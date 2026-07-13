import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Target, CheckCircle2, AlertTriangle, Zap } from 'lucide-react';
import { useEffect } from 'react';
import api from '../services/api';

export default function InterviewSummary() {
  const { state } = useLocation();
  const navigate = useNavigate();
  
  // Safely extract the session data returned from the backend
  const session = state?.session;

  // --- NEW: Save the score to update the Codeforces-style rating graph ---
  useEffect(() => {
    const saveInterviewRating = async () => {
      try {
        // Since your frontend score is out of 100, we divide by 10
        // so it perfectly matches the backend formula we just built.
        const normalizedScore = session.overallScore / 10;
        
        await api.post('/interview/save-score', { 
          finalScore: normalizedScore 
        });
        console.log("Codeforces rating updated automatically!");
      } catch (error) {
        console.error("Failed to update rating:", error);
      }
    };

    // Only run this if we have a valid session with a score
    if (session && session.overallScore !== undefined) {
      saveInterviewRating();
    }
  }, [session]); 
  // -----------------------------------------------------------------------

  if (!session) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#050505', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <AlertTriangle size={64} color="#ef4444" style={{ marginBottom: '20px' }} />
        <h2 style={{ fontSize: '24px', marginBottom: '10px' }}>No session data found.</h2>
        <p style={{ color: '#888', marginBottom: '30px' }}>It looks like you navigated here directly without taking an interview.</p>
        <button onClick={() => navigate('/dashboard')} style={{ padding: '12px 24px', background: '#3b82f6', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}>Return to Dashboard</button>
      </div>
    );
  }

  // Calculate color based on overall score
  const getScoreColor = (score) => {
    if (score >= 80) return '#86efac'; // Green
    if (score >= 60) return '#facc15'; // Yellow
    return '#ef4444'; // Red
  };

  const scoreColor = getScoreColor(session.overallScore);
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#050505', backgroundImage: 'radial-gradient(circle at 50% 0%, #11111a 0%, #050505 80%)', color: '#fff', padding: '60px 20px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        <button onClick={() => navigate('/dashboard')} style={{ background: 'transparent', border: 'none', color: '#888', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '40px', fontSize: '15px', fontWeight: '600', transition: 'color 0.2s' }} onMouseOver={(e) => e.target.style.color = '#fff'} onMouseOut={(e) => e.target.style.color = '#888'}>
          <ArrowLeft size={18} /> Back to Command Center
        </button>

        {/* HERO METRICS */}
        <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '50px', textAlign: 'center', marginBottom: '50px', backdropFilter: 'blur(10px)', animation: 'fadeInDown 0.6s ease-out' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '120px', height: '120px', borderRadius: '50%', backgroundColor: `${scoreColor}15`, border: `2px solid ${scoreColor}`, marginBottom: '24px', boxShadow: `0 0 40px ${scoreColor}40` }}>
            <span style={{ fontSize: '48px', fontWeight: '900', color: scoreColor }}>{session.overallScore}</span>
          </div>
          <h1 style={{ fontSize: '32px', margin: '0 0 16px 0', fontWeight: '800', letterSpacing: '-0.5px' }}>Interview Concluded</h1>
          <p style={{ fontSize: '18px', color: '#aaa', maxWidth: '700px', margin: '0 auto', lineHeight: '1.6' }}>
            {session.overallFeedback}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '30px' }}>
          <Target size={24} color="#3b82f6" />
          <h2 style={{ fontSize: '24px', fontWeight: '800', margin: 0 }}>Detailed Logic Analysis</h2>
        </div>
        
        {/* QUESTION BREAKDOWN LOOP */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          {session.detailedAnalysis.map((item, i) => (
            <div key={i} style={{ backgroundColor: '#0a0a0f', border: '1px solid #222', borderRadius: '20px', overflow: 'hidden', animation: 'fadeInUp 0.6s ease-out', animationFillMode: 'both', animationDelay: `${i * 0.1}s` }}>
              
              {/* Question Header */}
              <div style={{ backgroundColor: '#111116', padding: '24px 30px', borderBottom: '1px solid #222', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '18px', margin: 0, color: '#fff', lineHeight: '1.5', flex: 1, paddingRight: '20px' }}>
                  <span style={{ color: '#666', marginRight: '10px' }}>Q{i+1}.</span> {item.question}
                </h3>
                <div style={{ backgroundColor: getScoreColor(item.score) + '20', color: getScoreColor(item.score), padding: '8px 16px', borderRadius: '12px', fontWeight: '800', fontSize: '16px', border: `1px solid ${getScoreColor(item.score)}40` }}>
                  {item.score}/10
                </div>
              </div>

              <div style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                
                {/* User Answer Transcript */}
                <div>
                  <div style={{ fontSize: '12px', color: '#666', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '10px', fontWeight: '700' }}>Your Audio Transcript</div>
                  <div style={{ color: '#ccc', fontSize: '16px', lineHeight: '1.6', padding: '16px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '12px', borderLeft: '4px solid #444' }}>
                    "{item.userAnswer}"
                  </div>
                </div>

                {/* AI Comparison Grids */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  
                  {/* Critique */}
                  <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.15)', padding: '24px', borderRadius: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#ef4444', fontWeight: '700', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      <AlertTriangle size={18} /> AI Critique
                    </div>
                    <div style={{ color: '#ddd', fontSize: '15px', lineHeight: '1.6' }}>{item.critique}</div>
                  </div>

                  {/* Ideal Response */}
                  <div style={{ backgroundColor: 'rgba(134, 239, 172, 0.05)', border: '1px solid rgba(134, 239, 172, 0.15)', padding: '24px', borderRadius: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#86efac', fontWeight: '700', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      <CheckCircle2 size={18} /> Ideal Structure
                    </div>
                    <div style={{ color: '#ddd', fontSize: '15px', lineHeight: '1.6' }}>{item.idealResponse}</div>
                  </div>

                </div>
              </div>

            </div>
          ))}
        </div>

        {/* --- THE ROADMAP BRIDGE --- */}
        <div style={{ 
          marginTop: '60px', 
          backgroundColor: '#0a0a0f', 
          border: '1px solid #333', 
          borderRadius: '24px', 
          padding: '50px', 
          textAlign: 'center',
          animation: 'fadeInUp 0.8s ease-out'
        }}>
          <Zap size={48} color="#facc15" style={{ marginBottom: '20px' }} />
          <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '16px', color: '#fff' }}>Turn Weaknesses into Strengths</h2>
          <p style={{ color: '#aaa', fontSize: '16px', maxWidth: '600px', margin: '0 auto 30px auto', lineHeight: '1.6' }}>
            The AI has identified your knowledge gaps. Let's generate a customized, day-by-day study roadmap to target these specific areas before your real interview.
          </p>
          <button 
            onClick={() => navigate('/interview/roadmap', { state: { interviewData: session } })}
            style={{ 
              padding: '16px 32px', 
              backgroundColor: '#facc15', 
              color: '#000', 
              border: 'none', 
              borderRadius: '12px', 
              fontSize: '18px', 
              fontWeight: '700', 
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 10px 25px rgba(250, 204, 21, 0.15)'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 15px 35px rgba(250, 204, 21, 0.25)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 10px 25px rgba(250, 204, 21, 0.15)';
            }}
          >
            Generate My Action Plan
          </button>
        </div>

      </div>

      <style>{`
        @keyframes fadeInDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}