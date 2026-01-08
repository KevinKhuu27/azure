import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // clear auth info
    localStorage.removeItem("token"); // if using JWT
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="nav-left">
        <button className="nav-btn" onClick={() => navigate("/gradeCalculator")}>
          Grade Calculator
        </button>
        <button className="nav-btn" onClick={() => navigate("/finalGradeCalculator")}>
          Final Grade Calculator
        </button>
        <button className="nav-btn" onClick={() => navigate("/cgpaCalculator")}>
          CGPA Calculator
        </button>
      </div>

      <div className="nav-right">
        <button onClick={handleLogout}>Sign Out</button>
      </div>
    </nav>
  );
}
