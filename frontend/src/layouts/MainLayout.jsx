import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import "./MainLayout.css";

export default function MainLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  return (
    <>
      <Navbar />
      <div className="app-grid" data-collapsed={collapsed ? "true" : "false"}>
        <Sidebar 
          collapsed={collapsed}
          onToggleCollapsed={() => setCollapsed((s) => !s)}
          onSelect={(course) => setSelectedCourse(course)}
        />
        <main>
          {React.isValidElement(children) ? React.cloneElement(children, { selectedCourse }) : children}
        </main>
      </div>
    </>
  );
}
