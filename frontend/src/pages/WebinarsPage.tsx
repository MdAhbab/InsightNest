import { getWebinars } from "../api/catalog";
import useFetch from "../hooks/useFetch";
import { Loading, ErrorState, EmptyState } from "../components/AsyncStates";
import { Webinar } from "../types";

const fmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });

const webinarStatusClass = (status: Webinar["status"]) => {
  if (status === "SCHEDULED") return "tag status-open";
  if (status === "COMPLETED") return "tag status-blue";
  return "tag status-muted";
};

const WebinarsPage = () => {
  const { data, loading, error, retry } = useFetch(getWebinars);

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
        </div>
        <aside className="insight-panel">
          <span className="tag status-warning">Sessions</span>
          <h3>Upcoming live sessions</h3>
          <p>
            Seats are best used by students who already have a shortlist and want to match it with funding routes.
          </p>
          <div className="stats-row">
            <div className="metric">
              <h3>{data?.page.totalElements ?? "—"}</h3>
              <p>sessions</p>
            </div>
            <div className="metric">
              <h3>
                {data ? data.content.filter((w) => w.status === "SCHEDULED").length : "—"}
              </h3>
              <p>upcoming</p>
            </div>
            <div className="metric">
              <h3>
                {data ? data.content.filter((w) => w.status === "COMPLETED").length : "—"}
              </h3>
              <p>completed</p>
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
        {loading && <Loading />}
        {error && <ErrorState message={error} retry={retry} />}
        {!loading && !error && data?.content.length === 0 && (
          <EmptyState title="No webinars scheduled." hint="Check back soon for upcoming sessions and clinics." />
        )}
        {!loading && !error && data && data.content.length > 0 && (
          <div className="grid grid-2">
            {data.content.map((webinar) => (
              <article className="item-card" key={webinar.id}>
                <div className="item-topline">
                  <span>{webinar.host?.fullName ?? "InsightNest"}</span>
                  <span className={webinarStatusClass(webinar.status)}>{webinar.status}</span>
                </div>
                <h3>{webinar.title}</h3>
                <p>{webinar.description}</p>
                <div className="card-footer">
                  {webinar.scheduledAt ? (
                    <span className="tag status-warning">
                      {fmt.format(new Date(webinar.scheduledAt))}
                    </span>
                  ) : (
                    <span className="tag status-muted">Date TBA</span>
                  )}
                  {webinar.meetingLink && webinar.status === "SCHEDULED" && (
                    <a
                      href={webinar.meetingLink}
                      target="_blank"
                      rel="noreferrer"
                      className="tag status-blue"
                    >
                      Join link
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default WebinarsPage;
