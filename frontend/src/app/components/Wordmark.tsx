export function Wordmark({ size = 18, className = "" }: { size?: number; className?: string }) {
  return (
    <a href="#/" className={"inline-flex items-baseline gap-[6px] select-none " + className} aria-label="InsightNest — Home">
      <span
        className="serif"
        style={{ fontSize: size, lineHeight: 1, letterSpacing: "-0.02em", fontWeight: 400 }}
      >
        Insight<span style={{ fontStyle: "italic" }}>Nest</span>
      </span>
      <span className="mono" style={{ fontSize: size * 0.34, color: "var(--gold)" }}>·</span>
      <span className="mono" style={{ fontSize: size * 0.36 }}>EST. MMXXVI</span>
    </a>
  );
}
