import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Resume from './pages/Resume';
import Interview from './pages/Interview';
import Roadmap from './pages/Roadmap';
import Login from './pages/Login'; 

// 1. IMPORT YOUR AUTH PROVIDER
import { AuthProvider } from './context/AuthContext'; // Adjust this path to wherever your AuthContext is

function App() {
  return (
    // 2. WRAP EVERYTHING IN THE PROVIDER
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/resume" element={<Resume />} />
          <Route path="/interview" element={<Interview />} />
          <Route path="/roadmap" element={<Roadmap />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;