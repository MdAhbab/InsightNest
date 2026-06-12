import { useCallback, useEffect, useState } from "react";
import { PageIntro } from "../components/PageIntro";
import { SplitFlap } from "../components/SplitFlap";
import { ActionDrawer, Confirm, DField, DSection } from "../components/ActionDrawer";
import { useToast } from "../components/Toast";
import { useSession } from "../providers/SessionProvider";
import { ApiError } from "../api/client";
import { statusLabel, fmtDate } from "../api/format";
import {
  programApplicationsMe,
  scholarshipApplicationsMe,
  programApplicationWithdraw,
  scholarshipApplicationWithdraw,
  savedItemsList,
  savedItemsDelete,
  notificationsList,
  notificationsMarkRead,
  notificationsReadAll,
  agentDigest,
  learnerProfileGet,
  learnerProfilePut,
  ProgramApplicationDto,
  ScholarshipApplicationDto,
  SavedItemDto,
  NotificationDto,
  DigestResponse,
  LearnerProfileDto,
} from "../api/endpoints";

const TABS = [
  { key: "overview",      label: "Overview",      idx: "01" },
  { key: "applications",  label: "Applications",  idx: "02" },
  { key: "saved",         label: "Saved",         idx: "03" },
  { key: "notifications", label: "Notifications", idx: "04" },
  { key: "digest",        label: "Digest",        idx: "05" },
  { key: "profile",       label: "Profile",       idx: "06" },
] as const;

// ─── Unified application row ──────────────────────────────────────────────────

type AppRow = {
  id: number;
  ref: string;
  kind: "program" | "scholarship";
  title: string;
  subtitle?: string;
  submitted: string;
  status: string;
  displayStatus: string;
};

function buildRows(
  progApps: ProgramApplicationDto[],
  scholApps: ScholarshipApplicationDto[]
): AppRow[] {
  const rows: AppRow[] = [];
  for (const a of progApps) {
    rows.push({
      id: a.id,
      ref: `AP-${String(a.id).padStart(3, "0")}`,
      kind: "program",
      title: a.program.name,
      subtitle: a.program.university?.name,
      submitted: fmtDate(a.createdAt),
      status: a.status,
      displayStatus: statusLabel(a.status),
    });
  }
  for (const a of scholApps) {
    rows.push({
      id: a.id,
      ref: `SC-${String(a.id).padStart(3, "0")}`,
      kind: "scholarship",
      title: a.scholarship.title,
      submitted: fmtDate(a.createdAt),
      status: a.status,
      displayStatus: statusLabel(a.status),
    });
  }
  return rows;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton({ lines = 3, className = "" }: { lines?: number; className?: string }) {
  return (
    <div className={className}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="my-3 h-4 rounded"
          style={{ background: "var(--rule-strong)", width: `${85 - i * 12}%`, opacity: 0.6 }}
        />
      ))}
    </div>
  );
}

// ─── Error + retry ────────────────────────────────────────────────────────────

function ErrorRetry({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="py-10 flex flex-col items-center gap-4">
      <div className="mono" style={{ color: "var(--oxblood)", fontSize: 11 }}>{message}</div>
      <button onClick={onRetry} className="btn-ink btn-ghost"><span>Retry</span></button>
    </div>
  );
}

// ─── Status colour ────────────────────────────────────────────────────────────

function statusColour(status: string) {
  if (status === "APPROVED") return "var(--moss)";
  if (status === "REJECTED") return "var(--oxblood)";
  if (status === "WITHDRAWN") return "var(--ink-faint)";
  return "var(--ink)";
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function Dashboard() {
  const toast = useToast();
  const { session } = useSession();
  const [tab, setTab] = useState<typeof TABS[number]["key"]>("overview");

  // Applications
  const [appRows, setAppRows] = useState<AppRow[]>([]);
  const [appsLoading, setAppsLoading] = useState(false);
  const [appsError, setAppsError] = useState("");

  // Saved items
  const [saved, setSaved] = useState<SavedItemDto[]>([]);
  const [savedLoading, setSavedLoading] = useState(false);
  const [savedError, setSavedError] = useState("");

  // Notifications
  const [notifs, setNotifs] = useState<NotificationDto[]>([]);
  const [notifsLoading, setNotifsLoading] = useState(false);
  const [notifsError, setNotifsError] = useState("");

  // Digest
  const [digest, setDigest] = useState<DigestResponse | null>(null);
  const [digestLoading, setDigestLoading] = useState(false);
  const [digestError, setDigestError] = useState("");

  // View / confirm
  const [viewApp, setViewApp] = useState<AppRow | null>(null);
  const [withdrawApp, setWithdrawApp] = useState<AppRow | null>(null);
  const [withdrawing, setWithdrawing] = useState(false);

  // ─── Loaders ────────────────────────────────────────────────────────────────

  const loadApps = useCallback(async () => {
    setAppsLoading(true);
    setAppsError("");
    try {
      const [prog, schol] = await Promise.all([
        programApplicationsMe(),
        scholarshipApplicationsMe(),
      ]);
      setAppRows(buildRows(prog, schol));
    } catch (e) {
      setAppsError(e instanceof ApiError ? e.message : "Failed to load applications.");
    } finally {
      setAppsLoading(false);
    }
  }, []);

  const loadSaved = useCallback(async () => {
    setSavedLoading(true);
    setSavedError("");
    try {
      const items = await savedItemsList();
      setSaved(items);
    } catch (e) {
      setSavedError(e instanceof ApiError ? e.message : "Failed to load saved items.");
    } finally {
      setSavedLoading(false);
    }
  }, []);

  const loadNotifs = useCallback(async () => {
    setNotifsLoading(true);
    setNotifsError("");
    try {
      const data = await notificationsList({ page: 0, size: 50 });
      setNotifs(data.content);
    } catch (e) {
      setNotifsError(e instanceof ApiError ? e.message : "Failed to load notifications.");
    } finally {
      setNotifsLoading(false);
    }
  }, []);

  const loadDigest = useCallback(async () => {
    setDigestLoading(true);
    setDigestError("");
    try {
      const data = await agentDigest();
      setDigest(data);
    } catch (e) {
      setDigestError(e instanceof ApiError ? e.message : "Failed to load digest.");
    } finally {
      setDigestLoading(false);
    }
  }, []);

  // Load on mount
  useEffect(() => {
    loadApps();
    loadSaved();
    loadNotifs();
  }, [loadApps, loadSaved, loadNotifs]);

  // Load digest when tab is opened
  useEffect(() => {
    if (tab === "digest" && !digest && !digestLoading) {
      loadDigest();
    }
  }, [tab, digest, digestLoading, loadDigest]);

  // ─── Counts for stat tiles ───────────────────────────────────────────────────

  const unreadNotifCount = notifs.filter(n => !n.readAt).length;
  const digestUrgentCount = digest?.urgent.length ?? 0;

  // ─── Withdraw handler ────────────────────────────────────────────────────────

  const handleWithdraw = async () => {
    if (!withdrawApp) return;
    setWithdrawing(true);
    try {
      if (withdrawApp.kind === "program") {
        await programApplicationWithdraw(withdrawApp.id);
      } else {
        await scholarshipApplicationWithdraw(withdrawApp.id);
      }
      toast("Application withdrawn", "info");
      setWithdrawApp(null);
      await loadApps();
    } catch (e) {
      toast(e instanceof ApiError ? e.message : "Withdrawal failed.", "error" as any);
    } finally {
      setWithdrawing(false);
    }
  };

  // ─── Greeting ────────────────────────────────────────────────────────────────

  const greeting = (() => {
    const h = new Date().getHours();
    return h < 6 ? "Working late" : h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
  })();

  const firstName = session.name.split(" ")[0] || "Friend";
  const pendingApps = appRows.filter(a => a.status === "PENDING" || a.status === "NEEDS_INFO").length;

  return (
    <>
      <PageIntro
        index="00"
        kicker={`DASHBOARD · ${session.role.toUpperCase()}`}
        title={<><span style={{ color: "var(--ink-soft)" }}>{greeting},</span> {firstName} —</>}
        lede={<>{pendingApps} application{pendingApps !== 1 ? "s" : ""} in flight, {unreadNotifCount} unread note{unreadNotifCount !== 1 ? "s" : ""}.</>}
        meta="LAST UPDATED · JUST NOW"
      />

      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 pb-32 grid grid-cols-12 gap-6 md:gap-10">
        {/* Sidebar */}
        <aside className="col-span-12 md:col-span-3 md:sticky md:top-28 self-start space-y-6">
          <div className="border border-[var(--rule-strong)] p-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 border border-[var(--ink)] flex items-center justify-center serif" style={{ fontSize: 22 }}>{session.initial}</div>
              <div className="min-w-0">
                <div className="serif truncate" style={{ fontSize: "1.0625rem" }}>{session.name}</div>
                <div className="mono" style={{ color: "var(--ink-faint)", fontSize: 10 }}>FOLIO</div>
              </div>
            </div>
            <div className="mt-4 inline-block mono px-2 py-1 border border-[var(--gold)]" style={{ color: "var(--gold)", fontSize: 10 }}>{session.role.toUpperCase()}</div>
          </div>

          <div className="md:hidden -mx-1 overflow-x-auto no-scrollbar">
            <div className="inline-flex gap-px min-w-full" style={{ background: "var(--rule)" }}>
              {TABS.map((t) => (
                <button key={t.key} onClick={() => setTab(t.key)} className="px-4 py-3 mono whitespace-nowrap" style={{ background: t.key === tab ? "var(--ink)" : "var(--paper)", color: t.key === tab ? "var(--paper)" : "var(--ink-soft)", fontSize: 11 }}>
                  {t.idx} · {t.label}
                </button>
              ))}
            </div>
          </div>

          <ul className="hidden md:block space-y-2">
            {TABS.map((t) => (
              <li key={t.key}>
                <button onClick={() => setTab(t.key)} className="flex items-baseline gap-3 w-full text-left py-2 border-b border-[var(--rule)]" style={{ color: t.key === tab ? "var(--ink)" : "var(--ink-soft)" }}>
                  <span className="mono" style={{ color: t.key === tab ? "var(--gold)" : "var(--ink-faint)" }}>{t.idx}</span>
                  <span className="serif" style={{ fontSize: "1.0625rem", fontWeight: 300 }}>{t.label}</span>
                  {t.key === tab && <span className="ml-auto mono" style={{ color: "var(--gold)" }}>●</span>}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <div className="col-span-12 md:col-span-9 space-y-12">
          {/* Stat tiles */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px" style={{ background: "var(--rule)" }}>
            {[
              { l: "Applications", n: appRows.length, p: 2 },
              { l: "Saved", n: saved.length, p: 2 },
              { l: "Unread Notes", n: unreadNotifCount, p: 2 },
              { l: "Urgent Items", n: digestUrgentCount, p: 2 },
            ].map((s) => (
              <div key={s.l} className="p-5 sm:p-6" style={{ background: "var(--paper-raised)" }}>
                <div className="mono" style={{ color: "var(--ink-faint)", fontSize: 10 }}>{s.l.toUpperCase()}</div>
                <div className="serif tabular mt-3" style={{ fontSize: "clamp(2rem, 4vw, 3.25rem)", fontWeight: 300, lineHeight: 1 }}>
                  <SplitFlap value={s.n} pad={s.p} />
                </div>
              </div>
            ))}
          </div>

          {/* ── Overview ── */}
          {tab === "overview" && (
            <section className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-px" style={{ background: "var(--rule)" }}>
                {[
                  { label: "Find a programme", to: "#/programs", desc: "Browse the catalogue." },
                  { label: "Open Counsellor", to: "#/counsellor", desc: "Ask the agent for the next move." },
                  { label: "Sentinel digest", to: "#/digest", desc: "Read this week's bulletin." },
                ].map((c) => (
                  <a key={c.label} href={c.to} className="p-6 hover:bg-[var(--paper-deep)] transition-colors" style={{ background: "var(--paper-raised)" }}>
                    <div className="mono" style={{ color: "var(--gold)", fontSize: 10 }}>QUICK ACTION</div>
                    <div className="serif mt-2" style={{ fontSize: "1.25rem", fontWeight: 300 }}>{c.label}</div>
                    <div className="mono mt-2" style={{ color: "var(--ink-soft)" }}>{c.desc}</div>
                    <div className="mono mt-4" style={{ color: "var(--ink-faint)" }}>OPEN →</div>
                  </a>
                ))}
              </div>

              <section>
                <header className="flex items-end justify-between pb-4 border-b border-[var(--rule)]">
                  <div className="flex items-baseline gap-4"><span className="section-index">A</span><h2 className="serif" style={{ fontWeight: 300 }}>Recent applications</h2></div>
                  <button onClick={() => setTab("applications")} className="mono" style={{ color: "var(--gold)" }}>ALL →</button>
                </header>
                {appsLoading && <Skeleton lines={3} className="py-4" />}
                {!appsLoading && appsError && (
                  <div className="py-4 mono" style={{ color: "var(--oxblood)", fontSize: 11 }}>{appsError}</div>
                )}
                {!appsLoading && !appsError && appRows.length === 0 && (
                  <div className="py-8 mono" style={{ color: "var(--ink-faint)" }}>No applications yet. <a href="#/programs" style={{ color: "var(--gold)" }}>Browse programmes →</a></div>
                )}
                <ul>
                  {appRows.slice(0, 3).map((a) => (
                    <li key={a.ref} className="py-4 border-b border-[var(--rule)] flex items-baseline justify-between gap-3">
                      <div>
                        <div className="serif" style={{ fontSize: "1.0625rem" }}>{a.title}</div>
                        {a.subtitle && <div className="mono" style={{ color: "var(--ink-faint)", fontSize: 10 }}>{a.subtitle}</div>}
                      </div>
                      <span className="mono" style={{ color: statusColour(a.status), fontSize: 10 }}>{a.displayStatus}</span>
                    </li>
                  ))}
                </ul>
              </section>
            </section>
          )}

          {/* ── Applications ── */}
          {tab === "applications" && (
            <section>
              <header className="flex items-end justify-between pb-4 border-b border-[var(--rule)] gap-3 flex-wrap">
                <div className="flex items-baseline gap-4"><span className="section-index">02</span><h2 className="serif" style={{ fontWeight: 300 }}>Applications</h2></div>
                <a href="#/programs" className="btn-ink btn-gold"><span>+ Browse programmes</span></a>
              </header>

              {appsLoading && <Skeleton lines={4} className="py-4" />}
              {!appsLoading && appsError && <ErrorRetry message={appsError} onRetry={loadApps} />}
              {!appsLoading && !appsError && appRows.length === 0 && (
                <div className="py-12 text-center">
                  <div className="mono" style={{ color: "var(--ink-faint)" }}>NO APPLICATIONS YET</div>
                  <a href="#/programs" className="btn-ink mt-6 inline-flex"><span>Browse programmes</span></a>
                </div>
              )}

              {!appsLoading && !appsError && appRows.length > 0 && (
                <div className="overflow-x-auto no-scrollbar">
                  <table className="w-full min-w-[600px]">
                    <thead>
                      <tr className="mono text-left" style={{ color: "var(--ink-faint)", fontSize: 10 }}>
                        <th className="py-3 font-normal">REF</th>
                        <th className="py-3 font-normal">PROGRAMME / SCHOLARSHIP</th>
                        <th className="py-3 font-normal hidden md:table-cell">SUBMITTED</th>
                        <th className="py-3 font-normal">STATUS</th>
                        <th className="py-3 font-normal text-right">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appRows.map((a) => (
                        <tr key={a.ref} className="border-t border-[var(--rule)]">
                          <td className="py-4 mono tabular" style={{ color: "var(--gold)", fontSize: 11 }}>{a.ref}</td>
                          <td className="py-4">
                            <div className="serif" style={{ fontSize: "1.0625rem" }}>{a.title}</div>
                            {a.subtitle && <div className="mono" style={{ color: "var(--ink-soft)", fontSize: 10 }}>{a.subtitle}</div>}
                          </td>
                          <td className="py-4 mono hidden md:table-cell" style={{ color: "var(--ink-soft)" }}>{a.submitted}</td>
                          <td className="py-4 mono" style={{ color: statusColour(a.status), fontSize: 11 }}>{a.displayStatus}</td>
                          <td className="py-4 text-right mono flex justify-end gap-2 flex-wrap" style={{ fontSize: 10 }}>
                            <button onClick={() => setViewApp(a)} className="hover:text-[var(--gold)] px-2">VIEW</button>
                            {/* Bug 13: only show withdraw for PENDING/NEEDS_INFO */}
                            {(a.status === "PENDING" || a.status === "NEEDS_INFO") && (
                              <button onClick={() => setWithdrawApp(a)} className="hover:text-[var(--oxblood)] px-2">WITHDRAW</button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

          {/* ── Saved ── */}
          {tab === "saved" && (
            <section>
              <header className="flex items-end justify-between pb-4 border-b border-[var(--rule)]">
                <div className="flex items-baseline gap-4"><span className="section-index">03</span><h2 className="serif" style={{ fontWeight: 300 }}>Saved items</h2></div>
                {saved.length > 0 && (
                  <button
                    onClick={async () => {
                      try {
                        await Promise.all(saved.map(s => savedItemsDelete(s.id)));
                        setSaved([]);
                        toast("Cleared saved list", "info");
                      } catch {
                        toast("Failed to clear saved list", "error" as any);
                      }
                    }}
                    className="mono hover:text-[var(--oxblood)]"
                  >CLEAR ALL</button>
                )}
              </header>

              {savedLoading && <Skeleton lines={3} className="py-4" />}
              {!savedLoading && savedError && <ErrorRetry message={savedError} onRetry={loadSaved} />}
              {!savedLoading && !savedError && saved.length === 0 && (
                <div className="py-12 text-center">
                  <div className="mono" style={{ color: "var(--ink-faint)" }}>NOTHING SAVED YET</div>
                  <a href="#/programs" className="btn-ink mt-6 inline-flex"><span>Browse programmes</span></a>
                </div>
              )}

              <ul>
                {saved.map((s) => {
                  const typeLabel = s.itemType.replace("_", " ").toLowerCase();
                  const href = (() => {
                    switch (s.itemType) {
                      case "UNIVERSITY": return `#/universities/${s.itemId}`;
                      case "PROGRAM": return `#/programs/${s.itemId}`;
                      case "SCHOLARSHIP": return `#/scholarships/${s.itemId}`;
                      case "RESEARCH_PROJECT": return `#/research/${s.itemId}`;
                      case "WEBINAR": return `#/webinars/${s.itemId}`;
                      default: return "#/";
                    }
                  })();
                  return (
                    <li key={s.id} className="py-4 border-b border-[var(--rule)] grid grid-cols-12 gap-3 items-baseline">
                      <a href={href} className="col-span-12 md:col-span-8 serif hover:text-[var(--gold)]" style={{ fontSize: "1.0625rem" }}>
                        {s.title ?? `${typeLabel} #${s.itemId}`}
                      </a>
                      <div className="col-span-6 md:col-span-2 mono" style={{ color: "var(--ink-soft)", fontSize: 10 }}>{typeLabel.toUpperCase()}</div>
                      <div className="col-span-6 md:col-span-1 mono" style={{ color: "var(--ink-faint)", fontSize: 10 }}>{fmtDate(s.createdAt)}</div>
                      <button
                        onClick={async () => {
                          try {
                            await savedItemsDelete(s.id);
                            setSaved(prev => prev.filter(x => x.id !== s.id));
                            toast("Removed from folio", "info");
                          } catch {
                            toast("Failed to remove", "error" as any);
                          }
                        }}
                        className="col-span-12 md:col-span-1 text-right mono hover:text-[var(--oxblood)]"
                        style={{ fontSize: 10 }}
                      >REMOVE</button>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {/* ── Notifications ── */}
          {tab === "notifications" && (
            <section>
              <header className="flex items-end justify-between pb-4 border-b border-[var(--rule)]">
                <div className="flex items-baseline gap-4"><span className="section-index">04</span><h2 className="serif" style={{ fontWeight: 300 }}>Notifications</h2></div>
                {notifs.some(n => !n.readAt) && (
                  <button
                    onClick={async () => {
                      try {
                        await notificationsReadAll();
                        setNotifs(prev => prev.map(n => ({ ...n, readAt: new Date().toISOString() })));
                        toast("Marked all as read");
                      } catch {
                        toast("Failed to mark all read", "error" as any);
                      }
                    }}
                    className="mono hover:text-[var(--gold)]"
                  >MARK ALL READ</button>
                )}
              </header>

              {notifsLoading && <Skeleton lines={3} className="py-4" />}
              {!notifsLoading && notifsError && <ErrorRetry message={notifsError} onRetry={loadNotifs} />}
              {!notifsLoading && !notifsError && notifs.length === 0 && (
                <div className="py-8 mono" style={{ color: "var(--ink-faint)" }}>No notifications yet.</div>
              )}

              <ul>
                {notifs.map((n) => {
                  const unread = !n.readAt;
                  return (
                    <li key={n.id} className="py-4 border-b border-[var(--rule)] flex items-start gap-4">
                      <span className="w-2 h-2 mt-3 shrink-0" style={{ background: unread ? "var(--gold)" : "transparent", border: unread ? "none" : "1px solid var(--ink-faint)" }} />
                      <div className="flex-1">
                        {n.title && <div className="serif" style={{ fontSize: "1.0625rem" }}>{n.title}</div>}
                        <button
                          className="text-left hover:text-[var(--gold)]"
                          onClick={async () => {
                            if (unread) {
                              try {
                                await notificationsMarkRead(n.id);
                                setNotifs(prev => prev.map(x => x.id === n.id ? { ...x, readAt: new Date().toISOString() } : x));
                              } catch {
                                // silent
                              }
                            }
                          }}
                        >
                          {n.message}
                        </button>
                      </div>
                      <div className="mono" style={{ color: "var(--ink-faint)", fontSize: 10 }}>{fmtDate(n.createdAt)}</div>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {/* ── Digest ── */}
          {tab === "digest" && (
            <section>
              <header className="flex items-end justify-between pb-4 border-b border-[var(--rule)]">
                <div className="flex items-baseline gap-4"><span className="section-index">05</span><h2 className="serif" style={{ fontWeight: 300 }}>This week's Sentinel</h2></div>
                <a href="#/digest" className="mono" style={{ color: "var(--gold)" }}>OPEN FULL BULLETIN →</a>
              </header>

              {digestLoading && <Skeleton lines={5} className="py-4" />}
              {!digestLoading && digestError && <ErrorRetry message={digestError} onRetry={loadDigest} />}

              {!digestLoading && !digestError && digest && (
                <>
                  {digest.urgent.length > 0 && (
                    <div className="mb-6">
                      <div className="mono py-2" style={{ color: "var(--oxblood)", fontSize: 10 }}>URGENT — CLOSING WITHIN 30 DAYS</div>
                      <ul>
                        {digest.urgent.map((item, i) => (
                          <li key={item.id} className="py-4 border-b border-[var(--rule)] grid grid-cols-12 gap-3 items-baseline">
                            <span className="col-span-1 mono tabular" style={{ color: "var(--oxblood)" }}>{String(i + 1).padStart(2, "0")}</span>
                            <div className="col-span-8 serif" style={{ fontSize: "1.0625rem" }}>{item.title}</div>
                            {item.deadline && <div className="col-span-3 text-right mono" style={{ color: "var(--oxblood)", fontSize: 10 }}>DL {fmtDate(item.deadline)}</div>}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {digest.approaching.length > 0 && (
                    <div className="mb-6">
                      <div className="mono py-2" style={{ color: "var(--gold)", fontSize: 10 }}>APPROACHING — WITHIN 90 DAYS</div>
                      <ul>
                        {digest.approaching.map((item, i) => (
                          <li key={item.id} className="py-4 border-b border-[var(--rule)] grid grid-cols-12 gap-3 items-baseline">
                            <span className="col-span-1 mono tabular" style={{ color: "var(--gold)" }}>{String(i + 1).padStart(2, "0")}</span>
                            <div className="col-span-8 serif" style={{ fontSize: "1.0625rem" }}>{item.title}</div>
                            {item.deadline && <div className="col-span-3 text-right mono" style={{ color: "var(--gold)", fontSize: 10 }}>DL {fmtDate(item.deadline)}</div>}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {digest.webinars.length > 0 && (
                    <div>
                      <div className="mono py-2" style={{ color: "var(--ink-faint)", fontSize: 10 }}>WEBINARS</div>
                      <ul>
                        {digest.webinars.map((item, i) => (
                          <li key={item.id} className="py-4 border-b border-[var(--rule)] grid grid-cols-12 gap-3 items-baseline">
                            <span className="col-span-1 mono tabular" style={{ color: "var(--ink-faint)" }}>{String(i + 1).padStart(2, "0")}</span>
                            <div className="col-span-8 serif" style={{ fontSize: "1.0625rem" }}>{item.title}</div>
                            {item.deadline && <div className="col-span-3 text-right mono" style={{ color: "var(--ink-soft)", fontSize: 10 }}>{fmtDate(item.deadline)}</div>}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {digest.urgent.length === 0 && digest.approaching.length === 0 && digest.webinars.length === 0 && (
                    <div className="py-8 mono" style={{ color: "var(--ink-faint)" }}>
                      Save programmes, scholarships, or register for webinars to see your digest here.
                    </div>
                  )}
                </>
              )}

              <div className="mt-6 flex justify-end gap-3">
                <a href="#/webinars" className="btn-ink btn-ghost"><span>Standing programme</span></a>
                <a href="#/digest" className="btn-ink btn-gold"><span>Configure Sentinel</span></a>
              </div>
            </section>
          )}

          {/* ── Profile ── */}
          {tab === "profile" && (
            session.role === "Learner"
              ? <LearnerProfile />
              : (
                <section className="space-y-6">
                  <header className="flex items-end justify-between pb-4 border-b border-[var(--rule)]">
                    <div className="flex items-baseline gap-4"><span className="section-index">06</span><h2 className="serif" style={{ fontWeight: 300 }}>Profile</h2></div>
                  </header>
                  <p style={{ color: "var(--ink-soft)" }}>
                    For Faculty and Rep profiles, visit <a href="#/settings" style={{ color: "var(--gold)" }}>Settings →</a>
                  </p>
                </section>
              )
          )}
        </div>
      </section>

      {/* Application detail drawer */}
      <ApplicationView app={viewApp} onClose={() => setViewApp(null)} />

      {/* Withdraw confirmation */}
      <Confirm
        open={!!withdrawApp}
        onClose={() => setWithdrawApp(null)}
        onConfirm={handleWithdraw}
        title="Withdraw this application?"
        body={
          <>You will be able to submit a fresh application for the same programme, but this submission will be removed from the review queue.</>
        }
        confirmLabel={withdrawing ? "Withdrawing…" : "Withdraw"}
        danger
      />
    </>
  );
}

// ─── Application detail drawer ───────────────────────────────────────────────

function ApplicationView({ app, onClose }: { app: AppRow | null; onClose: () => void }) {
  if (!app) return null;
  return (
    <ActionDrawer
      open={!!app}
      onClose={onClose}
      kicker={`APPLICATION · ${app.ref}`}
      title={app.title}
      footer={
        <>
          <a href={app.kind === "program" ? `#/programs/${app.id}` : `#/scholarships/${app.id}`} className="btn-ink btn-ghost"><span>Open {app.kind}</span></a>
          <a href="#/messages" className="btn-ink"><span>Message admissions</span></a>
          <button onClick={onClose} className="btn-ink btn-gold"><span>Done</span></button>
        </>
      }
    >
      <DSection title="Record" index="01">
        <dl className="grid grid-cols-2 gap-y-3">
          {([
            ["REF", app.ref],
            ["TYPE", app.kind === "program" ? "Programme" : "Scholarship"],
            ["TITLE", app.title],
            ...(app.subtitle ? [["INSTITUTION", app.subtitle]] : []),
            ["SUBMITTED", app.submitted],
            ["STATUS", app.displayStatus],
          ] as [string, string][]).map(([k, vv]) => (
            <div key={k} className="col-span-2 grid grid-cols-2 gap-3 py-2 border-b border-[var(--rule)]">
              <dt className="mono" style={{ color: "var(--ink-faint)", fontSize: 10 }}>{k}</dt>
              <dd className="text-right">{vv}</dd>
            </div>
          ))}
        </dl>
      </DSection>
    </ActionDrawer>
  );
}

// ─── Learner profile editor ───────────────────────────────────────────────────

function LearnerProfile() {
  const toast = useToast();
  const { session } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [v, setV] = useState<LearnerProfileDto>({
    educationHistory: "",
    cgpa: "",
    hobbies: "",
    nationality: "",
    socialLinks: "",
    bio: "",
  });

  useEffect(() => {
    learnerProfileGet()
      .then(data => {
        setV({
          educationHistory: data.educationHistory ?? "",
          cgpa: data.cgpa ?? "",
          hobbies: data.hobbies ?? "",
          nationality: data.nationality ?? "",
          socialLinks: data.socialLinks ?? "",
          bio: data.bio ?? "",
        });
      })
      .catch(e => setError(e instanceof ApiError ? e.message : "Failed to load profile."))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await learnerProfilePut(v);
      toast("Profile saved", "ok");
    } catch (e) {
      toast(e instanceof ApiError ? e.message : "Save failed.", "error" as any);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="space-y-6">
      <header className="flex items-end justify-between pb-4 border-b border-[var(--rule)]">
        <div className="flex items-baseline gap-4"><span className="section-index">06</span><h2 className="serif" style={{ fontWeight: 300 }}>Folio profile</h2></div>
        <button onClick={handleSave} disabled={saving || loading} className="btn-ink btn-gold" style={{ opacity: saving ? 0.65 : 1 }}>
          <span>{saving ? "Saving…" : "Save profile"}</span>
        </button>
      </header>

      {loading && <Skeleton lines={5} />}
      {error && <div className="mono" style={{ color: "var(--oxblood)", fontSize: 11 }}>{error}</div>}

      {!loading && !error && (
        <>
          <DField label="Display name" value={session.name} onChange={() => {}} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DField label="Email" value={session.email} onChange={() => {}} />
            <DField label="Nationality" value={v.nationality ?? ""} onChange={(t) => setV({ ...v, nationality: t })} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DField label="CGPA" value={v.cgpa ?? ""} onChange={(t) => setV({ ...v, cgpa: t })} />
            <DField label="Social links" value={v.socialLinks ?? ""} onChange={(t) => setV({ ...v, socialLinks: t })} />
          </div>
          <DField label="Interests & hobbies" value={v.hobbies ?? ""} onChange={(t) => setV({ ...v, hobbies: t })} />
          <DField label="Education history" value={v.educationHistory ?? ""} onChange={(t) => setV({ ...v, educationHistory: t })} textarea />
          <DField label="Short bio" value={v.bio ?? ""} onChange={(t) => setV({ ...v, bio: t })} textarea />
        </>
      )}
    </section>
  );
}
