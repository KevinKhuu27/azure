import { Routes, Route, Navigate } from "react-router-dom";
import './App.css'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import GradeCalculator from './pages/GradeCalculator.jsx';
import FinalGradeCalculator from './pages/FinalGradeCalculator.jsx';
import GPACalculator from './pages/GPACalculator.jsx';
import CGPACalculator from './pages/CGPACalculator.jsx';
import MainLayout from './layouts/MainLayout.jsx';
import ProtectedRoute from './authentication/ProtectedRoute.jsx';
import { AuthProvider } from './authentication/AuthContext.jsx';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route path="/gradeCalculator" element={<ProtectedRoute><MainLayout><GradeCalculator /></MainLayout></ProtectedRoute>} />
        <Route path="/finalGradeCalculator" element={<ProtectedRoute><MainLayout><FinalGradeCalculator /></MainLayout></ProtectedRoute>} />
        <Route path="/gpaCalculator" element={<ProtectedRoute><MainLayout><GPACalculator /></MainLayout></ProtectedRoute>} />
        <Route path="/cgpaCalculator" element={<ProtectedRoute><MainLayout><CGPACalculator /></MainLayout></ProtectedRoute>} />
      </Routes>
    </AuthProvider>
  );
}

export default App
