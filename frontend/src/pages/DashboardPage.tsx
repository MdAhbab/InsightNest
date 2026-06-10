import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  getMyProgramApplications,
  getMyScholarshipApplications,
  getMyWebinarRegistrations,
  getMyResearchRequests,
  getUsersPage,
  getContactPage,
  getNotifications,
  markAllNotificationsRead,
  getSavedItems,
} from "../api/catalog";
import {
  ProgramApplication,
  ScholarshipApplication,
  WebinarRegistration,
  ResearchRequest,
  AppNotification,
  SavedItem,
  SavedItemType,
} from "../types";

const fmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });

const appStatusClass = (status: ProgramApplication["status"] | ScholarshipApplication["status"]) => {
  if (status === "APPROVED") return "tag status-open";
  if (status === "REJECTED") return "tag status-warning";
  if (status === "NEEDS_INFO") return "tag status-warning";
  return "tag status-blue";
};

const reqStatusClass = (status: ResearchRequest["status"]) => {
  if (status === "APPROVED") return "tag status-open";
  if (status === "REJECTED") return "tag status-warning";
  return "tag status-blue";
};

type LearnerData = {
  programApps: ProgramApplication[];
  scholarshipApps: ScholarshipApplication[];
  webinarRegs: WebinarRegistration[];
  errors: string[];
};

type FacultyData = {
  researchRequests: ResearchRequest[];
  errors: string[];
};

type AdminData = {
  userCount: number | null;
  contactCount: number | null;
  errors: string[];
};

// Pluralise a word by appending 's' unless count === 1
const plural = (count: number, word: string) => (count === 1 ? `1 ${word}` : `${count} ${word}s`);

const savedTypeLabel: Record<SavedItemType, string> = {
  UNIVERSITY: "university",
  PROGRAM: "program",
  SCHOLARSHIP: "scholarship",
  RESEARCH_PROJECT: "research project",
  WEBINAR: "webinar",
};

const buildSavedBreakdown = (items: SavedItem[]): string => {
  const counts: Partial<Record<SavedItemType, number>> = {};
  for (const item of items) {
    counts[item.itemType] = (counts[item.itemType] ?? 0) + 1;
  }
  const parts = (Object.entries(counts) as [SavedItemType, number][])
    .filter(([, n]) => n > 0)
    .map(([type, n]) => plural(n, savedTypeLabel[type]));
  return parts.join(" · ");
};

// Notifications section component — kept small, independent loading state
const NotificationsSection = () => {
  const [notifs, setNotifs] = useState<AppNotification[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  const fetchNotifs = useCallback(() => {
    setLoading(true);
    getNotifications(0, 5)
      .then((page) => {
        setNotifs(page.content);
        setTotal(page.page.totalElements);
      })
      .catch(() => {
        // silently ignore — notifications failure must not affect role cards
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchNotifs();
  }, [fetchNotifs]);

  const unreadCount = notifs.filter((n) => n.readAt === null).length;

  const handleMarkAll = async () => {
    setMarkingAll(true);
    try {
      await markAllNotificationsRead();
      fetchNotifs();
    } catch {
      // ignore
    } finally {
      setMarkingAll(false);
    }
  };

  return (
    <article className="dashboard-card" style={{ gridColumn: "1 / -1" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span className={unreadCount > 0 ? "tag status-warning" : "tag status-muted"}>
            {unreadCount > 0 ? `${unreadCount} unread` : "0 unread"}
          </span>
          <h3 style={{ margin: 0 }}>Notifications</h3>
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            className="btn btn-ghost"
            style={{ minHeight: "32px", padding: "0 12px", fontSize: "13px" }}
            onClick={handleMarkAll}
            disabled={markingAll}
          >
            Mark all read
          </button>
        )}
      </div>

      {loading && (
        <div className="async-loading" style={{ padding: "16px 0" }} role="status">
          <span className="async-spinner" aria-hidden="true" />
          <span className="async-loading-text">Loading notifications…</span>
        </div>
      )}

      {!loading && notifs.length === 0 && (
        <p style={{ marginTop: "8px" }}>No notifications yet.</p>
      )}

      {!loading && notifs.length > 0 && (
        <>
          <ul className="dashboard-sub-list">
            {notifs.map((n) => (
              <li
                key={n.id}
                className="dashboard-sub-item"
                style={n.readAt === null ? { fontWeight: 700 } : undefined}
              >
                <span style={{ display: "flex", flexDirection: "column", gap: "2px", flex: 1, overflow: "hidden" }}>
                  <span style={{ fontWeight: n.readAt === null ? 800 : 600, color: "var(--color-ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {n.readAt === null && (
                      <span
                        aria-hidden="true"
                        style={{ display: "inline-block", width: "7px", height: "7px", borderRadius: "50%", background: "var(--color-primary)", marginRight: "6px", verticalAlign: "middle", flexShrink: 0 }}
                      />
                    )}
                    {n.title}
                  </span>
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: "12px", color: "var(--color-muted)" }}>
                    {n.message}
                  </span>
                </span>
                <span className="tag status-muted" style={{ flexShrink: 0, fontSize: "11px" }}>
                  {fmt.format(new Date(n.createdAt))}
                </span>
              </li>
            ))}
          </ul>
          {total > 5 && (
            <p style={{ fontSize: "12px", marginTop: "6px" }}>
              Showing 5 of {total} notifications.
            </p>
          )}
        </>
      )}
    </article>
  );
};

// Saved items card — shown in the role grid for all roles
const SavedItemsCard = () => {
  const [items, setItems] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSavedItems()
      .then((all) => setItems(all))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const breakdown = buildSavedBreakdown(items);

  return (
    <article className="dashboard-card">
      <span className={`tag ${items.length > 0 ? "status-blue" : "status-muted"}`}>
        {loading ? "…" : `${items.length} saved`}
      </span>
      <h3>Saved items</h3>
      {loading ? (
        <p>Loading…</p>
      ) : items.length === 0 ? (
        <p>Nothing saved yet. Use Save on universities, programs, and scholarships.</p>
      ) : (
        <p>{breakdown}</p>
      )}
    </article>
  );
};

const DashboardPage = () => {
  const { user } = useAuth();
  const initials = user?.fullName
    ? user.fullName
        .split(" ")
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase()
    : "?";

  const isAdmin = user?.roles.includes("ADMIN") ?? false;
  const isFaculty = user?.roles.includes("FACULTY") ?? false;
  const isLearner = user?.roles.includes("LEARNER") ?? false;

  const [loading, setLoading] = useState(true);
  const [learner, setLearner] = useState<LearnerData | null>(null);
  const [faculty, setFaculty] = useState<FacultyData | null>(null);
  const [admin, setAdmin] = useState<AdminData | null>(null);

  useEffect(() => {
    if (!user) return;

    if (isAdmin) {
      Promise.allSettled([getUsersPage(), getContactPage()]).then(([usersResult, contactResult]) => {
        const errors: string[] = [];
        const userCount = usersResult.status === "fulfilled" ? usersResult.value.page.totalElements : null;
        const contactCount = contactResult.status === "fulfilled" ? contactResult.value.page.totalElements : null;
        if (usersResult.status === "rejected") errors.push("Could not load user count.");
        if (contactResult.status === "rejected") errors.push("Could not load contact count.");
        setAdmin({ userCount, contactCount, errors });
        setLoading(false);
      });
    } else if (isFaculty) {
      Promise.allSettled([getMyResearchRequests()]).then(([reqResult]) => {
        const errors: string[] = [];
        const researchRequests = reqResult.status === "fulfilled" ? reqResult.value : [];
        if (reqResult.status === "rejected") errors.push("Could not load research requests.");
        setFaculty({ researchRequests, errors });
        setLoading(false);
      });
    } else if (isLearner) {
      Promise.allSettled([
        getMyProgramApplications(),
        getMyScholarshipApplications(),
        getMyWebinarRegistrations(),
      ]).then(([progResult, scholResult, webResult]) => {
        const errors: string[] = [];
        const programApps = progResult.status === "fulfilled" ? progResult.value : [];
        const scholarshipApps = scholResult.status === "fulfilled" ? scholResult.value : [];
        const webinarRegs = webResult.status === "fulfilled" ? webResult.value : [];
        if (progResult.status === "rejected") errors.push("Could not load program applications.");
        if (scholResult.status === "rejected") errors.push("Could not load scholarship applications.");
        if (webResult.status === "rejected") errors.push("Could not load webinar registrations.");
        setLearner({ programApps, scholarshipApps, webinarRegs, errors });
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [user, isAdmin, isFaculty, isLearner]);

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

          {loading ? (
            <div className="section-card">
              <div className="async-loading" role="status" aria-label="Loading dashboard data">
                <span className="async-spinner" aria-hidden="true" />
                <span className="async-loading-text">Loading your data…</span>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              {learner && (
                <div className="grid grid-3">
                  {learner.errors.map((e) => (
                    <p key={e} className="dashboard-note">{e}</p>
                  ))}
                  <article className="dashboard-card">
                    <span className={`tag ${learner.programApps.length > 0 ? "status-warning" : "status-muted"}`}>
                      {learner.programApps.length} application{learner.programApps.length !== 1 ? "s" : ""}
                    </span>
                    <h3>Program applications</h3>
                    {learner.programApps.length === 0 ? (
                      <p>No program applications yet.</p>
                    ) : (
                      <ul className="dashboard-sub-list">
                        {learner.programApps.slice(0, 3).map((a) => (
                          <li key={a.id} className="dashboard-sub-item">
                            <span>{a.program.name}</span>
                            <span className={appStatusClass(a.status)}>{a.status}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </article>

                  <article className="dashboard-card">
                    <span className={`tag ${learner.scholarshipApps.length > 0 ? "status-warning" : "status-muted"}`}>
                      {learner.scholarshipApps.length} application{learner.scholarshipApps.length !== 1 ? "s" : ""}
                    </span>
                    <h3>Scholarship applications</h3>
                    {learner.scholarshipApps.length === 0 ? (
                      <p>No scholarship applications yet.</p>
                    ) : (
                      <ul className="dashboard-sub-list">
                        {learner.scholarshipApps.slice(0, 3).map((a) => (
                          <li key={a.id} className="dashboard-sub-item">
                            <span>{a.scholarship.title}</span>
                            <span className={appStatusClass(a.status)}>{a.status}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </article>

                  <article className="dashboard-card">
                    <span className={`tag ${learner.webinarRegs.filter((r) => r.status === "REGISTERED").length > 0 ? "status-blue" : "status-muted"}`}>
                      {learner.webinarRegs.filter((r) => r.status === "REGISTERED").length} registered
                    </span>
                    <h3>Webinar registrations</h3>
                    {learner.webinarRegs.length === 0 ? (
                      <p>No webinar registrations yet.</p>
                    ) : (
                      <ul className="dashboard-sub-list">
                        {learner.webinarRegs.slice(0, 3).map((r) => (
                          <li key={r.id} className="dashboard-sub-item">
                            <span>{r.webinar.title}</span>
                            <span className={r.status === "REGISTERED" ? "tag status-open" : "tag status-muted"}>
                              {r.status}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </article>

                  <SavedItemsCard />
                </div>
              )}

              {faculty && (
                <div className="grid grid-3">
                  {faculty.errors.map((e) => (
                    <p key={e} className="dashboard-note">{e}</p>
                  ))}
                  <article className="dashboard-card">
                    <span className={`tag ${faculty.researchRequests.filter((r) => r.status === "PENDING").length > 0 ? "status-warning" : "status-muted"}`}>
                      {faculty.researchRequests.filter((r) => r.status === "PENDING").length} pending
                    </span>
                    <h3>Research requests</h3>
                    {faculty.researchRequests.length === 0 ? (
                      <p>No research join requests yet.</p>
                    ) : (
                      <ul className="dashboard-sub-list">
                        {faculty.researchRequests.slice(0, 3).map((r) => (
                          <li key={r.id} className="dashboard-sub-item">
                            <span>{r.requester.fullName} — {r.project.title}</span>
                            <span className={reqStatusClass(r.status)}>{r.status}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </article>
                  <article className="dashboard-card">
                    <span className="tag status-blue">
                      {fmt.format(new Date())}
                    </span>
                    <h3>Activity</h3>
                    <p>Manage your research projects and respond to pending join requests.</p>
                  </article>

                  <SavedItemsCard />
                </div>
              )}

              {admin && (
                <div className="grid grid-3">
                  {admin.errors.map((e) => (
                    <p key={e} className="dashboard-note">{e}</p>
                  ))}
                  <article className="dashboard-card">
                    <span className="tag status-blue">Platform</span>
                    <h3>Total users</h3>
                    <p style={{ fontSize: "32px", fontWeight: 800, color: "var(--color-primary-dark)" }}>
                      {admin.userCount !== null ? admin.userCount : "—"}
                    </p>
                  </article>
                  <article className="dashboard-card">
                    <span className="tag status-warning">Support</span>
                    <h3>Contact requests</h3>
                    <p style={{ fontSize: "32px", fontWeight: 800, color: "var(--color-primary-dark)" }}>
                      {admin.contactCount !== null ? admin.contactCount : "—"}
                    </p>
                  </article>
                  <article className="dashboard-card">
                    <span className="tag status-open">Admin</span>
                    <h3>Platform management</h3>
                    <p>Manage users, programs, scholarships, and contact requests from the admin panel.</p>
                  </article>

                  <SavedItemsCard />
                </div>
              )}

              {!isLearner && !isFaculty && !isAdmin && (
                <div className="section-card">
                  <p>No role-specific dashboard available. Please contact support.</p>
                </div>
              )}

              {/* Notifications — full-width, independent loading, below role cards */}
              <div className="grid grid-3">
                <NotificationsSection />
              </div>
            </div>
          )}
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
