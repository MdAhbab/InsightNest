const universities = [
  {
    name: "University of Dhaka",
    city: "Dhaka",
    type: "Public",
    focus: "Business, social science, law, biological science",
    rank: "#1 public profile",
    intake: "Spring and annual admissions",
  },
  {
    name: "BUET",
    city: "Dhaka",
    type: "Public",
    focus: "Engineering, architecture, planning, computer science",
    rank: "Top engineering choice",
    intake: "Highly competitive annual intake",
  },
  {
    name: "BRAC University",
    city: "Dhaka",
    type: "Private",
    focus: "Public health, CSE, economics, development studies",
    rank: "Research active",
    intake: "Multiple intakes",
  },
  {
    name: "North South University",
    city: "Dhaka",
    type: "Private",
    focus: "Business, economics, engineering, life sciences",
    rank: "Strong private network",
    intake: "Spring, summer, fall",
  },
  {
    name: "SUST",
    city: "Sylhet",
    type: "Public",
    focus: "Science, technology, data systems, social science",
    rank: "STEM focused",
    intake: "Annual admission cycle",
  },
  {
    name: "Rajshahi University",
    city: "Rajshahi",
    type: "Public",
    focus: "Science, humanities, agriculture, business",
    rank: "Regional leader",
    intake: "Annual admission cycle",
  },
];

const UniversitiesPage = () => {
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
            <span className="filter-chip active">All institutions</span>
            <span className="filter-chip">Public</span>
            <span className="filter-chip">Private</span>
            <span className="filter-chip">Dhaka</span>
            <span className="filter-chip">STEM</span>
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
              <h3>6</h3>
              <p>featured institutions</p>
            </div>
            <div className="metric">
              <h3>4</h3>
              <p>cities covered</p>
            </div>
            <div className="metric">
              <h3>2</h3>
              <p>ownership types</p>
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
        <div className="grid grid-3">
          {universities.map((university) => (
            <article className="item-card" key={university.name}>
              <div className="item-topline">
                <span>{university.city}</span>
                <span className="tag status-open">{university.type}</span>
              </div>
              <h3>{university.name}</h3>
              <p>{university.focus}</p>
              <div className="card-footer">
                <span className="tag status-muted">{university.rank}</span>
                <span>{university.intake}</span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default UniversitiesPage;
