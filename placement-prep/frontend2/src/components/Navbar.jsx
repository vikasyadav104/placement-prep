import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { User, Code2, LogOut } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  // Highlight the active tab based on the current URL
  const isActive = (path) => location.pathname === path;

  const handleSignOut = () => {
    // Clear your auth tokens here (e.g., localStorage.removeItem('token'))
    console.log("Signing out...");
    navigate('/login');
  };

  return (
    <nav style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      padding: '16px 32px', 
      background: '#0a0a0f', 
      borderBottom: '1px solid #222',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      
      {/* Left Side: Brand Logo */}
      <div>
        <h2 style={{ margin: 0, color: '#fff', fontSize: '22px', fontWeight: 'bold', letterSpacing: '1px' }}>
          <span style={{ color: '#a855f7' }}>⚡</span> AlgoTrack
        </h2>
      </div>

      {/* Center: Navigation Links */}
      <div style={{ display: 'flex', gap: '32px' }}>
        <Link 
          to="/profile" 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            color: isActive('/profile') ? '#a855f7' : '#888', 
            textDecoration: 'none',
            fontWeight: '600',
            transition: 'color 0.2s'
          }}
        >
          <User size={18} />
          Profile
        </Link>

        <Link 
          to="/logic-core" 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            color: isActive('/logic-core') ? '#a855f7' : '#888', 
            textDecoration: 'none',
            fontWeight: '600',
            transition: 'color 0.2s'
          }}
        >
          <Code2 size={18} />
          Logic Core
        </Link>
      </div>

      {/* Right Side: Sign Out */}
      <div>
        <button 
          onClick={handleSignOut}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            background: 'transparent', 
            color: '#ef4444', 
            border: '1px solid rgba(239, 68, 68, 0.3)', 
            padding: '8px 16px', 
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
          onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>

    </nav>
  );
}