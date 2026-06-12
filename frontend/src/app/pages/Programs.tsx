import { useCallback, useEffect, useMemo, useState } from "react";
import { PageIntro } from "../components/PageIntro";
import { LedgerRow, RowBadge } from "../components/LedgerRow";
import { ApiError } from "../api/client";
import { fmtDate } from "../api/format";
import { useSession } from "../providers/SessionProvider";
import {
  programsList,
  savedItemsList,
  savedItemsCreate,
  savedItemsDelete,
  ProgramDto,
  SavedItemDto,
} from "../api/endpoints";

const DISCIPLINES = ["All", "Life Sciences", "Computer Science", "Earth Sciences", "Humanities", "Social Sciences", "Engineering", "Mathematics"];
const LEVELS = ["All", "MSc", "PhD", "MA", "MEng", "BSc"];

function Skeleton() {
  return (
    <div className="py-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="my-5 h-4 rounded" style={{ background: "var(--rule-strong)", width: `${80 - i * 8}%`, opacity: 0.5 }} />
      ))}
    </div>
  );
}

export default function Programs() {
  const { session } = useSession();
  const [disc, setDisc] = useState("All");
  const [level, setLevel] = useState("All");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);

  const [items, setItems] = useState<ProgramDto[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [savedItems, setSavedItems] = useState<SavedItemDto[]>([]);

  const load = useCallback(async (p: number, discipline: string, lv: string, search: string) => {
    setLoading(true);
    setError("");
    try {
      const data = await programsList({
        page: p,
        size: 20,
        q: search || undefined,
        department: discipline !== "All" ? discipline : undefined,
        type: lv !== "All" ? lv : undefined,
      });
      setItems(data.content);
      setTotalPages(data.page.totalPages);
      setTotalElements(data.page.totalElements);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load programmes.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Load saved items when signed in
  useEffect(() => {
    if (session.signedIn) {
      savedItemsList().then(setSavedItems).catch(() => {});
    }
  }, [session.signedIn]);

  // Reload when filters change (reset to page 0)
  useEffect(() => {
    setPage(0);
    load(0, disc, level, q);
  }, [disc, level, q, load]);

  // Reload when page changes
  const goToPage = useCallback((p: number) => {
    setPage(p);
    load(p, disc, level, q);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [disc, level, q, load]);

  const isSaved = (id: number) => savedItems.some(s => s.itemType === "PROGRAM" && s.itemId === id);
  const getSavedId = (id: number) => savedItems.find(s => s.itemType === "PROGRAM" && s.itemId === id)?.id;

  const handleSave = async (programId: number) => {
    if (!session.signedIn) {
      window.location.hash = `#/login?next=/programs`;
      return;
    }
    const existingId = getSavedId(programId);
    try {
      if (existingId != null) {
        await savedItemsDelete(existingId);
        setSavedItems(prev => prev.filter(s => s.id !== existingId));
      } else {
        const saved = await savedItemsCreate({ itemType: "PROGRAM", itemId: programId });
        setSavedItems(prev => [...prev, saved]);
      }
    } catch {
      // Silent on save error
    }
  };

  const pageNumbers = useMemo(() => {
    const pages: number[] = [];
    for (let i = 0; i < Math.min(totalPages, 7); i++) pages.push(i);
    return pages;
  }, [totalPages]);

  return (
    <>
      <PageIntro
        index="02"
        kicker="THE COURSE CATALOGUE"
        title={<>Programmes, set as a prospectus.</>}
        lede="Filterable by discipline and level — read across to the deadline column, as you would in a printed schedule."
        meta={loading ? "LOADING…" : `${totalElements} RESULTS`}
      />

      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 pb-32">
        {/* Horizontal discipline track */}
        <div className="relative mb-12">
          <div className="mono mb-3" style={{ color: "var(--ink-faint)" }}>FILTER · DISCIPLINE</div>
          <div className="flex gap-px no-scrollbar overflow-x-auto" style={{ background: "var(--rule)" }}>
            {DISCIPLINES.map((d) => (
              <button
                key={d}
                onClick={() => setDisc(d)}
                className="px-5 py-4 mono whitespace-nowrap transition-colors"
                style={{
                  background: disc === d ? "var(--ink)" : "var(--paper)",
                  color: disc === d ? "var(--paper)" : "var(--ink-soft)",
                  fontSize: 11,
                }}
              >{d}</button>
            ))}
          </div>
        </div>

        {/* Sticky toolbar */}
        <div className="sticky top-24 z-10 grid grid-cols-12 gap-4 py-4" style={{ background: "var(--paper)", borderBottom: "1px solid var(--rule-strong)" }}>
          <div className="col-span-12 md:col-span-6 field-underline" style={{ paddingTop: 0 }}>
            <input placeholder="Search programme or institution" value={q} onChange={(e) => setQ(e.target.value)} style={{ fontSize: "1.0625rem" }} />
          </div>
          <div className="col-span-6 md:col-span-3 flex items-center gap-2 mono" style={{ fontSize: 11 }}>
            <span style={{ color: "var(--ink-faint)" }}>LEVEL</span>
            <select value={level} onChange={(e) => setLevel(e.target.value)} className="ml-auto bg-transparent border-b border-[var(--rule-strong)] pb-1 py-1">
              {LEVELS.map((l) => <option key={l}>{l}</option>)}
            </select>
          </div>
          <div className="col-span-6 md:col-span-3 flex items-center gap-2 mono justify-end" style={{ fontSize: 11, color: "var(--ink-faint)" }}>
            <span>SORT — DEADLINE</span>
          </div>
        </div>

        {loading && <Skeleton />}

        {!loading && error && (
          <div className="py-10 flex flex-col items-center gap-4">
            <div className="mono" style={{ color: "var(--oxblood)", fontSize: 11 }}>{error}</div>
            <button onClick={() => load(page, disc, level, q)} className="btn-ink btn-ghost"><span>Retry</span></button>
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="py-12 text-center mono" style={{ color: "var(--ink-faint)" }}>
            No programmes found.
          </div>
        )}

        <ul>
          {items.map((p, i) => (
            <li key={p.id}>
              <LedgerRow
                index={String(page * 20 + i + 1).padStart(3, "0")}
                title={<>{p.name}</>}
                subtitle={<>{p.university?.name ?? "—"} · {p.university?.country ?? "—"}</>}
                meta={<>DEADLINE · {fmtDate(p.applicationDeadline)}</>}
                href={`#/programs/${p.id}`}
                badges={[<RowBadge key="l">{p.type ?? "—"}</RowBadge>]}
                expandable={true}
                detail={
                  <div className="grid grid-cols-12 gap-6">
                    <div className="col-span-12 md:col-span-7">
                      <div className="mono mb-2" style={{ color: "var(--gold)" }}>{p.department ?? "—"}</div>
                      <div className="serif" style={{ fontSize: "1.5rem", fontWeight: 300 }}>{p.name}</div>
                      <p className="mt-3" style={{ color: "var(--ink-soft)" }}>
                        {p.description ?? `Programme at ${p.university?.name ?? "—"} in the ${p.department ?? "—"} faculty, structured around a thesis component and electives drawn from adjacent departments.`}
                      </p>
                    </div>
                    <div className="col-span-12 md:col-span-4 md:col-start-9 mono space-y-2" style={{ color: "var(--ink-soft)", fontSize: 11 }}>
                      <div>LEVEL — <span style={{ color: "var(--ink)" }}>{p.type ?? "—"}</span></div>
                      <div>DURATION — <span style={{ color: "var(--ink)" }}>{p.duration ?? "—"}</span></div>
                      <div>TUITION — <span style={{ color: "var(--ink)" }}>{p.tuition ?? "—"}</span></div>
                      <div>DEADLINE — <span style={{ color: "var(--gold)" }}>{fmtDate(p.applicationDeadline)}</span></div>
                      <div className="pt-4 flex gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleSave(p.id); }}
                          className="btn-ink btn-ghost"
                          style={{ fontSize: 11 }}
                        >
                          <span>{isSaved(p.id) ? "Saved ✓" : "Save"}</span>
                        </button>
                        <a href={session.signedIn ? `#/programs/${p.id}` : `#/login?next=/programs/${p.id}`} className="btn-ink">
                          <span>Apply</span>
                        </a>
                      </div>
                    </div>
                  </div>
                }
              />
            </li>
          ))}
        </ul>

        {totalPages > 1 && (
          <nav className="mt-12 flex items-center justify-center gap-4 mono" style={{ fontSize: 11 }}>
            <button
              disabled={page === 0}
              onClick={() => goToPage(page - 1)}
              className="px-3 py-2 border border-[var(--rule-strong)]"
              style={{ opacity: page === 0 ? 0.4 : 1 }}
            >‹</button>
            {pageNumbers.map((n) => (
              <button
                key={n}
                onClick={() => goToPage(n)}
                className="w-8 h-8 tabular"
                style={{
                  color: n === page ? "var(--gold)" : "var(--ink-soft)",
                  borderBottom: n === page ? "1px solid var(--gold)" : "none",
                }}
              >{String(n + 1).padStart(2, "0")}</button>
            ))}
            {totalPages > 7 && <span style={{ color: "var(--ink-faint)" }}>…</span>}
            <button
              disabled={page >= totalPages - 1}
              onClick={() => goToPage(page + 1)}
              className="px-3 py-2 border border-[var(--rule-strong)]"
              style={{ opacity: page >= totalPages - 1 ? 0.4 : 1 }}
            >›</button>
          </nav>
        )}
      </section>
    </>
  );
}
