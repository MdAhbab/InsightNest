import { useCallback, useEffect, useState } from "react";
import { PageIntro } from "../components/PageIntro";
import { useToast } from "../components/Toast";
import { ApiError } from "../api/client";
import { fmtDate } from "../api/format";
import { useInView } from "../hooks/useScrollProgress";
import {
  agentMatchmaker,
  researchJoin,
  savedItemsCreate,
  MatchmakerEntry,
} from "../api/endpoints";

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="py-4">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="my-3 h-4 rounded" style={{ background: "var(--rule-strong)", width: `${85 - i * 12}%`, opacity: 0.6 }} />
      ))}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function Matchmaker() {
  const toast = useToast();
  const [matches, setMatches] = useState<MatchmakerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [draftFor, setDraftFor] = useState<MatchmakerEntry | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await agentMatchmaker();
      setMatches(data);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load matches.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <>
      <PageIntro
        index="β"
        kicker="RESEARCH MATCHMAKER · BETA"
        title={<>Open projects, ranked against your folio.</>}
        lede="Each row is scored from the public corpus of the lab and your stated interests. The rationale is the candid part."
        meta={loading ? "LOADING…" : `${matches.length} MATCHES`}
      />
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 pb-32">
        {loading && <Skeleton lines={6} />}

        {!loading && error && (
          <div className="py-10 flex flex-col items-center gap-4">
            <div className="mono" style={{ color: "var(--oxblood)", fontSize: 11 }}>{error}</div>
            <button onClick={load} className="btn-ink btn-ghost"><span>Retry</span></button>
          </div>
        )}

        {!loading && !error && matches.length === 0 && (
          <div className="py-12 text-center mono" style={{ color: "var(--ink-faint)" }}>
            NO MATCHES FOUND — fill out your learner profile to get personalised results.{" "}
            <a href="#/dashboard" style={{ color: "var(--gold)" }}>Update profile →</a>
          </div>
        )}

        {!loading && !error && matches.length > 0 && (
          <ul>
            {matches.map((entry, i) => (
              <MatchRow
                key={entry.project.id}
                entry={entry}
                index={i}
                onDraft={() => setDraftFor(entry)}
                onSaved={() => toast("Saved to folio", "ok")}
              />
            ))}
          </ul>
        )}
      </section>

      {draftFor && (
        <JoinModal
          entry={draftFor}
          onClose={() => setDraftFor(null)}
          onSent={() => { toast("Join request filed", "ok"); setDraftFor(null); }}
        />
      )}
    </>
  );
}

// ─── Match row ────────────────────────────────────────────────────────────────

function MatchRow({ entry, index, onDraft, onSaved }: {
  entry: MatchmakerEntry;
  index: number;
  onDraft: () => void;
  onSaved: () => void;
}) {
  const toast = useToast();
  const { ref, inView } = useInView<HTMLLIElement>(0.3);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const r = entry.project;
  const score = entry.score;
  const R = 28;
  const C = 2 * Math.PI * R;
  const dash = inView ? C * (score / 100) : 0;

  const handleSave = async () => {
    setSaving(true);
    try {
      await savedItemsCreate({ itemType: "RESEARCH_PROJECT", itemId: r.id });
      onSaved();
    } catch (e) {
      toast(e instanceof ApiError ? e.message : "Could not save.", "error" as any);
    } finally {
      setSaving(false);
    }
  };

  const tags = r.tags ? r.tags.split(",").map(t => t.trim()).filter(Boolean) : [];

  return (
    <li ref={ref} className="border-b border-[var(--rule)] py-8 grid grid-cols-12 gap-6 items-start">
      <div className="col-span-2 md:col-span-1">
        <svg width="74" height="74" viewBox="0 0 74 74">
          <circle cx="37" cy="37" r={R} fill="none" stroke="var(--rule)" strokeWidth="1" />
          <circle
            cx="37" cy="37" r={R} fill="none" stroke="var(--gold)" strokeWidth="2"
            strokeDasharray={`${dash} ${C}`} transform="rotate(-90 37 37)"
            style={{ transition: "stroke-dasharray 1.2s cubic-bezier(0.22,1,0.36,1)" }}
          />
          <text x="37" y="42" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="14" fill="var(--ink)">{score}</text>
        </svg>
      </div>
      <div className="col-span-10 md:col-span-8">
        <div className="mono" style={{ color: "var(--gold)" }}>
          {String(index + 1).padStart(2, "0")} · {r.status ?? "OPEN"}
        </div>
        <h3 className="serif mt-1" style={{ fontSize: "clamp(1.25rem, 2vw, 1.75rem)", fontWeight: 300 }}>
          <a href={`#/research/${r.id}`} className="hover:text-[var(--gold)]">{r.title}</a>
        </h3>
        <div className="mono mt-1" style={{ color: "var(--ink-soft)" }}>
          {[r.lab, r.institution, r.pi ?? r.createdBy?.fullName].filter(Boolean).join(" · ")}
        </div>
        {r.deadline && (
          <div className="mono mt-1" style={{ color: "var(--ink-faint)", fontSize: 10 }}>
            DL {fmtDate(r.deadline)}{r.openings != null ? ` · ${r.openings} opening${r.openings !== 1 ? "s" : ""}` : ""}
          </div>
        )}
        {tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {tags.slice(0, 5).map(t => (
              <span key={t} className="mono px-2 py-0.5 border border-[var(--rule)]" style={{ fontSize: 9 }}>{t}</span>
            ))}
          </div>
        )}
        <button
          onClick={() => setOpen((o) => !o)}
          className="mono mt-3"
          style={{ color: "var(--ink-soft)" }}
        >
          {open ? "− HIDE RATIONALE" : "+ WHY THIS MATCHES"}
        </button>
        <div style={{ display: "grid", gridTemplateRows: open ? "1fr" : "0fr", transition: "grid-template-rows 0.5s ease" }}>
          <div style={{ overflow: "hidden" }}>
            <blockquote
              className="serif mt-4 pl-6 border-l-2"
              style={{ borderColor: "var(--gold)", fontSize: "1.125rem", fontWeight: 300, lineHeight: 1.55, color: "var(--ink-soft)" }}
            >
              {entry.rationale}
            </blockquote>
          </div>
        </div>
      </div>
      <div className="col-span-12 md:col-span-3 flex md:flex-col items-stretch justify-end gap-3 mono" style={{ fontSize: 11 }}>
        <button onClick={onDraft} className="btn-ink btn-gold"><span>Draft join request</span></button>
        <button onClick={handleSave} disabled={saving} className="btn-ink btn-ghost" style={{ opacity: saving ? 0.65 : 1 }}>
          <span>{saving ? "Saving…" : "Save"}</span>
        </button>
      </div>
    </li>
  );
}

// ─── Join modal ────────────────────────────────────────────────────────────────

function JoinModal({ entry, onClose, onSent }: {
  entry: MatchmakerEntry;
  onClose: () => void;
  onSent: () => void;
}) {
  const toast = useToast();
  const r = entry.project;
  const piName = r.pi ?? r.createdBy?.fullName ?? "the PI";
  const piLast = piName.split(" ").slice(-1)[0];

  const defaultLetter = `Dear ${piLast},\n\nI write following the description of your group's current opening on ${r.title.toLowerCase()}. My own work over the past two years has concerned adjacent questions, and the methodology you describe would extend it in a direction I have been hoping to take.\n\nI would be grateful for thirty minutes of conversation at a time convenient to you.\n\nYours sincerely`;

  const [letter, setLetter] = useState(defaultLetter);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const handleSend = async () => {
    setSending(true);
    setError("");
    try {
      await researchJoin(r.id, { message: letter });
      onSent();
    } catch (e) {
      if (e instanceof ApiError) {
        if (e.status === 409 || (e.message?.toLowerCase().includes("already"))) {
          setError("You have already submitted a join request for this project.");
        } else {
          setError(e.message);
        }
      } else {
        setError("Failed to file join request.");
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-6"
      style={{ background: "color-mix(in srgb, var(--ink) 70%, transparent)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl p-8 md:p-10"
        style={{ background: "var(--paper)", border: "1px solid var(--rule-strong)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="serif" style={{ fontSize: "1.5rem", fontWeight: 300 }}>Draft join request</h2>
          <button onClick={onClose} className="mono">CLOSE ✕</button>
        </div>
        <div className="mono mb-2" style={{ color: "var(--ink-faint)" }}>TO · {piName}</div>
        <div className="mono mb-6" style={{ color: "var(--ink-faint)" }}>SUBJECT · Enquiry — {r.title}</div>
        <textarea
          rows={12}
          value={letter}
          onChange={(e) => setLetter(e.target.value)}
          className="w-full p-5 bg-transparent border border-[var(--rule-strong)]"
          style={{ fontFamily: "var(--font-serif)", fontSize: "1.0625rem", lineHeight: 1.6, color: "var(--ink)" }}
        />
        {error && <div className="mono mt-3" style={{ color: "var(--oxblood)", fontSize: 11 }}>{error}</div>}
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="btn-ink btn-ghost"><span>Discard</span></button>
          <button
            onClick={handleSend}
            disabled={sending}
            className="btn-ink btn-gold"
            style={{ opacity: sending ? 0.65 : 1 }}
          >
            <span>{sending ? "Filing…" : "File for sending"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
