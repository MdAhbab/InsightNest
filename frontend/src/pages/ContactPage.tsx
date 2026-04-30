const ContactPage = () => {
  return (
    <div className="page-stack">
      <section className="page-hero">
        <div className="page-copy">
          <span className="eyebrow">Contact</span>
          <h1>Get help with applications, funding, research, or platform access.</h1>
          <p>
            Send a focused message and the support team can route it to admissions guidance, scholarship review, or
            faculty collaboration support.
          </p>
        </div>
        <aside className="insight-panel">
          <span className="tag status-blue">Response window</span>
          <h3>Usually within 48 hours</h3>
          <p>For urgent deadline issues, include the exact deadline date and the institution name.</p>
          <ul className="timeline">
            <li>
              <strong>Email</strong>
              <span>support@insightnest.com</span>
            </li>
            <li>
              <strong>Location</strong>
              <span>Dhaka, Bangladesh</span>
            </li>
          </ul>
        </aside>
      </section>

      <section className="contact-grid">
        <aside className="insight-panel">
          <span className="tag status-open">Before you send</span>
          <h3>Helpful context</h3>
          <ul className="timeline">
            <li>
              <strong>For programs</strong>
              <span>Name the university, program, intake, and your education background.</span>
            </li>
            <li>
              <strong>For scholarships</strong>
              <span>Share eligibility concern, deadline, and missing document.</span>
            </li>
            <li>
              <strong>For research</strong>
              <span>Include skills, previous project, and mentor or lab name.</span>
            </li>
          </ul>
        </aside>
        <form className="section-card contact-form">
          <div className="section-heading">
            <div>
              <h2>Send a message</h2>
              <p>Keep it specific and the support path gets much faster.</p>
            </div>
          </div>
          <label>
            Name
            <input type="text" placeholder="Your name" required />
          </label>
          <label>
            Email
            <input type="email" placeholder="you@example.com" required />
          </label>
          <label>
            Subject
            <input type="text" placeholder="Scholarship inquiry" required />
          </label>
          <label>
            Message
            <textarea rows={5} placeholder="Write your message" required></textarea>
          </label>
          <button type="submit" className="btn btn-primary">
            Send message
          </button>
        </form>
      </section>
    </div>
  );
};

export default ContactPage;
