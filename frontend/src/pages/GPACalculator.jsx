import React, { useState } from "react";
import '../Calculator.css';
import '../GPACalculator.css';

export default function GPACalculator() {
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