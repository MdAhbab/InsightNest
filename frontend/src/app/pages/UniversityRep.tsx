import { useCallback, useEffect, useState } from "react";
import { PageIntro } from "../components/PageIntro";
import { SplitFlap } from "../components/SplitFlap";
import { ActionDrawer, Confirm, DField, DGrid, DSection } from "../components/ActionDrawer";
import { useToast } from "../components/Toast";
import { useSession } from "../providers/SessionProvider";
import { ApiError } from "../api/client";
import { fmtDate, fmtMoney } from "../api/format";
import {
  programsList,
  programsCreate,
  programsUpdate,
  scholarshipsList,
  scholarshipsCreate,
  scholarshipsUpdate,
  webinarsList,
  webinarsCreate,
  messagesList,
  messagesGet,
  messagesReply,
  universitiesList,
  programApplicationsAll,
  ProgramDto,
  ScholarshipDto,
  WebinarDto,
  ConversationDto,
  ConversationDetailDto,
  UniversityDto,
} from "../api/endpoints";

// ─── Tabs ─────────────────────────────────────────────────────────────────────

const TABS = [
  { k: "programs",     label: "Programmes",            idx: "01" },
  { k: "scholarships", label: "Scholarships",          idx: "02" },
  { k: "events",       label: "Events & office hours", idx: "03" },
  { k: "enquiries",    label: "Enquiries",             idx: "04" },
  { k: "profile",      label: "Institution",           idx: "05" },
] as const;

// ─── localStorage key for institution profile ─────────────────────────────────
const INST_KEY = "insightnest.rep.institution";
type InstProfile = { name: string; founded: string; contact: string; description: string; accepting: boolean };
const DEFAULT_INST: InstProfile = { name: "", founded: "", contact: "", description: "", accepting: true };
function loadInst(): InstProfile {
  try { return JSON.parse(localStorage.getItem(INST_KEY) ?? "null") ?? DEFAULT_INST; } catch { return DEFAULT_INST; }
}
function saveInst(v: InstProfile) { localStorage.setItem(INST_KEY, JSON.stringify(v)); }

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Skeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="py-4">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="my-3 h-4 rounded" style={{ background: "var(--rule-strong)", width: `${82 - i * 10}%`, opacity: 0.6 }} />
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

export default function UniversityRep() {
  const toast = useToast();
  const { session } = useSession();
  const [tab, setTab] = useState<typeof TABS[number]["k"]>("programs");

  // Stat tile data
  const [programTotal, setProgramTotal] = useState(0);
  const [scholarshipTotal, setScholarshipTotal] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [liveApps, setLiveApps] = useState<number | null>(null);

  // Load stat tiles
  useEffect(() => {
    programsList({ size: 1 }).then(d => setProgramTotal(d.page.totalElements)).catch(() => {});
    scholarshipsList({ size: 1 }).then(d => setScholarshipTotal(d.page.totalElements)).catch(() => {});
    messagesList({ page: 0, size: 50 }).then(d => {
      const total = d.content.reduce((s, c) => s + (c.unreadCount ?? 0), 0);
      setUnreadCount(total);
    }).catch(() => {});
    // Live applications: try programApplicationsAll — may 403 for reps
    programApplicationsAll({ size: 1 })
      .then(d => setLiveApps(d.page.totalElements))
      .catch(() => setLiveApps(null)); // null = show "—"
  }, []);

  return (
    <>
      <PageIntro
        index="¶"
        kicker="UNIVERSITY REPRESENTATIVE · DASHBOARD"
        title={<>The {session.name ? session.name.split(" ").slice(-1)[0] : "Rep"} desk.</>}
        lede={<>Managing {programTotal} programmes and {scholarshipTotal} scholarships. {unreadCount} unread enquiries.</>}
        meta="UNIVERSITY REPRESENTATIVE · INSIGHTNEST"
      />

      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 pb-32 grid grid-cols-12 gap-6 md:gap-10">
        <aside className="col-span-12 md:col-span-3 md:sticky md:top-28 self-start space-y-6">
          <div className="border border-[var(--rule-strong)] p-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 border border-[var(--ink)] flex items-center justify-center serif" style={{ fontSize: 22 }}>{session.initial}</div>
              <div className="min-w-0">
                <div className="serif truncate" style={{ fontSize: "1.0625rem" }}>{session.name}</div>
                <div className="mono" style={{ color: "var(--ink-faint)", fontSize: 10 }}>FOLIO · REP</div>
              </div>
            </div>
            <div className="mt-4 inline-block mono px-2 py-1 border border-[var(--gold)]" style={{ color: "var(--gold)", fontSize: 10 }}>UNIVERSITY REP</div>
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
              { l: "Programmes",      n: programTotal,    p: 2 },
              { l: "Scholarships",    n: scholarshipTotal, p: 2 },
              { l: "Unread enquiries",n: unreadCount,     p: 2 },
            ].map((s) => (
              <div key={s.l} className="p-5 sm:p-6" style={{ background: "var(--paper-raised)" }}>
                <div className="mono" style={{ color: "var(--ink-faint)", fontSize: 10 }}>{s.l.toUpperCase()}</div>
                <div className="serif tabular mt-3" style={{ fontSize: "clamp(2rem, 4vw, 3.25rem)", fontWeight: 300, lineHeight: 1 }}>
                  <SplitFlap value={s.n} pad={s.p} />
                </div>
              </div>
            ))}
            {/* Live applications tile — may be "—" if 403 */}
            <div className="p-5 sm:p-6" style={{ background: "var(--paper-raised)" }}>
              <div className="mono" style={{ color: "var(--ink-faint)", fontSize: 10 }}>LIVE APPLICATIONS</div>
              <div className="serif tabular mt-3" style={{ fontSize: "clamp(2rem, 4vw, 3.25rem)", fontWeight: 300, lineHeight: 1 }}>
                {liveApps !== null ? <SplitFlap value={liveApps} pad={3} /> : <span style={{ color: "var(--ink-faint)" }}>—</span>}
              </div>
            </div>
          </div>

          {tab === "programs"     && <ProgramsTab toast={toast} />}
          {tab === "scholarships" && <ScholarshipsTab toast={toast} />}
          {tab === "events"       && <EventsTab toast={toast} />}
          {tab === "enquiries"    && <EnquiriesTab toast={toast} />}
          {tab === "profile"      && <InstitutionSection toast={toast} />}
        </div>
      </section>
    </>
  );
}

// ─── Programmes tab ───────────────────────────────────────────────────────────

function ProgramsTab({ toast }: { toast: ReturnType<typeof useToast> }) {
  const [items, setItems] = useState<ProgramDto[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [drawer, setDrawer] = useState<{ open: boolean; editing?: ProgramDto }>({ open: false });
  const [confirmArchive, setConfirmArchive] = useState<{ item: ProgramDto; archive: boolean } | null>(null);
  const [unis, setUnis] = useState<UniversityDto[]>([]);

  const load = useCallback(async (p = 0, query = q) => {
    setLoading(true);
    setError("");
    try {
      const data = await programsList({ page: p, size: 20, q: query || undefined });
      setItems(data.content);
      setTotal(data.page.totalElements);
      setPage(p);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load programmes.");
    } finally {
      setLoading(false);
    }
  }, [q]);

  useEffect(() => {
    load(0, "");
    universitiesList({ size: 100 }).then(d => setUnis(d.content)).catch(() => {});
  }, []);

  const handleSave = async (v: Partial<ProgramDto>) => {
    try {
      if (drawer.editing) {
        await programsUpdate(drawer.editing.id, v);
        toast("Programme updated", "ok");
      } else {
        await programsCreate(v);
        toast("Programme created", "ok");
      }
      setDrawer({ open: false });
      load(page);
    } catch (e) {
      toast(e instanceof ApiError ? e.message : "Save failed.", "error" as any);
    }
  };

  const handleArchive = async () => {
    if (!confirmArchive) return;
    try {
      await programsUpdate(confirmArchive.item.id, { archived: confirmArchive.archive });
      toast(confirmArchive.archive ? "Programme unpublished" : "Programme published", confirmArchive.archive ? "info" : "ok");
      setConfirmArchive(null);
      load(page);
    } catch (e) {
      toast(e instanceof ApiError ? e.message : "Action failed.", "error" as any);
    }
  };

  return (
    <section>
      <header className="flex items-end justify-between pb-4 border-b border-[var(--rule)] gap-3 flex-wrap">
        <div className="flex items-baseline gap-4"><span className="section-index">01</span><h2 className="serif" style={{ fontWeight: 300 }}>Programmes managed</h2></div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="field-underline" style={{ paddingTop: 0, minWidth: 200 }}>
            <input placeholder="Filter…" value={q} onChange={e => { setQ(e.target.value); load(0, e.target.value); }} />
          </div>
          <button onClick={() => setDrawer({ open: true })} className="btn-ink btn-gold"><span>+ New programme</span></button>
        </div>
      </header>

      {loading && <Skeleton lines={4} />}
      {!loading && error && <ErrorRetry message={error} onRetry={() => load(page)} />}
      {!loading && !error && items.length === 0 && (
        <div className="py-12 text-center mono" style={{ color: "var(--ink-faint)" }}>No programmes found.</div>
      )}

      <ul>
        {items.map((p, i) => (
          <li key={p.id} className="py-5 border-b border-[var(--rule)] grid grid-cols-12 gap-3 items-baseline">
            <span className="col-span-2 md:col-span-1 mono tabular" style={{ color: "var(--gold)" }}>{String(page * 20 + i + 1).padStart(2, "0")}</span>
            <div className="col-span-10 md:col-span-7 min-w-0">
              <a href={`#/programs/${p.id}`} className="serif hover:text-[var(--gold)]" style={{ fontSize: "1.0625rem" }}>{p.name}</a>
              <div className="mono mt-1" style={{ color: "var(--ink-soft)", fontSize: 10 }}>
                {[p.type, p.university?.name, p.applicationDeadline ? `DL ${fmtDate(p.applicationDeadline)}` : null].filter(Boolean).join(" · ")}
              </div>
            </div>
            <div className="col-span-12 md:col-span-4 flex justify-end gap-2 mono flex-wrap" style={{ fontSize: 10 }}>
              <span className="px-2 py-1 border border-[var(--rule)]" style={{ color: p.archived ? "var(--oxblood)" : "var(--moss)" }}>{p.archived ? "UNPUBLISHED" : "PUBLISHED"}</span>
              <button onClick={() => setDrawer({ open: true, editing: p })} className="px-3 py-1 border border-[var(--rule-strong)] hover:border-[var(--gold)] hover:text-[var(--gold)]">EDIT</button>
              {p.archived
                ? <button onClick={() => setConfirmArchive({ item: p, archive: false })} className="px-3 py-1 border border-[var(--rule-strong)] hover:border-[var(--moss)] hover:text-[var(--moss)]">PUBLISH</button>
                : <button onClick={() => setConfirmArchive({ item: p, archive: true })} className="px-3 py-1 border border-[var(--rule-strong)] hover:border-[var(--oxblood)] hover:text-[var(--oxblood)]">UNPUBLISH</button>
              }
            </div>
          </li>
        ))}
      </ul>

      {total > 20 && (
        <div className="flex gap-3 mono mt-4" style={{ fontSize: 11 }}>
          <button disabled={page === 0} onClick={() => load(page - 1)} className="px-3 py-1 border border-[var(--rule-strong)] disabled:opacity-40">PREV</button>
          <span style={{ color: "var(--ink-faint)" }}>Page {page + 1} / {Math.ceil(total / 20)}</span>
          <button disabled={(page + 1) * 20 >= total} onClick={() => load(page + 1)} className="px-3 py-1 border border-[var(--rule-strong)] disabled:opacity-40">NEXT</button>
        </div>
      )}

      <RepProgramDrawer open={drawer.open} editing={drawer.editing} unis={unis} onClose={() => setDrawer({ open: false })} onSave={handleSave} />

      <Confirm
        open={!!confirmArchive}
        onClose={() => setConfirmArchive(null)}
        onConfirm={handleArchive}
        title={confirmArchive?.archive ? "Unpublish this programme?" : "Publish this programme?"}
        body={<>{confirmArchive?.archive ? "The programme will be removed from the public atlas. Existing applications remain intact." : "The programme will be listed in the public atlas."}</>}
        confirmLabel={confirmArchive?.archive ? "Yes — unpublish" : "Yes — publish"}
        danger={!!confirmArchive?.archive}
      />
    </section>
  );
}

function RepProgramDrawer({ open, editing, unis, onClose, onSave }: {
  open: boolean; editing?: ProgramDto; unis: UniversityDto[]; onClose: () => void; onSave: (v: Partial<ProgramDto>) => void;
}) {
  const [v, setV] = useState<Partial<ProgramDto> & { universityId?: number }>({});

  useEffect(() => {
    if (editing) {
      setV({ name: editing.name, type: editing.type ?? "", department: editing.department ?? "", duration: editing.duration ?? "", description: editing.description ?? "", applicationDeadline: editing.applicationDeadline ?? "", tuition: editing.tuition ?? "", universityId: editing.university?.id });
    } else {
      setV({ name: "", type: "", department: "", duration: "", description: "", applicationDeadline: "", tuition: "", universityId: undefined });
    }
  }, [open, editing?.id]);

  return (
    <ActionDrawer open={open} onClose={onClose} kicker={editing ? "EDIT PROGRAMME" : "NEW PROGRAMME"} title={editing ? "Editing programme" : "New programme listing"}
      footer={<><button onClick={onClose} className="btn-ink btn-ghost"><span>Cancel</span></button><button onClick={() => onSave(v)} className="btn-ink btn-gold"><span>{editing ? "Save changes" : "Publish"}</span></button></>}>
      <DSection title="Identity" index="01">
        <DField label="Title" value={v.name ?? ""} onChange={t => setV({ ...v, name: t })} />
        <DGrid>
          <DField label="Type / Level" value={v.type ?? ""} onChange={t => setV({ ...v, type: t })} options={["MSc", "PhD", "MA", "MEng", "BSc", "MPhil", "LLM"]} />
          <DField label="Department" value={v.department ?? ""} onChange={t => setV({ ...v, department: t })} />
        </DGrid>
        <div className={"field-underline " + (v.universityId ? "has-value" : "")}>
          <label>University</label>
          <select value={v.universityId ?? ""} onChange={e => setV({ ...v, universityId: e.target.value ? parseInt(e.target.value) : undefined })}>
            <option value="">— select —</option>
            {unis.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        </div>
      </DSection>
      <DSection title="Terms" index="02">
        <DGrid>
          <DField label="Duration" value={v.duration ?? ""} onChange={t => setV({ ...v, duration: t })} placeholder="2 yrs" />
          <DField label="Tuition" value={v.tuition ?? ""} onChange={t => setV({ ...v, tuition: t })} placeholder="CHF 1,460/yr" />
        </DGrid>
        <DField label="Application deadline (YYYY-MM-DD)" value={v.applicationDeadline ?? ""} onChange={t => setV({ ...v, applicationDeadline: t })} placeholder="2026-10-01" />
      </DSection>
      <DSection title="Editorial" index="03">
        <DField label="Description" value={v.description ?? ""} onChange={t => setV({ ...v, description: t })} textarea placeholder="A 2–3 sentence précis." />
      </DSection>
    </ActionDrawer>
  );
}

// ─── Scholarships tab ─────────────────────────────────────────────────────────

function ScholarshipsTab({ toast }: { toast: ReturnType<typeof useToast> }) {
  const [items, setItems] = useState<ScholarshipDto[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [drawer, setDrawer] = useState<{ open: boolean; editing?: ScholarshipDto }>({ open: false });
  const [confirmArchive, setConfirmArchive] = useState<{ item: ScholarshipDto; archive: boolean } | null>(null);

  const load = useCallback(async (p = 0, query = q) => {
    setLoading(true);
    setError("");
    try {
      const data = await scholarshipsList({ page: p, size: 20, q: query || undefined });
      setItems(data.content);
      setTotal(data.page.totalElements);
      setPage(p);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load scholarships.");
    } finally {
      setLoading(false);
    }
  }, [q]);

  useEffect(() => { load(0, ""); }, []);

  const handleSave = async (v: Partial<ScholarshipDto>) => {
    try {
      if (drawer.editing) {
        await scholarshipsUpdate(drawer.editing.id, v);
        toast("Scholarship updated", "ok");
      } else {
        await scholarshipsCreate(v);
        toast("Scholarship created", "ok");
      }
      setDrawer({ open: false });
      load(page);
    } catch (e) {
      toast(e instanceof ApiError ? e.message : "Save failed.", "error" as any);
    }
  };

  const handleArchive = async () => {
    if (!confirmArchive) return;
    try {
      await scholarshipsUpdate(confirmArchive.item.id, { archived: confirmArchive.archive });
      toast(confirmArchive.archive ? "Scholarship unpublished" : "Scholarship published", confirmArchive.archive ? "info" : "ok");
      setConfirmArchive(null);
      load(page);
    } catch (e) {
      toast(e instanceof ApiError ? e.message : "Action failed.", "error" as any);
    }
  };

  return (
    <section>
      <header className="flex items-end justify-between pb-4 border-b border-[var(--rule)] gap-3 flex-wrap">
        <div className="flex items-baseline gap-4"><span className="section-index">02</span><h2 className="serif" style={{ fontWeight: 300 }}>Scholarships managed</h2></div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="field-underline" style={{ paddingTop: 0, minWidth: 200 }}>
            <input placeholder="Filter…" value={q} onChange={e => { setQ(e.target.value); load(0, e.target.value); }} />
          </div>
          <button onClick={() => setDrawer({ open: true })} className="btn-ink btn-gold"><span>+ New scholarship</span></button>
        </div>
      </header>

      {loading && <Skeleton lines={4} />}
      {!loading && error && <ErrorRetry message={error} onRetry={() => load(page)} />}
      {!loading && !error && items.length === 0 && (
        <div className="py-12 text-center mono" style={{ color: "var(--ink-faint)" }}>No scholarships found.</div>
      )}

      <ul>
        {items.map((s, i) => (
          <li key={s.id} className="py-5 border-b border-[var(--rule)] grid grid-cols-12 gap-3 items-baseline">
            <span className="col-span-2 md:col-span-1 mono tabular" style={{ color: "var(--gold)" }}>{String(page * 20 + i + 1).padStart(2, "0")}</span>
            <div className="col-span-10 md:col-span-7 min-w-0">
              <a href={`#/scholarships/${s.id}`} className="serif hover:text-[var(--gold)]" style={{ fontSize: "1.0625rem" }}>{s.title}</a>
              <div className="mono mt-1" style={{ color: "var(--ink-soft)", fontSize: 10 }}>
                {[s.funder, fmtMoney(s.amount, s.currency), s.deadline ? `DL ${fmtDate(s.deadline)}` : null].filter(Boolean).join(" · ")}
              </div>
            </div>
            <div className="col-span-12 md:col-span-4 flex justify-end gap-2 mono flex-wrap" style={{ fontSize: 10 }}>
              <span className="px-2 py-1 border border-[var(--rule)]" style={{ color: s.archived ? "var(--oxblood)" : "var(--moss)" }}>{s.archived ? "UNPUBLISHED" : "PUBLISHED"}</span>
              <button onClick={() => setDrawer({ open: true, editing: s })} className="px-3 py-1 border border-[var(--rule-strong)] hover:border-[var(--gold)] hover:text-[var(--gold)]">EDIT</button>
              {s.archived
                ? <button onClick={() => setConfirmArchive({ item: s, archive: false })} className="px-3 py-1 border border-[var(--rule-strong)] hover:border-[var(--moss)] hover:text-[var(--moss)]">PUBLISH</button>
                : <button onClick={() => setConfirmArchive({ item: s, archive: true })} className="px-3 py-1 border border-[var(--rule-strong)] hover:border-[var(--oxblood)] hover:text-[var(--oxblood)]">UNPUBLISH</button>
              }
            </div>
          </li>
        ))}
      </ul>

      {total > 20 && (
        <div className="flex gap-3 mono mt-4" style={{ fontSize: 11 }}>
          <button disabled={page === 0} onClick={() => load(page - 1)} className="px-3 py-1 border border-[var(--rule-strong)] disabled:opacity-40">PREV</button>
          <span style={{ color: "var(--ink-faint)" }}>Page {page + 1} / {Math.ceil(total / 20)}</span>
          <button disabled={(page + 1) * 20 >= total} onClick={() => load(page + 1)} className="px-3 py-1 border border-[var(--rule-strong)] disabled:opacity-40">NEXT</button>
        </div>
      )}

      <RepScholarshipDrawer open={drawer.open} editing={drawer.editing} onClose={() => setDrawer({ open: false })} onSave={handleSave} />

      <Confirm
        open={!!confirmArchive}
        onClose={() => setConfirmArchive(null)}
        onConfirm={handleArchive}
        title={confirmArchive?.archive ? "Unpublish this scholarship?" : "Publish this scholarship?"}
        body={<>{confirmArchive?.archive ? "The listing is removed from the public atlas immediately. Existing applications remain intact." : "The scholarship will be listed in the public atlas."}</>}
        confirmLabel={confirmArchive?.archive ? "Yes — unpublish" : "Yes — publish"}
        danger={!!confirmArchive?.archive}
      />
    </section>
  );
}

function RepScholarshipDrawer({ open, editing, onClose, onSave }: {
  open: boolean; editing?: ScholarshipDto; onClose: () => void; onSave: (v: Partial<ScholarshipDto>) => void;
}) {
  const [v, setV] = useState<Partial<ScholarshipDto>>({});
  const [amtStr, setAmtStr] = useState("");

  useEffect(() => {
    if (editing) {
      setV({ title: editing.title, description: editing.description ?? "", eligibility: editing.eligibility ?? "", deadline: editing.deadline ?? "", funder: editing.funder ?? "", currency: editing.currency ?? "USD", region: editing.region ?? "", level: editing.level ?? "" });
      setAmtStr(editing.amount != null ? String(editing.amount) : "");
    } else {
      setV({ title: "", description: "", eligibility: "", deadline: "", funder: "", currency: "USD", region: "", level: "" });
      setAmtStr("");
    }
  }, [open, editing?.id]);

  return (
    <ActionDrawer open={open} onClose={onClose} kicker={editing ? "EDIT SCHOLARSHIP" : "NEW SCHOLARSHIP"} title={editing ? "Editing scholarship" : "New scholarship listing"}
      footer={<><button onClick={onClose} className="btn-ink btn-ghost"><span>Cancel</span></button><button onClick={() => onSave({ ...v, amount: amtStr ? parseFloat(amtStr) : undefined })} className="btn-ink btn-gold"><span>{editing ? "Save changes" : "Publish"}</span></button></>}>
      <DSection title="Identity" index="01">
        <DField label="Title" value={v.title ?? ""} onChange={t => setV({ ...v, title: t })} />
        <DField label="Funder" value={v.funder ?? ""} onChange={t => setV({ ...v, funder: t })} />
      </DSection>
      <DSection title="Award" index="02">
        <DGrid>
          <DField label="Amount" value={amtStr} onChange={setAmtStr} type="number" />
          <DField label="Currency" value={v.currency ?? "USD"} onChange={t => setV({ ...v, currency: t })} options={["USD", "GBP", "EUR", "CHF", "CAD", "JPY"]} />
        </DGrid>
        <DGrid>
          <DField label="Region" value={v.region ?? ""} onChange={t => setV({ ...v, region: t })} />
          <DField label="Level" value={v.level ?? ""} onChange={t => setV({ ...v, level: t })} options={["Undergraduate", "Masters", "PhD", "Postdoctoral", "All"]} />
        </DGrid>
        <DField label="Deadline (YYYY-MM-DD)" value={v.deadline ?? ""} onChange={t => setV({ ...v, deadline: t })} placeholder="2026-10-01" />
      </DSection>
      <DSection title="Editorial" index="03">
        <DField label="Description" value={v.description ?? ""} onChange={t => setV({ ...v, description: t })} textarea />
        <DField label="Eligibility" value={v.eligibility ?? ""} onChange={t => setV({ ...v, eligibility: t })} textarea />
      </DSection>
    </ActionDrawer>
  );
}

// ─── Events tab ───────────────────────────────────────────────────────────────

function EventsTab({ toast }: { toast: ReturnType<typeof useToast> }) {
  const [items, setItems] = useState<WebinarDto[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [drawer, setDrawer] = useState(false);

  const load = useCallback(async (p = 0) => {
    setLoading(true);
    setError("");
    try {
      const data = await webinarsList({ page: p, size: 20 });
      setItems(data.content);
      setTotal(data.page.totalElements);
      setPage(p);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load events.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(0); }, [load]);

  const handleCreate = async (v: Partial<WebinarDto>) => {
    try {
      await webinarsCreate(v);
      toast("Event scheduled", "ok");
      setDrawer(false);
      load(page);
    } catch (e) {
      toast(e instanceof ApiError ? e.message : "Save failed.", "error" as any);
    }
  };

  return (
    <section>
      <header className="flex items-end justify-between pb-4 border-b border-[var(--rule)] gap-3 flex-wrap">
        <div className="flex items-baseline gap-4"><span className="section-index">03</span><h2 className="serif" style={{ fontWeight: 300 }}>Webinars &amp; office hours</h2></div>
        <button onClick={() => setDrawer(true)} className="btn-ink btn-gold"><span>+ Schedule event</span></button>
      </header>

      {loading && <Skeleton lines={4} />}
      {!loading && error && <ErrorRetry message={error} onRetry={() => load(page)} />}
      {!loading && !error && items.length === 0 && (
        <div className="py-12 text-center mono" style={{ color: "var(--ink-faint)" }}>No events yet.</div>
      )}

      <ul>
        {items.map((w, i) => (
          <li key={w.id} className="py-5 border-b border-[var(--rule)] grid grid-cols-12 gap-3 items-baseline">
            <span className="col-span-2 md:col-span-1 mono tabular" style={{ color: "var(--gold)" }}>{String(page * 20 + i + 1).padStart(2, "0")}</span>
            <div className="col-span-10 md:col-span-8 min-w-0">
              <a href={`#/webinars/${w.id}`} className="serif hover:text-[var(--gold)]" style={{ fontSize: "1.0625rem" }}>{w.title}</a>
              <div className="mono mt-1" style={{ color: "var(--ink-soft)", fontSize: 10 }}>
                {[fmtDate(w.scheduledAt), w.durationMinutes ? `${w.durationMinutes} min` : null, w.speakerAffiliation].filter(Boolean).join(" · ")}
              </div>
            </div>
            <div className="col-span-12 md:col-span-3 flex justify-end gap-2 mono flex-wrap" style={{ fontSize: 10 }}>
              <span className="px-2 py-1 border border-[var(--rule)]" style={{ color: "var(--ink-soft)" }}>{(w.status ?? "SCHEDULED").toUpperCase()}</span>
              <a href={`#/webinars/${w.id}`} className="px-3 py-1 border border-[var(--rule-strong)] hover:border-[var(--gold)] hover:text-[var(--gold)]">VIEW</a>
            </div>
          </li>
        ))}
      </ul>

      {total > 20 && (
        <div className="flex gap-3 mono mt-4" style={{ fontSize: 11 }}>
          <button disabled={page === 0} onClick={() => load(page - 1)} className="px-3 py-1 border border-[var(--rule-strong)] disabled:opacity-40">PREV</button>
          <span style={{ color: "var(--ink-faint)" }}>Page {page + 1} / {Math.ceil(total / 20)}</span>
          <button disabled={(page + 1) * 20 >= total} onClick={() => load(page + 1)} className="px-3 py-1 border border-[var(--rule-strong)] disabled:opacity-40">NEXT</button>
        </div>
      )}

      <RepWebinarDrawer open={drawer} onClose={() => setDrawer(false)} onSave={handleCreate} />
    </section>
  );
}

function RepWebinarDrawer({ open, onClose, onSave }: { open: boolean; onClose: () => void; onSave: (v: Partial<WebinarDto>) => void }) {
  const [v, setV] = useState<Partial<WebinarDto>>({ title: "", description: "", scheduledAt: "", meetingLink: "", speakerAffiliation: "", durationMinutes: 60 });

  useEffect(() => {
    if (open) setV({ title: "", description: "", scheduledAt: "", meetingLink: "", speakerAffiliation: "", durationMinutes: 60 });
  }, [open]);

  return (
    <ActionDrawer open={open} onClose={onClose} kicker="NEW EVENT" title="Schedule a webinar or office hour"
      footer={<><button onClick={onClose} className="btn-ink btn-ghost"><span>Cancel</span></button><button onClick={() => onSave(v)} className="btn-ink btn-gold"><span>Schedule</span></button></>}>
      <DSection title="Identity" index="01">
        <DField label="Title" value={v.title ?? ""} onChange={t => setV({ ...v, title: t })} placeholder="Open office — January round" />
        <DField label="Speaker / affiliation" value={v.speakerAffiliation ?? ""} onChange={t => setV({ ...v, speakerAffiliation: t })} />
      </DSection>
      <DSection title="Schedule" index="02">
        <DGrid>
          <DField label="Scheduled at (ISO)" value={v.scheduledAt ?? ""} onChange={t => setV({ ...v, scheduledAt: t })} placeholder="2026-08-01T14:00" />
          <DField label="Duration (minutes)" value={String(v.durationMinutes ?? 60)} onChange={t => setV({ ...v, durationMinutes: parseInt(t) || 60 })} type="number" />
        </DGrid>
        <DField label="Meeting link" value={v.meetingLink ?? ""} onChange={t => setV({ ...v, meetingLink: t })} placeholder="https://zoom.us/…" />
      </DSection>
      <DSection title="Detail" index="03">
        <DField label="Description" value={v.description ?? ""} onChange={t => setV({ ...v, description: t })} textarea placeholder="A 2–3 sentence précis." />
      </DSection>
    </ActionDrawer>
  );
}

// ─── Enquiries tab ────────────────────────────────────────────────────────────

function EnquiriesTab({ toast }: { toast: ReturnType<typeof useToast> }) {
  const [convs, setConvs] = useState<ConversationDto[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [openConv, setOpenConv] = useState<ConversationDetailDto | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);

  const load = useCallback(async (p = 0) => {
    setLoading(true);
    setError("");
    try {
      const data = await messagesList({ page: p, size: 20 });
      setConvs(data.content);
      setTotal(data.page.totalElements);
      setPage(p);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load enquiries.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(0); }, [load]);

  const openEnquiry = async (c: ConversationDto) => {
    setDetailLoading(true);
    setReply("");
    try {
      const detail = await messagesGet(c.id);
      setOpenConv(detail);
      // Mark unread on open: the GET call serves as mark-read on the backend
      setConvs(p => p.map(x => x.id === c.id ? { ...x, unreadCount: 0 } : x));
    } catch {
      toast("Failed to open enquiry.", "error" as any);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleSendReply = async () => {
    if (!openConv || !reply.trim()) return;
    setSending(true);
    try {
      await messagesReply(openConv.id, { body: reply });
      toast("Reply sent", "ok");
      setReply("");
      // Refresh detail
      const detail = await messagesGet(openConv.id);
      setOpenConv(detail);
    } catch (e) {
      toast(e instanceof ApiError ? e.message : "Failed to send reply.", "error" as any);
    } finally {
      setSending(false);
    }
  };

  return (
    <section>
      <header className="flex items-end justify-between pb-4 border-b border-[var(--rule)] gap-3 flex-wrap">
        <div className="flex items-baseline gap-4"><span className="section-index">04</span><h2 className="serif" style={{ fontWeight: 300 }}>Enquiries from candidates</h2></div>
        <div className="mono" style={{ color: "var(--ink-faint)", fontSize: 10 }}>{total} CONVERSATIONS</div>
      </header>

      {loading && <Skeleton lines={4} />}
      {!loading && error && <ErrorRetry message={error} onRetry={() => load(page)} />}
      {!loading && !error && convs.length === 0 && (
        <div className="py-8 mono" style={{ color: "var(--ink-faint)" }}>No enquiries yet.</div>
      )}

      <ul>
        {convs.map((c, i) => (
          <li key={c.id} className="py-5 border-b border-[var(--rule)] grid grid-cols-12 gap-3 items-baseline">
            <span className="col-span-2 md:col-span-1 mono tabular" style={{ color: (c.unreadCount ?? 0) > 0 ? "var(--gold)" : "var(--ink-faint)" }}>{String(page * 20 + i + 1).padStart(2, "0")}</span>
            <button onClick={() => openEnquiry(c)} className="col-span-10 md:col-span-8 text-left min-w-0">
              <div className="serif truncate" style={{ fontSize: "1.0625rem" }}>{c.otherParty?.fullName ?? "Unknown"}</div>
              <div className="mono mt-1 truncate" style={{ color: "var(--ink-soft)", fontSize: 10 }}>
                {c.subject ?? "(no subject)"}{c.lastPreview ? ` — "${c.lastPreview.slice(0, 40)}…"` : ""}
              </div>
            </button>
            <div className="col-span-6 md:col-span-2 mono" style={{ color: "var(--ink-faint)", fontSize: 10 }}>{fmtDate(c.lastMessageAt)}</div>
            <button onClick={() => openEnquiry(c)} className="col-span-6 md:col-span-1 text-right mono" style={{ color: "var(--gold)", fontSize: 10 }}>OPEN →</button>
          </li>
        ))}
      </ul>

      {total > 20 && (
        <div className="flex gap-3 mono mt-4" style={{ fontSize: 11 }}>
          <button disabled={page === 0} onClick={() => load(page - 1)} className="px-3 py-1 border border-[var(--rule-strong)] disabled:opacity-40">PREV</button>
          <span style={{ color: "var(--ink-faint)" }}>Page {page + 1} / {Math.ceil(total / 20)}</span>
          <button disabled={(page + 1) * 20 >= total} onClick={() => load(page + 1)} className="px-3 py-1 border border-[var(--rule-strong)] disabled:opacity-40">NEXT</button>
        </div>
      )}

      {/* Enquiry detail drawer */}
      <ActionDrawer
        open={!!openConv}
        onClose={() => setOpenConv(null)}
        kicker={openConv ? `ENQUIRY · ${(openConv.otherParty?.fullName ?? "").toUpperCase()}` : "ENQUIRY"}
        title={openConv?.subject ?? "(no subject)"}
        footer={
          <>
            <button onClick={() => setOpenConv(null)} className="btn-ink btn-ghost"><span>Close</span></button>
            <button onClick={handleSendReply} disabled={sending || !reply.trim()} className="btn-ink btn-gold" style={{ opacity: sending ? 0.65 : 1 }}>
              <span>{sending ? "Sending…" : "Send reply"}</span>
            </button>
          </>
        }
      >
        {detailLoading && <Skeleton lines={3} />}
        {!detailLoading && openConv && (
          <>
            <DSection title="Thread" index="01">
              <div className="space-y-4">
                {(openConv.messages ?? []).map((m) => (
                  <div key={m.id} className="p-4 border border-[var(--rule-strong)]" style={{ background: "var(--paper-raised)" }}>
                    <div className="mono mb-2" style={{ color: "var(--ink-faint)", fontSize: 10 }}>
                      FROM · {(m.sender?.fullName ?? "Unknown").toUpperCase()} — {fmtDate(m.sentAt)}
                    </div>
                    <p className="serif" style={{ fontSize: "1.0625rem", lineHeight: 1.65 }}>{m.body}</p>
                  </div>
                ))}
                {(openConv.messages ?? []).length === 0 && (
                  <div className="mono" style={{ color: "var(--ink-faint)" }}>No messages in this thread yet.</div>
                )}
              </div>
            </DSection>
            <DSection title="Your reply" index="02">
              <DField label="Reply" value={reply} onChange={setReply} textarea placeholder="A short, attributed reply…" />
              <div className="mono" style={{ color: "var(--ink-faint)", fontSize: 10 }}>SIGNED AS · {openConv.otherParty?.fullName ? "REP" : "YOU"} · UNIVERSITY REP</div>
            </DSection>
          </>
        )}
      </ActionDrawer>
    </section>
  );
}

// ─── Institution profile (localStorage) ──────────────────────────────────────

function InstitutionSection({ toast }: { toast: ReturnType<typeof useToast> }) {
  const [v, setV] = useState<InstProfile>(loadInst);

  const handleSave = () => {
    saveInst(v);
    toast("Institution profile saved on this device.", "ok");
  };

  return (
    <section className="space-y-6">
      <header className="flex items-end justify-between pb-4 border-b border-[var(--rule)]">
        <div className="flex items-baseline gap-4"><span className="section-index">05</span><h2 className="serif" style={{ fontWeight: 300 }}>Institution profile</h2></div>
        <button onClick={handleSave} className="btn-ink btn-gold"><span>Save profile</span></button>
      </header>

      {/* Institution profile is stored on this device — no backend binding for rep institution */}
      <div className="mono py-2 px-3 border border-[var(--rule-strong)]" style={{ color: "var(--ink-faint)", fontSize: 10, fontFamily: "var(--font-mono, monospace)" }}>
        Stored on this device · not persisted to backend in this edition
      </div>

      <DGrid>
        <DField label="Institution name" value={v.name} onChange={t => setV({ ...v, name: t })} />
        <DField label="Founded" value={v.founded} onChange={t => setV({ ...v, founded: t })} />
      </DGrid>
      <DField label="Public contact" value={v.contact} onChange={t => setV({ ...v, contact: t })} placeholder="admissions@university.edu" />
      <DField label="Description" value={v.description} onChange={t => setV({ ...v, description: t })} textarea />
      <label className="flex items-center justify-between py-3 border-b border-[var(--rule)]">
        <span>Accepting applications this cycle</span>
        <input type="checkbox" checked={v.accepting} onChange={e => setV({ ...v, accepting: e.target.checked })} />
      </label>
    </section>
  );
}
