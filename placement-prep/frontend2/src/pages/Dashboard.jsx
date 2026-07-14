import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// I added 'LogOut' to your lucide-react imports!
import { Code2, Zap, AlertCircle, ArrowLeft, User, LogOut } from 'lucide-react';

// --- YOUR COMPONENTS ---
import RatingGraph from '../components/RatingGraph';
import RecentContests from '../components/RecentContests';
import InterviewHeatmap from '../components/InterviewHeatmap';
import api from '../services/api';

export default function Dashboard() {
  const navigate = useNavigate();
  
  // --- UI STATE ---
  const [activeView, setActiveView] = useState('home'); // 'home' | 'dsa-form' | 'profile'

  // --- LOGIC STATE ---
  const [leetcodeId, setLeetcodeId] = useState('');
  const [codeforcesId, setCodeforcesId] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [syncError, setSyncError] = useState('');
  const [userData, setUserData] = useState(null);
  const [interviewSessions, setInterviewSessions] = useState([]);

  // ==========================================
  // SIGN OUT LOGIC
  // ==========================================
  const handleSignOut = () => {
    localStorage.removeItem('token'); 
    navigate('/login'); 
  };

  // --- STRICT BACKEND FETCHING ---
 // --- STRICT BACKEND FETCHING ---
// --- STRICT BACKEND FETCHING ---
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const profileResponse = await api.get('/user/profile'); 
        
        // Save the inner 'user' object directly!
        setUserData(profileResponse.data.user);
        
        const historyResponse = await api.get('/interview/history');
        if (historyResponse.data && historyResponse.data.sessions) {
          setInterviewSessions(historyResponse.data.sessions);
        }
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      }
    };
    fetchDashboardData();
  }, []);

  // --- DSA SYNC LOGIC ---
  const handleConnectIDs = async (e) => {
    e.preventDefault();
    setIsConnecting(true);
    setSyncError(''); 
    try {
      const response = await api.post('/user/sync-profiles', { leetcodeId, codeforcesId });
      if (response.status && response.status !== 200) throw new Error('Verification failed.');
      
      alert('Success! Telemetry Link Established.');
      navigate('/roadmap');
    } catch (error) {
      setSyncError(error.response?.data?.message || 'Verification failed. Please check your IDs.');
    } finally {
      setIsConnecting(false);
    }
  };

  // =======================================================================
  // VIEW 1: DARK PROFILE (Graph, History & Heatmap)
  // =======================================================================
  if (activeView === 'profile') {
    return (
      <div style={{
        minHeight: '100vh', backgroundColor: '#000000',
        backgroundImage: 'radial-gradient(circle at 50% 0%, #161622 0%, #000000 65%)',
        color: '#ffffff', fontFamily: 'system-ui, sans-serif', padding: '40px 20px', 
        display: 'flex', flexDirection: 'column', alignItems: 'center'
      }}>
        <div style={{ width: '100%', maxWidth: '1200px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '30px', borderBottom: '1px solid #222', paddingBottom: '20px' }}>
            <div>
              {/* FIXED: Now shows registered name, or 'Candidate' if loading */}
              <h1 style={{ fontSize: '32px', fontWeight: '800', margin: '0 0 8px 0' }}>{userData?.name || 'Candidate'}</h1>
              <p style={{ color: '#666', fontSize: '15px', margin: 0, fontWeight: '600', textTransform: 'uppercase' }}>SDE Candidate Profile</p>
            </div>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setActiveView('home')} style={{ background: '#fff', color: '#000', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'opacity 0.2s' }} onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'} onMouseOut={(e) => e.currentTarget.style.opacity = '1'}>
                <ArrowLeft size={16} /> Back to Home
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '24px' }}>
            <div style={{ background: 'rgba(12, 12, 16, 0.8)', border: '1px solid #1c1c24', borderRadius: '16px', padding: '24px' }}>
              <RatingGraph history={interviewSessions} />
            </div>
            <div style={{ background: 'rgba(12, 12, 16, 0.8)', border: '1px solid #1c1c24', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ flex: 1 }}>
                <RecentContests history={interviewSessions} />
              </div>
            </div>
          </div>
          
          {/* SAFETY WRAPPER FOR HEATMAP */}
          {interviewSessions && interviewSessions.length > 0 && (
            <div style={{ width: '100%' }}>
              <InterviewHeatmap history={interviewSessions} />
            </div>
          )}

        </div>
      </div>
    );
  }

  // =======================================================================
  // VIEW 2: GLOWING HOME UI
  // =======================================================================
  return (
    <div style={{
      minHeight: '100vh', backgroundColor: '#050505', color: '#ffffff', 
      backgroundImage: `url('/bg-glow.jpg')`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat',
      fontFamily: 'system-ui, sans-serif', display: 'flex', flexDirection: 'column'
    }}>
      
      {/* UPDATED NAVBAR WITH SIGN OUT BUTTON */}
      <nav style={{ padding: '24px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 10 }}>
{/* Replace your current <h2>AlgoTrack</h2> with this code: */}
<div style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '-0.5px' }}>
  <span style={{ color: '#ffffff' }}>Mock</span>
  <span style={{ 
    background: 'linear-gradient(to right, #60a5fa, #a855f7)', 
    WebkitBackgroundClip: 'text', 
    WebkitTextFillColor: 'transparent' 
  }}>Node</span>
</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          
          {/* Profile Button */}
<button 
  onClick={() => setActiveView('profile')} 
  style={{ 
    background: 'rgba(255, 255, 255, 0.05)', 
    border: '1px solid rgba(255, 255, 255, 0.1)', 
    color: '#ffffff', 
    padding: '8px 18px', 
    borderRadius: '20px', 
    cursor: 'pointer', 
    display: 'flex', 
    alignItems: 'center', 
    gap: '8px', 
    backdropFilter: 'blur(10px)', 
    fontWeight: '600', 
    fontSize: '14px',
    transition: 'all 0.3s ease' 
  }}
  onMouseOver={(e) => {
    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
    e.currentTarget.style.borderColor = 'rgba(96, 165, 250, 0.5)'; // Subtle blue border tint
    e.currentTarget.style.boxShadow = '0 0 15px rgba(96, 165, 250, 0.2)'; // Soft glow
  }}
  onMouseOut={(e) => {
    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
    e.currentTarget.style.boxShadow = 'none';
  }}
>
  <User size={16} /> 
  {userData?.name ? userData.name.split(' ')[0] : 'Profile'}
</button>

          {/* New Sign Out Button */}
          <button 
            onClick={handleSignOut}
            style={{ background: 'transparent', border: '1px solid #333333', color: '#a1a1aa', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', transition: 'all 0.2s ease' }}
            onMouseOver={(e) => {
              e.currentTarget.style.color = '#ef4444';
              e.currentTarget.style.borderColor = '#ef4444';
              e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.color = '#a1a1aa';
              e.currentTarget.style.borderColor = '#333333';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <LogOut size={16} /> Sign Out
          </button>

        </div>
      </nav>
      
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 20px', marginTop: '-60px', position: 'relative', zIndex: 5 }}>

        <h1 style={{ fontSize: '56px', fontWeight: '800', maxWidth: '850px', marginBottom: '24px', textShadow: '0 8px 32px rgba(0,0,0,0.8)' }}>
          Ace your next technical round<br />with AI-powered mock interviews
        </h1>
        <p style={{ fontSize: '20px', color: '#d1d5db', maxWidth: '650px', marginBottom: '40px', textShadow: '0 4px 12px rgba(0,0,0,0.8)' }}>
          Practice real-world challenges, get AI-driven feedback, and boost your confidence.
        </p>

        <div style={{ minHeight: '120px', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
          {activeView === 'home' ? (
            <div style={{ display: 'flex', gap: '16px' }}>
              
              {/* FIXED MOCK INTERVIEW BUTTON */}
              <button 
                onClick={() => navigate('/resume')} 
                style={{ background: '#10b981', color: '#fff', border: '1px solid #059669', padding: '16px 36px', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 24px rgba(16, 185, 129, 0.4)', transition: 'transform 0.1s' }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                Mock Interview
              </button>

              <button 
                onClick={() => setActiveView('dsa-form')} 
                style={{ background: 'rgba(255, 255, 255, 0.05)', color: '#fff', border: '1px solid rgba(255, 255, 255, 0.15)', padding: '16px 36px', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', backdropFilter: 'blur(12px)', transition: 'background 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
              >
                <Code2 size={20} /> DSA Tracker
              </button>
            </div>
          ) : (
            <div style={{ width: '100%', maxWidth: '400px' }}>
              <button onClick={() => setActiveView('home')} style={{ background: 'transparent', border: 'none', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px', fontWeight: '600', cursor: 'pointer', transition: 'color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.color = '#fff'} onMouseOut={(e) => e.currentTarget.style.color = '#9ca3af'}>
                <ArrowLeft size={16} /> Back
              </button>
              <form onSubmit={handleConnectIDs} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {syncError && <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#fca5a5', padding: '12px', borderRadius: '8px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}><AlertCircle size={16} /> {syncError}</div>}
                <div style={{ display: 'flex', gap: '12px' }}>
                  <input type="text" placeholder="LeetCode ID" required value={leetcodeId} onChange={(e) => setLeetcodeId(e.target.value)} style={{ flex: 1, padding: '14px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: '#fff', outline: 'none' }} onFocus={(e) => e.target.style.borderColor = '#10b981'} onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.2)'} />
                  <input type="text" placeholder="Codeforces ID" required value={codeforcesId} onChange={(e) => setCodeforcesId(e.target.value)} style={{ flex: 1, padding: '14px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: '#fff', outline: 'none' }} onFocus={(e) => e.target.style.borderColor = '#10b981'} onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.2)'} />
                </div>
                <button type="submit" disabled={isConnecting} style={{ background: '#fff', color: '#000', padding: '14px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', border: 'none', transition: 'background 0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = '#e5e7eb'} onMouseOut={(e) => e.currentTarget.style.background = '#fff'}>
                  {isConnecting ? 'Scraping Data...' : <><Zap size={18} /> Sync Profiles</>}
                </button>
              </form>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '60px', background: 'rgba(0,0,0,0.4)', padding: '12px 24px', borderRadius: '50px', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex' }}>
             <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#3b82f6', border: '2px solid #111', zIndex: 3 }} />
             <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#ef4444', border: '2px solid #111', marginLeft: '-12px', zIndex: 2 }} />
             <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#10b981', border: '2px solid #111', marginLeft: '-12px', zIndex: 1 }} />
          </div>
          <span style={{ color: '#d1d5db', fontSize: '15px', fontWeight: '500' }}>
            Don't just prepare for the interview <span style={{ color: '#a855f7', fontWeight: '700' }}>Master it.</span> Your streak starts with this session.
          </span>
        </div>
      </div>
    </div>
  );
}