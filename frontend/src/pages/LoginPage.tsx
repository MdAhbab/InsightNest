import { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    try {
      await login(email, password);
    } catch (err) {
      if (axios.isAxiosError<{ message?: string }>(err)) {
        setError(err.response?.data?.message ?? "Login failed. Check your credentials.");
      } else {
        setError("Login failed. Check your credentials.");
      }
    }
  };

  return (
    <div className="auth-page">
      <section className="auth-intro">
        <h1>Pick up exactly where your applications left off.</h1>
        <p>Return to saved programs, scholarship drafts, join requests, webinars, and resource checklists.</p>
      </section>
      <form className="section-card auth-card" onSubmit={handleSubmit}>
        <span className="eyebrow">Secure access</span>
        <h2>Welcome back</h2>
        <p>Log in to continue your higher study journey.</p>
        {error && <span className="error-text">{error}</span>}
        <label>
          Email
          <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required />
        </label>
        <label>
          Password
          <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" required />
        </label>
        <button type="submit" className="btn btn-primary">
          Log in
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
