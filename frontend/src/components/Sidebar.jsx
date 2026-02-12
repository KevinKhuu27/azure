import React, { useEffect, useMemo, useRef, useState } from "react";
import "./Sidebar.css";

export default function Sidebar({ onSelect, collapsed, onToggleCollapsed }) {
    const [entities, setEntities] = useState([]);
    const [activeId, setActiveId] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(true);
    const inputRef = useRef(null);
    const [dragId, setDragId] = useState(null);

    const active = useMemo(
        () => entities.find((e) => e.courseID === activeId) ?? null,
        [entities, activeId]
    );
    
    // Load courses from backend
    useEffect(() => {
        const loadCourses = async () => {
            try {
                setLoading(true);
                const resp = await fetch("http://localhost:8080/gpa-calculator/get-courses", {
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                });
                if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
                const data = await resp.json();
                setEntities(Array.isArray(data) ? data : []);
                if (Array.isArray(data) && data.length > 0) {
                    setActiveId(data[0].courseID);
                }
            } catch (e) {
                console.error("Failed to load courses", e);
            } finally {
                setLoading(false);
            }
        };
        loadCourses();
    }, []);

    useEffect(() => onSelect && onSelect(active), [active, onSelect]);
    useEffect(() => {
        if (editingId && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [editingId]);

    const addEntity = async () => {
        const defaultCourseName = "New Course"; // Default name for the new course

        try {
            setLoading(true);
            const resp = await fetch("http://localhost:8080/gpa-calculator/save-courses", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    rows: [
                        ...entities,
                        { courseID: null, course: defaultCourseName, grade: 0 }
                    ]
                }),
            });

            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

            // Reload courses
            const getResp = await fetch("http://localhost:8080/gpa-calculator/get-courses", {
                headers: { "Content-Type": "application/json" },
                credentials: "include",
            });
            if (!getResp.ok) throw new Error(`HTTP ${getResp.status}`);
            const data = await getResp.json();
            setEntities(Array.isArray(data) ? data : []);

            // Set the newly added course as active
            if (data.length > 0) {
                setActiveId(data[data.length - 1].courseID);
            }
        } catch (e) {
            console.error("Failed to add course", e);
            alert("Failed to add course");
        } finally {
            setLoading(false);
        }
    };

    const deleteEntity = async (courseID, name) => {
        const confirmation = window.confirm(`Are you sure you want to delete "${name}"?`);
        if (!confirmation) return;
        
        try {
            setLoading(true);
            const updatedCourses = entities.filter((e) => e.courseID !== courseID);
            
            const resp = await fetch("http://localhost:8080/gpa-calculator/save-courses", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    rows: updatedCourses.map(e => ({
                        courseID: e.courseID,
                        course: e.course,
                        grade: e.grade || 0
                    }))
                }),
            });

            if (!resp.ok) {
                const error = await resp.json();
                throw new Error(error.error || `HTTP ${resp.status}`);
            }

            setEntities(updatedCourses);
            setActiveId((prev) => {
                if (prev === courseID) {
                    return updatedCourses.length > 0 ? updatedCourses[0].courseID : null;
                }
                return prev;
            });
            if (editingId === courseID) setEditingId(null);
        } catch (e) {
            console.error("Failed to delete course", e);
            alert(e.message || "Failed to delete course");
        } finally {
            setLoading(false);
        }
    };

    const renameEntity = async (courseID, newName) => {
        if (!newName.trim()) return;
        
        try {
            setLoading(true);
            const updatedCourses = entities.map((e) => 
                e.courseID === courseID ? { ...e, course: newName } : e
            );
            
            const resp = await fetch("http://localhost:8080/gpa-calculator/save-courses", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    rows: updatedCourses.map(e => ({
                        courseID: e.courseID,
                        course: e.course,
                        grade: e.grade || 0
                    }))
                }),
            });

            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
            
            setEntities(updatedCourses);
        } catch (e) {
            console.error("Failed to rename course", e);
            alert("Failed to rename course");
        } finally {
            setLoading(false);
        }
    };

    // Drag and drop
    const onDragStart = (id) => setDragId(id);

    const onDrop = async (overID) => {
        if (!dragId || dragId === overID) return;

        try {
            const from = entities.findIndex((e) => e.courseID === dragId);
            const to = entities.findIndex((e) => e.courseID === overID);
            if (from < 0 || to < 0) return;

            const copy = [...entities];
            const [moved] = copy.splice(from, 1);
            copy.splice(to, 0, moved);
            
            // Save to backend
            const resp = await fetch("http://localhost:8080/gpa-calculator/save-courses", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    rows: copy.map(e => ({
                        courseID: e.courseID,
                        course: e.course,
                        grade: e.grade || 0
                    }))
                }),
            });

            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
            
            setEntities(copy);
        } catch (e) {
            console.error("Failed to reorder courses", e);
        }
        setDragId(null);
    };

    return (
        <aside className={`sidebar ${collapsed ? "sidebar-collapsed" : ""}`}>
            <div className="sidebar-top">
                <button className="add-entity-button hide-when-collapsed" onClick={addEntity} disabled={loading}>+ New</button>
                <button className="expand-button" onClick={onToggleCollapsed}>{collapsed ? ">" : "<"}</button>
            </div>
            <nav className="sidebar-content hide-when-collapsed">
                <div className="sidebar-content-inner">
                    <ul id="entitiesList" className="entities">
                        {entities.map((e) => (
                            <li
                                key={e.courseID}
                                className="entity"
                                draggable
                                onDragStart={() => onDragStart(e.courseID)}
                                onDragOver={(ev) => ev.preventDefault()}
                                onDrop={() => onDrop(e.courseID)}
                            >
                                {editingId === e.courseID ? (
                                    <input
                                        ref={inputRef}
                                        className="entity-button editing"
                                        defaultValue={e.course}
                                        onBlur={(ev) => {
                                            const next = ev.target.value.trim();
                                            if (next) renameEntity(e.courseID, next);
                                            setEditingId(null);
                                        }}
                                        onKeyDown={(ev) => {
                                            if (ev.key === "Enter") ev.target.blur();
                                            if (ev.key === "Escape") setEditingId(null);
                                        }}
                                        disabled={loading}
                                    />
                                    ) : (
                                    // alternates between button and input
                                    <button className={`entity-button ${e.courseID === activeId ? "active" : ""}`} onClick={() => { setActiveId(e.courseID); onSelect && onSelect(e); }} disabled={loading}>{e.course} </button>
                                )}

                                <div className="entity-actions">
                                    <button className="entity-action-button" onClick={() => setEditingId(e.courseID)} disabled={loading}>✎</button>
                                    <button className="entity-action-button" onClick={() => deleteEntity(e.courseID, e.course)} disabled={loading}>✕</button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </nav>
        </aside>
    );
}