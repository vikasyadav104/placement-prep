import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api'; 

export default function Login() {
  const navigate = useNavigate();
  
  // Backend & UI State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      
      // Save JWT token
      localStorage.setItem('token', response.data.token);
      
      // Teleport to the Dashboard
      navigate('/dashboard');
      
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      backgroundColor: '#000000',
      color: '#ffffff',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      
      {/* ========================================== */}
      {/* LEFT SIDE: Feature & Hype Panel            */}
      {/* ========================================== */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '60px',
        backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.2), #000000), url('https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070&auto=format&fit=crop')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        borderRight: '1px solid #222'
      }}>
        
        {/* Logo Area */}
{/* Replace your current <h2>AlgoTrack</h2> with this code: */}
<div style={{ 
  fontSize: '24px', 
  fontWeight: '800', 
  letterSpacing: '-0.5px',
  // This shadow makes it readable over any background
  textShadow: '0 2px 10px rgba(0,0,0,0.8), 0 0 20px rgba(0,0,0,0.5)' 
}}>
  <span style={{ color: '#ffffff' }}>Mock</span>
  <span style={{ 
    background: 'linear-gradient(to right, #60a5fa, #a855f7)', 
    WebkitBackgroundClip: 'text', 
    WebkitTextFillColor: 'transparent' 
  }}>Node</span>
</div>
        {/* Updated Authentic Copy */}
        <div style={{ maxWidth: '500px' }}>
          <h1 style={{ fontSize: '48px', fontWeight: '800', lineHeight: '1.1', marginBottom: '24px', letterSpacing: '-1px' }}>
            Ace your next technical round.
          </h1>
          <p style={{ fontSize: '18px', color: '#a1a1aa', lineHeight: '1.5', marginBottom: '32px' }}>
            Consistency is your greatest <span style={{ color: '#60a5fa', fontWeight: '600' }}>competitive edge</span>. 
            Take AI mock interviews, track your progress history, and watch your dynamic rating climb from Newbie to Master.
          </p>
          
          {/* Authentic Feature Stats */}
          <div style={{ display: 'flex', gap: '32px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '32px' }}>
            <div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#fff' }}>100%</div>
              <div style={{ fontSize: '13px', color: '#60a5fa', marginTop: '4px', fontWeight: '600', textTransform: 'uppercase' }}>Free Forever</div>
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#fff' }}>Dynamic</div>
              <div style={{ fontSize: '13px', color: '#666', marginTop: '4px', textTransform: 'uppercase' }}>Rating System</div>
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#fff' }}>In-depth</div>
              <div style={{ fontSize: '13px', color: '#666', marginTop: '4px', textTransform: 'uppercase' }}>History Tracking</div>
            </div>
          </div>
        </div>

      </div>

      {/* ========================================== */}
      {/* RIGHT SIDE: The Functional Login Form      */}
      {/* ========================================== */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px',
        backgroundColor: '#0a0a0a'
      }}>
        
        <div style={{ width: '100%', maxWidth: '380px' }}>
          
          <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px', letterSpacing: '-0.5px' }}>
            Welcome back
          </h2>
          <p style={{ color: '#888888', fontSize: '14px', marginBottom: '32px' }}>
            Enter your credentials to access your dashboard.
          </p>

          {/* Error Message */}
          {error && (
            <div style={{ 
              backgroundColor: 'rgba(220, 38, 38, 0.1)', border: '1px solid rgba(220, 38, 38, 0.3)', 
              color: '#ef4444', padding: '12px', borderRadius: '8px', marginBottom: '20px', 
              fontSize: '13px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px'
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: '#a1a1aa', marginBottom: '8px', fontWeight: '500' }}>Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                style={{ 
                  width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid #333', 
                  backgroundColor: '#111', color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                onBlur={(e) => e.target.style.borderColor = '#333'}
                required
              />
            </div>

            {/* Password */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label style={{ fontSize: '13px', color: '#a1a1aa', fontWeight: '500' }}>Password</label>
                <span style={{ fontSize: '12px', color: '#2563eb', cursor: 'pointer' }}>Forgot password?</span>
              </div>
              
              <div style={{ position: 'relative' }}>
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  style={{ 
                    width: '100%', padding: '12px 14px', paddingRight: '40px', borderRadius: '8px', 
                    border: '1px solid #333', backgroundColor: '#111', color: '#fff', fontSize: '14px', 
                    outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                  onBlur={(e) => e.target.style.borderColor = '#333'}
                  required
                />
                
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', color: '#666', cursor: 'pointer', display: 'flex'
                  }}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button 
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '12px', backgroundColor: loading ? '#1e40af' : '#2563eb', 
                color: loading ? '#93c5fd' : '#ffffff', border: 'none', borderRadius: '6px', 
                fontSize: '14px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', 
                marginTop: '8px', transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => !loading && (e.target.style.backgroundColor = '#1d4ed8')}
              onMouseOut={(e) => !loading && (e.target.style.backgroundColor = '#2563eb')}
            >
              {loading ? 'Signing in...' : 'Log In'}
            </button>
          </form>

          <div style={{ marginTop: '24px', fontSize: '13px', color: '#666', textAlign: 'center' }}>
            Don't have an account?{' '}
            <span 
              onClick={() => navigate('/register')} 
              style={{ color: '#fff', fontWeight: '600', cursor: 'pointer' }}
            >
              Sign up
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}