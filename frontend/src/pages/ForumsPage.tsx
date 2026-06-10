import { getForumThreads } from "../api/catalog";
import useFetch from "../hooks/useFetch";
import { Loading, ErrorState, EmptyState } from "../components/AsyncStates";

const fmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });

const ForumsPage = () => {
  const { data, loading, error, retry } = useFetch(getForumThreads);

  return (
    <div className="page-stack">
      <section className="page-hero">
        <div className="page-copy">
          <span className="eyebrow">Community forums</span>
          <h1>Better student decisions start with cleaner questions and verified answers.</h1>
          <p>
            The forum experience is designed for specific topics, useful replies, and quick scanning instead of noisy
            generic discussion.
          </p>
        </div>
        <aside className="insight-panel">
          <span className="tag status-blue">Posting quality</span>
          <h3>What makes a good thread</h3>
          <ul className="timeline">
            <li>
              <strong>Include context</strong>
              <span>Program, city, deadline, CGPA, and your current blocker.</span>
            </li>
            <li>
              <strong>Ask one thing</strong>
              <span>Focused questions get better answers from faculty and peers.</span>
            </li>
            <li>
              <strong>Share sources</strong>
              <span>Link official notices whenever advice depends on policy.</span>
            </li>
          </ul>
        </aside>
      </section>

      <section className="section-card">
        <div className="section-heading">
          <div>
            <h2>Active discussions</h2>
            <p>Forum cards emphasize topic, usefulness, and response activity.</p>
          </div>
        </div>
        {loading && <Loading />}
        {error && <ErrorState message={error} retry={retry} />}
        {!loading && !error && data?.content.length === 0 && (
          <EmptyState title="No discussions yet." hint="Be the first to start a thread on programs, scholarships, or research." />
        )}
        {!loading && !error && data && data.content.length > 0 && (
          <div className="grid grid-2">
            {data.content.map((thread) => (
              <article className="item-card" key={thread.id}>
                <div className="item-topline">
                  <span>{thread.author?.fullName ?? "Anonymous"}</span>
                  <span className="tag status-blue">{fmt.format(new Date(thread.createdAt))}</span>
                </div>
                <h3>{thread.title}</h3>
                <p>{thread.body}</p>
                <div className="card-footer">
                  <span className="tag status-muted">Community thread</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default ForumsPage;
