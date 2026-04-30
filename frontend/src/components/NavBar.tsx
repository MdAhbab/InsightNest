import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NavBar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="navbar">
      <Link to="/" className="brand">
        <span className="brand-mark">IN</span>
        <div>
          <p className="brand-name">InsightNest</p>
          <span className="brand-tagline">Higher-study decisions, organized</span>
        </div>
      </Link>
      <nav className="nav-links">
        <NavLink to="/universities" className={({ isActive }) => (isActive ? "active" : undefined)}>
          Universities
        </NavLink>
        <NavLink to="/programs" className={({ isActive }) => (isActive ? "active" : undefined)}>
          Programs
        </NavLink>
        <NavLink to="/scholarships" className={({ isActive }) => (isActive ? "active" : undefined)}>
          Scholarships
        </NavLink>
        <NavLink to="/research" className={({ isActive }) => (isActive ? "active" : undefined)}>
          Research
        </NavLink>
        <NavLink to="/resources" className={({ isActive }) => (isActive ? "active" : undefined)}>
          Resources
        </NavLink>
        <NavLink to="/forums" className={({ isActive }) => (isActive ? "active" : undefined)}>
          Forums
        </NavLink>
        <NavLink to="/webinars" className={({ isActive }) => (isActive ? "active" : undefined)}>
          Webinars
        </NavLink>
        <NavLink to="/faq" className={({ isActive }) => (isActive ? "active" : undefined)}>
          FAQ
        </NavLink>
        <NavLink to="/contact" className={({ isActive }) => (isActive ? "active" : undefined)}>
          Contact
        </NavLink>
      </nav>
      <div className="nav-actions">
        {user ? (
          <>
            <NavLink to="/dashboard" className="btn btn-ghost">
              Dashboard
            </NavLink>
            <button type="button" className="btn btn-primary" onClick={logout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login">Log in</NavLink>
            <NavLink to="/register" className="btn btn-primary">
              Get started
            </NavLink>
          </>
        )}
      </div>
    </header>
  );
};

export default NavBar;
