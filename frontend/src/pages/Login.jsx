import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../authentication/AuthContext";
import "./../AuthPage.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (submitting) return;
    setSubmitting(true);
    try {
      const { success, error } = await login(email, password);
      if (success) {
        navigate("/gradeCalculator", { replace: true });
      } else {
        alert(error || "Login failed");
      }
    } catch (err) {
      alert("Error connecting to server");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-form">
      <h1 className="auth-title">Login to your account</h1>
      <form onSubmit={handleSubmit}>
        <h2 className="auth-input-title">Email</h2>
        <input
          className="auth-input"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <h2 className="auth-input-title">Password</h2>
        <input
          className="auth-input"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" className="auth-button">Login</button>
      </form>
      <a href="/register" className="auth-link">Don't have an account? Register</a>
    </div>
  );
}
