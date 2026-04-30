#!/usr/bin/env python3
"""
Cross-platform InsightNest launcher.

What it does:
  - checks/copies backend and frontend .env files from examples
  - checks Java 17+, Maven, Node 18+, and npm
  - downloads portable Java, Maven, and Node into .tools/ when needed
  - installs frontend npm packages
  - optionally warms Maven dependencies
  - starts the Spring Boot backend and Vite frontend
  - opens the browser when the frontend is ready

Usage:
  python run.py
  python run.py --skip-install
  python run.py --no-open
"""

from __future__ import annotations

import argparse
import os
import platform
import re
import shutil
import signal
import socket
import subprocess
import sys
import tarfile
import tempfile
import threading
import time
import urllib.request
import webbrowser
import zipfile
from pathlib import Path
from typing import Dict, Iterable, Optional, Tuple


ROOT = Path(__file__).resolve().parent
BACKEND_DIR = ROOT / "backend"
FRONTEND_DIR = ROOT / "frontend"
TOOLS_DIR = ROOT / ".tools"
DOWNLOADS_DIR = TOOLS_DIR / "downloads"

JAVA_MAJOR = 17
NODE_MAJOR = 18
MAVEN_VERSION = os.environ.get("INSIGHTNEST_MAVEN_VERSION", "3.9.9")
NODE_VERSION = os.environ.get("INSIGHTNEST_NODE_VERSION", "20.18.1")


class LaunchError(RuntimeError):
    pass


def log(message: str) -> None:
    print(f"[run.py] {message}", flush=True)


def run_cmd(
    command: Iterable[str],
    *,
    cwd: Path,
    env: Dict[str, str],
    check: bool = True,
    timeout: Optional[int] = None,
) -> subprocess.CompletedProcess:
    rendered = " ".join(command)
    log(f"Running: {rendered}")
    result = subprocess.run(
        list(command),
        cwd=str(cwd),
        env=env,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        timeout=timeout,
    )
    if result.stdout:
        print(result.stdout, end="" if result.stdout.endswith("\n") else "\n")
    if check and result.returncode != 0:
        raise LaunchError(f"Command failed with exit code {result.returncode}: {rendered}")
    return result


def system_name() -> str:
    name = platform.system().lower()
    if name.startswith("darwin"):
        return "mac"
    if name.startswith("windows"):
        return "windows"
    if name.startswith("linux"):
        return "linux"
    raise LaunchError(f"Unsupported OS: {platform.system()}")


def node_platform() -> str:
    name = system_name()
    if name == "windows":
        return "win"
    if name == "mac":
        return "darwin"
    return "linux"


def archive_suffix(for_node: bool = False) -> str:
    if system_name() == "windows":
        return "zip"
    return "tar.xz" if for_node else "tar.gz"


def cpu_arch(*, for_node: bool = False) -> str:
    machine = platform.machine().lower()
    if machine in {"x86_64", "amd64"}:
        return "x64"
    if machine in {"aarch64", "arm64"}:
        return "arm64" if for_node else "aarch64"
    raise LaunchError(f"Unsupported CPU architecture: {platform.machine()}")


def executable_names(name: str) -> Tuple[str, ...]:
    if system_name() != "windows":
        return (name,)
    return (f"{name}.exe", f"{name}.cmd", f"{name}.bat", name)


def prepend_path(env: Dict[str, str], *paths: Path) -> Dict[str, str]:
    updated = dict(env)
    existing = updated.get("PATH", "")
    prefix = os.pathsep.join(str(path) for path in paths if path.exists())
    updated["PATH"] = prefix + (os.pathsep + existing if existing and prefix else existing)
    return updated


def which(command: str, env: Dict[str, str]) -> Optional[str]:
    return shutil.which(command, path=env.get("PATH"))


def copy_env_if_missing(path: Path) -> None:
    example = path.with_name(path.name + ".example")
    if path.exists():
        return
    if not example.exists():
        return
    shutil.copyfile(example, path)
    log(f"Created {path.relative_to(ROOT)} from {example.relative_to(ROOT)}")


def load_env_file(path: Path) -> Dict[str, str]:
    values: Dict[str, str] = {}
    if not path.exists():
        return values
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        if key:
            values[key] = value
    return values


def command_output(command: Iterable[str], env: Dict[str, str]) -> str:
    try:
        result = subprocess.run(
            list(command),
            env=env,
            text=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            timeout=15,
        )
        return result.stdout or ""
    except (OSError, subprocess.SubprocessError):
        return ""


def parse_major_version(text: str, pattern: str) -> Optional[int]:
    match = re.search(pattern, text)
    if not match:
        return None
    version = match.group(1)
    if version.startswith("1."):
        parts = version.split(".")
        return int(parts[1]) if len(parts) > 1 and parts[1].isdigit() else None
    first = version.split(".", 1)[0].lstrip("v")
    return int(first) if first.isdigit() else None


def download_file(url: str, destination: Path) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)
    if destination.exists() and destination.stat().st_size > 0:
        log(f"Using cached download: {destination.relative_to(ROOT)}")
        return

    log(f"Downloading {url}")
    with urllib.request.urlopen(url, timeout=120) as response:
        total = response.headers.get("Content-Length")
        total_bytes = int(total) if total and total.isdigit() else None
        read_bytes = 0
        with destination.open("wb") as handle:
            while True:
                chunk = response.read(1024 * 1024)
                if not chunk:
                    break
                handle.write(chunk)
                read_bytes += len(chunk)
                if total_bytes:
                    percent = int((read_bytes / total_bytes) * 100)
                    print(f"\r[run.py] Downloaded {percent:3d}%", end="", flush=True)
    print()


def extract_archive(archive: Path, destination: Path) -> None:
    if destination.exists():
        return

    with tempfile.TemporaryDirectory(prefix="insightnest-tool-") as temp_name:
        temp_dir = Path(temp_name)
        log(f"Extracting {archive.name}")
        if archive.suffix == ".zip":
            with zipfile.ZipFile(archive) as zipped:
                zipped.extractall(temp_dir)
        else:
            with tarfile.open(archive, mode="r:*") as tar:
                tar.extractall(temp_dir)

        candidates = [path for path in temp_dir.iterdir() if path.is_dir()]
        if len(candidates) != 1:
            raise LaunchError(f"Could not identify extracted tool root in {archive}")
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.move(str(candidates[0]), str(destination))


def find_tool_root(root: Path, binary_name: str) -> Optional[Path]:
    binaries = executable_names(binary_name)
    for binary in binaries:
        if (root / "bin" / binary).exists() or (root / binary).exists():
            return root
    for candidate in root.glob("*"):
        for binary in binaries:
            if (candidate / "bin" / binary).exists() or (candidate / binary).exists():
                return candidate
    return None


def ensure_java(env: Dict[str, str]) -> Dict[str, str]:
    local_root = find_tool_root(TOOLS_DIR / "jdk-17", "java")
    if local_root:
        env = prepend_path(env, local_root / "bin")
        env["JAVA_HOME"] = str(local_root)

    java_cmd = which("java", env)
    if java_cmd:
        output = command_output([java_cmd, "-version"], env)
        major = parse_major_version(output, r'version "([^"]+)"')
        if major and major >= JAVA_MAJOR:
            log(f"Java {major}+ available.")
            return env

    os_name = system_name()
    arch = cpu_arch()
    suffix = "zip" if os_name == "windows" else "tar.gz"
    url = f"https://api.adoptium.net/v3/binary/latest/{JAVA_MAJOR}/ga/{os_name}/{arch}/jdk/hotspot/normal/eclipse"
    archive = DOWNLOADS_DIR / f"temurin-jdk-{JAVA_MAJOR}-{os_name}-{arch}.{suffix}"
    destination = TOOLS_DIR / "jdk-17"
    download_file(url, archive)
    extract_archive(archive, destination)

    local_root = find_tool_root(destination, "java")
    if not local_root:
        raise LaunchError("Downloaded Java, but could not find java in the extracted archive.")
    env = prepend_path(env, local_root / "bin")
    env["JAVA_HOME"] = str(local_root)
    log(f"Using portable Java from {local_root.relative_to(ROOT)}")
    return env


def ensure_maven(env: Dict[str, str]) -> Dict[str, str]:
    local_root = find_tool_root(TOOLS_DIR / f"apache-maven-{MAVEN_VERSION}", "mvn")
    if local_root:
        env = prepend_path(env, local_root / "bin")

    mvn_cmd = which("mvn", env)
    if mvn_cmd:
        output = command_output([mvn_cmd, "-version"], env)
        if "Apache Maven" in output:
            log("Maven available.")
            return env

    suffix = "zip" if system_name() == "windows" else "tar.gz"
    file_name = f"apache-maven-{MAVEN_VERSION}-bin.{suffix}"
    url = f"https://archive.apache.org/dist/maven/maven-3/{MAVEN_VERSION}/binaries/{file_name}"
    archive = DOWNLOADS_DIR / file_name
    destination = TOOLS_DIR / f"apache-maven-{MAVEN_VERSION}"
    download_file(url, archive)
    extract_archive(archive, destination)

    local_root = find_tool_root(destination, "mvn")
    if not local_root:
        raise LaunchError("Downloaded Maven, but could not find mvn in the extracted archive.")
    env = prepend_path(env, local_root / "bin")
    log(f"Using portable Maven from {local_root.relative_to(ROOT)}")
    return env


def ensure_node(env: Dict[str, str]) -> Dict[str, str]:
    local_root = find_tool_root(TOOLS_DIR / f"node-v{NODE_VERSION}", "node")
    if local_root:
        env = prepend_path(env, local_root, local_root / "bin")

    node_cmd = which("node", env)
    npm_cmd = which("npm", env)
    if node_cmd and npm_cmd:
        output = command_output([node_cmd, "--version"], env)
        major = parse_major_version(output, r"(v?\d+(?:\.\d+)*)")
        if major and major >= NODE_MAJOR:
            log(f"Node {major}+ and npm available.")
            return env

    platform_name = node_platform()
    arch = cpu_arch(for_node=True)
    suffix = archive_suffix(for_node=True)
    base_name = f"node-v{NODE_VERSION}-{platform_name}-{arch}"
    url = f"https://nodejs.org/dist/v{NODE_VERSION}/{base_name}.{suffix}"
    archive = DOWNLOADS_DIR / f"{base_name}.{suffix}"
    destination = TOOLS_DIR / f"node-v{NODE_VERSION}"
    download_file(url, archive)
    extract_archive(archive, destination)

    local_root = find_tool_root(destination, "node")
    if not local_root:
        raise LaunchError("Downloaded Node, but could not find node in the extracted archive.")
    env = prepend_path(env, local_root, local_root / "bin")
    log(f"Using portable Node from {local_root.relative_to(ROOT)}")
    return env


def parse_jdbc_mysql_url(url: str) -> Optional[Tuple[str, int, str]]:
    match = re.match(r"jdbc:mysql://([^/:?]+)(?::(\d+))?/([^?]+)", url)
    if not match:
        return None
    host = match.group(1)
    port = int(match.group(2) or "3306")
    database = match.group(3)
    return host, port, database


def wait_for_socket(host: str, port: int, timeout: float) -> bool:
    deadline = time.time() + timeout
    while time.time() < deadline:
        try:
            with socket.create_connection((host, port), timeout=2):
                return True
        except OSError:
            time.sleep(1)
    return False


def ensure_mysql_reachable(env: Dict[str, str], *, skip_check: bool) -> None:
    if skip_check:
        log("Skipping MySQL reachability check.")
        return

    db_url = env.get(
        "DB_URL",
        "jdbc:mysql://localhost:3306/insightnest?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC",
    )
    parsed = parse_jdbc_mysql_url(db_url)
    if not parsed:
        log(f"DB_URL is not a MySQL JDBC URL, skipping DB socket check: {db_url}")
        return

    host, port, database = parsed
    log(f"Checking MySQL at {host}:{port} for database '{database}'...")
    if wait_for_socket(host, port, timeout=5):
        log("MySQL port is reachable.")
        return

    raise LaunchError(
        "MySQL is not reachable. Start MySQL and create the database named "
        f"'{database}', or update backend/.env DB_URL. Use --skip-db-check to let the backend try anyway."
    )


def port_available(port: int) -> bool:
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
            sock.bind(("127.0.0.1", port))
            return True
    except OSError:
        return False


def choose_port(preferred: int) -> int:
    if port_available(preferred):
        return preferred
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.bind(("127.0.0.1", 0))
        port = int(sock.getsockname()[1])
    log(f"Port {preferred} is busy; using {port}.")
    return port


def wait_for_http(url: str, timeout: float) -> bool:
    deadline = time.time() + timeout
    while time.time() < deadline:
        try:
            with urllib.request.urlopen(url, timeout=3) as response:
                if response.status < 500:
                    return True
        except Exception:
            time.sleep(1)
    return False


def stream_process(process: subprocess.Popen, label: str) -> None:
    assert process.stdout is not None
    for line in process.stdout:
        print(f"[{label}] {line}", end="")


def start_process(command: Iterable[str], *, cwd: Path, env: Dict[str, str], label: str) -> subprocess.Popen:
    log(f"Starting {label}: {' '.join(command)}")
    process = subprocess.Popen(
        list(command),
        cwd=str(cwd),
        env=env,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        bufsize=1,
    )
    thread = threading.Thread(target=stream_process, args=(process, label), daemon=True)
    thread.start()
    return process


def terminate_processes(processes: Iterable[subprocess.Popen]) -> None:
    for process in processes:
        if process.poll() is None:
            process.terminate()
    deadline = time.time() + 8
    for process in processes:
        while process.poll() is None and time.time() < deadline:
            time.sleep(0.2)
        if process.poll() is None:
            process.kill()


def maybe_install_dependencies(env: Dict[str, str], *, skip_install: bool, skip_maven_warmup: bool) -> None:
    if skip_install:
        log("Skipping dependency installation.")
        return

    npm_cmd = which("npm", env)
    if not npm_cmd:
        raise LaunchError("npm was not found after Node setup.")

    if not (FRONTEND_DIR / "node_modules").exists():
        run_cmd([npm_cmd, "install"], cwd=FRONTEND_DIR, env=env)
    else:
        log("frontend/node_modules exists; skipping npm install.")

    if skip_maven_warmup:
        log("Skipping Maven dependency warmup.")
        return

    mvn_cmd = which("mvn", env)
    if not mvn_cmd:
        raise LaunchError("mvn was not found after Maven setup.")
    run_cmd([mvn_cmd, "-q", "-DskipTests", "dependency:go-offline"], cwd=BACKEND_DIR, env=env)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run InsightNest backend and frontend.")
    parser.add_argument("--no-open", action="store_true", help="Do not open the browser automatically.")
    parser.add_argument("--skip-install", action="store_true", help="Skip npm install and Maven dependency warmup.")
    parser.add_argument("--skip-maven-warmup", action="store_true", help="Do not run Maven dependency:go-offline.")
    parser.add_argument("--skip-db-check", action="store_true", help="Skip the MySQL socket check.")
    parser.add_argument("--backend-port", type=int, default=8080, help="Preferred backend port.")
    parser.add_argument("--frontend-port", type=int, default=5173, help="Preferred frontend port.")
    return parser.parse_args()


def main() -> int:
    args = parse_args()

    if sys.version_info < (3, 9):
        raise LaunchError("Python 3.9+ is required to run this launcher.")

    copy_env_if_missing(BACKEND_DIR / ".env")
    copy_env_if_missing(FRONTEND_DIR / ".env")

    env = dict(os.environ)
    env.update(load_env_file(BACKEND_DIR / ".env"))
    env.update(load_env_file(FRONTEND_DIR / ".env"))

    TOOLS_DIR.mkdir(exist_ok=True)
    DOWNLOADS_DIR.mkdir(parents=True, exist_ok=True)

    env = ensure_java(env)
    env = ensure_maven(env)
    env = ensure_node(env)

    backend_port = choose_port(args.backend_port)
    frontend_port = choose_port(args.frontend_port)
    env["SERVER_PORT"] = str(backend_port)
    env["VITE_API_URL"] = f"http://localhost:{backend_port}/api"

    ensure_mysql_reachable(env, skip_check=args.skip_db_check)
    maybe_install_dependencies(
        env,
        skip_install=args.skip_install,
        skip_maven_warmup=args.skip_maven_warmup,
    )

    mvn_cmd = which("mvn", env)
    npm_cmd = which("npm", env)
    if not mvn_cmd or not npm_cmd:
        raise LaunchError("Required launch commands are missing after setup.")

    backend = start_process([mvn_cmd, "spring-boot:run"], cwd=BACKEND_DIR, env=env, label="backend")

    log(f"Waiting for backend port {backend_port}...")
    if not wait_for_socket("127.0.0.1", backend_port, timeout=90):
        if backend.poll() is not None:
            raise LaunchError(f"Backend exited early with code {backend.returncode}.")
        raise LaunchError("Backend did not open its port in time.")

    frontend = start_process(
        [npm_cmd, "run", "dev", "--", "--host", "127.0.0.1", "--port", str(frontend_port)],
        cwd=FRONTEND_DIR,
        env=env,
        label="frontend",
    )

    frontend_url = f"http://localhost:{frontend_port}"
    log(f"Waiting for frontend at {frontend_url}...")
    if not wait_for_http(frontend_url, timeout=60):
        if frontend.poll() is not None:
            raise LaunchError(f"Frontend exited early with code {frontend.returncode}.")
        raise LaunchError("Frontend did not respond in time.")

    log(f"InsightNest is running: {frontend_url}")
    if not args.no_open:
        webbrowser.open(frontend_url)

    log("Press Ctrl+C to stop both servers.")
    processes = [backend, frontend]

    def handle_signal(signum, frame) -> None:  # type: ignore[no-untyped-def]
        raise KeyboardInterrupt

    signal.signal(signal.SIGINT, handle_signal)
    if hasattr(signal, "SIGTERM"):
        signal.signal(signal.SIGTERM, handle_signal)

    try:
        while True:
            for process, label in ((backend, "backend"), (frontend, "frontend")):
                code = process.poll()
                if code is not None:
                    raise LaunchError(f"{label} stopped with exit code {code}.")
            time.sleep(1)
    except KeyboardInterrupt:
        log("Stopping servers...")
        terminate_processes(processes)
        return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except LaunchError as exc:
        log(str(exc))
        raise SystemExit(1)
