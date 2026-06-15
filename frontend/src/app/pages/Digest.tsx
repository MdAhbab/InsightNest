import { useCallback, useEffect, useState } from "react";
import { PageIntro } from "../components/PageIntro";
import { useSession } from "../providers/SessionProvider";
import { useToast } from "../components/Toast";
import { ApiError } from "../api/client";
import { fmtDate } from "../api/format";
import { agentDigest, agentSentinelRun, DigestItem, DigestResponse } from "../api/endpoints";

// ─── Snooze / remove helpers (UI-local, localStorage) ────────────────────────
// Per INTEGRATION_AUDIT §2: "digest snooze (localStorage)" stays UI-local.

function getISOWeek(): string {
  const d = new Date();
  const day = d.getDay() || 7;
  d.setDate(d.getDate() + 4 - day);
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

const HIDDEN_KEY = "insightnest.digest.hidden";
const SNOOZED_KEY = "insightnest.digest.snoozed";

function getHiddenIds(): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem(HIDDEN_KEY) ?? "[]")); } catch { return new Set(); }
}
function addHiddenId(key: string) {
  const s = getHiddenIds(); s.add(key);
  localStorage.setItem(HIDDEN_KEY, JSON.stringify([...s]));
}

type SnoozedEntry = { key: string; until: string }; // until = ISO date
function getSnoozedEntries(): SnoozedEntry[] {
  try { return JSON.parse(localStorage.getItem(SNOOZED_KEY) ?? "[]"); } catch { return []; }
}
function addSnoozed(key: string) {
  const d = new Date(); d.setDate(d.getDate() + 7);
  const entries = getSnoozedEntries().filter(e => e.key !== key);
  entries.push({ key, until: d.toISOString().split("T")[0] });
  localStorage.setItem(SNOOZED_KEY, JSON.stringify(entries));
}
function isSnoozedNow(key: string): boolean {
  const today = new Date().toISOString().split("T")[0];
  return getSnoozedEntries().some(e => e.key === key && e.until > today);
}
function itemKey(item: DigestItem): string { return `${item.type}-${item.id}`; }

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="py-4">
      {[80, 68, 55, 72, 60].map((w, i) => (
        <div key={i} className="my-4 h-5 rounded" style={{ background: "var(--rule-strong)", width: `${w}%`, opacity: 0.55 }} />
      ))}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function Digest() {
  const { session } = useSession();
  const toast = useToast();
  const [digest, setDigest] = useState<DigestResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [delivering, setDelivering] = useState(false);
  // UI-local hidden tracking
  const [hiddenKeys, setHiddenKeys] = useState<Set<string>>(getHiddenIds);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await agentDigest();
      setDigest(data);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load digest.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const deliver = async () => {
    setDelivering(true);
    try {
      const data = await agentSentinelRun();
      setDigest(data);
      toast("Bulletin delivered to your notifications.", "ok");
    } catch (e) {
      toast(e instanceof ApiError ? e.message : "Could not deliver the bulletin.", "err");
    } finally {
      setDelivering(false);
    }
  };

  const handleRemove = (item: DigestItem) => {
    const k = itemKey(item);
    addHiddenId(k);
    setHiddenKeys(prev => new Set([...prev, k]));
    // UI-local with toast — per §2 stays local
    toast("Item removed from this bulletin (stored on this device)", "info");
  };

  const handleSnooze = (item: DigestItem) => {
    const k = itemKey(item);
    addSnoozed(k);
    setHiddenKeys(prev => new Set([...prev, k]));
    toast("Snoozed for 7 days (stored on this device)", "info");
  };

  const isHidden = (item: DigestItem) => {
    const k = itemKey(item);
    return hiddenKeys.has(k) || isSnoozedNow(k);
  };

  const applyRoute = (item: DigestItem): string => {
    switch (item.type.toUpperCase()) {
      case "PROGRAM": return `#/programs/${item.id}`;
      case "SCHOLARSHIP": return `#/scholarships/${item.id}`;
      case "WEBINAR": return `#/webinars/${item.id}`;
      case "RESEARCH_PROJECT": return `#/research/${item.id}`;
      default: return "#/";
    }
  };

  const displayName = session.name.split(" ")[0] || "Reader";
  const firstName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
  const dateline = digest?.generatedAt
    ? fmtDate(digest.generatedAt)
    : new Date().toISOString().split("T")[0].replace(/-/g, ".");

  const urgentFiltered = (digest?.urgent ?? []).filter(i => !isHidden(i));
  const approachingFiltered = (digest?.approaching ?? []).filter(i => !isHidden(i));
  const webinarsFiltered = (digest?.webinars ?? []).filter(i => !isHidden(i));

  return (
    <>
      <PageIntro
        index="δ"
        kicker="DEADLINE SENTINEL · WEEKLY BULLETIN"
        title={<>What arrives next.</>}
        lede="A printed bulletin of the deadlines closing soonest among your saved and matched items."
        meta={`DATELINE · ${dateline}`}
      />
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 pb-32">
        <div className="border-t-2 border-b border-[var(--ink)] py-6 grid grid-cols-12 gap-6 mono" style={{ color: "var(--ink-soft)" }}>
          <div className="col-span-12 md:col-span-3"><span style={{ color: "var(--gold)" }}>EDITOR</span> · The Sentinel</div>
          <div className="col-span-12 md:col-span-3"><span style={{ color: "var(--gold)" }}>DATELINE</span> · {dateline}</div>
          <div className="col-span-12 md:col-span-3"><span style={{ color: "var(--gold)" }}>FOR THE ATTENTION OF</span> · {firstName} S.</div>
          <div className="col-span-12 md:col-span-3"><span style={{ color: "var(--gold)" }}>WEEK</span> · {getISOWeek()}</div>
        </div>

        {!loading && !error && (
          <div className="flex justify-end mt-4">
            <button onClick={deliver} disabled={delivering} className="btn-ink btn-ghost self-end">
              <span>{delivering ? "Delivering…" : "Deliver this bulletin to my notifications"}</span>
            </button>
          </div>
        )}

        {loading && <Skeleton />}

        {!loading && error && (
          <div className="py-10 flex flex-col gap-4">
            <div className="mono" style={{ color: "var(--oxblood)", fontSize: 11 }}>{error}</div>
            <button onClick={load} className="btn-ink btn-ghost self-start"><span>Retry</span></button>
          </div>
        )}

        {!loading && !error && digest && (
          <div className="mt-10 grid grid-cols-12 gap-10">
            {/* Column I — Most urgent */}
            <div className="col-span-12 md:col-span-6 border-r-0 md:border-r border-[var(--rule)] pr-0 md:pr-10">
              <h2 className="serif pb-3 border-b border-[var(--ink)]" style={{ fontSize: "1.875rem", fontWeight: 300 }}>Most urgent</h2>
              {urgentFiltered.length === 0 && (
                <div className="py-8 mono" style={{ color: "var(--ink-faint)" }}>
                  No urgent items — all deadlines are more than 30 days away.
                </div>
              )}
              <ul>
                {urgentFiltered.map((item, i) => (
                  <li key={itemKey(item)} className="py-6 border-b border-[var(--rule)]">
                    <div className="mono mb-1" style={{ color: "var(--gold)" }}>
                      {String(i + 1).padStart(2, "0")} · CLOSES {item.deadline ? fmtDate(item.deadline) : "—"}
                    </div>
                    <div className="serif" style={{ fontSize: "1.5rem", fontWeight: 300, lineHeight: 1.15 }}>{item.title}</div>
                    {item.subtitle && (
                      <div className="mono mt-1" style={{ color: "var(--ink-soft)" }}>{item.subtitle}</div>
                    )}
                    <div className="mt-3 flex gap-3 mono" style={{ fontSize: 11 }}>
                      <a href={applyRoute(item)} className="hover:text-[var(--gold)]">APPLY →</a>
                      {/* SNOOZE and REMOVE are UI-local (per audit §2) */}
                      <button onClick={() => handleSnooze(item)} className="hover:text-[var(--gold)]">SNOOZE 7d</button>
                      <button onClick={() => handleRemove(item)} className="hover:text-[var(--gold)]">REMOVE</button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column II — Approaching + webinars */}
            <div className="col-span-12 md:col-span-6">
              <h2 className="serif pb-3 border-b border-[var(--ink)]" style={{ fontSize: "1.875rem", fontWeight: 300 }}>Approaching, with notice</h2>
              {approachingFiltered.length === 0 && (
                <div className="py-5 mono" style={{ color: "var(--ink-faint)" }}>
                  No approaching deadlines within 90 days.
                </div>
              )}
              <ul>
                {approachingFiltered.map((item, i) => (
                  <li key={itemKey(item)} className="py-5 border-b border-[var(--rule)] grid grid-cols-12 gap-3">
                    <div className="col-span-2 mono tabular" style={{ color: "var(--gold)" }}>
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <div className="col-span-7">
                      <a href={applyRoute(item)} className="serif hover:text-[var(--gold)]" style={{ fontSize: "1.0625rem" }}>
                        {item.title}
                      </a>
                      {item.subtitle && <div className="mono" style={{ color: "var(--ink-soft)" }}>{item.subtitle}</div>}
                    </div>
                    <div className="col-span-3 text-right mono" style={{ color: "var(--gold)" }}>
                      {item.deadline ? fmtDate(item.deadline) : "—"}
                    </div>
                  </li>
                ))}
              </ul>

              {webinarsFiltered.length > 0 && (
                <>
                  <h2 className="serif pb-3 mt-10 border-b border-[var(--ink)]" style={{ fontSize: "1.875rem", fontWeight: 300 }}>And the standing programme</h2>
                  <ul>
                    {webinarsFiltered.map((item) => (
                      <li key={itemKey(item)} className="py-4 border-b border-[var(--rule)] flex items-baseline justify-between gap-3">
                        <a href={`#/webinars/${item.id}`} className="serif hover:text-[var(--gold)]" style={{ fontSize: "1.0625rem" }}>
                          {item.title}
                        </a>
                        <div className="mono whitespace-nowrap" style={{ color: "var(--gold)" }}>
                          {item.deadline ? fmtDate(item.deadline) : ""}
                        </div>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>
        )}

        {!loading && !error && digest && urgentFiltered.length === 0 && approachingFiltered.length === 0 && webinarsFiltered.length === 0 && (
          <div className="mt-10 py-8 mono text-center" style={{ color: "var(--ink-faint)" }}>
            Save programmes, scholarships or register for webinars to see your digest here.{" "}
            <a href="#/programs" style={{ color: "var(--gold)" }}>Browse programmes →</a>
          </div>
        )}
      </section>
    </>
  );
}
