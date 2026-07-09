import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Map, Loader2, AlertCircle, ArrowLeft, Calendar, Target, CheckSquare, Zap, Code, Clock } from 'lucide-react';

const LOADING_STEPS = [
  "Cross-referencing interview weaknesses...",
  "Fetching LeetCode & Codeforces statistics...",
  "Identifying algorithmic knowledge gaps...",
  "Structuring week-by-week curriculum...",
  "Roadmap Calibrated!"
];

export default function Roadmap() {
  const navigate = useNavigate();
  
  // UI States: 'config' -> 'loading' -> 'roadmap'
  const [stage, setStage] = useState('config'); 
  const [error, setError] = useState('');
  
  // Form Data
  const [weeks, setWeeks] = useState(4);
  const [leetcodeId, setLeetcodeId] = useState('');
  const [codeforcesId, setCodeforcesId] = useState('');

  // Roadmap Data
  const [roadmap, setRoadmap] = useState(null);
  const [stepIndex, setStepIndex] = useState(0);

  const handleGenerate = async (e) => {
    e?.preventDefault();
    setStage('loading');
    setError('');

    try {
      // 1. Optional: Send the IDs to your backend to save them first
      if (leetcodeId || codeforcesId) {
        // await api.post('/user/update-coding-profiles', { leetcodeId, codeforcesId });
      }

      // 2. Generate the Roadmap (We pass 'weeks' so the backend knows how long to make it)
      const response = await api.post('/roadmap/generate', { weeks });
      setRoadmap(response.data.roadmap.content);
      
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to generate roadmap. Did you upload a resume first?');
      setStage('config');
    }
  };

  // --- THE "LABOR ILLUSION" TIMER FOR ROADMAP GENERATION ---
  useEffect(() => {
    if (stage !== 'loading') return;
    const timer = setInterval(() => {
      setStepIndex((prev) => {
        if (prev < LOADING_STEPS.length - 1) {
          return prev + 1;
        } else {
          clearInterval(timer);
          setTimeout(() => setStage('roadmap'), 800);
          return prev;
        }
      });
    }, 1500); // 1.5s per step to allow the backend API time to finish
    return () => clearInterval(timer);
  }, [stage]);

  return (
    <div style={{
      minHeight: '100vh', backgroundColor: '#000000',
      backgroundImage: 'radial-gradient(circle at 50% 0%, #1a1a24 0%, #000000 70%)',
      color: '#ffffff', fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center'
    }}>
      <div style={{ width: '100%', maxWidth: '1000px' }}>
        
        <button onClick={() => navigate('/dashboard')} style={{ background: 'transparent', border: 'none', color: '#888', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '30px', fontSize: '15px' }}>
          <ArrowLeft size={18} /> Back to Dashboard
        </button>

        {error && (
          <div style={{ backgroundColor: 'rgba(220, 38, 38, 0.1)', border: '1px solid #dc2626', color: '#fca5a5', padding: '15px', borderRadius: '8px', marginBottom: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            <AlertCircle size={18} /> {error}
          </div>
        )}

        {/* --- STAGE 1: THE CONFIGURATOR --- */}
        {stage === 'config' && (
          <div style={{ maxWidth: '600px', margin: '0 auto', animation: 'fadeIn 0.5s ease-out' }}>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(134, 239, 172, 0.1)', marginBottom: '20px' }}>
                <Map size={32} color="#86efac" />
              </div>
              <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '15px' }}>Configure Your Prep Plan</h1>
              <p style={{ color: '#888', fontSize: '16px', lineHeight: '1.6' }}>
                Link your coding profiles so the AI can prioritize algorithms you actually struggle with.
              </p>
            </div>

            <form onSubmit={handleGenerate} className="glass-card" style={glassStyle}>
              
              {/* Timeline Slider */}
              <div style={{ marginBottom: '30px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', fontWeight: '600', marginBottom: '15px' }}>
                  <Clock size={18} color="#86efac" /> Prep Timeline: {weeks} Weeks
                </label>
                <input 
                  type="range" min="1" max="12" value={weeks} 
                  onChange={(e) => setWeeks(e.target.value)}
                  style={{ width: '100%', cursor: 'pointer', accentColor: '#86efac' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666', fontSize: '12px', marginTop: '8px' }}>
                  <span>1 Week (Crash Course)</span>
                  <span>12 Weeks (Deep Dive)</span>
                </div>
              </div>

              {/* Coding Profiles */}
              <div style={{ marginBottom: '30px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', fontWeight: '600', marginBottom: '15px' }}>
                  <Code size={18} color="#86efac" /> Connect Coding Profiles (Optional)
                </label>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <input 
                    type="text" placeholder="LeetCode Username" value={leetcodeId} onChange={(e) => setLeetcodeId(e.target.value)}
                    style={inputStyle}
                  />
                  <input 
                    type="text" placeholder="Codeforces Handle" value={codeforcesId} onChange={(e) => setCodeforcesId(e.target.value)}
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <button type="submit" style={primaryBtn}>
                <Zap size={20} /> Generate AI Roadmap
              </button>
              
              <button 
                type="button" onClick={() => handleGenerate()} 
                style={{ width: '100%', background: 'transparent', border: 'none', color: '#666', marginTop: '15px', cursor: 'pointer', fontSize: '14px', textDecoration: 'underline' }}
              >
                Skip and generate basic roadmap
              </button>

            </form>
          </div>
        )}

        {/* --- STAGE 2: THE LOADING ILLUSION --- */}
        {stage === 'loading' && (
          <div style={{ textAlign: 'center', padding: '100px 20px', animation: 'fadeIn 0.5s ease-out' }}>
            <Loader2 size={64} color="#86efac" style={{ animation: 'spin 2s linear infinite', margin: '0 auto 30px auto' }} />
            <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '15px' }}>Compiling Curriculum</h2>
            <p style={{ color: stepIndex === LOADING_STEPS.length - 1 ? '#86efac' : '#888', fontSize: '18px', transition: 'color 0.3s' }}>
              {LOADING_STEPS[stepIndex]}
            </p>
            <div style={{ width: '100%', maxWidth: '400px', height: '4px', backgroundColor: '#222', borderRadius: '2px', margin: '40px auto 0 auto', overflow: 'hidden' }}>
              <div style={{ height: '100%', backgroundColor: '#86efac', transition: 'width 1.5s ease-in-out', width: `${((stepIndex + 1) / LOADING_STEPS.length) * 100}%` }} />
            </div>
          </div>
        )}

        {/* --- STAGE 3: THE ROADMAP UI --- */}
        {stage === 'roadmap' && roadmap && (
          <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <div style={{ textAlign: 'center', marginBottom: '50px' }}>
              <h1 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '15px' }}>Your Custom {weeks}-Week Prep Plan</h1>
              <p style={{ color: '#86efac', fontSize: '16px' }}>Calibrated to fix your interview weaknesses and algorithm gaps.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
              {Object.keys(roadmap).map((weekKey, index) => {
                const weekData = roadmap[weekKey];
                return (
                  <div key={weekKey} className="glass-card" style={glassStyle}>
                    
                    {/* Week Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', borderBottom: '1px solid #333', paddingBottom: '15px' }}>
                      <div>
                        <div style={{ color: '#86efac', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Calendar size={14} /> Week {index + 1}
                        </div>
                        <h2 style={{ fontSize: '22px', fontWeight: '600', color: '#fff' }}>{weekData.theme}</h2>
                      </div>
                    </div>

                    {/* Focus Areas */}
                    <div style={{ marginBottom: '25px' }}>
                      <div style={{ color: '#888', fontSize: '14px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}><Target size={16} /> Focus Areas</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {weekData.focusAreas.map((area, i) => (
                          <span key={i} style={{ backgroundColor: 'rgba(134, 239, 172, 0.1)', color: '#86efac', border: '1px solid rgba(134, 239, 172, 0.2)', padding: '6px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: '500' }}>
                            {area}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Action Items */}
                    <div>
                      <div style={{ color: '#888', fontSize: '14px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}><CheckSquare size={16} /> Action Items</div>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {weekData.actionItems.map((item, i) => (
                          <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '15px', color: '#ddd', lineHeight: '1.5', backgroundColor: 'rgba(255, 255, 255, 0.02)', padding: '12px', borderRadius: '8px' }}>
                            <div style={{ minWidth: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#3b82f6', marginTop: '8px' }}></div>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
      
      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}

// Styles
const glassStyle = { backgroundColor: 'rgba(15, 15, 20, 0.8)', border: '1px solid #222', borderRadius: '16px', padding: '30px', backdropFilter: 'blur(10px)' };
const inputStyle = { width: '100%', padding: '14px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid #333', borderRadius: '8px', color: '#fff', fontSize: '15px', outline: 'none' };
const primaryBtn = { width: '100%', padding: '16px', backgroundColor: '#ffffff', color: '#000000', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '700', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', transition: 'transform 0.1s', boxShadow: '0 4px 14px 0 rgba(255, 255, 255, 0.1)' };