import { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const RegisterPage = () => {
  const { register } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"LEARNER" | "FACULTY">("LEARNER");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    try {
      await register({ fullName, email, password, role });
    } catch (err) {
      if (axios.isAxiosError<{ message?: string }>(err)) {
        setError(err.response?.data?.message ?? "Registration failed. Try a different email.");
      } else {
        setError("Registration failed. Try a different email.");
      }
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
          <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" required />
        </label>
        <label>
          Role
          <select value={role} onChange={(event) => setRole(event.target.value as "LEARNER" | "FACULTY")} required>
            <option value="LEARNER">Learner</option>
            <option value="FACULTY">Faculty</option>
          </select>
        </label>
        <button type="submit" className="btn btn-primary">
          Create account
        </button>
      </form>
    </div>
  );
};

export default RegisterPage;
