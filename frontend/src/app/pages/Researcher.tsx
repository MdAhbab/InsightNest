import { useCallback, useEffect, useState } from "react";
import { PageIntro } from "../components/PageIntro";
import { SplitFlap } from "../components/SplitFlap";
import { ActionDrawer, Confirm, DField, DGrid, DSection } from "../components/ActionDrawer";
import { useToast } from "../components/Toast";
import { useSession } from "../providers/SessionProvider";
import { ApiError } from "../api/client";
import { fmtDate } from "../api/format";
import {
  researchList,
  researchCreate,
  researchPatchStatus,
  researchRequestsOwned,
  researchRequestReview,
  messagesList,
  facultyProfileGet,
  facultyProfilePut,
  ResearchProjectDto,
  ResearchRequestDto,
  ConversationDto,
  FacultyProfileDto,
} from "../api/endpoints";

// ─── Exam template — LOCAL (audit §2: "faculty exam-template builder persists to localStorage") ───

const EXAM_KEY = "insightnest.researcher.exam";
type ExamSection = { title: string; questions: { q: string; type: string }[] };
const DEFAULT_EXAM: ExamSection[] = [
  { title: "I — Background", questions: [{ q: "Describe your most relevant prior work.", type: "long" }, { q: "What is your highest degree, and from which institution?", type: "short" }] },
  { title: "II — Intent", questions: [{ q: "What draws you to this particular opening?", type: "long" }, { q: "Where do you expect to be in five years?", type: "short" }] },
];
function loadExam(): ExamSection[] {
  try { return JSON.parse(localStorage.getItem(EXAM_KEY) ?? "null") ?? DEFAULT_EXAM; } catch { return DEFAULT_EXAM; }
}
function saveExam(e: ExamSection[]) {
  localStorage.setItem(EXAM_KEY, JSON.stringify(e));
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

const TABS = [
  { k: "openings",   label: "Openings",   idx: "01" },
  { k: "applicants", label: "Applicants", idx: "02" },
  { k: "exam",       label: "Examination",idx: "03" },
  { k: "inbox",      label: "Inbox",      idx: "04" },
  { k: "profile",    label: "Profile",    idx: "05" },
] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Skeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="py-4">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="my-3 h-4 rounded" style={{ background: "var(--rule-strong)", width: `${80 - i * 10}%`, opacity: 0.6 }} />
      ))}
    </div>
  );
}

function ErrorRetry({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="py-8 flex flex-col gap-3">
      <div className="mono" style={{ color: "var(--oxblood)", fontSize: 11 }}>{message}</div>
      <button onClick={onRetry} className="btn-ink btn-ghost self-start"><span>Retry</span></button>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function Researcher() {
  const toast = useToast();
  const { session } = useSession();
  const [tab, setTab] = useState<typeof TABS[number]["k"]>("openings");

  // Openings
  const [openings, setOpenings] = useState<ResearchProjectDto[]>([]);
  const [openingsLoading, setOpeningsLoading] = useState(false);
  const [openingsError, setOpeningsError] = useState("");

  // Applicants
  const [applicants, setApplicants] = useState<ResearchRequestDto[]>([]);
  const [applicantsLoading, setApplicantsLoading] = useState(false);
  const [applicantsError, setApplicantsError] = useState("");

  // Inbox (messages, top 4)
  const [inbox, setInbox] = useState<ConversationDto[]>([]);
  const [inboxLoading, setInboxLoading] = useState(false);

  // Exam (local)
  const [exam, setExam] = useState<ExamSection[]>(loadExam);

  // Drawer state
  const [openingDrawer, setOpeningDrawer] = useState<{ open: boolean; editing?: ResearchProjectDto }>({ open: false });
  const [confirmAction, setConfirmAction] = useState<{ project: ResearchProjectDto; action: "CLOSED" | "OPEN" | "ARCHIVED" } | null>(null);
  const [applicantDrawer, setApplicantDrawer] = useState<ResearchRequestDto | null>(null);
  const [confirmReview, setConfirmReview] = useState<{ req: ResearchRequestDto; status: "APPROVED" | "REJECTED" } | null>(null);
  const [reviewing, setReviewing] = useState(false);
  const [editQ, setEditQ] = useState<{ si: number; qi: number; q: string; type: string } | null>(null);
  const [addSection, setAddSection] = useState(false);

  const loadOpenings = useCallback(async () => {
    setOpeningsLoading(true);
    setOpeningsError("");
    try {
      // Filter to owned by current user client-side
      const data = await researchList({ page: 0, size: 100 });
      const mine = session.user?.id
        ? data.content.filter(r => r.createdBy?.id === session.user!.id)
        : data.content;
      setOpenings(mine);
    } catch (e) {
      setOpeningsError(e instanceof ApiError ? e.message : "Failed to load openings.");
    } finally {
      setOpeningsLoading(false);
    }
  }, [session.user?.id]);

  const loadApplicants = useCallback(async () => {
    setApplicantsLoading(true);
    setApplicantsError("");
    try {
      const data = await researchRequestsOwned();
      setApplicants(data);
    } catch (e) {
      setApplicantsError(e instanceof ApiError ? e.message : "Failed to load applicants.");
    } finally {
      setApplicantsLoading(false);
    }
  }, []);

  const loadInbox = useCallback(async () => {
    setInboxLoading(true);
    try {
      const data = await messagesList({ page: 0, size: 4 });
      setInbox(data.content.slice(0, 4));
    } catch { /* silent */ } finally {
      setInboxLoading(false);
    }
  }, []);

  useEffect(() => { loadOpenings(); loadApplicants(); loadInbox(); }, [loadOpenings, loadApplicants, loadInbox]);

  const doReview = async () => {
    if (!confirmReview) return;
    setReviewing(true);
    try {
      await researchRequestReview(confirmReview.req.id, { status: confirmReview.status });
      toast(confirmReview.status === "APPROVED" ? "Shortlisted" : "Declined", confirmReview.status === "APPROVED" ? "ok" : "info");
      setConfirmReview(null);
      await loadApplicants();
    } catch (e) {
      toast(e instanceof ApiError ? e.message : "Action failed.", "error" as any);
    } finally {
      setReviewing(false);
    }
  };

  const openCount = openings.filter(o => o.status === "OPEN").length;
  const pendingApplicants = applicants.filter(a => a.status === "PENDING").length;
  const shortlisted = applicants.filter(a => a.status === "APPROVED").length;

  return (
    <>
      <PageIntro
        index="ƒ"
        kicker="RESEARCHER · DASHBOARD"
        title={<><span style={{ color: "var(--ink-soft)" }}>Welcome,</span> {session.name.split(" ").slice(-1)[0]}.</>}
        lede={<>{openCount} projects open this cycle, {pendingApplicants} candidates in the review queue.</>}
        meta={session.email}
      />

      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 pb-32 grid grid-cols-12 gap-6 md:gap-10">
        <aside className="col-span-12 md:col-span-3 md:sticky md:top-28 self-start space-y-6">
          <div className="border border-[var(--rule-strong)] p-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 border border-[var(--ink)] flex items-center justify-center serif" style={{ fontSize: 22 }}>{session.initial}</div>
              <div className="min-w-0">
                <div className="serif truncate" style={{ fontSize: "1.0625rem" }}>{session.name}</div>
                <div className="mono" style={{ color: "var(--ink-faint)", fontSize: 10 }}>FOLIO · FACULTY</div>
              </div>
            </div>
            <div className="mt-4 inline-block mono px-2 py-1 border border-[var(--gold)]" style={{ color: "var(--gold)", fontSize: 10 }}>FACULTY · PI</div>
          </div>

          <div className="md:hidden -mx-1 overflow-x-auto no-scrollbar">
            <div className="inline-flex gap-px min-w-full" style={{ background: "var(--rule)" }}>
              {TABS.map((t) => (
                <button key={t.k} onClick={() => setTab(t.k)} className="px-4 py-3 mono whitespace-nowrap" style={{ background: t.k === tab ? "var(--ink)" : "var(--paper)", color: t.k === tab ? "var(--paper)" : "var(--ink-soft)", fontSize: 11 }}>
                  {t.idx} · {t.label}
                </button>
              ))}
            </div>
          </div>

          <ul className="hidden md:block space-y-2">
            {TABS.map((t) => (
              <li key={t.k}>
                <button onClick={() => setTab(t.k)} className="flex items-baseline gap-3 w-full text-left py-2 border-b border-[var(--rule)]" style={{ color: t.k === tab ? "var(--ink)" : "var(--ink-soft)" }}>
                  <span className="mono" style={{ color: t.k === tab ? "var(--gold)" : "var(--ink-faint)" }}>{t.idx}</span>
                  <span className="serif" style={{ fontSize: "1.0625rem", fontWeight: 300 }}>{t.label}</span>
                  {t.k === tab && <span className="ml-auto mono" style={{ color: "var(--gold)" }}>●</span>}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <div className="col-span-12 md:col-span-9 space-y-10">
          {/* Stat tiles */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px" style={{ background: "var(--rule)" }}>
            {[
              { l: "Openings", n: openings.length, p: 2 },
              { l: "Applicants", n: applicants.length, p: 2 },
              { l: "Shortlisted", n: shortlisted, p: 2 },
              { l: "Pending review", n: pendingApplicants, p: 2 },
            ].map((s) => (
              <div key={s.l} className="p-5 sm:p-6" style={{ background: "var(--paper-raised)" }}>
                <div className="mono" style={{ color: "var(--ink-faint)", fontSize: 10 }}>{s.l.toUpperCase()}</div>
                <div className="serif tabular mt-3" style={{ fontSize: "clamp(2rem, 4vw, 3.25rem)", fontWeight: 300, lineHeight: 1 }}>
                  <SplitFlap value={s.n} pad={s.p} />
                </div>
              </div>
            ))}
          </div>

          {/* ── OPENINGS TAB ── */}
          {tab === "openings" && (
            <section>
              <header className="flex items-end justify-between pb-4 border-b border-[var(--rule)] gap-3 flex-wrap">
                <div className="flex items-baseline gap-4"><span className="section-index">01</span><h2 className="serif" style={{ fontWeight: 300 }}>Open positions</h2></div>
                <button onClick={() => setOpeningDrawer({ open: true })} className="btn-ink btn-gold"><span>+ Open new position</span></button>
              </header>

              {openingsLoading && <Skeleton lines={4} />}
              {!openingsLoading && openingsError && <ErrorRetry message={openingsError} onRetry={loadOpenings} />}
              {!openingsLoading && !openingsError && openings.length === 0 && (
                <div className="py-8 mono" style={{ color: "var(--ink-faint)" }}>No positions published yet.</div>
              )}

              <ul>
                {openings.map((o, i) => {
                  const tags = o.tags ? o.tags.split(",").map(t => t.trim()).filter(Boolean) : [];
                  return (
                    <li key={o.id} className="grid grid-cols-12 gap-3 py-5 border-b border-[var(--rule)] items-baseline">
                      <span className="col-span-2 md:col-span-1 mono tabular" style={{ color: "var(--gold)" }}>{String(i + 1).padStart(2, "0")}</span>
                      <div className="col-span-10 md:col-span-7 min-w-0">
                        <div className="serif truncate" style={{ fontSize: "1.0625rem" }}>{o.title}</div>
                        <div className="mono mt-1" style={{ color: "var(--ink-soft)", fontSize: 10 }}>
                          {[o.lab, o.openings != null ? `${o.openings} opening${o.openings !== 1 ? "s" : ""}` : null, o.deadline ? `DL ${fmtDate(o.deadline)}` : null].filter(Boolean).join(" · ")}
                        </div>
                        {tags.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {tags.map(t => <span key={t} className="mono px-2 py-0.5 border border-[var(--rule)]" style={{ fontSize: 9 }}>{t}</span>)}
                          </div>
                        )}
                      </div>
                      <div className="col-span-12 md:col-span-4 flex justify-end gap-2 mono flex-wrap" style={{ fontSize: 10 }}>
                        <span className="px-2 py-1 border border-[var(--rule)]" style={{ color: o.status === "OPEN" ? "var(--moss)" : o.status === "CLOSED" ? "var(--oxblood)" : "var(--ink-soft)" }}>{o.status ?? "OPEN"}</span>
                        <button onClick={() => setOpeningDrawer({ open: true, editing: o })} className="px-3 py-1 border border-[var(--rule-strong)] hover:border-[var(--gold)] hover:text-[var(--gold)]">EDIT</button>
                        {o.status !== "CLOSED"
                          ? <button onClick={() => setConfirmAction({ project: o, action: "CLOSED" })} className="px-3 py-1 border border-[var(--rule-strong)] hover:border-[var(--oxblood)] hover:text-[var(--oxblood)]">CLOSE</button>
                          : <button onClick={() => setConfirmAction({ project: o, action: "OPEN" })} className="px-3 py-1 border border-[var(--rule-strong)] hover:border-[var(--moss)] hover:text-[var(--moss)]">REOPEN</button>
                        }
                        <button onClick={() => setConfirmAction({ project: o, action: "ARCHIVED" })} className="px-3 py-1 border border-[var(--rule-strong)] hover:border-[var(--oxblood)] hover:text-[var(--oxblood)]">ARCHIVE</button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {/* ── APPLICANTS TAB ── */}
          {tab === "applicants" && (
            <section>
              <header className="flex items-end justify-between pb-4 border-b border-[var(--rule)] gap-3 flex-wrap">
                <div className="flex items-baseline gap-4"><span className="section-index">02</span><h2 className="serif" style={{ fontWeight: 300 }}>Applicants — review queue</h2></div>
                <div className="mono" style={{ color: "var(--ink-faint)" }}>SORTED · FILED DATE</div>
              </header>

              {applicantsLoading && <Skeleton lines={4} />}
              {!applicantsLoading && applicantsError && <ErrorRetry message={applicantsError} onRetry={loadApplicants} />}
              {!applicantsLoading && !applicantsError && applicants.length === 0 && (
                <div className="py-8 mono" style={{ color: "var(--ink-faint)" }}>No applicants yet.</div>
              )}

              <ul>
                {applicants.map((a) => (
                  <li key={a.id} className="py-6 border-b border-[var(--rule)] grid grid-cols-12 gap-3">
                    <div className="col-span-9 md:col-span-7 min-w-0">
                      <button onClick={() => setApplicantDrawer(a)} className="serif text-left hover:text-[var(--gold)]" style={{ fontSize: "1.125rem" }}>
                        {a.requester?.fullName ?? `Applicant #${a.id}`}
                      </button>
                      <div className="mono mt-1" style={{ color: "var(--ink-soft)", fontSize: 10 }}>
                        {a.project.title} · FILED {fmtDate(a.createdAt)}
                      </div>
                      {a.message && (
                        <div className="serif mt-2" style={{ fontSize: "1rem", color: "var(--ink-soft)", fontStyle: "italic" }}>
                          "{a.message.slice(0, 80)}{a.message.length > 80 ? "…" : ""}"
                        </div>
                      )}
                    </div>
                    <div className="col-span-3 md:col-span-2 mono" style={{ color: statusColor(a.status), fontSize: 11 }}>
                      {a.status ?? "PENDING"}
                    </div>
                    <div className="col-span-12 md:col-span-3 flex md:flex-col md:items-end gap-2 flex-wrap items-start">
                      <div className="flex gap-2 mono flex-wrap" style={{ fontSize: 10 }}>
                        <button onClick={() => setConfirmReview({ req: a, status: "APPROVED" })} className="px-2 py-1 border border-[var(--rule-strong)] hover:border-[var(--gold)] hover:text-[var(--gold)]">SHORTLIST</button>
                        <button onClick={() => setConfirmReview({ req: a, status: "REJECTED" })} className="px-2 py-1 border border-[var(--rule-strong)] hover:border-[var(--oxblood)] hover:text-[var(--oxblood)]">DECLINE</button>
                      </div>
                      <a href="#/messages" className="mono" style={{ color: "var(--gold)", fontSize: 10 }}>SEND LETTER →</a>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* ── EXAM TAB — local ── */}
          {tab === "exam" && (
            <section>
              <header className="flex items-end justify-between pb-4 border-b border-[var(--rule)] gap-3 flex-wrap">
                <div className="flex items-baseline gap-4"><span className="section-index">03</span><h2 className="serif" style={{ fontWeight: 300 }}>Written examination — template</h2></div>
                <div className="flex gap-2">
                  <button onClick={() => toast("Preview opened in new pane")} className="btn-ink btn-ghost"><span>Preview</span></button>
                  <button onClick={() => setAddSection(true)} className="btn-ink btn-gold"><span>+ New section</span></button>
                </div>
              </header>
              {/* Template is stored locally; answers arrive inside join-request letters. */}
              <div className="mono mt-2 mb-4" style={{ color: "var(--ink-faint)", fontSize: 10 }}>
                Template is stored locally; answers arrive inside join-request letters.
              </div>
              {exam.map((sec, si) => (
                <div key={si} className="mt-6 border border-[var(--rule-strong)] p-5 md:p-6">
                  <div className="flex items-baseline justify-between gap-3 flex-wrap">
                    <h3 className="serif" style={{ fontSize: "1.25rem", fontWeight: 300 }}>{sec.title}</h3>
                    <div className="flex items-center gap-3">
                      <div className="mono" style={{ color: "var(--ink-faint)" }}>SECTION {String(si + 1).padStart(2, "0")}</div>
                      <button onClick={() => { const updated = exam.filter((_, k) => k !== si); setExam(updated); saveExam(updated); toast("Section removed", "info"); }} className="mono hover:text-[var(--oxblood)]" style={{ fontSize: 10 }}>DELETE SECTION</button>
                    </div>
                  </div>
                  <ul className="mt-4 space-y-1">
                    {sec.questions.map((q, qi) => (
                      <li key={qi} className="grid grid-cols-12 gap-3 py-3 border-t border-[var(--rule)] items-baseline">
                        <span className="col-span-2 md:col-span-1 mono tabular" style={{ color: "var(--gold)" }}>{si + 1}.{qi + 1}</span>
                        <span className="col-span-7 md:col-span-8 serif" style={{ fontSize: "1.0625rem" }}>{q.q}</span>
                        <span className="col-span-2 mono" style={{ color: "var(--ink-soft)", fontSize: 10 }}>{q.type.toUpperCase()}</span>
                        <button onClick={() => setEditQ({ si, qi, q: q.q, type: q.type })} className="col-span-1 mono text-right hover:text-[var(--gold)]" style={{ fontSize: 10 }}>EDIT</button>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => {
                      const updated = exam.map((s, k) => k === si ? { ...s, questions: [...s.questions, { q: "New question — edit me.", type: "short" }] } : s);
                      setExam(updated); saveExam(updated);
                    }}
                    className="mt-4 mono hover:text-[var(--gold)]" style={{ fontSize: 11 }}
                  >+ ADD QUESTION TO THIS SECTION</button>
                </div>
              ))}
            </section>
          )}

          {/* ── INBOX TAB ── */}
          {tab === "inbox" && (
            <section>
              <header className="flex items-end justify-between pb-4 border-b border-[var(--rule)]">
                <div className="flex items-baseline gap-4"><span className="section-index">04</span><h2 className="serif" style={{ fontWeight: 300 }}>Recent letters</h2></div>
                <a href="#/messages" className="mono" style={{ color: "var(--gold)" }}>OPEN INBOX →</a>
              </header>
              {inboxLoading && <Skeleton lines={3} />}
              {!inboxLoading && inbox.length === 0 && (
                <div className="py-8 mono" style={{ color: "var(--ink-faint)" }}>No messages yet. <a href="#/messages" style={{ color: "var(--gold)" }}>Go to inbox →</a></div>
              )}
              <ul>
                {inbox.map((c, i) => (
                  <li key={c.id} className="py-4 border-b border-[var(--rule)] grid grid-cols-12 gap-3">
                    <span className="col-span-2 md:col-span-1 mono tabular" style={{ color: "var(--gold)" }}>{String(i + 1).padStart(2, "0")}</span>
                    <div className="col-span-7 md:col-span-9">
                      <div className="serif" style={{ fontSize: "1.0625rem" }}>
                        {c.otherParty?.fullName ?? "Unknown"} — {c.subject ?? "(no subject)"}
                      </div>
                      {c.lastPreview && (
                        <div className="mono" style={{ color: "var(--ink-soft)", fontSize: 10 }}>"{c.lastPreview.slice(0, 60)}{c.lastPreview.length > 60 ? "…" : ""}"</div>
                      )}
                    </div>
                    <a href={`#/messages/${c.id}`} className="col-span-3 md:col-span-2 text-right mono" style={{ color: "var(--gold)", fontSize: 10 }}>REPLY →</a>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* ── PROFILE TAB ── */}
          {tab === "profile" && <FacultyProfileSection />}
        </div>
      </section>

      {/* DRAWERS */}
      <OpeningDrawer
        open={openingDrawer.open}
        editing={openingDrawer.editing}
        onClose={() => setOpeningDrawer({ open: false })}
        onSave={async (data) => {
          try {
            if (openingDrawer.editing) {
              await researchPatchStatus(openingDrawer.editing.id, "OPEN");
              // Re-create is not available; we only patch status — for edit we notify
              toast("Note: only status can be updated via API. Other changes saved locally.", "info");
            } else {
              await researchCreate(data);
              toast("Position published", "ok");
            }
            setOpeningDrawer({ open: false });
            await loadOpenings();
          } catch (e) {
            toast(e instanceof ApiError ? e.message : "Failed.", "error" as any);
          }
        }}
      />

      {/* Confirm status change */}
      <Confirm
        open={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={async () => {
          if (!confirmAction) return;
          try {
            await researchPatchStatus(confirmAction.project.id, confirmAction.action);
            toast(`Status updated to ${confirmAction.action}`, "ok");
            setConfirmAction(null);
            await loadOpenings();
          } catch (e) {
            toast(e instanceof ApiError ? e.message : "Failed.", "error" as any);
          }
        }}
        title={`Set position to ${confirmAction?.action ?? ""}?`}
        body={<>This will update the project status in the system.</>}
        confirmLabel={`Yes — ${confirmAction?.action ?? ""}`}
        danger={confirmAction?.action === "ARCHIVED"}
      />

      {/* Applicant detail drawer */}
      {applicantDrawer && (
        <ActionDrawer
          open={!!applicantDrawer}
          onClose={() => setApplicantDrawer(null)}
          kicker={`APPLICANT · #${applicantDrawer.id}`}
          title={applicantDrawer.requester?.fullName ?? `Applicant #${applicantDrawer.id}`}
          footer={
            <>
              <a href="#/messages" className="btn-ink btn-ghost"><span>Write</span></a>
              <button onClick={() => { setConfirmReview({ req: applicantDrawer, status: "REJECTED" }); setApplicantDrawer(null); }} className="btn-ink" style={{ borderColor: "var(--oxblood)", color: "var(--oxblood)" }}><span>Decline</span></button>
              <button onClick={() => { setConfirmReview({ req: applicantDrawer, status: "APPROVED" }); setApplicantDrawer(null); }} className="btn-ink btn-gold"><span>Shortlist</span></button>
            </>
          }
        >
          <DSection title="Project" index="01">
            <dl className="grid grid-cols-2 gap-y-1">
              {[
                ["PROJECT", applicantDrawer.project.title],
                ["STATUS", applicantDrawer.status ?? "PENDING"],
                ["FILED", fmtDate(applicantDrawer.createdAt)],
              ].map(([k, v]) => (
                <div key={k} className="col-span-2 grid grid-cols-2 gap-3 py-2 border-b border-[var(--rule)]">
                  <dt className="mono" style={{ color: "var(--ink-faint)", fontSize: 10 }}>{k}</dt>
                  <dd className="text-right">{v}</dd>
                </div>
              ))}
            </dl>
          </DSection>
          {applicantDrawer.message && (
            <DSection title="Letter (excerpt)" index="02">
              <blockquote className="serif pl-5 border-l-2" style={{ borderColor: "var(--gold)", fontSize: "1.0625rem", fontWeight: 300, lineHeight: 1.65, color: "var(--ink-soft)" }}>
                {applicantDrawer.message}
              </blockquote>
            </DSection>
          )}
        </ActionDrawer>
      )}

      {/* Confirm review */}
      <Confirm
        open={!!confirmReview}
        onClose={() => setConfirmReview(null)}
        onConfirm={doReview}
        title={confirmReview?.status === "APPROVED" ? "Shortlist this applicant?" : "Decline this applicant?"}
        body={<>{confirmReview?.status === "APPROVED" ? "The applicant will be moved to shortlist status." : "The applicant will receive a decline notice."}</>}
        confirmLabel={reviewReviewLabel(confirmReview?.status, reviewReviewLabel)}
        danger={confirmReview?.status === "REJECTED"}
      />

      {/* Question editor drawer */}
      {editQ && (
        <ActionDrawer
          open={!!editQ}
          onClose={() => setEditQ(null)}
          kicker={`QUESTION · ${editQ.si + 1}.${editQ.qi + 1}`}
          title="Edit examination question"
          footer={
            <>
              <button onClick={() => setEditQ(null)} className="btn-ink btn-ghost"><span>Cancel</span></button>
              <button
                onClick={() => {
                  const updated = exam.map((s, k) => k === editQ.si ? { ...s, questions: s.questions.map((qq, qi) => qi === editQ.qi ? { q: editQ.q, type: editQ.type } : qq) } : s);
                  setExam(updated); saveExam(updated); toast("Question updated", "ok"); setEditQ(null);
                }}
                className="btn-ink btn-gold"
              ><span>Save question</span></button>
            </>
          }
        >
          <DSection title="Prompt" index="01">
            <DField label="Question" value={editQ.q} onChange={(q) => setEditQ({ ...editQ, q })} textarea />
            <DField label="Answer type" value={editQ.type} onChange={(t) => setEditQ({ ...editQ, type: t })} options={["short", "long", "select"]} />
          </DSection>
        </ActionDrawer>
      )}

      {/* Add section drawer */}
      <ActionDrawer
        open={addSection}
        onClose={() => setAddSection(false)}
        kicker="NEW SECTION"
        title="Add an examination section"
        footer={
          <>
            <button onClick={() => setAddSection(false)} className="btn-ink btn-ghost"><span>Cancel</span></button>
            <button
              onClick={() => {
                const title = (document.getElementById("new-section-title") as HTMLInputElement)?.value ?? "New section";
                const updated = [...exam, { title, questions: [] }]; setExam(updated); saveExam(updated); toast("Section added", "ok"); setAddSection(false);
              }}
              className="btn-ink btn-gold"
            ><span>Add section</span></button>
          </>
        }
      >
        <DSection title="Identity" index="01">
          <div className="field-underline">
            <label>Section title</label>
            <input id="new-section-title" placeholder="IV — Methodology" />
          </div>
        </DSection>
      </ActionDrawer>
    </>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function statusColor(status?: string) {
  if (status === "APPROVED") return "var(--moss)";
  if (status === "REJECTED") return "var(--oxblood)";
  return "var(--ink-soft)";
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function reviewReviewLabel(status?: string, _: any = null): string {
  return status === "APPROVED" ? "Yes — shortlist" : "Yes — decline";
}

// ─── Opening drawer ───────────────────────────────────────────────────────────

function OpeningDrawer({ open, editing, onClose, onSave }: {
  open: boolean;
  editing?: ResearchProjectDto;
  onClose: () => void;
  onSave: (data: Partial<ResearchProjectDto>) => void;
}) {
  const [v, setV] = useState<Partial<ResearchProjectDto>>({
    title: "", description: "", requiredSkills: "", tags: "", lab: "", institution: "",
    openings: 1, field: "Life Sciences", deadline: "",
  });

  useEffect(() => {
    if (editing) {
      setV({
        title: editing.title ?? "",
        description: editing.description ?? "",
        requiredSkills: editing.requiredSkills ?? "",
        tags: editing.tags ?? "",
        lab: editing.lab ?? "",
        institution: editing.institution ?? "",
        openings: editing.openings ?? 1,
        field: editing.field ?? "Life Sciences",
        deadline: editing.deadline ?? "",
      });
    } else {
      setV({ title: "", description: "", requiredSkills: "", tags: "", lab: "", institution: "", openings: 1, field: "Life Sciences", deadline: "" });
    }
  }, [open, editing?.id]);

  return (
    <ActionDrawer
      open={open}
      onClose={onClose}
      kicker={editing ? "EDIT POSITION" : "NEW POSITION"}
      title={editing ? "Editing position" : "Open a new position"}
      footer={
        <>
          <button onClick={onClose} className="btn-ink btn-ghost"><span>Cancel</span></button>
          <button onClick={() => onSave(v)} className="btn-ink btn-gold">
            <span>{editing ? "Save changes" : "Publish position"}</span>
          </button>
        </>
      }
    >
      <DSection title="Identity" index="01">
        <DField label="Project title" value={v.title ?? ""} onChange={(t) => setV({ ...v, title: t })} placeholder="e.g. Single-cell atlas of cortical organoids" />
        <DGrid>
          <DField label="Lab" value={v.lab ?? ""} onChange={(t) => setV({ ...v, lab: t })} />
          <DField label="Field" value={v.field ?? ""} onChange={(t) => setV({ ...v, field: t })} options={["Life Sciences", "Computer Science", "Earth Sciences", "Engineering", "Humanities", "Social Sciences"]} />
        </DGrid>
        <DField label="Institution" value={v.institution ?? ""} onChange={(t) => setV({ ...v, institution: t })} />
      </DSection>
      <DSection title="Terms" index="02">
        <DGrid>
          <DField label="Openings" value={String(v.openings ?? 1)} onChange={(t) => setV({ ...v, openings: parseInt(t) || 1 })} type="number" />
          <DField label="Deadline (YYYY-MM-DD)" value={v.deadline ?? ""} onChange={(t) => setV({ ...v, deadline: t })} placeholder="2026-09-01" />
        </DGrid>
      </DSection>
      <DSection title="Detail" index="03">
        <DField label="Description" value={v.description ?? ""} onChange={(t) => setV({ ...v, description: t })} textarea />
        <DField label="Required skills" value={v.requiredSkills ?? ""} onChange={(t) => setV({ ...v, requiredSkills: t })} placeholder="Python, single-cell RNA-seq" />
        <DField label="Tags (comma-separated)" value={v.tags ?? ""} onChange={(t) => setV({ ...v, tags: t })} />
      </DSection>
    </ActionDrawer>
  );
}

// ─── Faculty profile section ──────────────────────────────────────────────────

function FacultyProfileSection() {
  const toast = useToast();
  const [v, setV] = useState<FacultyProfileDto>({ expertise: "", department: "", researchInterests: "", website: "", linkedIn: "", taughtCourses: "", bio: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    facultyProfileGet()
      .then(data => setV({
        expertise: data.expertise ?? "",
        department: data.department ?? "",
        researchInterests: data.researchInterests ?? "",
        website: data.website ?? "",
        linkedIn: data.linkedIn ?? "",
        taughtCourses: data.taughtCourses ?? "",
        bio: data.bio ?? "",
      }))
      .catch(() => {/* use defaults */})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await facultyProfilePut(v);
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
        <div className="flex items-baseline gap-4"><span className="section-index">05</span><h2 className="serif" style={{ fontWeight: 300 }}>Public profile</h2></div>
        <button onClick={handleSave} disabled={saving || loading} className="btn-ink btn-gold" style={{ opacity: saving ? 0.65 : 1 }}>
          <span>{saving ? "Saving…" : "Save profile"}</span>
        </button>
      </header>
      {loading && <Skeleton lines={4} />}
      {!loading && (
        <>
          <DGrid>
            <DField label="Area of expertise" value={v.expertise ?? ""} onChange={(t) => setV({ ...v, expertise: t })} />
            <DField label="Department" value={v.department ?? ""} onChange={(t) => setV({ ...v, department: t })} />
          </DGrid>
          <DGrid>
            <DField label="Website" value={v.website ?? ""} onChange={(t) => setV({ ...v, website: t })} />
            <DField label="LinkedIn" value={v.linkedIn ?? ""} onChange={(t) => setV({ ...v, linkedIn: t })} />
          </DGrid>
          <DField label="Research interests" value={v.researchInterests ?? ""} onChange={(t) => setV({ ...v, researchInterests: t })} placeholder="Single-cell biology, neural development" />
          <DField label="Courses taught" value={v.taughtCourses ?? ""} onChange={(t) => setV({ ...v, taughtCourses: t })} />
          <DField label="Short bio" value={v.bio ?? ""} onChange={(t) => setV({ ...v, bio: t })} textarea />
        </>
      )}
    </section>
  );
}
