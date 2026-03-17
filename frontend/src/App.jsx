import { Routes, Route, Navigate } from "react-router-dom";
import './App.css'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import GradeCalculator from './pages/GradeCalculator.jsx';
import FinalGradeCalculator from './pages/FinalGradeCalculator.jsx';
import GPACalculator from './pages/GPACalculator.jsx';
import CGPACalculator from './pages/CGPACalculator.jsx';
import MainLayout from './layouts/MainLayout.jsx';
import Sidebar from './components/Sidebar.jsx';
import GPASidebar from './components/GPASidebar.jsx';
import ProtectedRoute from './authentication/ProtectedRoute.jsx';
import { AuthProvider } from './authentication/AuthContext.jsx';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route path="/gradeCalculator" element={<MainLayout showSidebar={true} sidebarComponent={Sidebar}><GradeCalculator /></MainLayout>} />
        <Route path="/gpaCalculator" element={<MainLayout showSidebar={true} sidebarComponent={GPASidebar}><GPACalculator /></MainLayout>} />
        <Route path="/cgpaCalculator" element={<MainLayout><CGPACalculator /></MainLayout>} />
        <Route path="/finalGradeCalculator" element={<MainLayout><FinalGradeCalculator /></MainLayout>} />
      </Routes>
    </AuthProvider>
  );
}

export default App
