/** Engraved editorial seal — used on auth pages, dossiers, bulletins. */
export function Seal({ size = 200, label = "INSIGHTNEST", year = "MMXXVI" }: { size?: number; label?: string; year?: string }) {
  const R = size / 2;
  const inner = R - 12;
  const text = `${label} · ${label} · ${label} · `;
  const id = `seal-${label}-${year}`;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden style={{ color: "var(--gold)" }}>
      <defs>
        <path id={id} d={`M ${R},${R} m -${inner - 4},0 a ${inner - 4},${inner - 4} 0 1,1 ${(inner - 4) * 2},0 a ${inner - 4},${inner - 4} 0 1,1 -${(inner - 4) * 2},0`} />
      </defs>
      <circle cx={R} cy={R} r={R - 1} fill="none" stroke="currentColor" strokeWidth="1" />
      <circle cx={R} cy={R} r={inner} fill="none" stroke="currentColor" strokeWidth="0.5" />
      <circle cx={R} cy={R} r={inner - 8} fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.45" />
      {/* tick marks */}
      {Array.from({ length: 60 }).map((_, i) => {
        const a = (i / 60) * Math.PI * 2;
        const r0 = R - 4, r1 = i % 5 === 0 ? R - 10 : R - 7;
        return (
          <line key={i} x1={R + Math.cos(a) * r0} y1={R + Math.sin(a) * r0}
            x2={R + Math.cos(a) * r1} y2={R + Math.sin(a) * r1}
            stroke="currentColor" strokeWidth={i % 5 === 0 ? 0.8 : 0.4} />
        );
      })}
      <text fontFamily="var(--font-mono)" fontSize="8" letterSpacing="0.3em" fill="currentColor">
        <textPath href={`#${id}`} startOffset="0">{text + text}</textPath>
      </text>
      {/* center mark */}
      <g transform={`translate(${R} ${R})`} fill="currentColor">
        <text textAnchor="middle" y="-8" fontFamily="var(--font-serif)" fontSize={size * 0.18} fontWeight="300" letterSpacing="-0.04em">N</text>
        <text textAnchor="middle" y={size * 0.13} fontFamily="var(--font-mono)" fontSize="8" letterSpacing="0.3em">{year}</text>
        <line x1="-20" y1="2" x2="20" y2="2" stroke="currentColor" strokeWidth="0.6" />
      </g>
    </svg>
  );
}

/** Decorative engraved corner ornament. */
export function CornerMark({ size = 40, rotate = 0 }: { size?: number; rotate?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" style={{ color: "var(--gold)", transform: `rotate(${rotate}deg)` }}>
      <g fill="none" stroke="currentColor" strokeWidth="1">
        <line x1="0" y1="0" x2="20" y2="0" />
        <line x1="0" y1="0" x2="0" y2="20" />
        <line x1="6" y1="6" x2="14" y2="6" />
        <line x1="6" y1="6" x2="6" y2="14" />
        <circle cx="10" cy="10" r="1" fill="currentColor" />
      </g>
    </svg>
  );
}
