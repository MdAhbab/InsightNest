import { useEffect, useRef } from "react";
import { useTheme } from "../providers/ThemeProvider";

/** Receding row of "index card spines" — a shallow-DOF library rack. */
export function ArchiveScene({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const c = ref.current!;
    const ctx = c.getContext("2d")!;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0, h = 0;
    const resize = () => {
      const r = c.getBoundingClientRect();
      w = r.width; h = r.height; c.width = w * dpr; c.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    let raf = 0;
    let mouseX = 0;
    const onMove = (e: MouseEvent) => {
      const r = c.getBoundingClientRect();
      mouseX = (e.clientX - r.left - r.width / 2) / r.width;
    };
    window.addEventListener("mousemove", onMove);

    const isDark = theme === "dark";
    const ink = isDark ? "rgba(237,232,220,0.9)" : "rgba(22,24,29,0.9)";
    const paper = isDark ? "rgba(20,23,29,1)" : "rgba(251,248,241,1)";
    const rule = isDark ? "rgba(56,61,72,1)" : "rgba(216,208,191,1)";
    const gold = isDark ? "rgba(201,162,75,1)" : "rgba(168,133,44,1)";

    let t0 = performance.now();
    const frame = (t: number) => {
      const dt = (t - t0) / 1000;
      ctx.clearRect(0, 0, w, h);

      // floor line
      ctx.strokeStyle = rule;
      ctx.lineWidth = 1;
      const horizon = h * 0.62;
      ctx.beginPath(); ctx.moveTo(0, horizon); ctx.lineTo(w, horizon); ctx.stroke();

      // spines receding
      const N = 22;
      const baseY = horizon;
      const vanishX = w / 2 - mouseX * 60;
      for (let i = N; i >= 0; i--) {
        const k = i / N;
        const persp = 0.35 + k * 0.85;
        const spineH = h * 0.55 * persp;
        const spineW = Math.max(2, 28 * persp);
        const x = vanishX - (N / 2 - i) * (38 * persp) - dt * 4 * persp;
        const xMod = ((x % (w + 200)) + (w + 200)) % (w + 200) - 100;
        const y = baseY - spineH;
        // spine
        ctx.fillStyle = paper;
        ctx.fillRect(xMod, y, spineW, spineH);
        // edge
        ctx.strokeStyle = rule;
        ctx.strokeRect(xMod + 0.5, y + 0.5, spineW - 1, spineH - 1);
        // label band
        ctx.fillStyle = i % 4 === 0 ? gold : ink;
        ctx.globalAlpha = 0.85;
        ctx.fillRect(xMod, y + spineH * 0.65, spineW, Math.max(2, 4 * persp));
        ctx.globalAlpha = 1;
        // top dust
        ctx.fillStyle = rule;
        ctx.fillRect(xMod, y - 2 * persp, spineW, 2 * persp);
      }

      // soft fog
      const grad = ctx.createLinearGradient(0, horizon - 200, 0, horizon);
      grad.addColorStop(0, isDark ? "rgba(12,14,18,0)" : "rgba(244,239,230,0)");
      grad.addColorStop(1, isDark ? "rgba(12,14,18,0.75)" : "rgba(244,239,230,0.75)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, horizon - 200, w, 200);

      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
    };
  }, [theme]);

  return <canvas ref={ref} className={"block w-full h-full " + className} />;
}
