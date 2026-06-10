import { getResearchProjects } from "../api/catalog";
import useFetch from "../hooks/useFetch";
import { Loading, ErrorState, EmptyState } from "../components/AsyncStates";
import { ResearchProject } from "../types";

const statusClass = (status: ResearchProject["status"]) => {
  if (status === "OPEN") return "tag status-open";
  if (status === "CLOSED") return "tag status-warning";
  return "tag status-muted";
};

const ResearchPage = () => {
  const { data, loading, error, retry } = useFetch(getResearchProjects);

  return (
    <div className="page-stack">
      <section className="page-hero">
        <div className="page-copy">
          <span className="eyebrow">Research collaboration</span>
          <h1>Find faculty projects where your skills can become credible research work.</h1>
          <p>
            A modern research board should make scope, mentor, status, and required skills obvious before learners
            request to join.
          </p>
        </div>
        <aside className="insight-panel">
          <span className="tag status-blue">Join request quality</span>
          <h3>What mentors look for</h3>
          <ul className="timeline">
            <li>
              <strong>Specific contribution</strong>
              <span>Name the task you can take, not just the field you like.</span>
            </li>
            <li>
              <strong>Proof of skill</strong>
              <span>Attach a project, dataset notebook, paper, or fieldwork example.</span>
            </li>
            <li>
              <strong>Weekly capacity</strong>
              <span>Set realistic availability before the project begins.</span>
            </li>
          </ul>
        </aside>
      </section>

      <section className="section-card">
        <div className="section-heading">
          <div>
            <h2>Research projects</h2>
            <p>Built for fast mentor fit and clear join decisions.</p>
          </div>
        </div>
        {loading && <Loading />}
        {error && <ErrorState message={error} retry={retry} />}
        {!loading && !error && data?.content.length === 0 && (
          <EmptyState title="No research projects found." hint="Open projects will appear here as faculty post them." />
        )}
        {!loading && !error && data && data.content.length > 0 && (
          <div className="grid grid-2">
            {data.content.map((project) => (
              <article className="item-card" key={project.id}>
                <div className="item-topline">
                  <span>{project.createdBy?.fullName ?? "—"}</span>
                  <span className={statusClass(project.status)}>{project.status}</span>
                </div>
                <h3>{project.title}</h3>
                <p>{project.description}</p>
                <div className="card-footer">
                  {project.requiredSkills && (
                    <span className="tag status-blue">{project.requiredSkills}</span>
                  )}
                  {project.tags && <span className="tag status-muted">{project.tags}</span>}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default ResearchPage;
