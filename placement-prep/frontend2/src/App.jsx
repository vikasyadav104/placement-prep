import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'; // <-- Added Navigate here
import { AuthProvider } from './context/AuthContext';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Resume from './pages/temp';
import Roadmap from './pages/Roadmap';
import ActiveInterview from './pages/ActiveInterview';
import InterviewSummary from './pages/InterviewSummary';
import InterviewRoadmap from './pages/InterviewRoadmap';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          
          {/* ========================================== */}
          {/* THIS IS THE NEW REDIRECT LINE              */}
          {/* Automatically sends anyone visiting "/" directly to "/login" */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          {/* ========================================== */}

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/dashboard" element={<Dashboard />} /> 
          
          <Route path="/resume" element={<Resume />} />
          <Route path="/roadmap" element={<Roadmap />} />
          <Route path="/interview/active" element={<ActiveInterview />} />
          <Route path="/interview/summary" element={<InterviewSummary />} />
          <Route path="/interview/roadmap" element={<InterviewRoadmap />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;