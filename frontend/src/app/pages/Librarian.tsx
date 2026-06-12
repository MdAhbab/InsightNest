import { useRef, useState } from "react";
import { PageIntro } from "../components/PageIntro";
import { useToast } from "../components/Toast";
import { ApiError } from "../api/client";
import { resourceDownloadUrl } from "../api/endpoints";
import { agentLibrarian, LibrarianResponse } from "../api/endpoints";

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function Librarian() {
  const [q, setQ] = useState("");
  const [result, setResult] = useState<LibrarianResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const ask = async (question?: string) => {
    const finalQ = (question ?? q).trim();
    if (!finalQ || loading) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const data = await agentLibrarian({ question: finalQ });
      setResult(data);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "The archive could not be consulted. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleExample = (ex: string) => {
    setQ(ex);
    inputRef.current?.focus();
  };

  return (
    <>
      <PageIntro
        index="γ"
        kicker="ASK THE LIBRARY · BETA"
        title={<>A semantic enquiry desk.</>}
        lede="Ask a question in plain English; the librarian replies with an answer and points you to the shelves."
      />
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 pb-32">
        <div className="flex items-center gap-3 pb-4 border-b border-[var(--ink)]">
          <span className="mono" style={{ color: "var(--gold)" }}>›</span>
          <input
            ref={inputRef}
            placeholder="Ask the archive…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") ask(); }}
            disabled={loading}
            className="flex-1 bg-transparent"
            style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.5rem, 3vw, 2.25rem)", fontWeight: 300, color: "var(--ink)" }}
          />
          <button
            onClick={() => ask()}
            disabled={loading || !q.trim()}
            className="btn-ink"
            style={{ opacity: loading ? 0.65 : 1 }}
          >
            <span>{loading ? "Searching…" : "Enquire"}</span>
          </button>
        </div>

        {!result && !loading && !error && (
          <div className="mt-10">
            <div className="mono" style={{ color: "var(--ink-faint)" }}>
              EXAMPLES — click to try:
            </div>
            <div className="mt-3 flex flex-wrap gap-3">
              {[
                "How long should a research proposal be for a UK PhD?",
                "What sources do scholarship committees value most?",
                "What is the difference between an MSc and an MRes?",
              ].map((ex) => (
                <button
                  key={ex}
                  onClick={() => handleExample(ex)}
                  className="mono px-3 py-2 border border-[var(--rule-strong)] hover:border-[var(--gold)] hover:text-[var(--gold)]"
                  style={{ fontSize: 11, textAlign: "left" }}
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        )}

        {loading && (
          <div className="mt-10 mono" style={{ color: "var(--ink-faint)" }}>
            Searching the archive…
          </div>
        )}

        {!loading && error && (
          <div className="mt-10 flex flex-col gap-4">
            <div className="mono" style={{ color: "var(--oxblood)", fontSize: 11 }}>{error}</div>
            <button onClick={() => ask()} className="btn-ink btn-ghost self-start"><span>Retry</span></button>
          </div>
        )}

        {!loading && !error && result && (
          <div className="mt-12 grid grid-cols-12 gap-10">
            <article className="col-span-12 md:col-span-8 serif" style={{ fontSize: "1.125rem", fontWeight: 300, lineHeight: 1.7 }}>
              <div className="mono mb-4" style={{ color: "var(--gold)" }}>
                ANSWER · {result.sources.length} source{result.sources.length !== 1 ? "s" : ""}
              </div>
              {result.answer
                ? renderAnswerWithCitations(result.answer, result.sources.length)
                : (
                  <p style={{ color: "var(--ink-soft)", fontStyle: "italic" }}>
                    No relevant material was found in the archive for that question.
                  </p>
                )
              }
            </article>

            {result.sources.length > 0 && (
              <aside className="col-span-12 md:col-span-4">
                <div className="mono pb-3 border-b border-[var(--rule-strong)]" style={{ color: "var(--ink-faint)" }}>SOURCES</div>
                <ol>
                  {result.sources.map((src, i) => (
                    <li key={src.resourceId} className="py-4 border-b border-[var(--rule)]">
                      <div className="flex items-baseline gap-2">
                        <span className="mono tabular" style={{ color: "var(--gold)" }}>{i + 1}.</span>
                        <div className="min-w-0">
                          <a
                            href={`#/resources/${src.resourceId}`}
                            className="serif hover:text-[var(--gold)]"
                            style={{ fontSize: "1rem" }}
                          >
                            {src.title}
                          </a>
                          <div className="mono" style={{ color: "var(--ink-soft)" }}>
                            {[src.author, src.year].filter(Boolean).join(" · ")}
                          </div>
                          {src.relevance && (
                            <div className="mono mt-1" style={{ color: "var(--ink-faint)", fontSize: 10 }}>{src.relevance}</div>
                          )}
                          <a
                            href={resourceDownloadUrl(src.resourceId)}
                            className="mono hover:text-[var(--gold)] mt-1 inline-block"
                            style={{ fontSize: 10 }}
                            target="_blank"
                            rel="noreferrer"
                          >
                            DOWNLOAD ↓
                          </a>
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              </aside>
            )}
          </div>
        )}
      </section>
    </>
  );
}

// ─── Helper: render answer with optional superscript citations ────────────────

function renderAnswerWithCitations(answer: string, sourceCount: number) {
  // If the answer already contains [n] citation markers, render them as superscripts
  if (!/\[\d+\]/.test(answer)) {
    return <p>{answer}</p>;
  }

  const parts = answer.split(/(\[\d+\])/g);
  return (
    <p>
      {parts.map((part, i) => {
        const match = part.match(/^\[(\d+)\]$/);
        if (match) {
          const n = parseInt(match[1], 10);
          if (n >= 1 && n <= sourceCount) {
            return (
              <sup key={i} style={{ color: "var(--gold)" }}>{n}</sup>
            );
          }
        }
        return <span key={i}>{part}</span>;
      })}
    </p>
  );
}
