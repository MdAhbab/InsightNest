import { useState } from "react";

type Step = { title: string; fields: { key: string; label: string; type?: "short" | "long" | "select" | "file"; options?: string[] }[] };

export function ApplyFlow({
  steps,
  onClose,
  title,
  refCode,
  onSubmit,
  submitError,
}: {
  steps: Step[];
  onClose: () => void;
  title: string;
  refCode: string;
  /** Called on final step submit. Receives all field values. Should throw on failure. */
  onSubmit?: (answers: Record<string, string>) => Promise<void>;
  /** Error message to display inside modal on submission failure. */
  submitError?: string;
}) {
  const [i, setI] = useState(0);
  const [v, setV] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);
  const [pending, setPending] = useState(false);
  const [localError, setLocalError] = useState("");

  if (done) {
    return (
      <Shell onClose={onClose}>
        <div className="text-center py-12">
          <div className="mono" style={{ color: "var(--gold)" }}>FILED · {refCode}</div>
          <h2 className="serif mt-4" style={{ fontSize: "clamp(1.875rem, 3vw, 2.75rem)", fontWeight: 300 }}>
            Your application has been received.
          </h2>
          <p className="mt-4 max-w-[40ch] mx-auto" style={{ color: "var(--ink-soft)" }}>
            A confirmation has been left in your inbox. You may follow its passage from your dashboard.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <a href="#/dashboard" className="btn-ink"><span>To dashboard</span></a>
            <a href="#/messages" className="btn-ink btn-ghost"><span>View inbox</span></a>
          </div>
        </div>
      </Shell>
    );
  }

  const step = steps[i];
  const errorMsg = submitError || localError;

  const handleSubmit = async () => {
    if (onSubmit) {
      setPending(true);
      setLocalError("");
      try {
        await onSubmit(v);
        setDone(true);
      } catch (e) {
        setLocalError(e instanceof Error ? e.message : "Submission failed.");
      } finally {
        setPending(false);
      }
    } else {
      setDone(true);
    }
  };

  return (
    <Shell onClose={onClose}>
      <div className="flex items-baseline justify-between pb-4 border-b border-[var(--ink)]">
        <div>
          <div className="mono" style={{ color: "var(--gold)" }}>APPLICATION · {refCode}</div>
          <h2 className="serif mt-2" style={{ fontSize: "1.875rem", fontWeight: 300 }}>{title}</h2>
        </div>
        <div className="mono text-right" style={{ color: "var(--ink-faint)" }}>
          STEP <span className="tabular" style={{ color: "var(--ink)" }}>{String(i + 1).padStart(2, "0")}</span>/{String(steps.length).padStart(2, "0")}
        </div>
      </div>

      <div className="mt-6 flex gap-1">
        {steps.map((_, k) => (
          <span key={k} className="flex-1 h-[2px]" style={{ background: k <= i ? "var(--gold)" : "var(--rule-strong)" }} />
        ))}
      </div>

      <div className="mt-8">
        <h3 className="serif" style={{ fontSize: "1.5rem", fontWeight: 300 }}>{step.title}</h3>
        <div className="mt-6 space-y-6">
          {step.fields.map((f) => (
            <div key={f.key} className={"field-underline " + (v[f.key] ? "has-value" : "")}>
              <label>{f.label}</label>
              {f.type === "long" ? (
                <textarea rows={5} value={v[f.key] ?? ""} onChange={(e) => setV({ ...v, [f.key]: e.target.value })} style={{ resize: "vertical" }} />
              ) : f.type === "select" ? (
                <select value={v[f.key] ?? ""} onChange={(e) => setV({ ...v, [f.key]: e.target.value })}>
                  <option value="">—</option>
                  {f.options!.map((o) => <option key={o}>{o}</option>)}
                </select>
              ) : f.type === "file" ? (
                <input type="file" onChange={(e) => setV({ ...v, [f.key]: e.target.value })} />
              ) : (
                <input value={v[f.key] ?? ""} onChange={(e) => setV({ ...v, [f.key]: e.target.value })} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Error display inside modal */}
      {errorMsg && (
        <div className="mt-6 p-4 border border-[var(--oxblood)]" style={{ background: "color-mix(in srgb, var(--oxblood) 8%, var(--paper))" }}>
          <div className="mono" style={{ color: "var(--oxblood)", fontSize: 11 }}>{errorMsg}</div>
        </div>
      )}

      <div className="mt-10 pt-6 border-t border-[var(--rule)] flex items-center justify-between">
        <button onClick={onClose} className="mono" style={{ color: "var(--ink-soft)" }}>SAVE &amp; CLOSE</button>
        <div className="flex gap-3">
          {i > 0 && <button onClick={() => setI(i - 1)} className="btn-ink btn-ghost"><span>← Previous</span></button>}
          {i < steps.length - 1 ? (
            <button onClick={() => setI(i + 1)} className="btn-ink"><span>Continue →</span></button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={pending}
              className="btn-ink btn-gold"
              style={{ opacity: pending ? 0.65 : 1 }}
            >
              <span>{pending ? "Submitting…" : "Submit application"}</span>
            </button>
          )}
        </div>
      </div>
    </Shell>
  );
}

function Shell({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 md:p-6" style={{ background: "color-mix(in srgb, var(--ink) 75%, transparent)" }} onClick={onClose}>
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 md:p-10" style={{ background: "var(--paper)", border: "1px solid var(--rule-strong)" }} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}
