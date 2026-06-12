import { useEffect, type ReactNode } from "react";

export function ActionDrawer({
  open, onClose, title, kicker, footer, children,
}: {
  open: boolean; onClose: () => void; title: ReactNode; kicker?: string; footer?: ReactNode; children: ReactNode;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80] flex" style={{ background: "color-mix(in srgb, var(--ink) 65%, transparent)" }} onClick={onClose}>
      <div
        className="ml-auto w-full sm:max-w-md md:max-w-xl h-full overflow-y-auto"
        style={{ background: "var(--paper)", borderLeft: "1px solid var(--rule-strong)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="sticky top-0 z-10 px-6 md:px-10 pt-8 pb-4 border-b border-[var(--ink)] flex items-baseline justify-between gap-4" style={{ background: "var(--paper)" }}>
          <div className="min-w-0">
            {kicker && <div className="mono" style={{ color: "var(--gold)" }}>{kicker}</div>}
            <h2 className="serif mt-2 truncate" style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 300 }}>{title}</h2>
          </div>
          <button onClick={onClose} className="mono whitespace-nowrap">CLOSE ✕</button>
        </header>
        <div className="px-6 md:px-10 py-8">{children}</div>
        {footer && (
          <footer className="sticky bottom-0 px-6 md:px-10 py-5 border-t border-[var(--rule-strong)] flex items-center justify-end gap-3" style={{ background: "var(--paper)" }}>
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
}

export function Confirm({
  open, onClose, onConfirm, title, body, confirmLabel = "Confirm", danger = false,
}: {
  open: boolean; onClose: () => void; onConfirm: () => void; title: string; body: ReactNode; confirmLabel?: string; danger?: boolean;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[85] flex items-center justify-center p-6" style={{ background: "color-mix(in srgb, var(--ink) 70%, transparent)" }} onClick={onClose}>
      <div className="w-full max-w-md p-8" style={{ background: "var(--paper)", border: "1px solid var(--rule-strong)" }} onClick={(e) => e.stopPropagation()}>
        <div className="mono" style={{ color: danger ? "var(--oxblood)" : "var(--gold)" }}>{danger ? "CAUTION" : "CONFIRM"}</div>
        <h3 className="serif mt-2" style={{ fontSize: "1.5rem", fontWeight: 300 }}>{title}</h3>
        <div className="mt-4" style={{ color: "var(--ink-soft)" }}>{body}</div>
        <div className="mt-8 flex justify-end gap-3">
          <button onClick={onClose} className="btn-ink btn-ghost"><span>Cancel</span></button>
          <button onClick={() => { onConfirm(); onClose(); }} className={"btn-ink " + (danger ? "" : "btn-gold")} style={danger ? { borderColor: "var(--oxblood)", color: "var(--oxblood)" } : undefined}>
            <span>{confirmLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/** Reusable underline field used inside drawers. */
export function DField({ label, value, onChange, type = "text", textarea = false, options, placeholder }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; textarea?: boolean; options?: string[]; placeholder?: string;
}) {
  return (
    <div className={"field-underline " + (value ? "has-value" : "")}>
      <label>{label}</label>
      {options ? (
        <select value={value} onChange={(e) => onChange(e.target.value)}>
          <option value="">—</option>
          {options.map((o) => <option key={o}>{o}</option>)}
        </select>
      ) : textarea ? (
        <textarea rows={5} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={{ resize: "vertical" }} />
      ) : (
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
      )}
    </div>
  );
}

export function DGrid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{children}</div>;
}

export function DSection({ title, index, children }: { title: string; index: string; children: ReactNode }) {
  return (
    <section className="pb-6 mb-6 border-b border-[var(--rule)] space-y-5">
      <div className="flex items-baseline gap-3">
        <span className="section-index">{index}</span>
        <h3 className="serif" style={{ fontSize: "1.25rem", fontWeight: 300 }}>{title}</h3>
      </div>
      {children}
    </section>
  );
}
