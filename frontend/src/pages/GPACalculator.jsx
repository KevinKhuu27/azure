import React, { useState, useEffect, useCallback } from "react";
import '../Calculator.css';
import '../GPACalculator.css';

export default function GPACalculator() {
    const [rows, setRows] = useState([{ course: "", grade: "" },]);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (index, field, value) => {
        const updatedRows = [...rows];
        updatedRows[index][field] = value;
        setRows(updatedRows);
    };

    const addRow = () => {
        setRows([...rows, { course: "", grade: "" }]);
    };

    const removeRow = (indexToRemove) => {
        // keep at least one row
        if (rows.length === 1) return;
        setRows(rows.filter((_, index) => index !== indexToRemove));
    };

    const calculateAverage = () => {
        let numberOfCourses = 0;
        let totalGrade = 0;
        rows.forEach((row) => {
            const grade = parseFloat(row.grade);
            if (!isNaN(grade)) {
                totalGrade += grade;
                numberOfCourses += 1;
            }
        });

        if (numberOfCourses === 0) {
            alert("Please enter at least one valid grade.");
            return;
        }

        const average = totalGrade / numberOfCourses;
        setResult(average.toFixed(2));
    };

    const save = async () => {
        try {
            setLoading(true);
            const resp = await fetch('http://localhost:8080/gpa-calculator/save-courses', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    rows: rows.map(r => ({
                        courseID: r.courseID ?? null,
                        course: r.course,
                        grade: Number(r.grade),
                    })),
                }),
            });

            if (!resp.ok) {
                const err = await resp.json().catch(() => ({}));
                throw new Error(err.error || `HTTP ${resp.status}`);
            }

            const data = await resp.json();
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const loadEntries = useCallback(async () => {
        setLoading(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 150));

            const resp = await fetch("http://localhost:8080/gpa-calculator/get-courses", {
                headers: { "Content-Type": "application/json" },
                credentials: "include",
            });

            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

            const data = await resp.json();

            const flatRows = (Array.isArray(data) ? data : []).map(r => ({
                courseID: r.courseID ?? null,
                course: r.course || "",
                grade: String(r.grade ?? ""),
            }));

            if (flatRows.length > 0) {
                setRows(flatRows);
                setResult(null);
            } else {
                setRows([{ course: "", grade: "" }]);
                setResult(null);
            }
        } catch (e) {
            console.error("Failed to load entries", e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            if (cancelled) return;
            await loadEntries();
        })();
        return () => {
            cancelled = true;
        };
    }, [loadEntries]);

    return (
        <div className="calculator-container">
            <div className="calculator-header">GPA Calculator</div>
            <div className="gpa-calculator-columns-header">
                <div>Course</div>
                <div>Grade</div>
            </div>

            {rows.map((row, index) => (
                <div className="gpa-calculator-row" key={index}>
                    <input
                        type="text"
                        placeholder="e.g. CPS706"
                        value={row.course}
                        onChange={(e) =>
                            handleChange(index, "course", e.target.value)
                        }
                    />

                    <input
                        type="number"
                        placeholder="e.g. 3.67"
                        value={row.grade}
                        onChange={(e) =>
                            handleChange(index, "grade", e.target.value)
                        }
                    />

                    <button
                        className="remove-btn"
                        disabled={rows.length === 1}
                        onClick={() => removeRow(index)}
                    >
                        ✕
                    </button>
                </div>
            ))}

            <div className="gpa-calculator-actions">
                <button onClick={addRow}>+ Add Row</button>
                <button onClick={calculateAverage}>Calculate</button>
            </div>

            <div className="calculator-actions">
                <button onClick={save}>Save</button>
                <button onClick={loadEntries}>Cancel</button>
            </div>

            {result && (
                <div className="calculator-result">
                    Final Grade: <strong>{result}</strong>
                </div>
            )}
        </div>
    );
}