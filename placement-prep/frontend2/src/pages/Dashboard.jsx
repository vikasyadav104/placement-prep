import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, Map, Code, ChevronRight, Zap, UploadCloud, History, Target, TrendingDown, Activity, CheckCircle2, Lock, AlertCircle } from 'lucide-react';
import RatingGraph from '../components/RatingGraph';
import api from '../services/api';
import RecentContests from '../components/RecentContests';

export default function Dashboard() {
  const navigate = useNavigate();
  
  // --- STATE MANAGEMENT ---
  const [hasResume, setHasResume] = useState(false); 
  const [leetcodeId, setLeetcodeId] = useState('');
  const [codeforcesId, setCodeforcesId] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [syncError, setSyncError] = useState('');
  const [isSynced, setIsSynced] = useState(false);

  const handleConnectIDs = async (e) => {
    e.preventDefault();
    setIsConnecting(true);
    setSyncError(''); 
    
    try {
      const response = await api.post('/user/sync-profiles', { leetcodeId, codeforcesId });
      
      // BULLETPROOF CHECK: Manually force an error if the status isn't 200 OK
      if (response.status && response.status !== 200) {
        throw new Error(response.data?.message || 'Verification failed.');
      }
      
      // If we made it here, the backend CONFIRMED the IDs are real.
      setIsSynced(true);
      alert('Success! Telemetry Link Established.');
      
    } catch (error) {
      console.error("🔥 Sync Failed:", error);
      
      // Extract the exact error message from the backend (or fallback to a default message)
      const errorMessage = error.response?.data?.message || error.message || 'Verification failed. Please check your IDs.';
      
      setSyncError(errorMessage);
      setIsSynced(false); // STRICTLY lock the roadmap!
    } finally {
      setIsConnecting(false);
    }
  };
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/user/profile'); 
        setUserData(response.data);
      } catch (error) {
        console.error("Failed to load profile", error);
      }
    };
    fetchProfile();
  }, []);

  return (
    <div style={{
      minHeight: '100vh', backgroundColor: '#000000',
      backgroundImage: 'radial-gradient(circle at 50% 0%, #161622 0%, #000000 65%)',
      color: '#ffffff', fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center'
    }}>
      <div style={{ width: '100%', maxWidth: '1200px' }}>
        
        {/* --- HEADER --- */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '25px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: '800', margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>
             Vikas Yadav
            </h1>
            <p style={{ color: '#666', fontSize: '15px', margin: 0, fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>
              SDE Candidate Profile
            </p>
          </div>
        </div>

        {/* --- TOP ROW: GRAPH & HISTORY --- */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '24px', animation: 'fadeIn 0.5s ease-out' }}>
       <div style={{ marginTop: '40px', maxWidth: '800px' }}>
        <RatingGraph history={userData?.interviewHistory} />
      </div>

          <div className="glass-card" style={{ ...glassStyle, padding: '20px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
    
    {/* Left Side: Your Rating Graph */}

    {/* Right Side: Your NEW Dynamic Recent Contests List */}
    <div style={{ flex: 1 }}>
      <RecentContests history={userData?.interviewHistory} />
    </div>
    
  </div>
          </div>
        </div>

        {/* --- MIDDLE ROW: THE RESUME BANNER --- */}
        <div style={{ animation: 'fadeIn 0.6s ease-out', marginBottom: '24px' }}>
          {!hasResume ? (
            <div style={{ ...premiumVaultStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '30px 40px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: '16px', borderRadius: '14px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                  <UploadCloud size={32} color="#3b82f6" />
                </div>
                <div style={{ textAlign: 'left' }}>
                  <h2 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '6px' }}>Initialize AI Sandbox</h2>
                  <p style={{ color: '#999', fontSize: '14px', margin: 0, maxWidth: '500px', lineHeight: '1.5' }}>
                    Upload your resume to map your tech stack. The AI will parse your projects and generate ranked technical questions to test your limits.
                  </p>
                </div>
              </div>
              <button onClick={() => navigate('/resume')} style={{ ...primaryBtn, backgroundColor: '#3b82f6', color: '#fff', padding: '14px 28px', whiteSpace: 'nowrap' }}>
                Upload PDF Resume <ChevronRight size={18} />
              </button>
            </div>
          ) : (
            <div style={{ ...premiumVaultStyle, borderColor: '#86efac', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '30px 40px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                <div style={{ backgroundColor: 'rgba(134, 239, 172, 0.1)', padding: '16px', borderRadius: '14px', border: '1px solid rgba(134, 239, 172, 0.2)' }}>
                  <Video size={32} color="#86efac" />
                </div>
                <div style={{ textAlign: 'left' }}>
                  <h2 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '6px' }}>Crucible Ready</h2>
                  <p style={{ color: '#aaa', fontSize: '14px', margin: 0, maxWidth: '500px', lineHeight: '1.5' }}>
                    Your parameters are loaded. Start a ranked interview to update your MMR and calibrate your communication skills.
                  </p>
                </div>
              </div>
<button onClick={() => navigate('/interview/active')} style={{ ...primaryBtn, padding: '14px 28px', whiteSpace: 'nowrap' }}>
  Start Ranked Interview <ChevronRight size={18} />
</button>
            </div>
          )}
        </div>

        {/* --- BOTTOM ROW: DSA & ROADMAP ENGINE --- */}
        <div className="glass-card" style={{ ...glassStyle, padding: '30px', animation: 'fadeIn 0.7s ease-out' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '25px' }}>
            <div style={{ backgroundColor: 'rgba(134, 239, 172, 0.1)', padding: '8px', borderRadius: '8px' }}>
              <Code size={20} color="#86efac" />
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>Algorithmic Analytics & Routing</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
            
            {/* Left Side: Profile Sync & Telemetry */}
            <div>
              <p style={{ color: '#888', fontSize: '14px', lineHeight: '1.5', marginBottom: '20px' }}>
                Sync your profiles. The engine will scrape your recent Interviews ratings, successful problem resolutions, and failed optimization attempts to build your telemetry profile.
              </p>

              {/* CONDITIONAL UI: Form vs Synced State */}
              {!isSynced ? (
                <form onSubmit={handleConnectIDs} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '25px' }}>
                  
                  {/* NEW: THE VISUAL ERROR RENDERER */}
                  {syncError && (
                    <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#fca5a5', padding: '12px', borderRadius: '8px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <AlertCircle size={16} /> {syncError}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <input type="text" placeholder="LeetCode ID" required value={leetcodeId} onChange={(e) => setLeetcodeId(e.target.value)} style={inputStyle} />
                    <input type="text" placeholder="Codeforces ID" required value={codeforcesId} onChange={(e) => setCodeforcesId(e.target.value)} style={inputStyle} />
                  </div>
                  <button type="submit" disabled={isConnecting} style={{
                    ...secondaryBtn, backgroundColor: isConnecting ? '#222' : 'rgba(255, 255, 255, 0.05)', color: isConnecting ? '#666' : '#fff'
                  }}>
                    {isConnecting ? 'Analyzing Telemetry...' : 'Sync Active Profiles'} <Zap size={14} />
                  </button>
                </form>
              ) : (
                <div style={{ backgroundColor: 'rgba(34, 197, 94, 0.05)', border: '1px solid rgba(34, 197, 94, 0.2)', borderRadius: '12px', padding: '16px', marginBottom: '25px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#22c55e', fontWeight: '700', marginBottom: '12px' }}>
                    <CheckCircle2 size={18} /> Telemetry Link Established
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div style={{ backgroundColor: 'rgba(0,0,0,0.5)', padding: '10px', borderRadius: '8px' }}>
                      <div style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase' }}>LeetCode</div>
                      <div style={{ fontSize: '14px', color: '#fff', fontWeight: '600' }}>{leetcodeId}</div>
                    </div>
                    <div style={{ backgroundColor: 'rgba(0,0,0,0.5)', padding: '10px', borderRadius: '8px' }}>
                      <div style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase' }}>Codeforces</div>
                      <div style={{ fontSize: '14px', color: '#fff', fontWeight: '600' }}>{codeforcesId}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Mini mock stats */}
              <div style={{ display: 'flex', gap: '15px', opacity: isSynced ? 1 : 0.4, transition: 'opacity 0.3s' }}>
                <StatBadge icon={<TrendingDown size={14} color="#ef4444" />} label="Recent TLEs" value={isSynced ? "12" : "--"} />
                <StatBadge icon={<Activity size={14} color="#3b82f6" />} label="Avg Rating" value={isSynced ? "1420" : "----"} />
              </div>
            </div>

            {/* Right Side: Dynamic Roadmap Generation */}
            <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '24px', borderRadius: '12px', border: '1px solid #222', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <Target size={20} color={isSynced ? "#a855f7" : "#555"} />
                <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0, color: isSynced ? '#fff' : '#666' }}>Dynamic Progression Track</h3>
              </div>
              <p style={{ color: isSynced ? '#aaa' : '#555', fontSize: '14px', lineHeight: '1.6', marginBottom: '20px', transition: 'color 0.3s' }}>
                Based on your synced telemetry, the AI will isolate your weakest patterns and generate a multi-week study roadmap to repair your logic gaps.
              </p>
              
              <button 
                onClick={() => navigate('/roadmap')}
                disabled={!isSynced}
                style={{ 
                  ...primaryBtn, 
                  backgroundColor: isSynced ? '#ffffff' : 'rgba(255,255,255,0.05)', 
                  color: isSynced ? '#000000' : '#444', 
                  width: '100%', 
                  justifyContent: 'center', 
                  padding: '14px',
                  cursor: isSynced ? 'pointer' : 'not-allowed',
                  boxShadow: isSynced ? '0 4px 12px rgba(255, 255, 255, 0.1)' : 'none',
                  border: isSynced ? 'none' : '1px solid #333'
                }}
              >
                {isSynced ? 'Generate AI Roadmap' : 'Locked: Sync Profiles First'}
                {isSynced ? <Map size={18} style={{ marginLeft: '4px' }} /> : <Lock size={16} style={{ marginLeft: '4px' }} />}
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

// Sub-components
const StatBadge = ({ icon, label, value }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(0,0,0,0.5)', padding: '8px 12px', borderRadius: '6px', border: '1px solid #222' }}>
    {icon}
    <span style={{ fontSize: '12px', color: '#888' }}>{label}:</span>
    <span style={{ fontSize: '13px', fontWeight: '700', color: '#fff' }}>{value}</span>
  </div>
);

const HistoryRow = ({ session, score, delta, color, date }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', backgroundColor: 'rgba(0,0,0,0.4)', border: '1px solid #222', borderRadius: '8px' }}>
    <div>
      <div style={{ fontSize: '14px', fontWeight: '600' }}>Session #{session}</div>
      <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>{date}</div>
    </div>
    <div style={{ textAlign: 'right' }}>
      <div style={{ fontSize: '15px', fontWeight: '800' }}>{score}/100</div>
      <div style={{ fontSize: '12px', fontWeight: '700', color: delta.startsWith('+') ? '#22c55e' : '#ef4444' }}>
        {delta}
      </div>
    </div>
  </div>
);

// CSS Objects
const glassStyle = { backgroundColor: 'rgba(12, 12, 16, 0.8)', border: '1px solid #1c1c24', borderRadius: '16px', backdropFilter: 'blur(12px)' };

const premiumVaultStyle = { position: 'relative', overflow: 'hidden', backgroundColor: 'rgba(10, 10, 15, 0.9)', border: '1px solid #222', borderRadius: '16px' };

const inputStyle = { width: '100%', padding: '12px 14px', backgroundColor: 'rgba(0,0,0,0.4)', border: '1px solid #222', borderRadius: '8px', color: '#fff', fontSize: '13px', outline: 'none' };
const primaryBtn = { borderRadius: '8px', fontSize: '15px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s' };
const secondaryBtn = { width: '100%', padding: '12px', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', cursor: 'pointer', transition: 'all 0.2s' };