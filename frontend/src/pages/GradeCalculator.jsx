import React, { useState } from "react";
import "../Calculator.css";
import "../GradeCalculator.css";

export default function GradeCalculator() {
  const [rows, setRows] = useState([{ description: "", grade: "", weight: "" },]);
  const [result, setResult] = useState(null);

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

      {result && (
        <div className="calculator-result">
          Final Grade: <strong>{result}%</strong>
        </div>
      )}
    </div>
  );
}
