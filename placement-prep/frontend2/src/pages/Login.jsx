import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api'; // Your mail carrier to the backend

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Send email and password to your backend
      const response = await api.post('/auth/login', { email, password });
      
      // 2. The backend sends back a JWT token. We must save it so the app knows you are logged in.
      localStorage.setItem('token', response.data.token);
      
      // 3. Teleport to the Dashboard
      navigate('/dashboard');
      
    } catch (err) {
      // 4. Show error if password is wrong or user doesn't exist
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundImage: `url('https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070&auto=format&fit=crop')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      
      {/* Navbar */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', padding: '20px 50px', color: '#ffffff' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => navigate('/')}>Logo</h2>
        <button onClick={() => navigate('/register')} style={{ background: 'transparent', border: '1px solid #fff', color: '#fff', padding: '8px 20px', borderRadius: '6px', cursor: 'pointer' }}>
          Register
        </button>
      </nav>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        
        {/* The Frosted Glass Modal */}
        <div style={{
          width: '100%',
          maxWidth: '420px',
          padding: '40px',
          background: 'rgba(255, 255, 255, 0.25)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        }}>

          <h1 style={{ textAlign: 'center', fontSize: '28px', fontWeight: '700', marginBottom: '20px' }}>Login</h1>

          {/* Show a red error box if login fails */}
          {error && (
            <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '10px', borderRadius: '5px', marginBottom: '15px', textAlign: 'center', fontSize: '14px', fontWeight: '500' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ fontSize: '14px', fontWeight: '600' }}>Email</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                style={{ border: 'none', borderBottom: '1px solid #1a1a1a', background: 'transparent', padding: '8px 0', outline: 'none', fontSize: '15px' }} 
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ fontSize: '14px', fontWeight: '600' }}>Password</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                style={{ border: 'none', borderBottom: '1px solid #1a1a1a', background: 'transparent', padding: '8px 0', outline: 'none', fontSize: '15px' }} 
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              style={{ 
                background: loading ? '#333' : '#1a1a1a', 
                color: '#ffffff', 
                border: 'none', 
                padding: '12px', 
                borderRadius: '6px', 
                fontSize: '16px', 
                fontWeight: '600', 
                cursor: loading ? 'not-allowed' : 'pointer', 
                marginTop: '10px' 
              }}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>

            <div style={{ textAlign: 'center', fontSize: '14px', marginTop: '10px' }}>
              Don't have an account? <span onClick={() => navigate('/register')} style={{ fontWeight: '700', cursor: 'pointer' }}>Register</span>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}