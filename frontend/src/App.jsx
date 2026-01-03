import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import UniversalLanding from './pages/UniversalLanding';
import LandingPro from './pages/LandingPro';
import LandingEnterprise from './pages/LandingEnterprise';
import LandingProfessional from './pages/LandingProfessional';
import LandingCool from './pages/LandingCool';
import LandingStandard from './pages/LandingStandard';
import LandingMinimal from './pages/LandingMinimal';
import Landing from './pages/Landing';
import TailwindTest from './pages/TailwindTest';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import StudentDashboard from './pages/student/StudentDashboard';
import Dashboard from './components/Dashboard';

function App() {
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<UniversalLanding />} />
        <Route path="/landing-pro" element={<LandingPro />} />
        <Route path="/test" element={<TailwindTest />} />
        <Route path="/landing-enterprise" element={<LandingEnterprise />} />
        <Route path="/landing-professional" element={<LandingProfessional />} />
        <Route path="/landing-cool" element={<LandingCool />} />
        <Route path="/landing-standard" element={<LandingStandard />} />
        <Route path="/landing-minimal" element={<LandingMinimal />} />
        <Route path="/landing-full" element={<Landing />} />
        <Route path="/register" element={<Register />} />
        <Route 
          path="/login" 
          element={
            user ? (
              <Navigate to={`/${user.role}`} replace />
            ) : (
              <Login onLogin={handleLogin} />
            )
          } 
        />
        
        {/* Protected routes */}
        <Route 
          path="/student" 
          element={
            user && user.role === 'student' ? (
              <StudentDashboard user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        <Route 
          path="/company" 
          element={
            user && user.role === 'company' ? (
              <Dashboard user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        <Route 
          path="/admin" 
          element={
            user && user.role === 'admin' ? (
              <Dashboard user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
