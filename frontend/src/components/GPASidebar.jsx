import React, { useEffect, useMemo, useRef, useState } from "react";
import "./Sidebar.css";

export default function Sidebar({ onSemesterSelect, collapsed, onToggleCollapsed, reloadKey, onDataChanged }) {
    const [entities, setEntities] = useState([]);
    const [activeID, setActiveID] = useState(null);
    const [editingID, setEditingID] = useState(null);
    const [loading, setLoading] = useState(true);
    const inputRef = useRef(null);

    const API_BASE = import.meta.env.VITE_API_URL;
    
    const active = useMemo(
        () => entities.find((e) => e.semesterID === activeID) ?? null,
        [entities, activeID]
    );
    
    // Load semesters from backend
    useEffect(() => {
        const loadCourses = async () => {
            try {
                setLoading(true);
                const resp = await fetch(`${API_BASE}/cgpa-calculator/get-semesters`, {
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                });
                if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
                const data = await resp.json();
                const next = Array.isArray(data) ? data : [];
                setEntities(next);
                setActiveID((prev) => {
                    if (!prev && next.length) return next[0].semesterID; // first mount
                    return next.some(e => e.semesterID === prev) ? prev : (next[0]?.semesterID ?? null);
                });
            } catch (e) {
                console.error("Failed to load semester", e);
            } finally {
                setLoading(false);
            }
        };
        loadCourses();
    }, [reloadKey]);

    useEffect(() => onSemesterSelect && onSemesterSelect(active), [active, onSemesterSelect]);
    useEffect(() => {
        if (editingID && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [editingID]);

    const addEntity = async () => {
        const defaultSemesterName = "New Semester"; // Default name for the new semester

        try {
            setLoading(true);
            const resp = await fetch(`${API_BASE}/cgpa-calculator/save-semesters`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    rows: [
                        ...entities,
                        { semesterID: null, semester: defaultSemesterName, grade: 0 }
                    ]
                }),
            });

            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

            // Reload semesters
            const getResp = await fetch(`${API_BASE}/cgpa-calculator/get-semesters`, {
                headers: { "Content-Type": "application/json" },
                credentials: "include",
            });
            if (!getResp.ok) throw new Error(`HTTP ${getResp.status}`);
            const data = await getResp.json();
            setEntities(Array.isArray(data) ? data : []);

            // Set the newly added semester as active
            if (data.length > 0) {
                setActiveID(data[data.length - 1].semesterID);
            }
            onDataChanged?.();
        } catch (e) {
            console.error("Failed to add semester", e);
            alert("Failed to add semester");
        } finally {
            setLoading(false);
        }
    };

    const deleteEntity = async (semesterID, name) => {
        const confirmation = window.confirm(`Are you sure you want to delete "${name}"?`);
        if (!confirmation) return;
        
        try {
            setLoading(true);
            const updatedSemesters = entities.filter((e) => e.semesterID !== semesterID);
            
            const resp = await fetch(`${API_BASE}/cgpa-calculator/save-semesters`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    rows: updatedSemesters.map(e => ({
                        semesterID: e.semesterID,
                        semester: e.semester,
                        grade: e.grade || 0
                    }))
                }),
            });

            if (!resp.ok) {
                const error = await resp.json();
                throw new Error(error.error || `HTTP ${resp.status}`);
            }

            setEntities(updatedSemesters);
            setActiveID((prev) => {
                if (updatedSemesters.length === 0) return null;
                if (prev === semesterID) return updatedSemesters[0].semesterID;
                return prev;
            });
            if (editingID === semesterID) setEditingID(null);
            onDataChanged?.();
        } catch (e) {
            console.error("Failed to delete semester", e);
            alert(e.message || "Failed to delete semester");
        } finally {
            setLoading(false);
        }
    };

    const renameEntity = async (semesterID, newName) => {
        if (!newName.trim()) return;
        
        try {
            setLoading(true);
            const updatedSemesters = entities.map((e) => 
                e.semesterID === semesterID ? { ...e, semester: newName } : e
            );
            
            const resp = await fetch(`${API_BASE}/cgpa-calculator/save-semesters`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    rows: updatedSemesters.map(e => ({
                        semesterID: e.semesterID,
                        semester: e.semester,
                        grade: e.grade || 0
                    }))
                }),
            });

            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
            
            setEntities(updatedSemesters);
            onDataChanged?.();
        } catch (e) {
            console.error("Failed to rename semester", e);
            alert("Failed to rename semester");
        } finally {
            setLoading(false);
        }
    };

    return (
        <aside className={`sidebar ${collapsed ? "sidebar-collapsed" : ""}`}>
            <div className="sidebar-top">
                <button className="add-entity-button hide-when-collapsed" onClick={addEntity} disabled={loading}>+</button>
                <button className="expand-button" onClick={onToggleCollapsed}>{collapsed ? ">" : "<"}</button>
            </div>
            <hr />
            <nav className="sidebar-content hide-when-collapsed">
                <div className="sidebar-content-inner">
                    <ul id="entitiesList" className="entities">
                        {entities.map((e) => (
                            <li
                                key={e.semesterID}
                                className="entity"
                            >
                                {editingID === e.semesterID ? (
                                    <input
                                        ref={inputRef}
                                        className="entity-button editing"
                                        defaultValue={e.semester}
                                        onBlur={(ev) => {
                                            const next = ev.target.value.trim();
                                            if (next) renameEntity(e.semesterID, next);
                                            setEditingID(null);
                                        }}
                                        onKeyDown={(ev) => {
                                            if (ev.key === "Enter") ev.target.blur();
                                            if (ev.key === "Escape") setEditingID(null);
                                        }}
                                        disabled={loading}
                                    />
                                    ) : (
                                    // alternates between button and input
                                    <button className={`entity-button ${e.semesterID === activeID ? "active" : ""}`} onClick={() => { setActiveID(e.semesterID); onSemesterSelect && onSemesterSelect(e); }} disabled={loading}>{e.semester} </button>
                                )}

                                <div className="entity-actions">
                                    <button className="entity-action-button" onClick={() => setEditingID(e.semesterID)} disabled={loading}>✎</button>
                                    <button className="entity-action-button" onClick={() => deleteEntity(e.semesterID, e.semester)} disabled={loading}>✕</button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </nav>
        </aside>
    );
}