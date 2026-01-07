import { useState } from 'react'
import { Routes, Route, Navigate } from "react-router-dom";
import './App.css'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import GradeCalculator from './pages/GradeCalculator.jsx';

function App() {
  const [loggedIn, setLoggedIn] = useState(false);

  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/gradeCalculator" element={<GradeCalculator />} />
    </Routes>
  );
}

export default App
