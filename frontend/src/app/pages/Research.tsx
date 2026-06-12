import { useCallback, useEffect, useState } from "react";
import { PageIntro } from "../components/PageIntro";
import { LensScene } from "../scenes/LensScene";
import { useInView } from "../hooks/useScrollProgress";
import { ApiError } from "../api/client";
import { fmtDate } from "../api/format";
import { researchList, ResearchProjectDto } from "../api/endpoints";

function Skeleton() {
  return (
    <div className="py-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="my-6 h-4 rounded" style={{ background: "var(--rule-strong)", width: `${80 - i * 8}%`, opacity: 0.5 }} />
      ))}
    </div>
  );
}

export default function Research() {
  const [items, setItems] = useState<ResearchProjectDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      // Load OPEN projects first (no explicit sort param, rely on server ordering)
      const [openData, otherData] = await Promise.all([
        researchList({ page: 0, size: 50, status: "OPEN" }),
        researchList({ page: 0, size: 50 }),
      ]);
      // Merge: OPEN first, then deduplicate by id
      const openItems = openData.content;
      const allItems = otherData.content;
      const openIds = new Set(openItems.map(r => r.id));
      const rest = allItems.filter(r => !openIds.has(r.id) && r.status !== "OPEN");
      setItems([...openItems, ...rest]);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load research projects.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCount = items.filter(r => r.status === "OPEN").length;

  return (
    <>
      <section className="relative" style={{ minHeight: "70vh" }}>
        <div className="absolute right-0 top-32 w-[55vw] h-[60vh] hidden md:block" aria-hidden>
          <LensScene />
        </div>
        <PageIntro
          index="04"
          kicker="THE ORBIT"
          title={<>Laboratories accepting collaborators.</>}
          lede="A standing list of research projects, weighed by openness and currency."
          meta={loading ? "LOADING…" : `${openCount} OPEN POSITIONS`}
        />
      </section>

      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 pb-32">
        <header className="grid grid-cols-12 gap-6 py-4 border-b border-[var(--rule-strong)] mono" style={{ color: "var(--ink-faint)", fontSize: 10 }}>
          <div className="col-span-1">REF</div>
          <div className="col-span-5">PROJECT</div>
          <div className="col-span-3">TAGS</div>
          <div className="col-span-2">DEADLINE</div>
          <div className="col-span-1 text-right">OPEN</div>
        </header>

        {loading && <Skeleton />}

        {!loading && error && (
          <div className="py-10 flex flex-col items-center gap-4">
            <div className="mono" style={{ color: "var(--oxblood)", fontSize: 11 }}>{error}</div>
            <button onClick={load} className="btn-ink btn-ghost"><span>Retry</span></button>
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="py-12 text-center mono" style={{ color: "var(--ink-faint)" }}>
            No research projects found.
          </div>
        )}

        <ul>
          {items.map((r, i) => (
            <ResearchRow key={r.id} r={r} i={i} />
          ))}
        </ul>
      </section>
    </>
  );
}

function ResearchRow({ r, i }: { r: ResearchProjectDto; i: number }) {
  const { ref, inView } = useInView<HTMLLIElement>(0.3);
  // Tags: split on comma if string, otherwise use tags field directly
  const tags = r.tags
    ? r.tags.split(",").map(t => t.trim()).filter(Boolean)
    : [];

  return (
    <li ref={ref}>
      <a href={`#/research/${r.id}`} className="grid grid-cols-12 gap-6 py-6 border-b border-[var(--rule)] items-baseline" style={{ display: "grid" }}>
        <div className="col-span-1 mono tabular" style={{ color: "var(--gold)", fontSize: 11 }}>{String(i + 1).padStart(2, "0")}</div>
        <div className="col-span-12 md:col-span-5 -mt-2 md:mt-0">
          <div className="serif" style={{ fontSize: "clamp(1.125rem, 1.7vw, 1.5rem)" }}>{r.title}</div>
          <div className="mono mt-1" style={{ color: "var(--ink-soft)" }}>{r.lab ?? "—"} · {r.institution ?? "—"}</div>
          <div className="mono mt-1" style={{ color: "var(--ink-faint)" }}>{r.pi ?? r.createdBy?.fullName ?? "—"}</div>
        </div>
        <div className="col-span-7 md:col-span-3 flex flex-wrap gap-2">
          {tags.slice(0, 4).map((t, ti) => (
            <span
              key={t}
              className="mono px-2 py-1 border border-[var(--rule-strong)]"
              style={{
                fontSize: 9,
                transform: inView ? `translate(0,0)` : `translate(${(ti % 2 ? 1 : -1) * 12}px, ${ti * 4}px)`,
                opacity: inView ? 1 : 0,
                transition: `transform 0.7s cubic-bezier(0.22,1,0.36,1) ${ti * 0.08}s, opacity 0.5s ease ${ti * 0.08}s`,
              }}
            >{t}</span>
          ))}
        </div>
        {/* Bug 6: Use fmtDate for deadline */}
        <div className="col-span-3 md:col-span-2 mono" style={{ color: "var(--gold)", fontSize: 11 }}>{fmtDate(r.deadline)}</div>
        <div className="col-span-2 md:col-span-1 text-right serif tabular" style={{ fontSize: "1.25rem" }}>{r.openings ?? "—"}</div>
      </a>
    </li>
  );
}
