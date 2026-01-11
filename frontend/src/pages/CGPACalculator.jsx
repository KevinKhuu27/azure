import React, { useState } from "react";
import '../Calculator.css';
import '../GPACalculator.css';

export default function CGPACalculator() {
    const [rows, setRows] = useState([{ description: "", grade: ""},]);
    const [result, setResult] = useState(null);
    
    const handleChange = (index, field, value) => {
        const updatedRows = [...rows];
        updatedRows[index][field] = value;
        setRows(updatedRows);
    };

    const addRow = () => {
        setRows([...rows, { description: "", grade: "" }]);
    };

    const removeRow = (indexToRemove) => {
        // keep at least one row
        if (rows.length === 1) return;
        setRows(rows.filter((_, index) => index !== indexToRemove));
    };
        
    const calculateAverage = () => {
        let numberOfSemesters = 0;
        let totalGrade = 0;
        rows.forEach((row) => {
            const grade = parseFloat(row.grade);
            if (!isNaN(grade)) {
                totalGrade += grade;
                numberOfSemesters += 1;
            }
        });

        if (numberOfSemesters === 0) {
            alert("Please enter at least one valid grade.");
            return;
        }
        
        const average = totalGrade / numberOfSemesters;
        setResult(average.toFixed(2));
    };

    return (
        <div className="calculator-container">
            <div className="calculator-header">CGPA Calculator</div>
            <div className="gpa-calculator-columns-header">
                <div>Semester</div>
                <div>Grade</div>
            </div>

            {rows.map((row, index) => (
                <div className="gpa-calculator-row" key={index}>
                    <input
                        type="text"
                        placeholder="e.g. W2026"
                        value={row.description}
                        onChange={(e) =>
                        handleChange(index, "description", e.target.value)
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

            {result && (
                <div className="calculator-result">
                Final Grade: <strong>{result}</strong>
                </div>
            )}
        </div>
    );
}