import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import "./MainLayout.css";

export default function MainLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [sidebarReloadKey, setSidebarReloadKey] = useState(0);
  const reloadSidebar = () => setSidebarReloadKey((k) => k + 1);

  return (
    <>
      <Navbar />
      <div className="app-grid" data-collapsed={collapsed ? "true" : "false"}>
        <Sidebar 
          collapsed={collapsed}
          onToggleCollapsed={() => setCollapsed((s) => !s)}
          onSelect={(course) => setSelectedCourse(course)}
          reloadKey={sidebarReloadKey}
        />
        <main>
          {React.isValidElement(children)
            ? React.cloneElement(children, { selectedCourse, onSave: reloadSidebar })
            : children}
        </main>
      </div>
    </>
  );
}
