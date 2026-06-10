import { getResources, downloadResource } from "../api/catalog";
import useFetch from "../hooks/useFetch";
import { Loading, ErrorState, EmptyState } from "../components/AsyncStates";

const ResourcesPage = () => {
  const { data, loading, error, retry } = useFetch(getResources);

  const handleDownload = (id: number, fileName: string) => {
    downloadResource(id, fileName).catch(() => {
      // silent — browser will not navigate away on failure
    });
  };

  return (
    <div className="page-stack">
      <section className="page-hero">
        <div className="page-copy">
          <span className="eyebrow">Resource library</span>
          <h1>Keep application, research, and funding materials in one organized library.</h1>
          <p>
            Resources are grouped by action: prepare documents, understand data sources, improve writing, and
            communicate with faculty.
          </p>
        </div>
        <aside className="insight-panel">
          <span className="tag status-open">Library health</span>
          <h3>Most used this week</h3>
          <ul className="timeline">
            <li>
              <strong>Scholarship checklist</strong>
              <span>Useful before opening any funding application.</span>
            </li>
            <li>
              <strong>Proposal template</strong>
              <span>Good structure for student-led research ideas.</span>
            </li>
            <li>
              <strong>Faculty outreach kit</strong>
              <span>Reduces vague emails and improves response quality.</span>
            </li>
          </ul>
        </aside>
      </section>

      <section className="section-card">
        <div className="section-heading">
          <div>
            <h2>Curated resources</h2>
            <p>Short descriptions and access labels make the library easier to scan.</p>
          </div>
        </div>
        {loading && <Loading />}
        {error && <ErrorState message={error} retry={retry} />}
        {!loading && !error && data?.content.length === 0 && (
          <EmptyState title="No resources yet." hint="Resources uploaded by faculty and admins will appear here." />
        )}
        {!loading && !error && data && data.content.length > 0 && (
          <div className="grid grid-3">
            {data.content.map((resource) => (
              <article className="item-card" key={resource.id}>
                <div className="item-topline">
                  <span>{resource.uploader?.fullName ?? "InsightNest"}</span>
                  <span className={resource.publicAccess ? "tag status-open" : "tag status-warning"}>
                    {resource.publicAccess ? "Public" : "Members"}
                  </span>
                </div>
                <h3>{resource.title}</h3>
                <p>{resource.description}</p>
                <div className="card-footer">
                  <button
                    type="button"
                    className="tag status-blue"
                    style={{ cursor: "pointer", border: "none", background: "none", padding: "0 11px" }}
                    onClick={() => handleDownload(resource.id, resource.fileName)}
                  >
                    Download
                  </button>
                  {resource.fileSize > 0 && (
                    <span className="tag status-muted">
                      {(resource.fileSize / 1024).toFixed(0)} KB
                    </span>
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

export default ResourcesPage;
