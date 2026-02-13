import React, { useState, useEffect, useCallback } from "react";
import "../Calculator.css";
import "../GradeCalculator.css";

export default function GradeCalculator() {
  const [rows, setRows] = useState([{ description: "", grade: "", weight: "" },]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exportTarget, setExportTarget] = useState("");

  const handleChange = (index, field, value) => {
    const updatedRows = [...rows];
    updatedRows[index][field] = value;
    setRows(updatedRows);
  };

  const addRow = () => {
    setRows([...rows, { description: "", grade: "", weight: "" }]);
  };

  const removeRow = (indexToRemove) => {
    // keep at least one row
    if (rows.length === 1) return;
    setRows(rows.filter((_, index) => index !== indexToRemove));
  };

  const calculateAverage = () => {
    let totalWeightedScore = 0;
    let totalWeight = 0;

    rows.forEach((row) => {
      const grade = parseFloat(row.grade);
      const weight = parseFloat(row.weight);

      if (!isNaN(grade) && !isNaN(weight)) {
        totalWeightedScore += grade * weight;
        totalWeight += weight;
      }
    });

    if (totalWeight === 0) {
      alert("Please enter at least one valid grade and weight.");
      return;
    }

    const average = totalWeightedScore / totalWeight / 100 * 4.33;
    setResult(average.toFixed(2));
  };
  
  const save = async () => {
    try {
      setLoading(true);
      const resp = await fetch('http://localhost:8080/grade-calculator/save-assignments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          rows: rows.map(r => ({
            assignmentID: r.assignmentID ?? null,
            description: r.description,
            grade: Number(r.grade),
            weight: Number(r.weight),
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

      const resp = await fetch("http://localhost:8080/grade-calculator/get-assignments", {
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

      const data = await resp.json();

      const flatRows = (Array.isArray(data) ? data : []).map(r => ({
        assignmentID: r.assignmentID ?? null,
        description: r.description || "",
        grade: String(r.grade ?? ""),
        weight: String(r.weight ?? ""),
      }));

      if (flatRows.length > 0) {
        setRows(flatRows);
        setResult(null);
      } else {
        setRows([{ description: "", grade: "", weight: "" }]);
        setResult(null);
      }
    } catch (e) {
      console.error("Failed to load entries", e);
    } finally {
      setLoading(false);
    }
  }, []);

  const exportToGPA = useCallback(async () => {
    try {
      setLoading(true);

      // Load existing GPA rows
      const getResp = await fetch("http://localhost:8080/gpa-calculator/get-courses", {
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (!getResp.ok) throw new Error(`HTTP ${getResp.status}`);
      const courses = await getResp.json();

      // Merge new entry with existing ones
      const existing = Array.isArray(courses)
        ? courses.find(c => String(c.course).trim().toLowerCase() === exportTarget.toLowerCase())
        : null;
      const merged = Array.isArray(courses) ? [...courses] : [];
      if (existing) {
        existing.grade = result; // update in-place
      } else {
        merged.push({ courseID: null, course: exportTarget, grade: result });
      }

      // Send ALL rows
      const payload = {
        rows: merged.map(r => ({
          courseID: r.courseID ?? null,
          course: r.course,
          grade: Number(r.grade),
        })),
      };

      const putResp = await fetch("http://localhost:8080/gpa-calculator/save-courses", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });


      if (!putResp.ok) {
        const err = await putResp.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${putResp.status}`);
      }

      const data = await putResp.json();
    } catch (e) {
        console.error(e);
    } finally {
        setLoading(false);
    }
  }, [result, exportTarget]);

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
      <div className="calculator-header">Grade Calculator</div>
      <div className="grade-calculator-columns-header">
        <div>Description</div>
        <div>Grade (%)</div>
        <div>Weight (%)</div>
      </div>

      {rows.map((row, index) => (
        <div className="grade-calculator-row" key={index}>
          <input
            type="text"
            placeholder="e.g. Assignment 1"
            value={row.description}
            onChange={(e) =>
              handleChange(index, "description", e.target.value)
            }
          />

          <input
            type="number"
            placeholder="e.g. 85"
            value={row.grade}
            onChange={(e) =>
              handleChange(index, "grade", e.target.value)
            }
          />

          <input
            type="number"
            placeholder="e.g. 20"
            value={row.weight}
            onChange={(e) =>
              handleChange(index, "weight", e.target.value)
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

      <div className="grade-calculator-actions">
        <div className="add-row">
          <button onClick={addRow}>+ Add Row</button>
        </div>
        <div className="action-buttons">
          <div className="save-actions">
            <button onClick={save}>Save</button>
            <button onClick={loadEntries}>Cancel</button>
          </div>
          <div className="calculate-button">
            <button onClick={calculateAverage}>Calculate</button>
          </div>
        </div>
      </div>

      {result && (
        <div className="calculator-result">
          <hr className="grade-calculator-hr"/>
          <div className="calculator-result-header"><strong>{(result * 100 / 4.33).toFixed(2)}%</strong></div>
          <div className="calculator-result-subheader">({result}/4.33)</div>
          <div className="export-section">
            Export to GPA as:
            <input
              id="exportTarget"
              type="text"
              placeholder="e.g. CPS101"
              value={exportTarget}
              onChange={(e) => setExportTarget(e.target.value)}
              disabled={loading}
            />
            <div className="export-button">
              <button onClick={exportToGPA} disabled={loading}>
                {loading ? "Exporting..." : "Export"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
