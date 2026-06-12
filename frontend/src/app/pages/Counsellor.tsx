import { useEffect, useRef, useState } from "react";
import { PageIntro } from "../components/PageIntro";
import { useToast } from "../components/Toast";
import { ApiError } from "../api/client";
import { fmtDate } from "../api/format";
import {
  agentCounsellor,
  savedItemsCreate,
  AgentCitation,
  ConversationHistoryItem,
} from "../api/endpoints";

// ─── Types ────────────────────────────────────────────────────────────────────

type Msg =
  | { from: "you"; text: string }
  | { from: "nest"; text: string; cites?: AgentCitation[]; streaming?: boolean };

// ─── Welcome message (single static line, no fake history) ───────────────────

const WELCOME: Msg = {
  from: "nest",
  text: "Welcome. I read the catalogue so you do not have to. Tell me what you are looking for — a programme, a scholarship, a research group — and I will point you to the most relevant entries and explain my reasoning.",
  cites: [],
};

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function Counsellor() {
  const toast = useToast();
  const [msgs, setMsgs] = useState<Msg[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [dossier, setDossier] = useState<AgentCitation[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 9e6, behavior: "smooth" });
  }, [msgs.length]);

  // Build history from current messages (excluding the welcome line)
  const buildHistory = (): ConversationHistoryItem[] => {
    const result: ConversationHistoryItem[] = [];
    for (const m of msgs) {
      if (m === WELCOME) continue;
      if (m.from === "you") result.push({ role: "user", text: m.text });
      else if (!m.streaming) result.push({ role: "assistant", text: m.text });
    }
    return result;
  };

  const ask = async () => {
    if (!input.trim() || pending) return;
    const q = input.trim();
    setInput("");
    setMsgs((m) => [...m, { from: "you", text: q }]);
    setPending(true);

    // Add streaming placeholder
    setMsgs((m) => [...m, { from: "nest", text: "", streaming: true }]);

    try {
      const res = await agentCounsellor({
        message: q,
        history: buildHistory(),
      });

      const reply = res.reply ?? "";
      // Accumulate new citations to dossier
      if (res.citations?.length) {
        setDossier((prev) => {
          const existingIds = new Set(prev.map(c => `${c.type}-${c.id}`));
          const newCites = res.citations.filter(c => !existingIds.has(`${c.type}-${c.id}`));
          return [...prev, ...newCites];
        });
      }

      // Bug 11: typewriter over real reply text
      setMsgs((m) => {
        const copy = [...m];
        copy[copy.length - 1] = { from: "nest", text: "", cites: res.citations, streaming: true };
        return copy;
      });

      // Typewriter effect on the real reply
      for (let i = 1; i <= reply.length; i += 3) {
        await new Promise((r) => setTimeout(r, 12));
        setMsgs((m) => {
          const copy = [...m];
          copy[copy.length - 1] = { from: "nest", text: reply.slice(0, i), cites: res.citations, streaming: true };
          return copy;
        });
      }

      // Finalise
      setMsgs((m) => {
        const copy = [...m];
        copy[copy.length - 1] = { from: "nest", text: reply, cites: res.citations, streaming: false };
        return copy;
      });
    } catch (e) {
      // Replace placeholder with error line
      setMsgs((m) => {
        const copy = [...m];
        copy[copy.length - 1] = {
          from: "nest",
          text: e instanceof ApiError
            ? `[Error — ${e.message}. Please try again.]`
            : "[The archive could not be consulted. Please try again.]",
          streaming: false,
        };
        return copy;
      });
      toast("Counsellor error — try again", "error" as any);
    } finally {
      setPending(false);
    }
  };

  return (
    <>
      <PageIntro
        index="α"
        kicker="NEST COUNSELLOR · BETA"
        title={<>A conversation with the editors.</>}
        lede="Type as you would write — in sentences, not in keywords. The counsellor reads carefully and cites as it goes."
      />
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 pb-32 grid grid-cols-12 gap-6 md:gap-10">
        <div className="col-span-12 md:col-span-8">
          <div ref={scrollRef} className="border-y border-[var(--rule-strong)] py-10 space-y-12 max-h-[60vh] overflow-y-auto pr-2">
            {msgs.map((m, i) => (
              <div key={i}>
                {m.from === "you" ? (
                  <div className="ml-auto max-w-[80%] text-right">
                    <div className="mono mb-2" style={{ color: "var(--gold)" }}>YOU</div>
                    <p className="mono" style={{ fontSize: 13, color: "var(--ink)" }}>{m.text}</p>
                  </div>
                ) : (
                  <div className="max-w-[44em]">
                    <div className="mono mb-3" style={{ color: "var(--ink-faint)" }}>
                      NEST COUNSELLOR{m === WELCOME ? " · WELCOME" : ""}
                    </div>
                    {/* "consulting the index…" line while pending + streaming */}
                    {m.streaming && m.text === "" && pending && (
                      <p className="mono" style={{ color: "var(--ink-soft)", fontSize: 12 }}>consulting the index…</p>
                    )}
                    {m.text !== "" && (
                      <p className="serif" style={{ fontSize: "clamp(1.125rem, 1.5vw, 1.375rem)", fontWeight: 300, lineHeight: 1.5 }}>
                        <span className="serif" style={{ float: "left", fontSize: "3.5em", lineHeight: 0.85, paddingRight: "0.12em", color: "var(--gold)", fontWeight: 300 }}>
                          {m.text.charAt(0)}
                        </span>
                        {m.text.slice(1)}
                        {m.streaming && (
                          <span style={{ display: "inline-block", width: 8, height: "1em", marginLeft: 4, background: "var(--gold)", animation: "lineMaskUp 0.6s steps(2) infinite alternate" }} />
                        )}
                      </p>
                    )}
                    {m.cites && m.cites.length > 0 && !m.streaming && (
                      <div className="mt-4 mono" style={{ color: "var(--ink-faint)" }}>
                        Cites:{" "}
                        {m.cites.map((c, idx) => (
                          <a
                            key={`${c.type}-${c.id}`}
                            href={c.type === "PROGRAM" ? `#/programs/${c.id}` : `#/scholarships/${c.id}`}
                            className="mr-3"
                            style={{ color: "var(--gold)" }}
                          >
                            [{idx + 1}]
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center gap-4 field-underline" style={{ paddingTop: 0 }}>
            <input
              placeholder={pending ? "Consulting the index…" : "Write to the counsellor…"}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") ask(); }}
              disabled={pending}
              style={{ fontSize: "1.125rem", opacity: pending ? 0.6 : 1 }}
            />
            <button
              onClick={ask}
              disabled={pending || !input.trim()}
              className="btn-ink"
              style={{ opacity: pending ? 0.65 : 1 }}
            >
              <span>{pending ? "…" : "Send"}</span>
            </button>
          </div>
          {pending && (
            <div className="mt-2 mono" style={{ color: "var(--ink-faint)", fontSize: 10 }}>
              consulting the index — one moment…
            </div>
          )}
        </div>

        <aside id="dossier" className="col-span-12 md:col-span-4 md:sticky md:top-28 self-start">
          <div className="mono pb-3 border-b border-[var(--rule-strong)]" style={{ color: "var(--ink-faint)" }}>DOSSIER · ACCUMULATED CITATIONS</div>
          {dossier.length === 0 ? (
            <div className="py-6 mono" style={{ color: "var(--ink-faint)", fontSize: 10 }}>
              Citations from the counsellor's replies will appear here.
            </div>
          ) : (
            <ul>
              {dossier.map((c, i) => (
                <DossierEntry key={`${c.type}-${c.id}`} cite={c} index={i + 1} onSave={() => toast("Saved to folio", "ok")} />
              ))}
            </ul>
          )}
        </aside>
      </section>
    </>
  );
}

// ─── Dossier entry ────────────────────────────────────────────────────────────

function DossierEntry({ cite, index, onSave }: { cite: AgentCitation; index: number; onSave: () => void }) {
  const toast = useToast();
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await savedItemsCreate({
        itemType: cite.type === "PROGRAM" ? "PROGRAM" : "SCHOLARSHIP",
        itemId: cite.id,
      });
      onSave();
    } catch (e) {
      toast(e instanceof ApiError ? e.message : "Could not save.", "error" as any);
    } finally {
      setSaving(false);
    }
  };

  return (
    <li className="py-4 border-b border-[var(--rule)]">
      <div className="flex items-baseline gap-3">
        <span className="mono tabular" style={{ color: "var(--gold)" }}>[{index}]</span>
        <div className="min-w-0">
          <a
            href={cite.type === "PROGRAM" ? `#/programs/${cite.id}` : `#/scholarships/${cite.id}`}
            className="serif hover:text-[var(--gold)]"
            style={{ fontSize: "1.0625rem" }}
          >
            {cite.title}
          </a>
          {cite.subtitle && (
            <div className="mono" style={{ color: "var(--ink-soft)", fontSize: 10 }}>
              {cite.subtitle}
              {cite.deadline ? ` · DL ${fmtDate(cite.deadline)}` : ""}
            </div>
          )}
        </div>
      </div>
      <button
        onClick={handleSave}
        disabled={saving}
        className="mt-2 mono hover:text-[var(--gold)]"
        style={{ fontSize: 10, opacity: saving ? 0.6 : 1 }}
      >
        {saving ? "SAVING…" : "SAVE TO FOLIO →"}
      </button>
    </li>
  );
}
