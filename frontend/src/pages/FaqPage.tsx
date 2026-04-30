const faqs = [
  {
    question: "How do I apply for a program?",
    answer: "Create a learner profile, complete your education details, shortlist a program, and apply from the program page.",
  },
  {
    question: "Can I submit multiple scholarship applications?",
    answer: "Yes. You can submit multiple applications as long as each eligibility requirement is met.",
  },
  {
    question: "Can faculty create webinars?",
    answer: "Yes. Faculty profiles can schedule webinars and manage registrations from their dashboard.",
  },
  {
    question: "How are applications reviewed?",
    answer: "Admins review submissions and update statuses to pending, approved, rejected, or needs info.",
  },
  {
    question: "Are Bangladeshi scholarships included?",
    answer: "Yes. The platform focuses on Bangladesh-relevant government, foundation, bank, ICT, and research funding routes.",
  },
];

const FaqPage = () => {
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
        <div className="faq-list">
          {faqs.map((faq) => (
            <article className="faq-item" key={faq.question}>
              <h4>{faq.question}</h4>
              <p>{faq.answer}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default FaqPage;
