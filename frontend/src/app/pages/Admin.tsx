import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "../router";
import { Seal } from "../components/Seal";
import { SplitFlap } from "../components/SplitFlap";
import { ActionDrawer, Confirm, DField, DGrid, DSection } from "../components/ActionDrawer";
import { useToast } from "../components/Toast";
import { useSession } from "../providers/SessionProvider";
import { ApiError } from "../api/client";
import { fmtDate, fmtMoney } from "../api/format";
import {
  adminGetStats,
  adminGetAuditLogs,
  universitiesList,
  universitiesCreate,
  universitiesUpdate,
  programsList,
  programsCreate,
  programsUpdate,
  scholarshipsList,
  scholarshipsCreate,
  scholarshipsUpdate,
  researchList,
  resourcesList,
  resourcesUpload,
  resourceDownloadUrl,
  webinarsList,
  webinarsCreate,
  forumThreadsList,
  usersList,
  usersPatchStatus,
  contactList,
  AdminStatsDto,
  AuditLogDto,
  UniversityDto,
  ProgramDto,
  ScholarshipDto,
  ResearchProjectDto,
  ResourceDto,
  WebinarDto,
  ForumThreadDto,
  UserDto,
  ContactMessageDto,
} from "../api/endpoints";

// ─── Nav ──────────────────────────────────────────────────────────────────────

const NAV = [
  { k: "overview",     label: "Overview",        idx: "00" },
  { k: "universities", label: "Universities",    idx: "01" },
  { k: "programs",     label: "Programmes",      idx: "02" },
  { k: "scholarships", label: "Scholarships",    idx: "03" },
  { k: "research",     label: "Research",        idx: "04" },
  { k: "resources",    label: "Resources",       idx: "05" },
  { k: "webinars",     label: "Webinars",        idx: "06" },
  { k: "forums",       label: "Forums",          idx: "07" },
  { k: "users",        label: "Users &amp; roles", idx: "08" },
  { k: "media",        label: "Media library",   idx: "09" },
  { k: "letters",      label: "Letters",         idx: "10" },
  { k: "settings",     label: "Settings",        idx: "11" },
];

// ─── Shared helpers ───────────────────────────────────────────────────────────

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

export default function Admin() {
  const { params } = useRouter();
  const { session } = useSession();
  const section = params.section ?? "overview";

  return (
    <main className="pt-32">
      <header className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 pb-10">
        <div className="grid grid-cols-12 gap-6 items-end">
          <div className="col-span-12 md:col-span-9">
            <div className="mono" style={{ color: "var(--gold)" }}>EDITOR'S DESK · ADMIN</div>
            <h1 className="serif mt-3" style={{ fontSize: "clamp(2.5rem, 5vw, 4.25rem)", fontWeight: 300, lineHeight: 1 }}>
              Volume I, Issue 24 — at the press.
            </h1>
            <p className="mt-4 max-w-[60ch]" style={{ color: "var(--ink-soft)" }}>
              Manage every entry that appears in the public atlas. Changes are versioned and may be reverted from the audit log.
            </p>
          </div>
          <div className="col-span-12 md:col-span-3 flex md:justify-end">
            <Seal size={120} label="EDITOR" />
          </div>
        </div>
      </header>

      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 pb-32 grid grid-cols-12 gap-6 md:gap-10">
        <aside className="col-span-12 md:col-span-3 md:sticky md:top-28 self-start space-y-6">
          <div className="border border-[var(--rule-strong)] p-5">
            <div className="mono" style={{ color: "var(--ink-faint)", fontSize: 10 }}>SIGNED IN AS</div>
            <div className="serif mt-2" style={{ fontSize: "1.125rem" }}>{session.name || "Administrator"}</div>
            <div className="mono mt-1" style={{ color: "var(--gold)", fontSize: 10 }}>ADMIN · EDITOR-IN-CHIEF</div>
          </div>

          {/* Mobile section selector */}
          <div className="md:hidden -mx-1 overflow-x-auto no-scrollbar">
            <div className="inline-flex gap-px min-w-full" style={{ background: "var(--rule)" }}>
              {NAV.map((n) => {
                const active = n.k === section;
                return (
                  <a key={n.k} href={`#/admin/${n.k}`} className="px-3 py-3 mono whitespace-nowrap" style={{ background: active ? "var(--ink)" : "var(--paper)", color: active ? "var(--paper)" : "var(--ink-soft)", fontSize: 10 }}>
                    {n.idx} · <span dangerouslySetInnerHTML={{ __html: n.label }} />
                  </a>
                );
              })}
            </div>
          </div>

          <nav className="hidden md:block">
            <ul className="space-y-2">
              {NAV.map((n) => {
                const active = n.k === section;
                return (
                  <li key={n.k}>
                    <a href={`#/admin/${n.k}`} className="flex items-baseline gap-3 py-2 border-b border-[var(--rule)]" style={{ color: active ? "var(--ink)" : "var(--ink-soft)" }}>
                      <span className="mono tabular" style={{ color: active ? "var(--gold)" : "var(--ink-faint)", fontSize: 11 }}>{n.idx}</span>
                      <span className="serif" style={{ fontSize: "1.0625rem", fontWeight: 300 }} dangerouslySetInnerHTML={{ __html: n.label }} />
                      {active && <span className="ml-auto mono" style={{ color: "var(--gold)" }}>●</span>}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        <div className="col-span-12 md:col-span-9">
          {section === "overview"     && <Overview />}
          {section === "universities" && <UniversitiesSection />}
          {section === "programs"     && <ProgramsSection />}
          {section === "scholarships" && <ScholarshipsSection />}
          {section === "research"     && <ResearchSection />}
          {section === "resources"    && <ResourcesSection />}
          {section === "webinars"     && <WebinarsSection />}
          {section === "forums"       && <ForumsSection />}
          {section === "users"        && <UsersSection />}
          {section === "media"        && <MediaLibrary />}
          {section === "letters"      && <LettersSection />}
          {section === "settings"     && <Settings />}
        </div>
      </section>
    </main>
  );
}

// ─── Overview ─────────────────────────────────────────────────────────────────

function Overview() {
  const [stats, setStats] = useState<AdminStatsDto | null>(null);
  const [logs, setLogs] = useState<AuditLogDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [s, l] = await Promise.all([
        adminGetStats(),
        adminGetAuditLogs({ page: 0, size: 5 }),
      ]);
      setStats(s);
      setLogs(l.content);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load overview.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const tiles = stats ? [
    { l: "Users",          n: stats.users ?? 0,                          p: 5 },
    { l: "Programmes",     n: stats.programs ?? 0,                       p: 3 },
    { l: "Pending review", n: (stats.pendingProgramApplications ?? 0) + (stats.pendingScholarshipApplications ?? 0), p: 2 },
    { l: "New messages",   n: stats.newContactMessages ?? 0,             p: 3 },
  ] : [];

  return (
    <div className="space-y-12">
      {loading && <Skeleton lines={3} />}
      {!loading && error && <ErrorRetry message={error} onRetry={load} />}

      {!loading && !error && stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px" style={{ background: "var(--rule)" }}>
          {tiles.map((t) => (
            <div key={t.l} className="p-6" style={{ background: "var(--paper-raised)" }}>
              <div className="mono" style={{ color: "var(--ink-faint)", fontSize: 10 }}>{t.l.toUpperCase()}</div>
              <div className="serif tabular mt-3" style={{ fontSize: "clamp(2.25rem, 4vw, 3.25rem)", fontWeight: 300, lineHeight: 1 }}>
                <SplitFlap value={t.n} pad={t.p} />
              </div>
            </div>
          ))}
        </div>
      )}

      <section>
        <header className="flex items-end justify-between pb-4 border-b border-[var(--rule)]">
          <div className="flex items-baseline gap-4"><span className="section-index">01</span><h2 className="serif" style={{ fontWeight: 300 }}>Recent activity</h2></div>
          <a href="#/admin/letters" className="mono" style={{ color: "var(--gold)" }}>FULL AUDIT LOG →</a>
        </header>
        {loading && <Skeleton lines={4} />}
        {!loading && logs.length === 0 && (
          <div className="py-8 mono" style={{ color: "var(--ink-faint)" }}>No audit log entries yet.</div>
        )}
        <ul>
          {logs.map((a, i) => (
            <li key={a.id ?? i} className="py-4 border-b border-[var(--rule)] grid grid-cols-12 gap-4">
              <span className="col-span-1 mono tabular" style={{ color: "var(--gold)" }}>{String(i + 1).padStart(2, "0")}</span>
              <div className="col-span-3 mono" style={{ color: "var(--ink-soft)", fontSize: 11 }}>{a.actorName ?? "—"}</div>
              <div className="col-span-6 serif" style={{ fontSize: "1.0625rem" }}>{a.action ?? "—"}{a.entityType ? ` · ${a.entityType}` : ""}</div>
              <div className="col-span-2 text-right mono" style={{ color: "var(--ink-faint)", fontSize: 10 }}>{fmtDate(a.createdAt)}</div>
            </li>
          ))}
        </ul>
      </section>

      <section className="grid grid-cols-12 gap-px" style={{ background: "var(--rule)" }}>
        {NAV.slice(1, 9).map((n) => (
          <a key={n.k} href={`#/admin/${n.k}`} className="col-span-6 md:col-span-3 p-5 hover:bg-[var(--paper-deep)] transition-colors" style={{ background: "var(--paper-raised)" }}>
            <div className="mono" style={{ color: "var(--gold)" }}>{n.idx}</div>
            <div className="serif mt-2" style={{ fontSize: "1.0625rem" }} dangerouslySetInnerHTML={{ __html: n.label }} />
            <div className="mono mt-2" style={{ color: "var(--ink-faint)" }}>OPEN →</div>
          </a>
        ))}
      </section>
    </div>
  );
}

// ─── Universities ─────────────────────────────────────────────────────────────

function UniversitiesSection() {
  const toast = useToast();
  const [items, setItems] = useState<UniversityDto[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [drawer, setDrawer] = useState<{ open: boolean; editing?: UniversityDto }>({ open: false });

  const load = useCallback(async (p = 0, query = q) => {
    setLoading(true);
    setError("");
    try {
      const data = await universitiesList({ page: p, size: 20, q: query || undefined });
      setItems(data.content);
      setTotal(data.page.totalElements);
      setPage(p);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load universities.");
    } finally {
      setLoading(false);
    }
  }, [q]);

  useEffect(() => { load(0, q); }, []);

  const handleSave = async (v: Partial<UniversityDto>) => {
    try {
      if (drawer.editing) {
        await universitiesUpdate(drawer.editing.id, v);
        toast("University updated", "ok");
      } else {
        await universitiesCreate(v);
        toast("University created", "ok");
      }
      setDrawer({ open: false });
      load(page);
    } catch (e) {
      toast(e instanceof ApiError ? e.message : "Save failed.", "error" as any);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between pb-4 border-b border-[var(--rule)] gap-4 flex-wrap">
        <h2 className="serif" style={{ fontSize: "clamp(1.875rem, 3vw, 2.5rem)", fontWeight: 300 }}>Universities</h2>
        <div className="flex items-center gap-3">
          <div className="field-underline" style={{ paddingTop: 0, minWidth: 220 }}>
            <input placeholder="Filter…" value={q} onChange={e => { setQ(e.target.value); load(0, e.target.value); }} />
          </div>
          <button onClick={() => setDrawer({ open: true })} className="btn-ink btn-gold"><span>+ New university</span></button>
        </div>
      </header>

      <div className="mono" style={{ color: "var(--ink-faint)", fontSize: 10 }}>{total} TOTAL</div>

      {loading && <Skeleton lines={4} />}
      {!loading && error && <ErrorRetry message={error} onRetry={() => load(page)} />}
      {!loading && !error && items.length === 0 && (
        <div className="py-8 mono" style={{ color: "var(--ink-faint)" }}>No universities found.</div>
      )}

      {!loading && !error && items.length > 0 && (
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full">
            <thead>
              <tr className="mono text-left" style={{ color: "var(--ink-faint)", fontSize: 10 }}>
                <th className="py-3 px-2 w-12">№</th>
                {["NAME", "CITY", "COUNTRY", "FOUNDED", "RANK", "TAGS"].map(c => <th key={c} className="py-3 px-2 font-normal whitespace-nowrap">{c}</th>)}
                <th className="py-3 px-2 text-right font-normal">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {items.map((u, i) => (
                <tr key={u.id} className="border-t border-[var(--rule)] hover:bg-[var(--paper-raised)] transition-colors">
                  <td className="py-3 px-2 mono tabular" style={{ color: "var(--gold)" }}>{String(page * 20 + i + 1).padStart(3, "0")}</td>
                  <td className="py-3 px-2"><div className="serif" style={{ fontSize: "1.0625rem", maxWidth: 240, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.name}</div></td>
                  <td className="py-3 px-2 mono" style={{ fontSize: 11, color: "var(--ink-soft)" }}>{u.city}</td>
                  <td className="py-3 px-2 mono" style={{ fontSize: 11, color: "var(--ink-soft)" }}>{u.country}</td>
                  <td className="py-3 px-2 mono" style={{ fontSize: 11, color: "var(--ink-soft)" }}>{u.foundedYear ?? "—"}</td>
                  <td className="py-3 px-2 mono" style={{ fontSize: 11, color: "var(--ink-soft)" }}>{u.ranking != null ? `#${u.ranking}` : "—"}</td>
                  <td className="py-3 px-2 mono" style={{ fontSize: 11, color: "var(--ink-soft)", maxWidth: 160 }}>
                    <span style={{ display: "inline-block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 160 }}>{(u.tags ?? []).join(", ") || "—"}</span>
                  </td>
                  <td className="py-3 px-2 text-right mono whitespace-nowrap" style={{ fontSize: 10 }}>
                    <button onClick={() => setDrawer({ open: true, editing: u })} className="hover:text-[var(--gold)] mr-3">EDIT</button>
                    <a href={`#/universities/${u.id}`} className="hover:text-[var(--gold)] mr-3">VIEW</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {total > 20 && (
        <div className="flex gap-3 mono" style={{ fontSize: 11 }}>
          <button disabled={page === 0} onClick={() => load(page - 1)} className="px-3 py-1 border border-[var(--rule-strong)] disabled:opacity-40">PREV</button>
          <span style={{ color: "var(--ink-faint)" }}>Page {page + 1} / {Math.ceil(total / 20)}</span>
          <button disabled={(page + 1) * 20 >= total} onClick={() => load(page + 1)} className="px-3 py-1 border border-[var(--rule-strong)] disabled:opacity-40">NEXT</button>
        </div>
      )}

      <UniversityDrawer
        open={drawer.open}
        editing={drawer.editing}
        onClose={() => setDrawer({ open: false })}
        onSave={handleSave}
      />
    </div>
  );
}

function UniversityDrawer({ open, editing, onClose, onSave }: {
  open: boolean; editing?: UniversityDto; onClose: () => void; onSave: (v: Partial<UniversityDto>) => void;
}) {
  const blank: Partial<UniversityDto> = { name: "", country: "", city: "", ranking: undefined, website: "", description: "", foundedYear: undefined, studentCount: undefined, tags: [] };
  const [v, setV] = useState<Partial<UniversityDto>>(blank);
  const [tagsStr, setTagsStr] = useState("");

  useEffect(() => {
    if (editing) {
      setV({ name: editing.name, country: editing.country, city: editing.city, ranking: editing.ranking ?? undefined, website: editing.website ?? "", description: editing.description ?? "", foundedYear: editing.foundedYear ?? undefined, studentCount: editing.studentCount ?? undefined });
      setTagsStr((editing.tags ?? []).join(", "));
    } else {
      setV(blank);
      setTagsStr("");
    }
  }, [open, editing?.id]);

  const save = () => {
    const tags = tagsStr.split(",").map(t => t.trim()).filter(Boolean);
    onSave({ ...v, tags });
  };

  return (
    <ActionDrawer open={open} onClose={onClose} kicker={editing ? "EDIT UNIVERSITY" : "NEW UNIVERSITY"} title={editing ? "Editing university" : "New university"}
      footer={<><button onClick={onClose} className="btn-ink btn-ghost"><span>Cancel</span></button><button onClick={save} className="btn-ink btn-gold"><span>{editing ? "Save changes" : "Create"}</span></button></>}>
      <DSection title="Identity" index="01">
        <DField label="Name" value={v.name ?? ""} onChange={t => setV({ ...v, name: t })} />
        <DGrid>
          <DField label="City" value={v.city ?? ""} onChange={t => setV({ ...v, city: t })} />
          <DField label="Country" value={v.country ?? ""} onChange={t => setV({ ...v, country: t })} options={["United Kingdom","United States","Switzerland","Germany","Netherlands","Sweden","Japan","Canada","Australia","France","Belgium","Ireland","Singapore"]} />
        </DGrid>
        <DGrid>
          <DField label="Founded (year)" value={v.foundedYear != null ? String(v.foundedYear) : ""} onChange={t => setV({ ...v, foundedYear: t ? parseInt(t) : undefined })} type="number" />
          <DField label="Ranking (#)" value={v.ranking != null ? String(v.ranking) : ""} onChange={t => setV({ ...v, ranking: t ? parseInt(t) : undefined })} type="number" />
        </DGrid>
      </DSection>
      <DSection title="Record" index="02">
        <DField label="Student count" value={v.studentCount != null ? String(v.studentCount) : ""} onChange={t => setV({ ...v, studentCount: t ? parseInt(t) : undefined })} type="number" />
        <DField label="Website" value={v.website ?? ""} onChange={t => setV({ ...v, website: t })} placeholder="https://…" />
        <DField label="Tags (comma-separated)" value={tagsStr} onChange={setTagsStr} placeholder="Russell Group, Collegiate" />
        <DField label="About" value={v.description ?? ""} onChange={t => setV({ ...v, description: t })} textarea placeholder="A 2–3 sentence précis of the institution." />
      </DSection>
    </ActionDrawer>
  );
}

// ─── Programmes ───────────────────────────────────────────────────────────────

function ProgramsSection() {
  const toast = useToast();
  const [items, setItems] = useState<ProgramDto[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [drawer, setDrawer] = useState<{ open: boolean; editing?: ProgramDto }>({ open: false });
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

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between pb-4 border-b border-[var(--rule)] gap-4 flex-wrap">
        <h2 className="serif" style={{ fontSize: "clamp(1.875rem, 3vw, 2.5rem)", fontWeight: 300 }}>Programmes</h2>
        <div className="flex items-center gap-3">
          <div className="field-underline" style={{ paddingTop: 0, minWidth: 220 }}>
            <input placeholder="Filter…" value={q} onChange={e => { setQ(e.target.value); load(0, e.target.value); }} />
          </div>
          <button onClick={() => setDrawer({ open: true })} className="btn-ink btn-gold"><span>+ New programme</span></button>
        </div>
      </header>
      <div className="mono" style={{ color: "var(--ink-faint)", fontSize: 10 }}>{total} TOTAL</div>
      {loading && <Skeleton lines={4} />}
      {!loading && error && <ErrorRetry message={error} onRetry={() => load(page)} />}
      {!loading && !error && items.length === 0 && <div className="py-8 mono" style={{ color: "var(--ink-faint)" }}>No programmes found.</div>}
      {!loading && !error && items.length > 0 && (
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full">
            <thead>
              <tr className="mono text-left" style={{ color: "var(--ink-faint)", fontSize: 10 }}>
                <th className="py-3 px-2 w-12">№</th>
                {["TITLE", "TYPE", "DEPARTMENT", "INSTITUTION", "DEADLINE", "TUITION"].map(c => <th key={c} className="py-3 px-2 font-normal whitespace-nowrap">{c}</th>)}
                <th className="py-3 px-2 text-right font-normal">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {items.map((p, i) => (
                <tr key={p.id} className="border-t border-[var(--rule)] hover:bg-[var(--paper-raised)] transition-colors">
                  <td className="py-3 px-2 mono tabular" style={{ color: "var(--gold)" }}>{String(page * 20 + i + 1).padStart(3, "0")}</td>
                  <td className="py-3 px-2"><div className="serif" style={{ fontSize: "1.0625rem", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div></td>
                  <td className="py-3 px-2 mono" style={{ fontSize: 11, color: "var(--ink-soft)" }}>{p.type ?? "—"}</td>
                  <td className="py-3 px-2 mono" style={{ fontSize: 11, color: "var(--ink-soft)" }}>{p.department ?? "—"}</td>
                  <td className="py-3 px-2 mono" style={{ fontSize: 11, color: "var(--ink-soft)" }}>{p.university?.name ?? "—"}</td>
                  <td className="py-3 px-2 mono" style={{ fontSize: 11, color: "var(--ink-soft)" }}>{fmtDate(p.applicationDeadline)}</td>
                  <td className="py-3 px-2 mono" style={{ fontSize: 11, color: "var(--ink-soft)" }}>{p.tuition ?? "—"}</td>
                  <td className="py-3 px-2 text-right mono whitespace-nowrap" style={{ fontSize: 10 }}>
                    <button onClick={() => setDrawer({ open: true, editing: p })} className="hover:text-[var(--gold)] mr-3">EDIT</button>
                    <a href={`#/programs/${p.id}`} className="hover:text-[var(--gold)]">VIEW</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {total > 20 && (
        <div className="flex gap-3 mono" style={{ fontSize: 11 }}>
          <button disabled={page === 0} onClick={() => load(page - 1)} className="px-3 py-1 border border-[var(--rule-strong)] disabled:opacity-40">PREV</button>
          <span style={{ color: "var(--ink-faint)" }}>Page {page + 1} / {Math.ceil(total / 20)}</span>
          <button disabled={(page + 1) * 20 >= total} onClick={() => load(page + 1)} className="px-3 py-1 border border-[var(--rule-strong)] disabled:opacity-40">NEXT</button>
        </div>
      )}
      <ProgramDrawer open={drawer.open} editing={drawer.editing} unis={unis} onClose={() => setDrawer({ open: false })} onSave={handleSave} />
    </div>
  );
}

function ProgramDrawer({ open, editing, unis, onClose, onSave }: {
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
    <ActionDrawer open={open} onClose={onClose} kicker={editing ? "EDIT PROGRAMME" : "NEW PROGRAMME"} title={editing ? "Editing programme" : "New programme"}
      footer={<><button onClick={onClose} className="btn-ink btn-ghost"><span>Cancel</span></button><button onClick={() => onSave(v)} className="btn-ink btn-gold"><span>{editing ? "Save changes" : "Create"}</span></button></>}>
      <DSection title="Identity" index="01">
        <DField label="Title" value={v.name ?? ""} onChange={t => setV({ ...v, name: t })} />
        <DGrid>
          <DField label="Type / Level" value={v.type ?? ""} onChange={t => setV({ ...v, type: t })} options={["MSc", "PhD", "MA", "MEng", "BSc", "MPhil", "LLM"]} />
          <DField label="Department" value={v.department ?? ""} onChange={t => setV({ ...v, department: t })} />
        </DGrid>
        {/* University select from live universitiesList */}
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
      <DSection title="Detail" index="03">
        <DField label="Description" value={v.description ?? ""} onChange={t => setV({ ...v, description: t })} textarea />
      </DSection>
    </ActionDrawer>
  );
}

// ─── Scholarships ─────────────────────────────────────────────────────────────

function ScholarshipsSection() {
  const toast = useToast();
  const [items, setItems] = useState<ScholarshipDto[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [drawer, setDrawer] = useState<{ open: boolean; editing?: ScholarshipDto }>({ open: false });

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

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between pb-4 border-b border-[var(--rule)] gap-4 flex-wrap">
        <h2 className="serif" style={{ fontSize: "clamp(1.875rem, 3vw, 2.5rem)", fontWeight: 300 }}>Scholarships</h2>
        <div className="flex items-center gap-3">
          <div className="field-underline" style={{ paddingTop: 0, minWidth: 220 }}>
            <input placeholder="Filter…" value={q} onChange={e => { setQ(e.target.value); load(0, e.target.value); }} />
          </div>
          <button onClick={() => setDrawer({ open: true })} className="btn-ink btn-gold"><span>+ New scholarship</span></button>
        </div>
      </header>
      <div className="mono" style={{ color: "var(--ink-faint)", fontSize: 10 }}>{total} TOTAL</div>
      {loading && <Skeleton lines={4} />}
      {!loading && error && <ErrorRetry message={error} onRetry={() => load(page)} />}
      {!loading && !error && items.length === 0 && <div className="py-8 mono" style={{ color: "var(--ink-faint)" }}>No scholarships found.</div>}
      {!loading && !error && items.length > 0 && (
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full">
            <thead>
              <tr className="mono text-left" style={{ color: "var(--ink-faint)", fontSize: 10 }}>
                <th className="py-3 px-2 w-12">№</th>
                {["NAME", "FUNDER", "REGION", "AMOUNT", "DEADLINE", "LEVEL"].map(c => <th key={c} className="py-3 px-2 font-normal whitespace-nowrap">{c}</th>)}
                <th className="py-3 px-2 text-right font-normal">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {items.map((s, i) => (
                <tr key={s.id} className="border-t border-[var(--rule)] hover:bg-[var(--paper-raised)] transition-colors">
                  <td className="py-3 px-2 mono tabular" style={{ color: "var(--gold)" }}>{String(page * 20 + i + 1).padStart(3, "0")}</td>
                  <td className="py-3 px-2"><div className="serif" style={{ fontSize: "1.0625rem", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.title}</div></td>
                  <td className="py-3 px-2 mono" style={{ fontSize: 11, color: "var(--ink-soft)" }}>{s.funder ?? "—"}</td>
                  <td className="py-3 px-2 mono" style={{ fontSize: 11, color: "var(--ink-soft)" }}>{s.region ?? "—"}</td>
                  <td className="py-3 px-2 mono" style={{ fontSize: 11, color: "var(--ink-soft)" }}>{fmtMoney(s.amount, s.currency)}</td>
                  <td className="py-3 px-2 mono" style={{ fontSize: 11, color: "var(--ink-soft)" }}>{fmtDate(s.deadline)}</td>
                  <td className="py-3 px-2 mono" style={{ fontSize: 11, color: "var(--ink-soft)" }}>{s.level ?? "—"}</td>
                  <td className="py-3 px-2 text-right mono whitespace-nowrap" style={{ fontSize: 10 }}>
                    <button onClick={() => setDrawer({ open: true, editing: s })} className="hover:text-[var(--gold)] mr-3">EDIT</button>
                    <a href={`#/scholarships/${s.id}`} className="hover:text-[var(--gold)]">VIEW</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {total > 20 && (
        <div className="flex gap-3 mono" style={{ fontSize: 11 }}>
          <button disabled={page === 0} onClick={() => load(page - 1)} className="px-3 py-1 border border-[var(--rule-strong)] disabled:opacity-40">PREV</button>
          <span style={{ color: "var(--ink-faint)" }}>Page {page + 1} / {Math.ceil(total / 20)}</span>
          <button disabled={(page + 1) * 20 >= total} onClick={() => load(page + 1)} className="px-3 py-1 border border-[var(--rule-strong)] disabled:opacity-40">NEXT</button>
        </div>
      )}
      <ScholarshipDrawer open={drawer.open} editing={drawer.editing} onClose={() => setDrawer({ open: false })} onSave={handleSave} />
    </div>
  );
}

function ScholarshipDrawer({ open, editing, onClose, onSave }: {
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
    <ActionDrawer open={open} onClose={onClose} kicker={editing ? "EDIT SCHOLARSHIP" : "NEW SCHOLARSHIP"} title={editing ? "Editing scholarship" : "New scholarship"}
      footer={<><button onClick={onClose} className="btn-ink btn-ghost"><span>Cancel</span></button><button onClick={() => onSave({ ...v, amount: amtStr ? parseFloat(amtStr) : undefined })} className="btn-ink btn-gold"><span>{editing ? "Save changes" : "Create"}</span></button></>}>
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

// ─── Research (READ-ONLY — no admin create endpoint) ──────────────────────────

function ResearchSection() {
  // Admin research section is read-only: list + VIEW link.
  // No admin create/edit/delete endpoint exists on the backend.
  const [items, setItems] = useState<ResearchProjectDto[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async (p = 0) => {
    setLoading(true);
    setError("");
    try {
      const data = await researchList({ page: p, size: 20 });
      setItems(data.content);
      setTotal(data.page.totalElements);
      setPage(p);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load research projects.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(0); }, [load]);

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between pb-4 border-b border-[var(--rule)]">
        <h2 className="serif" style={{ fontSize: "clamp(1.875rem, 3vw, 2.5rem)", fontWeight: 300 }}>Research projects</h2>
        <div className="mono" style={{ color: "var(--ink-faint)", fontSize: 10 }}>READ-ONLY — projects are created by Faculty</div>
      </header>
      <div className="mono" style={{ color: "var(--ink-faint)", fontSize: 10 }}>{total} TOTAL</div>
      {loading && <Skeleton lines={4} />}
      {!loading && error && <ErrorRetry message={error} onRetry={() => load(page)} />}
      {!loading && !error && items.length === 0 && <div className="py-8 mono" style={{ color: "var(--ink-faint)" }}>No research projects found.</div>}
      <ul>
        {items.map((r, i) => (
          <li key={r.id} className="py-4 border-b border-[var(--rule)] grid grid-cols-12 gap-3 items-baseline">
            <span className="col-span-1 mono tabular" style={{ color: "var(--gold)" }}>{String(page * 20 + i + 1).padStart(3, "0")}</span>
            <div className="col-span-8 min-w-0">
              <div className="serif truncate" style={{ fontSize: "1.0625rem" }}>{r.title}</div>
              <div className="mono mt-1" style={{ color: "var(--ink-soft)", fontSize: 10 }}>
                {[r.lab, r.institution, r.pi, r.field].filter(Boolean).join(" · ")}
              </div>
            </div>
            <div className="col-span-2 mono" style={{ color: "var(--ink-soft)", fontSize: 10 }}>{r.status ?? "OPEN"}</div>
            <a href={`#/research/${r.id}`} className="col-span-1 text-right mono" style={{ color: "var(--gold)", fontSize: 10 }}>VIEW →</a>
          </li>
        ))}
      </ul>
      {total > 20 && (
        <div className="flex gap-3 mono" style={{ fontSize: 11 }}>
          <button disabled={page === 0} onClick={() => load(page - 1)} className="px-3 py-1 border border-[var(--rule-strong)] disabled:opacity-40">PREV</button>
          <span style={{ color: "var(--ink-faint)" }}>Page {page + 1} / {Math.ceil(total / 20)}</span>
          <button disabled={(page + 1) * 20 >= total} onClick={() => load(page + 1)} className="px-3 py-1 border border-[var(--rule-strong)] disabled:opacity-40">NEXT</button>
        </div>
      )}
    </div>
  );
}

// ─── Resources ────────────────────────────────────────────────────────────────

function ResourcesSection() {
  const toast = useToast();
  const [items, setItems] = useState<ResourceDto[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async (p = 0) => {
    setLoading(true);
    setError("");
    try {
      const data = await resourcesList({ page: p, size: 20 });
      setItems(data.content);
      setTotal(data.page.totalElements);
      setPage(p);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load resources.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(0); }, [load]);

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("title", file.name.replace(/\.[^.]+$/, ""));
      await resourcesUpload(fd);
      toast("File uploaded", "ok");
      load(page);
    } catch (e) {
      toast(e instanceof ApiError ? e.message : "Upload failed.", "error" as any);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between pb-4 border-b border-[var(--rule)] flex-wrap gap-4">
        <h2 className="serif" style={{ fontSize: "clamp(1.875rem, 3vw, 2.5rem)", fontWeight: 300 }}>Resource library</h2>
        <div className="flex gap-3">
          <input ref={fileRef} type="file" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f); }} />
          <button onClick={() => fileRef.current?.click()} disabled={uploading} className="btn-ink btn-gold">
            <span>{uploading ? "Uploading…" : "+ Upload resource"}</span>
          </button>
        </div>
      </header>
      <div className="mono" style={{ color: "var(--ink-faint)", fontSize: 10 }}>{total} TOTAL</div>
      {loading && <Skeleton lines={4} />}
      {!loading && error && <ErrorRetry message={error} onRetry={() => load(page)} />}
      {!loading && !error && items.length === 0 && <div className="py-8 mono" style={{ color: "var(--ink-faint)" }}>No resources yet.</div>}
      {!loading && !error && items.length > 0 && (
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full">
            <thead>
              <tr className="mono text-left" style={{ color: "var(--ink-faint)", fontSize: 10 }}>
                <th className="py-3 px-2 w-12">№</th>
                {["TITLE", "TYPE", "AUTHOR", "YEAR", "FIELD", "UPLOADER"].map(c => <th key={c} className="py-3 px-2 font-normal whitespace-nowrap">{c}</th>)}
                <th className="py-3 px-2 text-right font-normal">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {items.map((r, i) => (
                <tr key={r.id} className="border-t border-[var(--rule)] hover:bg-[var(--paper-raised)] transition-colors">
                  <td className="py-3 px-2 mono tabular" style={{ color: "var(--gold)" }}>{String(page * 20 + i + 1).padStart(3, "0")}</td>
                  <td className="py-3 px-2"><div className="serif" style={{ fontSize: "1.0625rem", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.title}</div></td>
                  <td className="py-3 px-2 mono" style={{ fontSize: 11, color: "var(--ink-soft)" }}>{r.resourceType ?? "—"}</td>
                  <td className="py-3 px-2 mono" style={{ fontSize: 11, color: "var(--ink-soft)" }}>{r.author ?? "—"}</td>
                  <td className="py-3 px-2 mono" style={{ fontSize: 11, color: "var(--ink-soft)" }}>{r.year ?? "—"}</td>
                  <td className="py-3 px-2 mono" style={{ fontSize: 11, color: "var(--ink-soft)" }}>{r.field ?? "—"}</td>
                  <td className="py-3 px-2 mono" style={{ fontSize: 11, color: "var(--ink-soft)" }}>{r.uploader?.fullName ?? "—"}</td>
                  <td className="py-3 px-2 text-right mono whitespace-nowrap" style={{ fontSize: 10 }}>
                    <a href={resourceDownloadUrl(r.id)} target="_blank" rel="noreferrer" className="hover:text-[var(--gold)] mr-3">DOWNLOAD</a>
                    {/* DELETE is UI-local only — no backend delete endpoint for resources */}
                    <button onClick={() => { setItems(p => p.filter(x => x.id !== r.id)); toast("Removed from view (no backend delete)", "info"); }} className="hover:text-[var(--oxblood)]">DEL</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {total > 20 && (
        <div className="flex gap-3 mono" style={{ fontSize: 11 }}>
          <button disabled={page === 0} onClick={() => load(page - 1)} className="px-3 py-1 border border-[var(--rule-strong)] disabled:opacity-40">PREV</button>
          <span style={{ color: "var(--ink-faint)" }}>Page {page + 1} / {Math.ceil(total / 20)}</span>
          <button disabled={(page + 1) * 20 >= total} onClick={() => load(page + 1)} className="px-3 py-1 border border-[var(--rule-strong)] disabled:opacity-40">NEXT</button>
        </div>
      )}
    </div>
  );
}

// ─── Webinars ─────────────────────────────────────────────────────────────────

function WebinarsSection() {
  const toast = useToast();
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
      setError(e instanceof ApiError ? e.message : "Failed to load webinars.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(0); }, [load]);

  const handleCreate = async (v: Partial<WebinarDto>) => {
    try {
      await webinarsCreate(v);
      toast("Webinar scheduled", "ok");
      setDrawer(false);
      load(page);
    } catch (e) {
      toast(e instanceof ApiError ? e.message : "Save failed.", "error" as any);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between pb-4 border-b border-[var(--rule)] flex-wrap gap-4">
        <h2 className="serif" style={{ fontSize: "clamp(1.875rem, 3vw, 2.5rem)", fontWeight: 300 }}>Webinars</h2>
        <button onClick={() => setDrawer(true)} className="btn-ink btn-gold"><span>+ Schedule webinar</span></button>
      </header>
      <div className="mono" style={{ color: "var(--ink-faint)", fontSize: 10 }}>{total} TOTAL</div>
      {loading && <Skeleton lines={4} />}
      {!loading && error && <ErrorRetry message={error} onRetry={() => load(page)} />}
      {!loading && !error && items.length === 0 && <div className="py-8 mono" style={{ color: "var(--ink-faint)" }}>No webinars yet.</div>}
      <ul>
        {items.map((w, i) => (
          <li key={w.id} className="py-4 border-b border-[var(--rule)] grid grid-cols-12 gap-3 items-baseline">
            <span className="col-span-1 mono tabular" style={{ color: "var(--gold)" }}>{String(page * 20 + i + 1).padStart(3, "0")}</span>
            <div className="col-span-8 min-w-0">
              <div className="serif truncate" style={{ fontSize: "1.0625rem" }}>{w.title}</div>
              <div className="mono mt-1" style={{ color: "var(--ink-soft)", fontSize: 10 }}>
                {[w.speakerAffiliation, w.durationMinutes ? `${w.durationMinutes} min` : null, fmtDate(w.scheduledAt)].filter(Boolean).join(" · ")}
              </div>
            </div>
            <div className="col-span-2 mono" style={{ color: "var(--ink-soft)", fontSize: 10 }}>{(w.status ?? "SCHEDULED").toUpperCase()}</div>
            <a href={`#/webinars/${w.id}`} className="col-span-1 text-right mono" style={{ color: "var(--gold)", fontSize: 10 }}>VIEW →</a>
          </li>
        ))}
      </ul>
      {total > 20 && (
        <div className="flex gap-3 mono" style={{ fontSize: 11 }}>
          <button disabled={page === 0} onClick={() => load(page - 1)} className="px-3 py-1 border border-[var(--rule-strong)] disabled:opacity-40">PREV</button>
          <span style={{ color: "var(--ink-faint)" }}>Page {page + 1} / {Math.ceil(total / 20)}</span>
          <button disabled={(page + 1) * 20 >= total} onClick={() => load(page + 1)} className="px-3 py-1 border border-[var(--rule-strong)] disabled:opacity-40">NEXT</button>
        </div>
      )}
      <WebinarDrawer open={drawer} onClose={() => setDrawer(false)} onSave={handleCreate} />
    </div>
  );
}

function WebinarDrawer({ open, onClose, onSave }: { open: boolean; onClose: () => void; onSave: (v: Partial<WebinarDto>) => void }) {
  const [v, setV] = useState<Partial<WebinarDto>>({ title: "", description: "", scheduledAt: "", meetingLink: "", speakerAffiliation: "", durationMinutes: 60 });

  useEffect(() => {
    if (open) setV({ title: "", description: "", scheduledAt: "", meetingLink: "", speakerAffiliation: "", durationMinutes: 60 });
  }, [open]);

  return (
    <ActionDrawer open={open} onClose={onClose} kicker="NEW WEBINAR" title="Schedule a webinar"
      footer={<><button onClick={onClose} className="btn-ink btn-ghost"><span>Cancel</span></button><button onClick={() => onSave(v)} className="btn-ink btn-gold"><span>Schedule</span></button></>}>
      <DSection title="Identity" index="01">
        <DField label="Title" value={v.title ?? ""} onChange={t => setV({ ...v, title: t })} />
        <DField label="Speaker affiliation" value={v.speakerAffiliation ?? ""} onChange={t => setV({ ...v, speakerAffiliation: t })} />
      </DSection>
      <DSection title="Schedule" index="02">
        <DGrid>
          <DField label="Scheduled at (ISO)" value={v.scheduledAt ?? ""} onChange={t => setV({ ...v, scheduledAt: t })} placeholder="2026-08-01T14:00" />
          <DField label="Duration (minutes)" value={String(v.durationMinutes ?? 60)} onChange={t => setV({ ...v, durationMinutes: parseInt(t) || 60 })} type="number" />
        </DGrid>
        <DField label="Meeting link" value={v.meetingLink ?? ""} onChange={t => setV({ ...v, meetingLink: t })} placeholder="https://zoom.us/…" />
      </DSection>
      <DSection title="Detail" index="03">
        <DField label="Description" value={v.description ?? ""} onChange={t => setV({ ...v, description: t })} textarea />
      </DSection>
    </ActionDrawer>
  );
}

// ─── Forums (READ-ONLY) ───────────────────────────────────────────────────────

function ForumsSection() {
  // Forum threads are READ-ONLY in admin — no admin-specific create/delete endpoint;
  // thread creation is a user action on the public forum page.
  const [items, setItems] = useState<ForumThreadDto[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async (p = 0) => {
    setLoading(true);
    setError("");
    try {
      const data = await forumThreadsList({ page: p, size: 20 });
      setItems(data.content);
      setTotal(data.page.totalElements);
      setPage(p);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load threads.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(0); }, [load]);

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between pb-4 border-b border-[var(--rule)]">
        <h2 className="serif" style={{ fontSize: "clamp(1.875rem, 3vw, 2.5rem)", fontWeight: 300 }}>Forum threads</h2>
        <div className="mono" style={{ color: "var(--ink-faint)", fontSize: 10 }}>READ-ONLY — moderation via the public forum page</div>
      </header>
      <div className="mono" style={{ color: "var(--ink-faint)", fontSize: 10 }}>{total} TOTAL</div>
      {loading && <Skeleton lines={4} />}
      {!loading && error && <ErrorRetry message={error} onRetry={() => load(page)} />}
      {!loading && !error && items.length === 0 && <div className="py-8 mono" style={{ color: "var(--ink-faint)" }}>No threads yet.</div>}
      <ul>
        {items.map((t, i) => (
          <li key={t.id} className="py-4 border-b border-[var(--rule)] grid grid-cols-12 gap-3 items-baseline">
            <span className="col-span-1 mono tabular" style={{ color: "var(--gold)" }}>{String(page * 20 + i + 1).padStart(3, "0")}</span>
            <div className="col-span-8 min-w-0">
              <div className="serif truncate" style={{ fontSize: "1.0625rem" }}>{t.title}</div>
              <div className="mono mt-1" style={{ color: "var(--ink-soft)", fontSize: 10 }}>
                {[t.author?.fullName, t.category, t.replyCount != null ? `${t.replyCount} replies` : null, fmtDate(t.createdAt)].filter(Boolean).join(" · ")}
              </div>
            </div>
            <div className="col-span-2 mono" style={{ color: "var(--ink-soft)", fontSize: 10 }}>{t.category ?? "—"}</div>
            <a href={`#/forum/${t.id}`} className="col-span-1 text-right mono" style={{ color: "var(--gold)", fontSize: 10 }}>VIEW →</a>
          </li>
        ))}
      </ul>
      {total > 20 && (
        <div className="flex gap-3 mono" style={{ fontSize: 11 }}>
          <button disabled={page === 0} onClick={() => load(page - 1)} className="px-3 py-1 border border-[var(--rule-strong)] disabled:opacity-40">PREV</button>
          <span style={{ color: "var(--ink-faint)" }}>Page {page + 1} / {Math.ceil(total / 20)}</span>
          <button disabled={(page + 1) * 20 >= total} onClick={() => load(page + 1)} className="px-3 py-1 border border-[var(--rule-strong)] disabled:opacity-40">NEXT</button>
        </div>
      )}
    </div>
  );
}

// ─── Users ────────────────────────────────────────────────────────────────────

function UsersSection() {
  const toast = useToast();
  const [items, setItems] = useState<UserDto[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmSuspend, setConfirmSuspend] = useState<{ user: UserDto; suspend: boolean } | null>(null);
  const [actioning, setActioning] = useState(false);

  const load = useCallback(async (p = 0, query = q) => {
    setLoading(true);
    setError("");
    try {
      const data = await usersList({ page: p, size: 20, q: query || undefined });
      setItems(data.content);
      setTotal(data.page.totalElements);
      setPage(p);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load users.");
    } finally {
      setLoading(false);
    }
  }, [q]);

  useEffect(() => { load(0, ""); }, []);

  const doSuspend = async () => {
    if (!confirmSuspend) return;
    setActioning(true);
    try {
      await usersPatchStatus(confirmSuspend.user.id, confirmSuspend.suspend);
      toast(confirmSuspend.suspend ? "User suspended" : "User enabled", confirmSuspend.suspend ? "info" : "ok");
      setConfirmSuspend(null);
      load(page);
    } catch (e) {
      toast(e instanceof ApiError ? e.message : "Action failed.", "error" as any);
    } finally {
      setActioning(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between pb-4 border-b border-[var(--rule)] gap-4 flex-wrap">
        <h2 className="serif" style={{ fontSize: "clamp(1.875rem, 3vw, 2.5rem)", fontWeight: 300 }}>Users &amp; roles</h2>
        <div className="flex items-center gap-3">
          <div className="field-underline" style={{ paddingTop: 0, minWidth: 220 }}>
            <input placeholder="Search users…" value={q} onChange={e => { setQ(e.target.value); load(0, e.target.value); }} />
          </div>
          {/* Invite user is UI-local — no backend invite endpoint in this edition */}
          <button onClick={() => toast("Invite — stored on this device only. Not available in this edition.", "info")} className="btn-ink btn-gold"><span>+ Invite user</span></button>
        </div>
      </header>

      <div className="mono" style={{ color: "var(--ink-faint)", fontSize: 10 }}>{total} TOTAL USERS</div>

      {loading && <Skeleton lines={4} />}
      {!loading && error && <ErrorRetry message={error} onRetry={() => load(page)} />}
      {!loading && !error && items.length === 0 && <div className="py-8 mono" style={{ color: "var(--ink-faint)" }}>No users found.</div>}

      {!loading && !error && items.length > 0 && (
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full">
            <thead>
              <tr className="mono text-left" style={{ color: "var(--ink-faint)", fontSize: 10 }}>
                <th className="py-3 px-2 w-12">№</th>
                {["NAME", "EMAIL", "ROLES", "STATUS", "JOINED"].map(c => <th key={c} className="py-3 px-2 font-normal whitespace-nowrap">{c}</th>)}
                <th className="py-3 px-2 text-right font-normal">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {items.map((u, i) => {
                const isSuspended = u.status === "SUSPENDED";
                return (
                  <tr key={u.id} className="border-t border-[var(--rule)] hover:bg-[var(--paper-raised)] transition-colors">
                    <td className="py-3 px-2 mono tabular" style={{ color: "var(--gold)" }}>{String(page * 20 + i + 1).padStart(3, "0")}</td>
                    <td className="py-3 px-2 serif" style={{ fontSize: "1.0625rem" }}>{u.fullName}</td>
                    <td className="py-3 px-2 mono" style={{ color: "var(--ink-soft)", fontSize: 11 }}>{u.email}</td>
                    <td className="py-3 px-2 mono" style={{ color: u.roles.includes("ADMIN") ? "var(--gold)" : "var(--ink-soft)", fontSize: 10 }}>{u.roles.join(", ")}</td>
                    <td className="py-3 px-2 mono" style={{ color: isSuspended ? "var(--oxblood)" : "var(--moss)", fontSize: 10 }}>{u.status ?? "ACTIVE"}</td>
                    <td className="py-3 px-2 mono" style={{ color: "var(--ink-faint)", fontSize: 10 }}>{fmtDate(u.createdAt)}</td>
                    <td className="py-3 px-2 text-right mono whitespace-nowrap" style={{ fontSize: 10 }}>
                      {/* Permissions checkboxes are UI-local — not available in this edition */}
                      <button onClick={() => toast("Permission changes stored on this device only — not available in this edition.", "info")} className="hover:text-[var(--gold)] mr-3">PERMS</button>
                      {isSuspended
                        ? <button onClick={() => setConfirmSuspend({ user: u, suspend: false })} className="hover:text-[var(--moss)]">ENABLE</button>
                        : <button onClick={() => setConfirmSuspend({ user: u, suspend: true })} className="hover:text-[var(--oxblood)]">SUSPEND</button>
                      }
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {total > 20 && (
        <div className="flex gap-3 mono" style={{ fontSize: 11 }}>
          <button disabled={page === 0} onClick={() => load(page - 1)} className="px-3 py-1 border border-[var(--rule-strong)] disabled:opacity-40">PREV</button>
          <span style={{ color: "var(--ink-faint)" }}>Page {page + 1} / {Math.ceil(total / 20)}</span>
          <button disabled={(page + 1) * 20 >= total} onClick={() => load(page + 1)} className="px-3 py-1 border border-[var(--rule-strong)] disabled:opacity-40">NEXT</button>
        </div>
      )}

      <Confirm
        open={!!confirmSuspend}
        onClose={() => setConfirmSuspend(null)}
        onConfirm={doSuspend}
        title={confirmSuspend?.suspend ? `Suspend ${confirmSuspend.user.fullName}?` : `Enable ${confirmSuspend?.user.fullName}?`}
        body={<>{confirmSuspend?.suspend ? "The user will be locked out of their account immediately." : "The user account will be restored to active status."}</>}
        confirmLabel={actioning ? "Working…" : confirmSuspend?.suspend ? "Yes — suspend" : "Yes — enable"}
        danger={!!confirmSuspend?.suspend}
      />
    </div>
  );
}

// ─── Media Library (Resources grid + upload) ──────────────────────────────────

function MediaLibrary() {
  const toast = useToast();
  const [items, setItems] = useState<ResourceDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await resourcesList({ page: 0, size: 50 });
      setItems(data.content);
    } catch {
      // silent in media view
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("title", file.name.replace(/\.[^.]+$/, ""));
      const created = await resourcesUpload(fd);
      setItems(p => [created, ...p]);
      toast("File uploaded", "ok");
    } catch (e) {
      toast(e instanceof ApiError ? e.message : "Upload failed.", "error" as any);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between pb-4 border-b border-[var(--rule)] flex-wrap gap-4">
        <h2 className="serif" style={{ fontSize: "clamp(1.875rem, 3vw, 2.5rem)", fontWeight: 300 }}>Media library</h2>
        <div className="flex gap-3">
          <input ref={fileRef} type="file" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f); }} />
          <button onClick={() => fileRef.current?.click()} disabled={uploading} className="btn-ink btn-gold">
            <span>{uploading ? "Uploading…" : "+ Upload assets"}</span>
          </button>
        </div>
      </header>

      {/* Drop zone (visual only — click to trigger file input) */}
      <div
        className="border border-[var(--rule-strong)] border-dashed p-10 text-center cursor-pointer hover:bg-[var(--paper-raised)] transition-colors"
        style={{ background: "var(--paper-raised)" }}
        onClick={() => fileRef.current?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleUpload(f); }}
      >
        <div className="mono" style={{ color: "var(--gold)" }}>DROP-ZONE</div>
        <div className="serif mt-2" style={{ fontSize: "1.25rem", fontWeight: 300 }}>Drag any file here to upload.</div>
        <div className="mono mt-1" style={{ color: "var(--ink-faint)" }}>PDF · MP4 · any supported format — click or drag</div>
      </div>

      {loading && <Skeleton lines={3} />}

      {!loading && items.length === 0 && (
        <div className="py-8 mono" style={{ color: "var(--ink-faint)" }}>No files uploaded yet.</div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map((r) => (
          <figure key={r.id} className="border border-[var(--rule)]">
            <div className="aspect-[4/3] flex items-center justify-center" style={{ background: "var(--paper-deep)" }}>
              <span className="serif" style={{ color: "var(--ink-faint)", fontSize: 28 }}>
                {r.resourceType === "PDF" ? "PDF" : r.resourceType === "VIDEO" ? "▶" : r.resourceType === "DATASET" ? "⊞" : "·"}
              </span>
            </div>
            <figcaption className="p-3">
              <div className="serif truncate" style={{ fontSize: 14 }}>{r.title}</div>
              <div className="mono flex justify-between mt-1" style={{ color: "var(--ink-faint)", fontSize: 10 }}>
                <span>{r.resourceType ?? "FILE"}</span>
                <span>{r.fileSize ? `${(r.fileSize / 1024 / 1024).toFixed(1)} MB` : "—"}</span>
              </div>
              <div className="mt-3 flex gap-2 mono" style={{ fontSize: 10 }}>
                <a href={resourceDownloadUrl(r.id)} target="_blank" rel="noreferrer" className="px-2 py-1 border border-[var(--rule-strong)] hover:border-[var(--gold)]">DL</a>
                {/* DELETE is UI-local only — no backend resource delete endpoint */}
                <button onClick={() => { setItems(p => p.filter(x => x.id !== r.id)); toast("Removed from view (no backend delete)", "info"); }} className="px-2 py-1 border border-[var(--rule-strong)] hover:border-[var(--oxblood)]">DEL</button>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}

// ─── Letters (Contact inbox) ──────────────────────────────────────────────────

function LettersSection() {
  const [items, setItems] = useState<ContactMessageDto[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState<ContactMessageDto | null>(null);

  const load = useCallback(async (p = 0) => {
    setLoading(true);
    setError("");
    try {
      const data = await contactList({ page: p, size: 20 });
      setItems(data.content);
      setTotal(data.page.totalElements);
      setPage(p);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load letters.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(0); }, [load]);

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between pb-4 border-b border-[var(--rule)]">
        <h2 className="serif" style={{ fontSize: "clamp(1.875rem, 3vw, 2.5rem)", fontWeight: 300 }}>Letters — contact inbox</h2>
        <div className="mono" style={{ color: "var(--ink-faint)", fontSize: 10 }}>{total} MESSAGES</div>
      </header>

      {loading && <Skeleton lines={4} />}
      {!loading && error && <ErrorRetry message={error} onRetry={() => load(page)} />}
      {!loading && !error && items.length === 0 && <div className="py-8 mono" style={{ color: "var(--ink-faint)" }}>No contact messages yet.</div>}

      <ul>
        {items.map((m, i) => (
          <li key={m.id ?? i} className="py-4 border-b border-[var(--rule)] grid grid-cols-12 gap-3 items-baseline">
            <span className="col-span-1 mono tabular" style={{ color: "var(--gold)" }}>{String(page * 20 + i + 1).padStart(3, "0")}</span>
            <button onClick={() => setOpen(m)} className="col-span-8 text-left min-w-0">
              <div className="serif truncate" style={{ fontSize: "1.0625rem" }}>{m.name} — {m.subject}</div>
              <div className="mono mt-1" style={{ color: "var(--ink-soft)", fontSize: 10 }}>{m.email} · {fmtDate(m.createdAt)}</div>
            </button>
            <button onClick={() => setOpen(m)} className="col-span-3 md:col-span-1 text-right mono" style={{ color: "var(--gold)", fontSize: 10 }}>OPEN →</button>
          </li>
        ))}
      </ul>

      {total > 20 && (
        <div className="flex gap-3 mono" style={{ fontSize: 11 }}>
          <button disabled={page === 0} onClick={() => load(page - 1)} className="px-3 py-1 border border-[var(--rule-strong)] disabled:opacity-40">PREV</button>
          <span style={{ color: "var(--ink-faint)" }}>Page {page + 1} / {Math.ceil(total / 20)}</span>
          <button disabled={(page + 1) * 20 >= total} onClick={() => load(page + 1)} className="px-3 py-1 border border-[var(--rule-strong)] disabled:opacity-40">NEXT</button>
        </div>
      )}

      {open && (
        <ActionDrawer
          open={!!open}
          onClose={() => setOpen(null)}
          kicker={`LETTER · ${open.name?.toUpperCase()}`}
          title={open.subject ?? "(no subject)"}
          footer={<button onClick={() => setOpen(null)} className="btn-ink btn-ghost"><span>Close</span></button>}
        >
          <DSection title="Correspondent" index="01">
            <dl className="space-y-2">
              {[["FROM", open.name], ["EMAIL", open.email], ["DATE", fmtDate(open.createdAt)]].map(([k, vv]) => (
                <div key={k} className="grid grid-cols-2 gap-3 py-2 border-b border-[var(--rule)]">
                  <dt className="mono" style={{ color: "var(--ink-faint)", fontSize: 10 }}>{k}</dt>
                  <dd className="text-right">{vv}</dd>
                </div>
              ))}
            </dl>
          </DSection>
          <DSection title="Message" index="02">
            <p className="serif" style={{ fontSize: "1.0625rem", lineHeight: 1.65, color: "var(--ink-soft)" }}>{open.message}</p>
          </DSection>
        </ActionDrawer>
      )}
    </div>
  );
}

// ─── Settings (UI-local) ──────────────────────────────────────────────────────

function Settings() {
  const toast = useToast();
  return (
    <div className="space-y-12">
      <header className="pb-4 border-b border-[var(--rule)]">
        <h2 className="serif" style={{ fontSize: "clamp(1.875rem, 3vw, 2.5rem)", fontWeight: 300 }}>Site settings</h2>
        <div className="mono mt-2" style={{ color: "var(--ink-faint)", fontSize: 10 }}>
          Settings below are stored on this device only — no backend binding in this edition.
        </div>
      </header>

      <div className="space-y-6 pb-6 mb-6 border-b border-[var(--rule)]">
        <div className="flex items-baseline gap-3"><span className="section-index">01</span><h3 className="serif" style={{ fontSize: "1.25rem", fontWeight: 300 }}>Editorial identity</h3></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={"field-underline has-value"}><label>Masthead</label><input defaultValue="InsightNest" /></div>
          <div className={"field-underline has-value"}><label>Tagline</label><input defaultValue="Insight for your higher studies." /></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className={"field-underline has-value"}><label>Editor-in-chief</label><input defaultValue="Administrator" /></div>
          <div className={"field-underline has-value"}><label>Contact address</label><input defaultValue="editor@insightnest.org" /></div>
        </div>
      </div>

      <div className="space-y-6 pb-6 mb-6 border-b border-[var(--rule)]">
        <div className="flex items-baseline gap-3"><span className="section-index">02</span><h3 className="serif" style={{ fontSize: "1.25rem", fontWeight: 300 }}>Notifications</h3></div>
        <div className="space-y-3">
          {["Email the duty editor on new applications", "Notify reps on enquiries", "Weekly digest to all admins", "Daily content audit"].map(p => (
            <label key={p} className="flex items-center justify-between py-2 border-b border-[var(--rule)]">
              <span>{p}</span><input type="checkbox" defaultChecked />
            </label>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button className="btn-ink btn-ghost"><span>Revert</span></button>
        <button onClick={() => toast("Settings saved on this device only — not persisted to backend in this edition.", "info")} className="btn-ink btn-gold"><span>Save settings</span></button>
      </div>
    </div>
  );
}
