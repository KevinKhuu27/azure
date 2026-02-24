import React, { createContext, useState, useEffect, useContext } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const API_BASE = import.meta.env.VITE_API_URL;

  // Check session on app load
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch(`${API_BASE}/controller/check-session`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });

        setIsAuthenticated(response.ok);
        await fetchUser(); // Fetch user profile if session is valid
      } catch (err) {
        console.error("Session check failed:", err);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE}/controller/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      if (response.ok) {
        // Wait a moment for session to be established
        await new Promise(resolve => setTimeout(resolve, 100));
        setIsAuthenticated(true);
        await fetchUser(); // Fetch user profile after login
        console.log("Login successful, authenticated state set to true");
        return { success: true };
      } else {
        const data = await response.json();
        console.error("Login failed:", data);
        return { success: false, error: data.error || "Login failed" };
      }
    } catch (err) {
      console.error("Login error:", err);
      return { success: false, error: "Error connecting to server" };
    }
  };

  const logout = async () => {
    try {
      await fetch(`${API_BASE}/controller/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  // fetch the current user profile
  const fetchUser = async () => {
    try {
      const res = await fetch(`${API_BASE}/controller/get-user`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch user");
      const data = await res.json();
      setUser(data); // Expecting { id, name, email, ... }
      return data;
    } catch (err) {
      console.error("Fetching user failed:", err);
      setUser(null);
      return null;
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, loading, login, logout, user, fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
