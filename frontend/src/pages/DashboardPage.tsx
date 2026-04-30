import { useAuth } from "../context/AuthContext";

const DashboardPage = () => {
  const { user } = useAuth();
  const initials = user?.fullName
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <div className="page-stack">
      <section className="page-hero">
        <div className="page-copy">
          <span className="eyebrow">Dashboard</span>
          <h1>{user ? `Welcome back, ${user.fullName}.` : "Your application command center."}</h1>
          <p>
            Track the work that matters: program applications, scholarship readiness, research requests, webinars, and
            saved resources.
          </p>
        </div>
        <aside className="insight-panel">
          <span className="tag status-open">This week</span>
          <h3>Recommended focus</h3>
          <p>Review deadline-sensitive scholarships first, then update your research join requests.</p>
        </aside>
      </section>

      {user ? (
        <section className="dashboard-grid">
          <aside className="profile-panel">
            <div className="avatar">{initials}</div>
            <h3>{user.fullName}</h3>
            <p>{user.email}</p>
            <div className="filters">
              {user.roles.map((role) => (
                <span className="tag status-blue" key={role}>
                  {role}
                </span>
              ))}
            </div>
          </aside>

          <div className="grid grid-3">
            <article className="dashboard-card">
              <span className="tag status-warning">2 need attention</span>
              <h3>Applications</h3>
              <p>Track program and scholarship submissions with visible next steps.</p>
            </article>
            <article className="dashboard-card">
              <span className="tag status-open">3 open projects</span>
              <h3>Research</h3>
              <p>Monitor join requests, mentor responses, and project updates.</p>
            </article>
            <article className="dashboard-card">
              <span className="tag status-blue">1 upcoming</span>
              <h3>Webinars</h3>
              <p>See upcoming sessions, registrations, and recordings.</p>
            </article>
            <article className="dashboard-card">
              <span className="tag status-open">6 saved</span>
              <h3>Resources</h3>
              <p>Return to checklists, proposal templates, and dataset guides.</p>
            </article>
            <article className="dashboard-card">
              <span className="tag status-muted">12 replies</span>
              <h3>Forum activity</h3>
              <p>Follow answers on programs, scholarships, and research preparation.</p>
            </article>
            <article className="dashboard-card">
              <span className="tag status-warning">4 deadlines</span>
              <h3>Calendar</h3>
              <p>Stay ahead of application, interview, and document upload dates.</p>
            </article>
          </div>
        </section>
      ) : (
        <section className="section-card">
          <div className="section-heading">
            <div>
              <h2>Log in to access your dashboard</h2>
              <p>Your personalized application and research workspace appears here after login.</p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default DashboardPage;
