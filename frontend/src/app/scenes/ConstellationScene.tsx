import { useEffect, useRef } from "react";
import { useTheme } from "../providers/ThemeProvider";

type P = { x: number; y: number; z: number };

/** Slowly rotating point-cloud globe — "universities" — with thin great-circle arcs. */
export function ConstellationScene({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const { theme } = useTheme();
  const mouseRef = useRef({ x: 0, y: 0 });
  const scrollRef = useRef(0);

  useEffect(() => {
    const c = ref.current!;
    const ctx = c.getContext("2d", { alpha: true })!;
    let raf = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0, h = 0;
    const N = window.innerWidth < 768 ? 700 : 1400;
    const points: P[] = [];
    for (let i = 0; i < N; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = 2 * Math.PI * u;
      const phi = Math.acos(2 * v - 1);
      points.push({
        x: Math.sin(phi) * Math.cos(theta),
        y: Math.sin(phi) * Math.sin(theta),
        z: Math.cos(phi),
      });
    }
    // arcs between random pairs
    const arcs: [number, number][] = [];
    for (let i = 0; i < 14; i++) arcs.push([Math.floor(Math.random() * N), Math.floor(Math.random() * N)]);

    const resize = () => {
      const r = c.getBoundingClientRect();
      w = r.width; h = r.height;
      c.width = w * dpr; c.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const onMove = (e: MouseEvent) => {
      const r = c.getBoundingClientRect();
      mouseRef.current.x = (e.clientX - r.left - r.width / 2) / r.width;
      mouseRef.current.y = (e.clientY - r.top - r.height / 2) / r.height;
    };
    const onScroll = () => { scrollRef.current = Math.min(1, window.scrollY / window.innerHeight); };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("scroll", onScroll, { passive: true });

    const isDark = theme === "dark";
    const point = isDark ? "rgba(201,162,75,0.85)" : "rgba(168,133,44,0.8)";
    const arc = isDark ? "rgba(201,162,75,0.22)" : "rgba(31,45,80,0.18)";

    let t0 = performance.now();
    const project = (p: P, rx: number, ry: number, R: number, cx: number, cy: number, dz: number) => {
      // rotate Y
      const cosY = Math.cos(ry), sinY = Math.sin(ry);
      let x = p.x * cosY - p.z * sinY;
      let z = p.x * sinY + p.z * cosY;
      let y = p.y;
      // rotate X
      const cosX = Math.cos(rx), sinX = Math.sin(rx);
      const yy = y * cosX - z * sinX;
      z = y * sinX + z * cosX;
      y = yy;
      const persp = 1 / (1.8 + z * 0.6 + dz);
      const sx = cx + x * R * persp * 2.2;
      const sy = cy + y * R * persp * 2.2;
      return { sx, sy, z, persp };
    };

    const frame = (t: number) => {
      const dt = (t - t0) / 1000;
      const sp = scrollRef.current;
      const ry = dt * 0.12 + mouseRef.current.x * 0.4;
      const rx = -0.25 + mouseRef.current.y * 0.25 - sp * 0.5;
      const dz = sp * 1.2; // sink as user scrolls
      const cx = w / 2, cy = h / 2 + sp * h * 0.4;
      const R = Math.min(w, h) * 0.34;

      ctx.clearRect(0, 0, w, h);

      // points
      for (let i = 0; i < points.length; i++) {
        const { sx, sy, z, persp } = project(points[i], rx, ry, R, cx, cy, dz);
        const front = z < 0.05;
        const alpha = front ? Math.max(0.15, 0.9 - z * 1.4) : 0.08;
        const size = Math.max(0.4, persp * 1.5 * (front ? 1 : 0.5));
        ctx.fillStyle = isDark
          ? `rgba(201,162,75,${alpha * 0.95})`
          : `rgba(168,133,44,${alpha})`;
        ctx.beginPath();
        ctx.arc(sx, sy, size, 0, Math.PI * 2);
        ctx.fill();
      }

      // arcs
      ctx.strokeStyle = arc;
      ctx.lineWidth = 0.6;
      for (const [a, b] of arcs) {
        const pa = project(points[a], rx, ry, R, cx, cy, dz);
        const pb = project(points[b], rx, ry, R, cx, cy, dz);
        if (pa.z > 0.2 && pb.z > 0.2) continue;
        ctx.beginPath();
        const midx = (pa.sx + pb.sx) / 2;
        const midy = (pa.sy + pb.sy) / 2 - 30;
        ctx.moveTo(pa.sx, pa.sy);
        ctx.quadraticCurveTo(midx, midy, pb.sx, pb.sy);
        ctx.stroke();
      }

      // soft horizon line
      ctx.strokeStyle = isDark ? "rgba(201,162,75,0.12)" : "rgba(168,133,44,0.15)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(cx, cy + R * 0.7, R * 1.5, R * 0.06, 0, 0, Math.PI * 2);
      ctx.stroke();

      // suppress unused warning
      void point;

      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("scroll", onScroll);
    };
  }, [theme]);

  return <canvas ref={ref} className={"block w-full h-full " + className} />;
}
