import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"LEARNER" | "FACULTY">("LEARNER");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      await register({ fullName, email, password, role });
      navigate("/dashboard");
    } catch (err) {
      if (axios.isAxiosError<{ message?: string }>(err)) {
        setError(err.response?.data?.message ?? "Registration failed. Try a different email.");
      } else {
        setError("Registration failed. Try a different email.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <section className="auth-intro">
        <h1>Create one profile for programs, scholarships, and research.</h1>
        <p>Set up as a learner or faculty member and unlock the workspace designed for your next academic move.</p>
      </section>
      <form className="section-card auth-card" onSubmit={handleSubmit}>
        <span className="eyebrow">Profile setup</span>
        <h2>Create your InsightNest profile</h2>
        <p>Start as a learner or faculty member to unlock tools built for you.</p>
        {error && <span className="error-text">{error}</span>}
        <label>
          Full name
          <input value={fullName} onChange={(event) => setFullName(event.target.value)} required />
        </label>
        <label>
          Email
          <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required />
        </label>
        <label>
          Password
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            required
            minLength={8}
          />
        </label>
        <label>
          Confirm password
          <input
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            type="password"
            required
          />
        </label>
        <label>
          Role
          <select value={role} onChange={(event) => setRole(event.target.value as "LEARNER" | "FACULTY")} required>
            <option value="LEARNER">Learner</option>
            <option value="FACULTY">Faculty</option>
          </select>
        </label>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? "Creating account…" : "Create account"}
        </button>
      </form>
    </div>
  );
};

export default RegisterPage;
