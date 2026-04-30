import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="footer">
      <div>
        <h4>InsightNest</h4>
        <p>Academic discovery, application tracking, funding readiness, and research collaboration for Bangladesh.</p>
      </div>
      <div>
        <h4>Explore</h4>
        <p>
          <Link to="/universities">Universities</Link>
        </p>
        <p>
          <Link to="/programs">Programs</Link>
        </p>
        <p>
          <Link to="/scholarships">Scholarships</Link>
        </p>
      </div>
      <div>
        <h4>Support</h4>
        <p>support@insightnest.com</p>
        <p>Dhaka, Bangladesh</p>
        <p>
          <Link to="/contact">Contact support</Link>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
