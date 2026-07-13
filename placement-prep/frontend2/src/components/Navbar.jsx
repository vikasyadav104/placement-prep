import { Link, useLocation } from 'react-router-dom';
import { Cpu } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();

  // Hide navbar during the actual interview so it doesn't distract
  if (location.pathname === '/interview/active') return null;

  return (
    <nav style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      padding: '20px 40px', 
      backgroundColor: 'rgba(10, 10, 10, 0.8)', 
      borderBottom: '1px solid #333',
      backdropFilter: 'blur(10px)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#fff', textDecoration: 'none', fontWeight: 'bold', fontSize: '20px' }}>
        <Cpu color="#86efac" /> MockAI
      </Link>
      
      <div style={{ display: 'flex', gap: '30px' }}>
        <Link to="/dashboard" style={navLinkStyle}>Dashboard</Link>
        <Link to="/resume" style={navLinkStyle}>Upload Resume</Link>
        <Link to="/roadmap" style={navLinkStyle}>Study Roadmap</Link>
      </div>
    </nav>
  );
}

const navLinkStyle = {
  color: '#888',
  textDecoration: 'none',
  fontSize: '15px',
  fontWeight: '500',
  transition: 'color 0.2s'
};