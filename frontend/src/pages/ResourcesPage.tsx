const resources = [
  {
    title: "Bangladesh Climate Data Guide",
    type: "Dataset guide",
    access: "Public",
    body: "Where to find rainfall, river-level, cyclone, and vulnerability datasets for research projects.",
  },
  {
    title: "UGC Scholarship Checklist",
    type: "Application guide",
    access: "Public",
    body: "A document-by-document checklist for local scholarship applications.",
  },
  {
    title: "Dhaka Research Proposal Template",
    type: "Template",
    access: "Members",
    body: "A structured proposal format for university research groups using Dhaka-based datasets.",
  },
  {
    title: "Statement of Purpose Review Pack",
    type: "Writing resource",
    access: "Public",
    body: "Examples and revision prompts for Bangladeshi graduate applicants.",
  },
  {
    title: "Faculty Email Outreach Kit",
    type: "Communication",
    access: "Members",
    body: "Concise templates for requesting supervision, feedback, and lab openings.",
  },
  {
    title: "Scholarship Budget Planner",
    type: "Spreadsheet",
    access: "Public",
    body: "Estimate tuition, transport, living costs, and funding gaps before applying.",
  },
];

const ResourcesPage = () => {
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
          <div className="filters">
            <span className="filter-chip active">All resources</span>
            <span className="filter-chip">Guides</span>
            <span className="filter-chip">Templates</span>
            <span className="filter-chip">Datasets</span>
            <span className="filter-chip">Writing</span>
          </div>
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
        <div className="grid grid-3">
          {resources.map((resource) => (
            <article className="item-card" key={resource.title}>
              <div className="item-topline">
                <span>{resource.type}</span>
                <span className={resource.access === "Public" ? "tag status-open" : "tag status-warning"}>
                  {resource.access}
                </span>
              </div>
              <h3>{resource.title}</h3>
              <p>{resource.body}</p>
              <div className="card-footer">
                <span className="tag status-blue">View resource</span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ResourcesPage;
