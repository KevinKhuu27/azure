import React, { createContext, useState, useEffect, useContext } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check session on app load
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch("http://localhost:8080/controller/check-session", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });

        setIsAuthenticated(response.ok);
      } catch (err) {
        console.error("Session check failed:", err);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch("http://localhost:8080/controller/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      if (response.ok) {
        // Wait a moment for session to be established
        await new Promise(resolve => setTimeout(resolve, 100));
        setIsAuthenticated(true);
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
      await fetch("http://localhost:8080/controller/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setIsAuthenticated(false);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, loading, login, logout }}>
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
