import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft, CheckCircle2, Calendar, Target, AlertTriangle } from 'lucide-react';
import api from '../services/api';

export default function InterviewRoadmap() {
  const { state } = useLocation();
  const navigate = useNavigate();
  
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // 1. Security Check: Did they actually come from an interview?
    if (!state?.interviewData) {
      navigate('/dashboard'); 
      return;
    }

    // 2. Fetch the AI Roadmap
    const generateActionPlan = async () => {
      try {
        const response = await api.post('/ai-interview/generate-from-interview', { 
          interviewData: state.interviewData,
          weeks: 4 // You can make this dynamic later if you want a slider
        });
        
        setRoadmap(response.data.roadmap);
        setLoading(false);
      } catch (err) {
        console.error("AI Generation Failed:", err);
        setError("The AI encountered an issue building your custom plan. Please try again.");
        setLoading(false);
      }
    };

    generateActionPlan();
  }, [state, navigate]);

  // --- UI: LOADING STATE ---
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#050505', color: '#fff' }}>
        <Loader2 size={64} color="#a855f7" style={{ animation: 'spin 2s linear infinite', marginBottom: '20px' }} />
        <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '10px' }}>Analyzing Weaknesses...</h2>
        <p style={{ color: '#888', fontSize: '16px' }}>Cross-referencing interview logic with your resume projects.</p>
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // --- UI: ERROR STATE ---
  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#050505', color: '#fff' }}>
        <AlertTriangle size={64} color="#ef4444" style={{ marginBottom: '20px' }} />
        <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '10px' }}>Generation Failed</h2>
        <p style={{ color: '#888', marginBottom: '24px' }}>{error}</p>
        <button onClick={() => navigate(-1)} style={{ padding: '12px 24px', background: '#3b82f6', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontWeight: '600' }}>
          Go Back
        </button>
      </div>
    );
  }

  // --- UI: SUCCESS STATE (THE ROADMAP) ---
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#050505', backgroundImage: 'radial-gradient(circle at 50% 0%, #11111a 0%, #050505 80%)', color: '#fff', padding: '60px 20px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* Navigation */}
        <button onClick={() => navigate(-1)} style={{ background: 'transparent', border: 'none', color: '#888', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '40px', fontSize: '15px', fontWeight: '600', transition: 'color 0.2s' }}>
          <ArrowLeft size={18} /> Back to Interview Summary
        </button>

        {/* Header Section */}
        <div style={{ textAlign: 'center', marginBottom: '60px', animation: 'fadeInDown 0.6s ease-out' }}>
          <h1 style={{ fontSize: '42px', fontWeight: '900', marginBottom: '16px', letterSpacing: '-1px', color: '#fff' }}>
            {roadmap?.title || "Targeted Recovery Plan"}
          </h1>
          <p style={{ fontSize: '18px', color: '#aaa', maxWidth: '700px', margin: '0 auto', lineHeight: '1.6' }}>
            {roadmap?.description || "A custom 4-week curriculum to fix your logic gaps and defend your resume projects."}
          </p>
        </div>

        {/* The Weeks Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(450px, 1fr))', gap: '24px' }}>
          {roadmap?.weeks?.map((week, index) => (
            <div key={index} style={{ backgroundColor: '#0a0a0f', border: '1px solid #222', borderRadius: '20px', padding: '32px', animation: 'fadeInUp 0.6s ease-out', animationFillMode: 'both', animationDelay: `${index * 0.1}s` }}>
              
              {/* Week Title & Theme */}
              <div style={{ marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ color: '#a855f7', fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={14} /> {week.weekTitle}
                </div>
                <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#fff', margin: 0, lineHeight: '1.3' }}>
                  {week.theme}
                </h2>
              </div>

              {/* Focus Areas (Tags) */}
              <div style={{ marginBottom: '30px' }}>
                <div style={{ color: '#888', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Target size={14} /> Focus Vectors
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {week.focusAreas?.map((area, i) => (
                    <span key={i} style={{ backgroundColor: 'rgba(168, 85, 247, 0.08)', color: '#d8b4fe', border: '1px solid rgba(168, 85, 247, 0.2)', padding: '8px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: '600' }}>
                      {area}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Items (Checklist) */}
              <div>
                <div style={{ color: '#888', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  Action Protocol
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {week.actionItems?.map((item, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', fontSize: '15px', color: '#ccc', lineHeight: '1.6', backgroundColor: 'rgba(0, 0, 0, 0.3)', padding: '16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.02)' }}>
                      <CheckCircle2 size={18} color="#3b82f6" style={{ marginTop: '2px', flexShrink: 0 }} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          ))}
        </div>

      </div>

      {/* Basic Animations */}
      <style>{`
        @keyframes fadeInDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}