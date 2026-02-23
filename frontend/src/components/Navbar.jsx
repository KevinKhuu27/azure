import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";
import { useAuth } from "../authentication/AuthContext";

export default function Navbar() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await logout();
      navigate('/login', { replace: true });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <nav className="navbar">
      <div className="nav-left">
        <button className="nav-btn" onClick={() => navigate("/gradeCalculator")}>
          Grade Calculator
        </button>
        <button className="nav-btn" onClick={() => navigate("/gpaCalculator")}>
          GPA Calculator
        </button>
        <button className="nav-btn" onClick={() => navigate("/cgpaCalculator")}>
          CGPA Calculator
        </button>
        <button className="nav-btn" onClick={() => navigate("/finalGradeCalculator")}>
          Final Grade Calculator
        </button>
      </div>

      <div className="nav-right">
        { user ? (
          <div className="user-info">
            <span className="nav-username">Hello, <strong>{user.username}</strong>!</span>
            <button onClick={handleLogout}>Sign Out</button>
          </div>
        ) : (
          <button className="nav-btn" onClick={() => navigate("/login")} >Login</button>
        )}
      </div>
    </nav>
  );
}
