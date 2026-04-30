import { Link } from "react-router-dom";

const HomePage = () => {
  const focusAreas = [
    {
      title: "Program shortlists",
      body: "Compare departments, deadlines, ranking signals, and fit across Bangladeshi universities.",
      meta: "6 new deadlines this week",
    },
    {
      title: "Funding readiness",
      body: "Keep eligibility, documents, statements, and scholarship status in one review pipeline.",
      meta: "4 active local scholarships",
    },
    {
      title: "Research pathways",
      body: "Find faculty projects, join requests, datasets, proposal templates, and webinar recordings.",
      meta: "3 open labs accepting learners",
    },
  ];

  return (
    <div className="page-stack">
      <section className="hero">
        <div className="hero-content">
          <span className="eyebrow">Bangladesh academic opportunity hub</span>
          <h1>Make your next university move with sharper data and less guesswork.</h1>
          <p>
            InsightNest helps learners and faculty track programs, scholarships, research projects, resources,
            forums, and webinars from one focused workspace built for Bangladesh.
          </p>
          <div className="hero-actions">
            <Link to="/register" className="btn btn-primary">
              Start your profile
            </Link>
            <Link to="/universities" className="btn btn-ghost">
              Explore universities
            </Link>
          </div>
          <div className="hero-metrics">
            <div>
              <h3>42</h3>
              <p>Bangladesh institutions tracked</p>
            </div>
            <div>
              <h3>18</h3>
              <p>Scholarship routes mapped</p>
            </div>
            <div>
              <h3>9</h3>
              <p>Faculty research groups open</p>
            </div>
          </div>
        </div>
        <div className="hero-panel">
          <img
            className="hero-image"
            src="/assets/campus-hero.svg"
            alt="Students reviewing university, scholarship, and research information"
          />
          <div className="hero-card">
            <div className="item-topline">
              <span>Upcoming webinars</span>
              <span className="tag status-blue">May 2026</span>
            </div>
            <ul>
              <li>
                <div>
                  <strong>Funding Pathways for Bangladesh</strong>
                  <span>Scholarships, bank foundations, and UGC routes</span>
                </div>
                <span>May 17</span>
              </li>
              <li>
                <div>
                  <strong>Research Proposal Clinic</strong>
                  <span>How to shape a faculty-ready project pitch</span>
                </div>
                <span>May 25</span>
              </li>
              <li>
                <div>
                  <strong>Public University Admission Q&A</strong>
                  <span>Document prep and program comparison</span>
                </div>
                <span>Jun 02</span>
              </li>
            </ul>
            <Link to="/webinars" className="btn btn-primary">
              View all webinars
            </Link>
          </div>
        </div>
      </section>

      <section className="section-card">
        <div className="section-heading">
          <div>
            <h2>Built for the real application workflow</h2>
            <p>From discovery to decision, each module keeps the next action visible.</p>
          </div>
          <Link to="/dashboard" className="btn btn-accent">
            Open dashboard
          </Link>
        </div>
        <div className="grid grid-3">
          {focusAreas.map((area) => (
            <article className="item-card" key={area.title}>
              <span className="tag status-open">{area.meta}</span>
              <h3>{area.title}</h3>
              <p>{area.body}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
