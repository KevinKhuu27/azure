import React, { useState, useCallback } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import GPASidebar from "../components/GPASidebar";
import "./MainLayout.css";

export default function MainLayout({ children, showSidebar = false, sidebarComponent, sidebar }) {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [sidebarReloadKey, setSidebarReloadKey] = useState(0);
  const reloadSidebar = useCallback(() => setSidebarReloadKey((k) => k + 1), []);

  const SidebarComponent = sidebarComponent || Sidebar;

  return (
    <>
      <Navbar />
      <div className="app-grid" data-collapsed={collapsed ? "true" : "false"} data-sidebar={showSidebar ? "true" : "false"}>
        {showSidebar && (
          <SidebarComponent 
            collapsed={collapsed}
            onToggleCollapsed={() => setCollapsed((s) => !s)}
            onCourseSelect={(course) => setSelectedCourse(course)}
            onSemesterSelect={(semester) => setSelectedSemester(semester)}
            reloadKey={sidebarReloadKey}
            onDataChanged={reloadSidebar}
          />
        )}
        <main>
          {React.isValidElement(children)
            ? React.cloneElement(children, { selectedCourse, selectedSemester, onSave: reloadSidebar, reloadKey: sidebarReloadKey })
            : children}
        </main>
      </div>
    </>
  );
}
