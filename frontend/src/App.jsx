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
        
        <Route path="/gradeCalculator" element={<MainLayout><GradeCalculator /></MainLayout>} />
        <Route path="/gpaCalculator" element={<MainLayout><GPACalculator /></MainLayout>} />
        <Route path="/cgpaCalculator" element={<MainLayout><CGPACalculator /></MainLayout>} />
        <Route path="/finalGradeCalculator" element={<MainLayout><FinalGradeCalculator /></MainLayout>} />
      </Routes>
    </AuthProvider>
  );
}

export default App
