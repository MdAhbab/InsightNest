import { useMemo, useState } from "react";
import { getUniversities } from "../api/catalog";
import useFetch from "../hooks/useFetch";
import { Loading, ErrorState, EmptyState } from "../components/AsyncStates";

const fmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });

const UniversitiesPage = () => {
  const { data, loading, error, retry } = useFetch(getUniversities);
  const [activeFilter, setActiveFilter] = useState("All");

  const cities = useMemo(() => {
    if (!data) return [];
    return Array.from(new Set(data.content.map((u) => u.city))).sort();
  }, [data]);

  const chips = useMemo(() => ["All", ...cities], [cities]);

  const filtered = useMemo(() => {
    if (!data) return [];
    if (activeFilter === "All") return data.content;
    return data.content.filter((u) => u.city === activeFilter);
  }, [data, activeFilter]);

  const totalCount = data?.page.totalElements ?? null;

  return (
    <div className="page-stack">
      <section className="page-hero">
        <div className="page-copy">
          <span className="eyebrow">University discovery</span>
          <h1>Compare institutions by fit, city, discipline, and admission rhythm.</h1>
          <p>
            A cleaner view of Bangladeshi universities that helps students move from broad interest to a practical
            application shortlist.
          </p>
          <div className="filters">
            {chips.map((chip) => (
              <button
                key={chip}
                type="button"
                className={`filter-chip${activeFilter === chip ? " active" : ""}`}
                onClick={() => setActiveFilter(chip)}
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
        <aside className="insight-panel">
          <span className="tag status-blue">Admissions snapshot</span>
          <h3>Shortlist quality score</h3>
          <p>
            Prioritize programs where your subject fit, city preference, funding path, and deadline readiness align.
          </p>
          <div className="stats-row">
            <div className="metric">
              <h3>{totalCount !== null ? totalCount : "—"}</h3>
              <p>institutions</p>
            </div>
            <div className="metric">
              <h3>{cities.length || "—"}</h3>
              <p>cities covered</p>
            </div>
          </div>
        </aside>
      </section>

      <section className="section-card">
        <div className="section-heading">
          <div>
            <h2>Featured universities</h2>
            <p>Readable cards with the details applicants need before opening a full profile.</p>
          </div>
        </div>
        {loading && <Loading />}
        {error && <ErrorState message={error} retry={retry} />}
        {!loading && !error && filtered.length === 0 && (
          <EmptyState title="No universities match." hint="Try selecting a different city filter." />
        )}
        {!loading && !error && filtered.length > 0 && (
          <div className="grid grid-3">
            {filtered.map((university) => (
              <article className="item-card" key={university.id}>
                <div className="item-topline">
                  <span>{university.city}</span>
                  <span className={university.archived ? "tag status-muted" : "tag status-open"}>
                    {university.archived ? "Archived" : university.country}
                  </span>
                </div>
                <h3>{university.name}</h3>
                <p>{university.description}</p>
                <div className="card-footer">
                  {university.ranking !== null && (
                    <span className="tag status-blue">Rank #{university.ranking}</span>
                  )}
                  <span className="tag status-muted">{fmt.format(new Date(university.createdAt))}</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default UniversitiesPage;
