import { useState } from "react";
import { PageIntro } from "../components/PageIntro";
import { useScrollProgress } from "../hooks/useScrollProgress";
import { ApiError } from "../api/client";
import { contactSubmit } from "../api/endpoints";

const PLATES = [
  { src: "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&w=1400&q=80", caption: "PLATE 01 — READING ROOM, OXFORD" },
  { src: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1400&q=80", caption: "PLATE 02 — CLOISTER, TRINITY" },
  { src: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1400&q=80", caption: "PLATE 03 — LECTURE THEATRE" },
];

function emailValid(e: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

export default function Contact() {
  const [v, setV] = useState({ name: "", email: "", subject: "", body: "" });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState("");

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!v.name.trim()) errs.name = "Name is required.";
    if (!v.email.trim()) errs.email = "Email is required.";
    else if (!emailValid(v.email)) errs.email = "Enter a valid email address.";
    if (!v.subject.trim()) errs.subject = "Subject is required.";
    if (!v.body.trim()) errs.body = "Message is required.";
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");
    const errs = validate();
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setPending(true);
    try {
      await contactSubmit({ name: v.name, email: v.email, subject: v.subject, message: v.body });
      setSent(true);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.fieldErrors && Object.keys(err.fieldErrors).length > 0) {
          setFieldErrors(err.fieldErrors);
        } else {
          setServerError(err.message);
        }
      } else {
        setServerError("Failed to send. Please try again.");
      }
    } finally {
      setPending(false);
    }
  };

  return (
    <>
      <PageIntro
        index="∞"
        kicker="CORRESPONDENCE"
        title={<>Write to the editors.</>}
        lede="The address below is read each working day. Please mark scholarship enquiries with their reference."
      />
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 pb-32 grid grid-cols-12 gap-6 md:gap-10">
        <div className="col-span-12 md:col-span-6">
          {sent ? (
            <div className="py-10 space-y-4 border border-[var(--rule-strong)] p-8" style={{ background: "var(--paper-raised)" }}>
              <div className="mono" style={{ color: "var(--gold)" }}>FILED · RECEIVED</div>
              <h2 className="serif" style={{ fontSize: "clamp(1.5rem, 2.5vw, 2.25rem)", fontWeight: 300 }}>
                Your letter has been received.
              </h2>
              <p style={{ color: "var(--ink-soft)" }}>
                We will write back to <em>{v.email}</em> within one working day.
              </p>
              <button
                className="btn-ink btn-ghost"
                onClick={() => { setSent(false); setV({ name: "", email: "", subject: "", body: "" }); }}
              >
                <span>Send another</span>
              </button>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit} noValidate>
              <Field
                label="Your name"
                value={v.name}
                onChange={(s) => setV({ ...v, name: s })}
                error={fieldErrors.name}
              />
              <Field
                label="Return address"
                value={v.email}
                onChange={(s) => setV({ ...v, email: s })}
                type="email"
                error={fieldErrors.email}
              />
              <Field
                label="Subject"
                value={v.subject}
                onChange={(s) => setV({ ...v, subject: s })}
                error={fieldErrors.subject}
              />
              <Field
                label="Letter"
                value={v.body}
                onChange={(s) => setV({ ...v, body: s })}
                textarea
                error={fieldErrors.body || fieldErrors.message}
              />

              {serverError && (
                <div className="p-4 border border-[var(--oxblood)]" style={{ background: "color-mix(in srgb, var(--oxblood) 8%, var(--paper))" }}>
                  <div className="mono" style={{ color: "var(--oxblood)", fontSize: 11 }}>{serverError}</div>
                </div>
              )}

              <button
                type="submit"
                disabled={pending}
                className="btn-ink"
                style={{ opacity: pending ? 0.65 : 1 }}
              >
                <span>{pending ? "Sending…" : "Send letter"}</span>
                {!pending && <span aria-hidden style={{ color: "var(--gold)" }}>→</span>}
              </button>
            </form>
          )}
        </div>

        <div className="col-span-12 md:col-span-5 md:col-start-8 space-y-12">
          {PLATES.map((p, i) => <Plate key={i} p={p} speed={0.2 + i * 0.15} />)}
        </div>
      </section>
    </>
  );
}

function Plate({ p, speed }: { p: { src: string; caption: string }; speed: number }) {
  const { ref, p: prog } = useScrollProgress<HTMLDivElement>();
  return (
    <div ref={ref}>
      <div className="aspect-[4/5] relative overflow-hidden" style={{ background: "var(--paper-deep)" }}>
        <div
          className="absolute inset-0 duotone"
          style={{
            backgroundImage: `url(${p.src})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            transform: `translateY(${(prog - 0.5) * speed * 80}px) scale(1.05)`,
            transition: "transform 0.1s linear",
          }}
        />
      </div>
      <div className="mt-2 mono" style={{ color: "var(--ink-faint)" }}>{p.caption}</div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  textarea = false,
  error,
}: {
  label: string;
  value: string;
  onChange: (s: string) => void;
  type?: string;
  textarea?: boolean;
  error?: string;
}) {
  return (
    <div className="space-y-1">
      <div className={"field-underline " + (value ? "has-value" : "")}>
        <label>{label}</label>
        {textarea ? (
          <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={6} style={{ resize: "vertical" }} />
        ) : (
          <input type={type} value={value} onChange={(e) => onChange(e.target.value)} />
        )}
      </div>
      {error && (
        <div className="mono" style={{ color: "var(--oxblood)", fontSize: 10 }}>{error}</div>
      )}
    </div>
  );
}
