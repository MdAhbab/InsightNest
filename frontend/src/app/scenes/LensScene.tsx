import { useEffect, useRef } from "react";
import { useTheme } from "../providers/ThemeProvider";

/** Wireframe icosahedron inside a ring — an "observatory lens" that turns with scroll velocity. */
export function LensScene({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const { theme } = useTheme();
  const velRef = useRef(0);

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

    // icosahedron vertices
    const t = (1 + Math.sqrt(5)) / 2;
    const verts: [number, number, number][] = [
      [-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0],
      [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t],
      [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1],
    ];
    const edges: [number, number][] = [
      [0,1],[0,5],[0,7],[0,10],[0,11],[1,5],[1,7],[1,8],[1,9],
      [2,3],[2,4],[2,6],[2,10],[2,11],[3,4],[3,6],[3,8],[3,9],
      [4,5],[4,9],[4,11],[5,9],[5,11],[6,7],[6,8],[6,10],
      [7,8],[7,10],[8,9],[10,11],
    ];

    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      velRef.current = Math.min(60, Math.abs(y - lastY));
      lastY = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    let raf = 0;
    const isDark = theme === "dark";
    const stroke = isDark ? "rgba(201,162,75,0.85)" : "rgba(31,45,80,0.78)";
    const ring = isDark ? "rgba(237,232,220,0.18)" : "rgba(22,24,29,0.22)";

    let t0 = performance.now();
    let rot = 0;
    const frame = (tm: number) => {
      const dt = (tm - t0) / 1000; t0 = tm;
      const vel = velRef.current;
      velRef.current *= 0.92;
      rot += dt * 0.25 + vel * 0.01;

      ctx.clearRect(0, 0, w, h);
      const cx = w / 2, cy = h / 2;
      const R = Math.min(w, h) * 0.32;

      // outer rings — observatory instrument
      ctx.strokeStyle = ring;
      ctx.lineWidth = 1;
      for (const r of [R * 1.45, R * 1.55, R * 1.65]) {
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
      }
      // tick marks
      ctx.strokeStyle = ring;
      for (let i = 0; i < 60; i++) {
        const a = (i / 60) * Math.PI * 2 + rot * 0.2;
        const r0 = R * 1.55, r1 = i % 5 === 0 ? R * 1.66 : R * 1.6;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0);
        ctx.lineTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
        ctx.stroke();
      }

      // crosshair
      ctx.beginPath();
      ctx.moveTo(cx - R * 1.7, cy); ctx.lineTo(cx + R * 1.7, cy);
      ctx.moveTo(cx, cy - R * 1.7); ctx.lineTo(cx, cy + R * 1.7);
      ctx.strokeStyle = isDark ? "rgba(237,232,220,0.08)" : "rgba(22,24,29,0.08)";
      ctx.stroke();

      // project vertices
      const cosY = Math.cos(rot), sinY = Math.sin(rot);
      const cosX = Math.cos(rot * 0.6), sinX = Math.sin(rot * 0.6);
      const proj = verts.map(([x, y, z]) => {
        let x1 = x * cosY - z * sinY;
        let z1 = x * sinY + z * cosY;
        const y1 = y * cosX - z1 * sinX;
        z1 = y * sinX + z1 * cosX;
        const persp = 1 / (3 + z1 * 0.3);
        return { sx: cx + x1 * R * persp * 1.2, sy: cy + y1 * R * persp * 1.2, z: z1 };
      });

      // edges
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 1;
      for (const [a, b] of edges) {
        const A = proj[a], B = proj[b];
        const back = (A.z + B.z) / 2 > 0.4;
        ctx.globalAlpha = back ? 0.18 : 1;
        ctx.beginPath();
        ctx.moveTo(A.sx, A.sy); ctx.lineTo(B.sx, B.sy);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      // vertex dots
      for (const p of proj) {
        ctx.fillStyle = stroke;
        ctx.beginPath(); ctx.arc(p.sx, p.sy, p.z < 0 ? 2.4 : 1.5, 0, Math.PI * 2); ctx.fill();
      }

      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", onScroll);
    };
  }, [theme]);

  return <canvas ref={ref} className={"block w-full h-full " + className} />;
}
