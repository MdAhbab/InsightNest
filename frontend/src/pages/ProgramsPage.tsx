import { getPrograms } from "../api/catalog";
import useFetch from "../hooks/useFetch";
import { Loading, ErrorState, EmptyState } from "../components/AsyncStates";

const fmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });

const ProgramsPage = () => {
  const { data, loading, error, retry } = useFetch(getPrograms);

  return (
    <div className="page-stack">
      <section className="page-hero">
        <div className="page-copy">
          <span className="eyebrow">Program planning</span>
          <h1>Turn course browsing into an application-ready shortlist.</h1>
          <p>
            Programs are organized around decisions: level, institution, deadline, academic focus, and the next
            document you should prepare.
          </p>
        </div>
        <aside className="insight-panel">
          <span className="tag status-warning">Application queue</span>
          <h3>Suggested preparation order</h3>
          <ul className="timeline">
            <li>
              <strong>Confirm eligibility</strong>
              <span>Match CGPA, prerequisites, and required test scores.</span>
            </li>
            <li>
              <strong>Prepare documents</strong>
              <span>Transcript, statement, recommendation, NID, and payment proof.</span>
            </li>
            <li>
              <strong>Submit before review week</strong>
              <span>Avoid last-day payment and portal pressure.</span>
            </li>
          </ul>
        </aside>
      </section>

      <section className="section-card">
        <div className="section-heading">
          <div>
            <h2>Programs accepting applications</h2>
            <p>Every card gives a compact, comparable view instead of burying the decision points.</p>
          </div>
        </div>
        {loading && <Loading />}
        {error && <ErrorState message={error} retry={retry} />}
        {!loading && !error && data?.content.length === 0 && (
          <EmptyState title="No programs found." hint="Check back soon as new programs are added regularly." />
        )}
        {!loading && !error && data && data.content.length > 0 && (
          <div className="grid grid-3">
            {data.content.map((program) => (
              <article className="item-card" key={program.id}>
                <div className="item-topline">
                  <span>{program.university?.name ?? "—"}</span>
                  <span className={program.archived ? "tag status-muted" : "tag status-open"}>
                    {program.archived ? "Archived" : program.type}
                  </span>
                </div>
                <h3>{program.name}</h3>
                <p>{program.description}</p>
                <div className="card-footer">
                  {program.applicationDeadline ? (
                    <span className="tag status-warning">
                      Deadline: {fmt.format(new Date(program.applicationDeadline))}
                    </span>
                  ) : (
                    <span className="tag status-muted">No deadline set</span>
                  )}
                  {program.department && <span className="tag status-blue">{program.department}</span>}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default ProgramsPage;
