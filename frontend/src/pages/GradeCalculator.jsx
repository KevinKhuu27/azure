import React, { useState, useEffect, useCallback } from "react";
import "../Calculator.css";
import "../GradeCalculator.css";

export default function GradeCalculator() {
  const [rows, setRows] = useState([{ description: "", grade: "", weight: "" },]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

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

    const average = totalWeightedScore / totalWeight;
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
        <button onClick={addRow}>+ Add Row</button>
        <button onClick={calculateAverage}>Calculate</button>
      </div>

      <div className="calculator-actions">
        <button onClick={save}>Save</button>
        <button onClick={loadEntries}>Cancel</button>
      </div>

      {result && (
        <div className="calculator-result">
          Final Grade: <strong>{result}% ({(result/100*4.33).toFixed(2)}/4.33)</strong>
        </div>
      )}
    </div>
  );
}
