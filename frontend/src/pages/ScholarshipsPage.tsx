const scholarships = [
  {
    title: "Bangladesh Government Merit Scholarship",
    coverage: "Tuition waiver + stipend",
    deadline: "30 days left",
    eligibility: "Bangladeshi citizenship, strong academic result, institutional nomination.",
    status: "Open",
  },
  {
    title: "Prime Bank Foundation Scholarship",
    coverage: "Undergraduate support",
    deadline: "40 days left",
    eligibility: "Financial need, academic excellence, proof of enrollment.",
    status: "Open",
  },
  {
    title: "ICT Division Innovation Scholarship",
    coverage: "Project funding",
    deadline: "50 days left",
    eligibility: "STEM learner with a technology proposal relevant to Bangladesh.",
    status: "Proposal needed",
  },
  {
    title: "Dutch-Bangla Bank Scholarship",
    coverage: "Education support",
    deadline: "65 days left",
    eligibility: "SSC/HSC performance, income statement, admission confirmation.",
    status: "Open",
  },
  {
    title: "UGC Research Grant",
    coverage: "Faculty-led grant",
    deadline: "Archived",
    eligibility: "Research plan, faculty supervisor, and institutional approval.",
    status: "Archived",
  },
];

const ScholarshipsPage = () => {
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
          <div className="filters">
            <span className="filter-chip active">All funding</span>
            <span className="filter-chip">Merit</span>
            <span className="filter-chip">Need-based</span>
            <span className="filter-chip">Research</span>
            <span className="filter-chip">STEM</span>
          </div>
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
        <div className="grid grid-3">
          {scholarships.map((scholarship) => (
            <article className="item-card" key={scholarship.title}>
              <div className="item-topline">
                <span>{scholarship.coverage}</span>
                <span className={scholarship.status === "Archived" ? "tag status-muted" : "tag status-open"}>
                  {scholarship.status}
                </span>
              </div>
              <h3>{scholarship.title}</h3>
              <p>{scholarship.eligibility}</p>
              <div className="card-footer">
                <span className="tag status-warning">{scholarship.deadline}</span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ScholarshipsPage;
