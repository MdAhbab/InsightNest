import { getScholarships } from "../api/catalog";
import useFetch from "../hooks/useFetch";
import { Loading, ErrorState, EmptyState } from "../components/AsyncStates";
import useSavedItems from "../hooks/useSavedItems";

const fmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });

const ScholarshipsPage = () => {
  const { data, loading, error, retry } = useFetch(getScholarships);
  const saved = useSavedItems("SCHOLARSHIP");

  return (
    <div className="page-stack">
      <section className="page-hero">
        <div className="page-copy">
          <span className="eyebrow">Funding opportunities</span>
          <h1>See scholarship fit before you spend a week preparing documents.</h1>
          <p>
            Funding cards highlight coverage, eligibility, deadline pressure, and whether a proposal or financial
            verification is likely to be needed.
          </p>
        </div>
        <aside className="insight-panel">
          <span className="tag status-open">Document checklist</span>
          <h3>Keep these ready</h3>
          <ul className="timeline">
            <li>
              <strong>Identity and finances</strong>
              <span>NID or birth certificate, income statement, guardian details.</span>
            </li>
            <li>
              <strong>Academic proof</strong>
              <span>SSC, HSC, transcript, enrollment certificate, and ranking proof.</span>
            </li>
            <li>
              <strong>Story and intent</strong>
              <span>Personal statement, project proposal, or research summary.</span>
            </li>
          </ul>
        </aside>
      </section>

      <section className="section-card">
        <div className="section-heading">
          <div>
            <h2>Scholarships and grants</h2>
            <p>Designed for fast scanning, comparison, and application readiness.</p>
          </div>
        </div>
        {loading && <Loading />}
        {error && <ErrorState message={error} retry={retry} />}
        {!loading && !error && data?.content.length === 0 && (
          <EmptyState title="No scholarships found." hint="New funding opportunities are added as they become available." />
        )}
        {!loading && !error && data && data.content.length > 0 && (
          <div className="grid grid-3">
            {data.content.map((scholarship) => (
              <article className="item-card" key={scholarship.id}>
                <div className="item-topline">
                  <span className="tag status-muted">Scholarship</span>
                  <span className={scholarship.archived ? "tag status-muted" : "tag status-open"}>
                    {scholarship.archived ? "Archived" : "Open"}
                  </span>
                </div>
                <h3>{scholarship.title}</h3>
                <p>{scholarship.eligibility || scholarship.description}</p>
                <div className="card-footer">
                  {scholarship.deadline ? (
                    <span className="tag status-warning">
                      Deadline: {fmt.format(new Date(scholarship.deadline))}
                    </span>
                  ) : (
                    <span className="tag status-muted">No deadline set</span>
                  )}
                  {saved.enabled && (
                    <button
                      type="button"
                      className={`save-btn${saved.isSaved(scholarship.id) ? " saved" : ""}`}
                      disabled={saved.busyId === scholarship.id}
                      aria-pressed={saved.isSaved(scholarship.id)}
                      onClick={() => saved.toggle(scholarship.id)}
                    >
                      {saved.isSaved(scholarship.id) ? "Saved" : "Save"}
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default ScholarshipsPage;
