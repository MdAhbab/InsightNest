import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getWebinars, getUniversities, getScholarships, getResearchProjects } from "../api/catalog";
import { Webinar } from "../types";

const fmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" });

const focusAreas = [
  {
    title: "Program shortlists",
    body: "Compare departments, deadlines, ranking signals, and fit across Bangladeshi universities.",
    meta: "New deadlines this week",
  },
  {
    title: "Funding readiness",
    body: "Keep eligibility, documents, statements, and scholarship status in one review pipeline.",
    meta: "Active local scholarships",
  },
  {
    title: "Research pathways",
    body: "Find faculty projects, join requests, datasets, proposal templates, and webinar recordings.",
    meta: "Open labs accepting learners",
  },
];

const HomePage = () => {
  const [webinars, setWebinars] = useState<Webinar[]>([]);
  const [webinarsLoaded, setWebinarsLoaded] = useState(false);
  const [uniCount, setUniCount] = useState<number | null>(null);
  const [scholCount, setScholCount] = useState<number | null>(null);
  const [researchCount, setResearchCount] = useState<number | null>(null);

  useEffect(() => {
    getWebinars(0, 20)
      .then((page) => {
        const scheduled = page.content
          .filter((w) => w.status === "SCHEDULED")
          .sort((a, b) => {
            if (!a.scheduledAt) return 1;
            if (!b.scheduledAt) return -1;
            return new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime();
          })
          .slice(0, 3);
        setWebinars(scheduled);
        setWebinarsLoaded(true);
      })
      .catch(() => {
        setWebinarsLoaded(true);
      });

    getUniversities(0, 1)
      .then((p) => setUniCount(p.page.totalElements))
      .catch(() => setUniCount(null));

    getScholarships(0, 1)
      .then((p) => setScholCount(p.page.totalElements))
      .catch(() => setScholCount(null));

    getResearchProjects(0, 1)
      .then((p) => setResearchCount(p.page.totalElements))
      .catch(() => setResearchCount(null));
  }, []);

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
              <h3>{uniCount !== null ? uniCount : "—"}</h3>
              <p>Bangladesh institutions tracked</p>
            </div>
            <div>
              <h3>{scholCount !== null ? scholCount : "—"}</h3>
              <p>Scholarship routes mapped</p>
            </div>
            <div>
              <h3>{researchCount !== null ? researchCount : "—"}</h3>
              <p>Faculty research projects</p>
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
              <span className="tag status-blue">Scheduled</span>
            </div>
            {!webinarsLoaded && (
              <p style={{ color: "var(--color-muted)", fontSize: "13px" }}>Loading…</p>
            )}
            {webinarsLoaded && webinars.length === 0 && (
              <p style={{ color: "var(--color-muted)", fontSize: "13px" }}>No upcoming webinars.</p>
            )}
            {webinarsLoaded && webinars.length > 0 && (
              <ul>
                {webinars.map((w) => (
                  <li key={w.id}>
                    <div>
                      <strong>{w.title}</strong>
                      <span>{w.description}</span>
                    </div>
                    <span>
                      {w.scheduledAt ? fmt.format(new Date(w.scheduledAt)) : "TBA"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
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
