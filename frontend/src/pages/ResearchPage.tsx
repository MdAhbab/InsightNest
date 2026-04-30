const projects = [
  {
    title: "Bangladesh Flood Prediction Lab",
    owner: "Dr. Farhan Rahman",
    skills: "Python, ML, GIS",
    status: "Open",
    body: "Early warning models using rainfall, river-level, and district vulnerability data.",
  },
  {
    title: "Urban Mobility Study - Dhaka",
    owner: "Dr. Sabina Yasmin",
    skills: "Survey design, statistics",
    status: "Closed",
    body: "Commuter behavior, route pressure, and public transport demand across Dhaka.",
  },
  {
    title: "Bangla NLP Education Corpus",
    owner: "Dr. Farhan Rahman",
    skills: "Bangla NLP, annotation",
    status: "Archived",
    body: "Annotated Bangla student counseling text for education support tools.",
  },
  {
    title: "Community Health Heat Index",
    owner: "Dr. Sabina Yasmin",
    skills: "Public health, field survey",
    status: "Open",
    body: "Mapping heat exposure, health risk, and adaptation behavior in urban wards.",
  },
];

const ResearchPage = () => {
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
          <div className="filters">
            <span className="filter-chip active">All projects</span>
            <span className="filter-chip">Open</span>
            <span className="filter-chip">Climate</span>
            <span className="filter-chip">Public health</span>
            <span className="filter-chip">Bangla NLP</span>
          </div>
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
        <div className="grid grid-2">
          {projects.map((project) => (
            <article className="item-card" key={project.title}>
              <div className="item-topline">
                <span>{project.owner}</span>
                <span
                  className={
                    project.status === "Open"
                      ? "tag status-open"
                      : project.status === "Closed"
                        ? "tag status-warning"
                        : "tag status-muted"
                  }
                >
                  {project.status}
                </span>
              </div>
              <h3>{project.title}</h3>
              <p>{project.body}</p>
              <div className="card-footer">
                <span className="tag status-blue">{project.skills}</span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ResearchPage;
