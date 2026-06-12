import { useCallback, useEffect, useState } from "react";
import { PageIntro } from "../components/PageIntro";
import { ApiError } from "../api/client";
import { faqsList, FaqDto } from "../api/endpoints";

function Skeleton() {
  return (
    <div className="py-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="my-8 h-5 rounded" style={{ background: "var(--rule-strong)", width: `${75 - i * 8}%`, opacity: 0.5 }} />
      ))}
    </div>
  );
}

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  const [items, setItems] = useState<FaqDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await faqsList();
      setItems(data);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load FAQs.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <>
      <PageIntro
        index="∂"
        kicker="FREQUENTLY ASKED"
        title={<>Questions, with their answers.</>}
        lede="Compiled from correspondence received over the previous season."
      />
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 pb-32">
        <div className="grid grid-cols-12">
          <div className="col-span-12 md:col-span-8 md:col-start-3">

            {loading && <Skeleton />}

            {!loading && error && (
              <div className="py-10 flex flex-col items-center gap-4">
                <div className="mono" style={{ color: "var(--oxblood)", fontSize: 11 }}>{error}</div>
                <button onClick={load} className="btn-ink btn-ghost"><span>Retry</span></button>
              </div>
            )}

            {!loading && !error && items.length === 0 && (
              <div className="py-12 text-center mono" style={{ color: "var(--ink-faint)" }}>
                No questions on file at this time.
              </div>
            )}

            {items.map((item, i) => {
              const o = open === i;
              return (
                <div key={item.id} className="border-b border-[var(--rule)]">
                  <button
                    className="w-full grid grid-cols-[40px_1fr_28px] gap-6 py-8 text-left items-baseline"
                    onClick={() => setOpen(o ? null : i)}
                  >
                    <span className="mono tabular" style={{
                      color: "var(--gold)",
                      display: "inline-block",
                      transform: `rotate(${o ? 90 : 0}deg)`,
                      transformOrigin: "left center",
                      transition: "transform 0.4s ease",
                    }}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="serif" style={{ fontSize: "clamp(1.25rem, 2vw, 1.75rem)", fontWeight: 300, lineHeight: 1.2 }}>
                      {item.question}
                    </span>
                    <span className="mono" style={{ color: "var(--ink-soft)" }}>{o ? "−" : "+"}</span>
                  </button>
                  <div style={{
                    display: "grid",
                    gridTemplateRows: o ? "1fr" : "0fr",
                    transition: "grid-template-rows 0.55s cubic-bezier(0.65,0,0.35,1)",
                  }}>
                    <div style={{ overflow: "hidden" }}>
                      <p className="pb-8 pl-[64px] pr-12 max-w-[60ch]" style={{ color: "var(--ink-soft)" }}>
                        {item.answer.split(" ").map((w, wi) => (
                          <span key={wi} style={{ display: "inline-block", marginRight: "0.25em", opacity: o ? 1 : 0, transform: o ? "translateY(0)" : "translateY(8px)", transition: `opacity 0.5s ease ${wi * 0.012}s, transform 0.5s ease ${wi * 0.012}s` }}>
                            {w}
                          </span>
                        ))}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
