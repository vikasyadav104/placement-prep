import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api'; // This is the Mail Carrier we built

export default function Register() {
  const navigate = useNavigate();
  
  // These are our "Notepads" to store what the user types
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault(); // Stop page refresh
    setError(''); // Clear old errors

    try {
      // 1. Tell the mail carrier to send Name, Email, and Password to the backend
// ...to this!
    await api.post('/auth/signup', { name, email, password });
      
      // 2. If the backend says "OK", show a success message
      alert("Account created! Now please log in.");
      
      // 3. Teleport them to the Login page
      navigate('/login');
      
    } catch (err) {
      // 4. If the backend says "Error" (like email already exists), show the error
      setError(err.response?.data?.message || 'Registration failed. Try again.');
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
        <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>Logo</h2>
        <button onClick={() => navigate('/login')} style={{ background: 'transparent', border: '1px solid #fff', color: '#fff', padding: '8px 20px', borderRadius: '6px', cursor: 'pointer' }}>
          Login
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

          <h1 style={{ textAlign: 'center', fontSize: '28px', fontWeight: '700', marginBottom: '20px' }}>Register</h1>

          {/* Show a red error box if something goes wrong */}
          {error && (
            <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '10px', borderRadius: '5px', marginBottom: '15px', textAlign: 'center', fontSize: '14px' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ fontSize: '14px', fontWeight: '600' }}>Full Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required style={{ border: 'none', borderBottom: '1px solid #1a1a1a', background: 'transparent', padding: '8px 0', outline: 'none' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ fontSize: '14px', fontWeight: '600' }}>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ border: 'none', borderBottom: '1px solid #1a1a1a', background: 'transparent', padding: '8px 0', outline: 'none' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label style={{ fontSize: '14px', fontWeight: '600' }}>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ border: 'none', borderBottom: '1px solid #1a1a1a', background: 'transparent', padding: '8px 0', outline: 'none' }} />
            </div>

            <button type="submit" style={{ background: '#1a1a1a', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '6px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', marginTop: '10px' }}>
              Create Account
            </button>

            <div style={{ textAlign: 'center', fontSize: '14px', marginTop: '10px' }}>
              Already have an account? <span onClick={() => navigate('/login')} style={{ fontWeight: '700', cursor: 'pointer' }}>Login</span>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}