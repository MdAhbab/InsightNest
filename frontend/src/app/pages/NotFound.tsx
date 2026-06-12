import { useEffect, useRef } from "react";

export default function NotFound() {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const c = ref.current!;
    const ctx = c.getContext("2d")!;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0, h = 0;
    const resize = () => { const r = c.getBoundingClientRect(); w = r.width; h = r.height; c.width = w * dpr; c.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    resize(); window.addEventListener("resize", resize);

    const N = 1800;
    const pts: { x: number; y: number; vx: number; vy: number; tx: number; ty: number }[] = [];
    const buildShape = () => {
      const off = document.createElement("canvas");
      off.width = w; off.height = h;
      const o = off.getContext("2d")!;
      o.fillStyle = "white";
      o.font = `300 ${Math.floor(h * 0.7)}px Fraunces, serif`;
      o.textAlign = "center"; o.textBaseline = "middle";
      o.fillText("404", w / 2, h / 2);
      const img = o.getImageData(0, 0, w, h).data;
      const sample: [number, number][] = [];
      for (let y = 0; y < h; y += 4) for (let x = 0; x < w; x += 4) {
        if (img[(y * w + x) * 4 + 3] > 128) sample.push([x, y]);
      }
      pts.length = 0;
      for (let i = 0; i < N; i++) {
        const [x, y] = sample[Math.floor(Math.random() * sample.length)] || [w / 2, h / 2];
        pts.push({ x: Math.random() * w, y: Math.random() * h, vx: 0, vy: 0, tx: x, ty: y });
      }
    };
    buildShape();

    let mx = -9999, my = -9999;
    const onMove = (e: MouseEvent) => { const r = c.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; };
    const onLeave = () => { mx = -9999; my = -9999; };
    window.addEventListener("mousemove", onMove);
    c.addEventListener("mouseleave", onLeave);

    let raf = 0;
    const frame = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--gold").trim();
      for (const p of pts) {
        const dx = mx - p.x, dy = my - p.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 16000) {
          const f = 80 / (d2 + 80);
          p.vx -= dx * f * 0.02;
          p.vy -= dy * f * 0.02;
        } else {
          p.vx += (p.tx - p.x) * 0.04;
          p.vy += (p.ty - p.y) * 0.04;
        }
        p.vx *= 0.78; p.vy *= 0.78;
        p.x += p.vx; p.y += p.vy;
        ctx.fillRect(p.x, p.y, 1.4, 1.4);
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); window.removeEventListener("mousemove", onMove); c.removeEventListener("mouseleave", onLeave); };
  }, []);

  return (
    <main className="relative" style={{ minHeight: "100vh" }}>
      <canvas ref={ref} className="absolute inset-0 w-full h-full" />
      <div className="relative h-screen flex flex-col items-center justify-center text-center px-6">
        <div className="mono" style={{ color: "var(--gold)" }}>VOLUME I · PAGE NOT FOUND</div>
        <p className="serif mt-6 max-w-[40ch]" style={{ fontSize: "clamp(1.125rem, 1.6vw, 1.5rem)", fontWeight: 300, color: "var(--ink-soft)" }}>
          The page you wrote to has not been catalogued — or has been moved to the archive.
        </p>
        <a href="#/" className="btn-ink mt-10"><span>Return to the atlas</span></a>
      </div>
    </main>
  );
}
