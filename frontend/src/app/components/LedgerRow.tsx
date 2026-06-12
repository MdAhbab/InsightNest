import { useState, type ReactNode } from "react";

export function LedgerRow({
  index,
  title,
  subtitle,
  meta,
  badges,
  expandable,
  detail,
  href,
  onClick,
}: {
  index: string;
  title: ReactNode;
  subtitle?: ReactNode;
  meta?: ReactNode;
  badges?: ReactNode;
  expandable?: boolean;
  detail?: ReactNode;
  href?: string;
  onClick?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState(false);

  const interact = () => {
    if (href) { window.location.hash = href; return; }
    if (onClick) { onClick(); return; }
    if (expandable) setOpen((o) => !o);
  };

  return (
    <div>
      <div
        className="ledger-row grid-cols-[64px_minmax(0,1fr)_auto_auto_28px] md:grid-cols-[88px_minmax(0,1fr)_220px_auto_28px]"
        onClick={interact}
        role={href || expandable || onClick ? "button" : undefined}
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); interact(); } }}
      >
        <span className="row-index mono tabular" style={{ fontSize: 11 }}>{index}</span>
        <div className="min-w-0">
          <div className="row-title serif truncate" style={{ fontSize: "clamp(1.05rem, 1.5vw, 1.35rem)", fontWeight: 400, letterSpacing: "-0.012em" }}>{title}</div>
          {subtitle && <div className="row-meta mono mt-1 truncate" style={{ fontSize: 10 }}>{subtitle}</div>}
        </div>
        <div className="row-meta hidden md:block mono text-right" style={{ fontSize: 11 }}>{meta}</div>
        <div className="flex items-center gap-3">
          {badges}
          <button
            aria-label={saved ? "Unsave" : "Save"}
            data-saved={saved}
            onClick={(e) => { e.stopPropagation(); setSaved((s) => !s); }}
            className="row-save w-7 h-7 inline-flex items-center justify-center"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1">
              <path d="M3 1.5h8v11l-4-3-4 3v-11z"/>
            </svg>
          </button>
        </div>
        <span className="row-chevron mono" aria-hidden>›</span>
      </div>
      {expandable && (
        <div
          style={{
            display: "grid",
            gridTemplateRows: open ? "1fr" : "0fr",
            transition: "grid-template-rows 0.55s cubic-bezier(0.65,0,0.35,1)",
            background: "var(--paper-raised)",
          }}
        >
          <div style={{ overflow: "hidden" }}>
            <div className="px-6 md:px-10 py-6 border-b border-[var(--rule)]">{detail}</div>
          </div>
        </div>
      )}
    </div>
  );
}

/** A pill used as a row badge — inherits hover-inversion via .row-badge token vars. */
export function RowBadge({ children }: { children: ReactNode }) {
  return <span className="row-badge">{children}</span>;
}
