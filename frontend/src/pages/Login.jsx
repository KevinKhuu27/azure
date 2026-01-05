// src/pages/Login.jsx
import React, { useState } from "react";
import "./../AuthPage.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Login with", { email, password });
    // Call your backend login API here
  };

  return (
    <div className="auth-form">
      <h1 className="auth-title">Login to your account</h1>
      <form onSubmit={handleSubmit}>
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

        <button type="submit" className="auth-button">Login</button>
      </form>
      <a href="/register" className="auth-link">Don't have an account? Register</a>
    </div>
  );
}
