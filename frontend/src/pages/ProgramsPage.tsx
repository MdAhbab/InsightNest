const programs = [
  {
    name: "BSc in Computer Science and Engineering",
    university: "BUET",
    level: "Undergraduate",
    deadline: "45 days left",
    detail: "Systems, AI, software engineering, and competitive programming pathways.",
    status: "Deadline soon",
  },
  {
    name: "MSc in Data Science",
    university: "BRAC University",
    level: "Graduate",
    deadline: "75 days left",
    detail: "Applied analytics, local datasets, machine learning, and capstone research.",
    status: "Open",
  },
  {
    name: "MBA in Finance",
    university: "University of Dhaka",
    level: "Graduate",
    deadline: "60 days left",
    detail: "Banking, capital markets, financial modeling, and Bangladesh market cases.",
    status: "Open",
  },
  {
    name: "BBA in Marketing",
    university: "North South University",
    level: "Undergraduate",
    deadline: "90 days left",
    detail: "Consumer insight, brand strategy, digital commerce, and campaign analytics.",
    status: "Open",
  },
  {
    name: "MPH in Public Health",
    university: "BRAC University",
    level: "Graduate",
    deadline: "105 days left",
    detail: "Urban health, nutrition, epidemiology, and climate adaptation research.",
    status: "Review fit",
  },
  {
    name: "BSc in Civil Engineering",
    university: "SUST",
    level: "Undergraduate",
    deadline: "Archived",
    detail: "Transport, water resources, materials, and resilient infrastructure.",
    status: "Archived",
  },
];

const ProgramsPage = () => {
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
          <div className="filters">
            <span className="filter-chip active">All programs</span>
            <span className="filter-chip">Undergraduate</span>
            <span className="filter-chip">Graduate</span>
            <span className="filter-chip">STEM</span>
            <span className="filter-chip">Business</span>
          </div>
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
        <div className="grid grid-3">
          {programs.map((program) => (
            <article className="item-card" key={program.name}>
              <div className="item-topline">
                <span>{program.university}</span>
                <span className={program.status === "Archived" ? "tag status-muted" : "tag status-open"}>
                  {program.level}
                </span>
              </div>
              <h3>{program.name}</h3>
              <p>{program.detail}</p>
              <div className="card-footer">
                <span className={program.status === "Deadline soon" ? "tag status-warning" : "tag status-blue"}>
                  {program.status}
                </span>
                <span>{program.deadline}</span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ProgramsPage;
