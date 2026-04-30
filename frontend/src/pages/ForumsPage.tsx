const threads = [
  {
    title: "Scholarship tips for Bangladesh",
    topic: "Funding",
    replies: "18 replies",
    body: "Students compare verified scholarship sources, document timing, and interview preparation.",
  },
  {
    title: "Choosing CSE programs in Dhaka",
    topic: "Programs",
    replies: "12 replies",
    body: "A practical comparison of labs, faculty, alumni outcomes, and internship access.",
  },
  {
    title: "How to ask faculty for research supervision",
    topic: "Research",
    replies: "9 replies",
    body: "Examples of clear emails, short proposals, and portfolio links that mentors can review quickly.",
  },
  {
    title: "Public university admission document checklist",
    topic: "Admissions",
    replies: "22 replies",
    body: "NID, photos, transcripts, quota certificates, payment slips, and deadline reminders.",
  },
];

const ForumsPage = () => {
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
          <div className="filters">
            <span className="filter-chip active">Trending</span>
            <span className="filter-chip">Scholarships</span>
            <span className="filter-chip">Programs</span>
            <span className="filter-chip">Research</span>
            <span className="filter-chip">Admissions</span>
          </div>
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
        <div className="grid grid-2">
          {threads.map((thread) => (
            <article className="item-card" key={thread.title}>
              <div className="item-topline">
                <span>{thread.topic}</span>
                <span className="tag status-open">{thread.replies}</span>
              </div>
              <h3>{thread.title}</h3>
              <p>{thread.body}</p>
              <div className="card-footer">
                <span className="tag status-muted">Community verified</span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ForumsPage;
