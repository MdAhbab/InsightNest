import type { ReactNode } from "react";

export function SectionHeader({
  index,
  title,
  meta,
  children,
}: {
  index: string;
  title: ReactNode;
  meta?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <header className="flex items-end justify-between gap-8 pb-6 border-b border-[var(--rule)]">
      <div className="flex items-baseline gap-6 min-w-0">
        <span className="section-index whitespace-nowrap">{index}</span>
        <h2 className="serif text-balance" style={{ fontWeight: 300 }}>{title}</h2>
      </div>
      {meta && <div className="mono text-right hidden md:block">{meta}</div>}
      {children}
    </header>
  );
}
