import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Resume from './pages/Resume';
import Roadmap from './pages/Roadmap';
import ActiveInterview from './pages/ActiveInterview';
import InterviewSummary from './pages/InterviewSummary';
import InterviewRoadmap from './pages/InterviewRoadmap';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
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