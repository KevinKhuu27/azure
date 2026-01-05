// src/pages/Register.jsx
import React, { useState } from "react";
import "./../AuthPage.css";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    console.log("Register with", { username, email, password });
    // Call your backend register API here
  };

  return (
    <div className="auth-form">
      <h1 className="auth-title">Register an account</h1>
      <form onSubmit={handleSubmit}>
        <h2 className="auth-input-title">Username</h2>
        <input
          className="auth-input"
          type="text"
          placeholder="Your username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <h2 className="auth-input-title">Email</h2>
        <input
          className="auth-input"
          type="email"
          placeholder="Your email"
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

        <h2 className="auth-input-title">Confirm Password</h2>
        <input
          className="auth-input"
          type="password"
          placeholder="Confirm your password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <button type="submit" className="auth-button">Register</button>
      </form>
      <a href="/login" className="auth-link">Already have an account? Login</a>
    </div>
  );
}
