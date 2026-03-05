import React, { useState, useCallback } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import "./MainLayout.css";

export default function MainLayout({ children, showSidebar = false }) {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [sidebarReloadKey, setSidebarReloadKey] = useState(0);
  const reloadSidebar = useCallback(() => setSidebarReloadKey((k) => k + 1), []);

  return (
    <>
      <Navbar />
      <div className="app-grid" data-collapsed={collapsed ? "true" : "false"} data-sidebar={showSidebar ? "true" : "false"}>
        {showSidebar && (
          <Sidebar 
            collapsed={collapsed}
            onToggleCollapsed={() => setCollapsed((s) => !s)}
            onSelect={(course) => setSelectedCourse(course)}
            reloadKey={sidebarReloadKey}
            onDataChanged={reloadSidebar}
          />
        )}
        <main>
          {React.isValidElement(children)
            ? React.cloneElement(children, { selectedCourse, onSave: reloadSidebar, reloadKey: sidebarReloadKey })
            : children}
        </main>
      </div>
    </>
  );
}
