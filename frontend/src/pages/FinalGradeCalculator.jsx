import React, { useState } from 'react';
import '../Calculator.css';
import '../FinalGradeCalculator.css';

export default function FinalGradeCalculator() {
    const [currentGrade, setCurrentGrade] = useState("");
    const [targetGrade, setTargetGrade] = useState("");
    const [finalExamWeight, setFinalExamWeight] = useState("");
    const [result, setResult] = useState(null);

    const calculateRequired = () => {
        if (!currentGrade || !targetGrade || !finalExamWeight) {
            alert("Please enter all fields.");
            return;
        }

        const current = parseFloat(currentGrade) / 100;
        const target = parseFloat(targetGrade) / 100;
        const weight = parseFloat(finalExamWeight) / 100;
        setResult((((target - current * (1 - weight)) / weight) * 100).toFixed(2));
    };

    const clear = () => {
        setCurrentGrade("");
        setTargetGrade("");
        setFinalExamWeight("");
        setResult(null);
    };

    return (
        <div className="calculator-container">
            <div className='calculator-header'>Final Grade Calculator</div>

            <div className='final-calculator-row'>
                <div>Current Grade (%)</div>
                <input type="text" value={currentGrade} placeholder="e.g. 95" onChange={(e) => setCurrentGrade(e.target.value)} />
            </div>

            <div className='final-calculator-row'>
                <div>Target Grade (%)</div>
                <input type="text" value={targetGrade} placeholder="e.g. 90" onChange={(e) => setTargetGrade(e.target.value)} />
            </div>

            <div className='final-calculator-row'>
                <div>Weight of Exam (%)</div>
                <input type="text" value={finalExamWeight} placeholder="e.g. 25" onChange={(e) => setFinalExamWeight(e.target.value)} />
            </div>

            <div className="final-calculator-actions">
                <button onClick={clear}>× Reset </button>
                <button onClick={calculateRequired}>Calculate</button>
            </div>

            {result && (
                <div className="calculator-result">
                    <hr />
                    <div className="calculator-result-header">
                        <strong>{result}%</strong>
                    </div>
                </div>
            )}
        </div>
    );
}