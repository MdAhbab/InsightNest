import { getFaqs } from "../api/catalog";
import useFetch from "../hooks/useFetch";
import { Loading, ErrorState, EmptyState } from "../components/AsyncStates";

const FaqPage = () => {
  const { data, loading, error, retry } = useFetch(getFaqs);

  const activeFaqs = data ? data.filter((f) => f.active) : [];

  return (
    <div className="page-stack">
      <section className="page-hero">
        <div className="page-copy">
          <span className="eyebrow">FAQ</span>
          <h1>Answers for the decisions students ask about most often.</h1>
          <p>
            The FAQ is structured around action: applications, scholarships, faculty tools, and review status.
          </p>
        </div>
        <aside className="insight-panel">
          <span className="tag status-open">Support tip</span>
          <h3>Need a specific answer?</h3>
          <p>
            Include your role, program, university, and deadline when contacting support so the team can respond
            faster.
          </p>
        </aside>
      </section>

      <section className="section-card">
        <div className="section-heading">
          <div>
            <h2>Common questions</h2>
            <p>Clear answers, separated enough to scan without feeling like a wall of text.</p>
          </div>
        </div>
        {loading && <Loading />}
        {error && <ErrorState message={error} retry={retry} />}
        {!loading && !error && activeFaqs.length === 0 && (
          <EmptyState title="No FAQs available." hint="Check back soon or send us a question via Contact." />
        )}
        {!loading && !error && activeFaqs.length > 0 && (
          <div className="faq-list">
            {activeFaqs.map((faq) => (
              <article className="faq-item" key={faq.id}>
                <h4>{faq.question}</h4>
                <p>{faq.answer}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default FaqPage;
