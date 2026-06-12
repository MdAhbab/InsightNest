import { useEffect, useRef, useState } from "react";
import { useInView } from "../hooks/useScrollProgress";

export function SplitFlap({ value, pad = 0, className = "" }: { value: number; pad?: number; className?: string }) {
  const { ref, inView } = useInView<HTMLSpanElement>(0.4);
  const [n, setN] = useState(0);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!inView || startedRef.current) return;
    startedRef.current = true;
    const dur = 1400;
    const t0 = performance.now();
    const step = (t: number) => {
      const k = Math.min(1, (t - t0) / dur);
      const eased = 1 - Math.pow(1 - k, 4);
      setN(Math.round(value * eased));
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, value]);

  const s = String(n).padStart(pad, "0");
  return (
    <span ref={ref} className={"tabular " + className}>
      {s.split("").map((d, i) => (
        <span key={i} className="flap" style={{ width: "0.62em" }}>
          <span className="flap-track" style={{ transform: `translateY(-${Number(d) * 1}em)` }}>
            {Array.from({ length: 10 }).map((_, j) => <span key={j} className="flap-digit">{j}</span>)}
          </span>
        </span>
      ))}
    </span>
  );
}
