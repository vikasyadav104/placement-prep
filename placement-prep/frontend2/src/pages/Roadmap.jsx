import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Map, Loader2, ArrowLeft, Calendar, Target, CheckCircle2, Zap, Clock, Database, TrendingDown } from 'lucide-react';
import api from '../services/api';

const LOADING_STEPS = [
  "Analyzing C++ submission telemetry...",
  "Cross-referencing interview weaknesses...",
  "Identifying algorithmic knowledge gaps...",
  "Structuring week-by-week curriculum...",
  "Roadmap Calibrated!"
];

export default function Roadmap() {
  const navigate = useNavigate();
  
  const [stage, setStage] = useState('config'); 
  const [error, setError] = useState('');
  const [weeks, setWeeks] = useState(4);
  const [roadmap, setRoadmap] = useState(null);
  const [stepIndex, setStepIndex] = useState(0);

  const [telemetryData, setTelemetryData] = useState({
    totalSolved: 0,
    topicStats: []
  });

  useEffect(() => {
    const fetchRealData = async () => {
      try {
        const response = await api.get('/user/profile');
        const user = response.data.user;

        if (user) {
          const cfSolved = user.codeforcesStats?.totalSolved || 0;
          
          let lcSolved = 0;
          if (user.leetcodeStats?.difficultyCount) {
            const diff = user.leetcodeStats.difficultyCount;
            lcSolved = diff.All || ((diff.Easy || 0) + (diff.Medium || 0) + (diff.Hard || 0));
          }

          const combinedTopics = { ...user.leetcodeStats?.topicCount, ...user.codeforcesStats?.topicCount };
          const struggleTopics = user.codeforcesStats?.topicStruggleCount || {};

          // We map over EVERY SINGLE topic the backend sends us
          const realTopicStats = Object.keys(combinedTopics).map(topicName => {
            const solved = combinedTopics[topicName];
            const struggles = struggleTopics[topicName] || 0;
            
            let status = "Strong";
            if (struggles > 2 || solved < 5) status = "Critical Vulnerability";
            else if (struggles > 0 || solved < 15) status = "Moderate";

            return { name: topicName, solved, status };
          })
          .sort((a, b) => b.solved - a.solved); 

          // DEBUGGING: This will tell you exactly how many topics the backend found!
          console.log(`🔥 BACKEND SENT ${realTopicStats.length} TOTAL TOPICS:`, realTopicStats);

          setTelemetryData({
            totalSolved: cfSolved + lcSolved,
            topicStats: realTopicStats.length > 0 ? realTopicStats : [{ name: "Awaiting Data", solved: 0, status: "Unknown" }]
          });
        }
      } catch (error) {
        console.error("🔥 Failed to load real telemetry", error);
      }
    };

    fetchRealData();
  }, []);

  const generateDynamicRoadmap = (numWeeks) => {
    const generated = {};
    const themes = [
      "Dynamic Programming: 1D & 2D Matrices", "Advanced Sliding Window & Two Pointers", 
      "Graph Traversal & Shortest Path", "Trees, BSTs, & Tries", 
      "Backtracking & State Space Search", "Greedy Algorithms & Priority Queues", 
      "Bit Manipulation & Bitmasking", "Disjoint Set (Union-Find) Mastery",
      "Advanced Math & Number Theory", "System Design & Object Oriented Prep",
      "Segment Trees & Fenwick Trees", "Final Mock Interview Gauntlet"
    ];

    for (let i = 1; i <= numWeeks; i++) {
      generated[`week${i}`] = {
        theme: themes[(i - 1) % themes.length],
        focusAreas: ["Pattern Recognition", "Time/Space Optimization", "C++ STL Mastery"],
        actionItems: [
          `Solve 5 standard LeetCode Mediums focusing on ${themes[(i - 1) % themes.length].split(':')[0]}.`,
          "Review the top 3 highly-asked Codeforces variations for this pattern.",
          "Implement the core logic on a whiteboard before writing any C++ code.",
          "Complete a timed 45-minute mock assessment to test speed and accuracy."
        ]
      };
    }
    return generated;
  };

  const handleGenerate = async (e) => {
    e?.preventDefault();
    setStage('loading');
    setError('');
    try {
      setTimeout(() => {
        setRoadmap(generateDynamicRoadmap(Number(weeks)));
      }, 7500); 
    } catch (err) {
      setError('Failed to generate roadmap. Did you sync your profiles?');
      setStage('config');
    }
  };

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
    }, 1500); 
    return () => clearInterval(timer);
  }, [stage]);

  return (
    <div style={{
      minHeight: '100vh', backgroundColor: '#000000',
      backgroundImage: 'radial-gradient(circle at 50% 0%, #1a1a24 0%, #000000 70%)',
      color: '#ffffff', fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center'
    }}>
      <div style={{ width: '100%', maxWidth: '1100px' }}>
        
        <button onClick={() => navigate('/dashboard')} style={{ background: 'transparent', border: 'none', color: '#888', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '30px', fontSize: '15px', transition: 'color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.color = '#fff'} onMouseOut={(e) => e.currentTarget.style.color = '#888'}>
          <ArrowLeft size={18} /> Back to Command Center
        </button>

        {/* ========================================================= */}
        {/* THE VERTICALLY STACKED TELEMETRY UI */}
        {/* ========================================================= */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '40px', animation: 'fadeIn 0.5s ease-out' }}>
          
          {/* TOTAL SOLVED CARD - NOW AT THE VERY TOP */}
          <div style={{ ...glassStyle, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '40px' }}>
            <Database size={32} color="#3b82f6" style={{ marginBottom: '15px' }} />
            <div style={{ fontSize: '64px', fontWeight: '900', color: '#fff', lineHeight: '1', letterSpacing: '-2px' }}>
              {telemetryData.totalSolved}
            </div>
            <div style={{ fontSize: '14px', color: '#888', fontWeight: '700', marginTop: '12px', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
              Total Questions Solved
            </div>
          </div>

          {/* VULNERABILITY SCROLL BOX - NOW DIRECTLY BELOW IT */}
          <div style={{ ...glassStyle, padding: '30px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <TrendingDown size={22} color="#ef4444" />
              <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>Vulnerability Analysis (All Topics)</h3>
            </div>
            
            {/* The scrollable area, expanded to hold 3 columns if you have a lot of topics */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px',
              maxHeight: '300px', // Taller scroll area so you see more at once
              overflowY: 'auto', 
              paddingRight: '10px'
            }}>
              {telemetryData.topicStats.map((topic, i) => (
                <div key={i} style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid #222', borderRadius: '8px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: '600', color: '#eee' }}>{topic.name}</div>
                    <div style={{ fontSize: '12px', color: topic.status.includes('Critical') ? '#ef4444' : (topic.status === 'Strong' ? '#22c55e' : '#eab308'), marginTop: '6px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {topic.status}
                    </div>
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: '800', color: '#fff' }}>{topic.solved}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* --- STAGE 1: CONFIGURATION --- */}
        {stage === 'config' && (
          <div style={{ maxWidth: '600px', margin: '0 auto', animation: 'fadeIn 0.5s ease-out' }}>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '15px', letterSpacing: '-0.5px' }}>Generate Progression Track</h1>
              <p style={{ color: '#888', fontSize: '16px', lineHeight: '1.6' }}>
                The AI will parse your synced telemetry and build a custom curriculum to repair your algorithmic vulnerabilities.
              </p>
            </div>

            <form onSubmit={handleGenerate} className="glass-card" style={glassStyle}>
              <div style={{ marginBottom: '35px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', fontWeight: '700', marginBottom: '20px' }}>
                  <Clock size={18} color="#a855f7" /> Track Duration: {weeks} Weeks
                </label>
                <input 
                  type="range" min="1" max="12" value={weeks} 
                  onChange={(e) => setWeeks(e.target.value)}
                  style={{ width: '100%', cursor: 'pointer', accentColor: '#a855f7', height: '6px', borderRadius: '3px' }}
                />
              </div>

              <button type="submit" style={primaryBtn}>
                <Zap size={20} /> Initialize AI Analysis
              </button>
            </form>
          </div>
        )}

        {/* --- STAGE 2: LOADING --- */}
        {stage === 'loading' && (
          <div style={{ textAlign: 'center', padding: '60px 20px', animation: 'fadeIn 0.5s ease-out' }}>
            <Loader2 size={64} color="#a855f7" style={{ animation: 'spin 2s linear infinite', margin: '0 auto 30px auto' }} />
            <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '15px' }}>Processing Telemetry</h2>
            <p style={{ color: stepIndex === LOADING_STEPS.length - 1 ? '#a855f7' : '#888', fontSize: '16px', transition: 'color 0.3s', fontWeight: '500' }}>
              {LOADING_STEPS[stepIndex]}
            </p>
          </div>
        )}

        {/* --- STAGE 3: ROADMAP UI (Weeks Only Now) --- */}
        {stage === 'roadmap' && roadmap && (
          <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '30px', letterSpacing: '-0.5px', borderBottom: '1px solid #333', paddingBottom: '20px' }}>
              Your {weeks}-Week Execution Plan
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(480px, 1fr))', gap: '28px' }}>
              {Object.keys(roadmap).map((weekKey, index) => {
                const weekData = roadmap[weekKey];
                return (
                  <div key={weekKey} style={cardStyle} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                    
                    <div style={{ marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ color: '#a855f7', fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar size={14} /> Week {index + 1} Phase
                      </div>
                      <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#fff', margin: 0, lineHeight: '1.3' }}>{weekData.theme}</h2>
                    </div>

                    <div style={{ marginBottom: '30px' }}>
                      <div style={{ color: '#888', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}><Target size={14} /> Target Vectors</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        {weekData.focusAreas.map((area, i) => (
                          <span key={i} style={{ backgroundColor: 'rgba(168, 85, 247, 0.08)', color: '#d8b4fe', border: '1px solid rgba(168, 85, 247, 0.2)', padding: '8px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: '600' }}>
                            {area}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div style={{ color: '#888', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}><Zap size={14} /> Execution Protocol</div>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {weekData.actionItems.map((item, i) => (
                          <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', fontSize: '15px', color: '#ccc', lineHeight: '1.6', backgroundColor: 'rgba(0, 0, 0, 0.3)', padding: '16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.02)' }}>
                            <CheckCircle2 size={18} color="#3b82f6" style={{ marginTop: '2px', flexShrink: 0 }} />
                            <span>{item}</span>
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
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); border-radius: 10px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      `}</style>
    </div>
  );
}

// Styles
const glassStyle = { backgroundColor: 'rgba(15, 15, 20, 0.8)', border: '1px solid #222', borderRadius: '16px', backdropFilter: 'blur(10px)' };
const cardStyle = { ...glassStyle, padding: '32px', transition: 'transform 0.3s ease, border-color 0.3s ease', cursor: 'default' };
const primaryBtn = { width: '100%', padding: '16px', backgroundColor: '#ffffff', color: '#000000', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: '800', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', boxShadow: '0 4px 20px 0 rgba(255, 255, 255, 0.15)', transition: 'transform 0.1s' };