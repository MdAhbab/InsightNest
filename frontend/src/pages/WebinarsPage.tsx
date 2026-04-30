const webinars = [
  {
    title: "Funding Pathways for Bangladesh",
    host: "Dr. Farhan Rahman",
    date: "May 17, 2026",
    status: "Scheduled",
    body: "Scholarships, bank foundations, UGC routes, and proposal-based funding.",
  },
  {
    title: "Research Skills for Bangladeshi Undergraduates",
    host: "Dr. Sabina Yasmin",
    date: "Completed",
    status: "Recording",
    body: "How to build a first research profile with local datasets and a practical scope.",
  },
  {
    title: "Public University Admission Q&A",
    host: "Admissions panel",
    date: "June 2, 2026",
    status: "Canceled",
    body: "Document preparation, program comparison, and deadline planning.",
  },
  {
    title: "Statement of Purpose Clinic",
    host: "InsightNest mentors",
    date: "June 10, 2026",
    status: "Scheduled",
    body: "Live review patterns for graduate statements and scholarship essays.",
  },
];

const WebinarsPage = () => {
  return (
    <div className="page-stack">
      <section className="page-hero">
        <div className="page-copy">
          <span className="eyebrow">Webinars and clinics</span>
          <h1>Learn the hidden application work from mentors who review it.</h1>
          <p>
            Webinars are presented like an events board: status, host, date, and the practical outcome are easy to
            compare.
          </p>
          <div className="filters">
            <span className="filter-chip active">All sessions</span>
            <span className="filter-chip">Upcoming</span>
            <span className="filter-chip">Recordings</span>
            <span className="filter-chip">Funding</span>
            <span className="filter-chip">Writing</span>
          </div>
        </div>
        <aside className="insight-panel">
          <span className="tag status-warning">Next live session</span>
          <h3>Funding Pathways for Bangladesh</h3>
          <p>
            Seats are best used by students who already have a shortlist and want to match it with funding routes.
          </p>
          <div className="stats-row">
            <div className="metric">
              <h3>4</h3>
              <p>sessions</p>
            </div>
            <div className="metric">
              <h3>2</h3>
              <p>upcoming</p>
            </div>
            <div className="metric">
              <h3>1</h3>
              <p>recording</p>
            </div>
          </div>
        </aside>
      </section>

      <section className="section-card">
        <div className="section-heading">
          <div>
            <h2>Webinar schedule</h2>
            <p>Event cards are compact enough to scan, but specific enough to decide.</p>
          </div>
        </div>
        <div className="grid grid-2">
          {webinars.map((webinar) => (
            <article className="item-card" key={webinar.title}>
              <div className="item-topline">
                <span>{webinar.host}</span>
                <span
                  className={
                    webinar.status === "Scheduled"
                      ? "tag status-open"
                      : webinar.status === "Recording"
                        ? "tag status-blue"
                        : "tag status-muted"
                  }
                >
                  {webinar.status}
                </span>
              </div>
              <h3>{webinar.title}</h3>
              <p>{webinar.body}</p>
              <div className="card-footer">
                <span className="tag status-warning">{webinar.date}</span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default WebinarsPage;
