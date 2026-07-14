import React from 'react';
import { History } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function RecentContests({ history = [] }) {
  const navigate = useNavigate();

  // Ensure history is a valid array
  const safeHistory = Array.isArray(history) ? history : [];

  return (
    <div style={{ background: '#0a0a0f', padding: '24px', borderRadius: '16px', border: '1px solid #222', display: 'flex', flexDirection: 'column', height: '100%' }}>
      
      {/* HEADER SECTION */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <History size={20} color="#a855f7" />
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#fff' }}>Recent Interviews</h3>
        </div>
        
        {/* FIX: View All button now routes safely */}

      </div>

      {/* 
        SCROLLABLE CONTAINER 
        maxHeight: '260px' perfectly fits about 3 items. 
        overflowY: 'auto' lets you scroll down for the rest!
      */}
{/* 
        SCROLLABLE CONTAINER 
      */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '12px', 
        overflowY: 'auto', 
        maxHeight: '350px', // <-- CHANGED FROM 260px to 350px
        paddingRight: '8px' 
      }}>
        {safeHistory.length === 0 ? (
          <p style={{ color: '#555', textAlign: 'center', marginTop: '20px', fontSize: '14px' }}>No interviews taken yet.</p>
        ) : (
          safeHistory.map((session, index) => {
            
            // 1. ROBUST SCORE FIX (Catches all possible backend names to avoid NaN)
            const score = Number(session.overallScore) || Number(session.score) || Number(session.totalScore) || 0;
            
            // 2. ROBUST DATE FIX (Avoids Invalid Date)
            let dateString = "Unknown Date";
            if (session.createdAt || session.date) {
              const d = new Date(session.createdAt || session.date);
              if (!isNaN(d.getTime())) { // Check if it successfully parsed
                dateString = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
              }
            }

            // 3. Dynamic Session Numbering (Assuming newest is at index 0)
            const sessionNumber = safeHistory.length - index;
            const formattedNumber = sessionNumber < 10 ? `0${sessionNumber}` : sessionNumber;

            return (
              <div 
                key={index} 
                style={{ 
                  background: 'rgba(255,255,255,0.03)', 
                  border: '1px solid rgba(255,255,255,0.08)', 
                  borderRadius: '12px', 
                  padding: '16px', 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  transition: 'background 0.2s ease',
                }}
              >
                <div>
                  <h4 style={{ margin: '0 0 4px 0', color: '#fff', fontSize: '15px', fontWeight: '700' }}>
                    Session #{formattedNumber}
                  </h4>
                  <p style={{ margin: 0, color: '#666', fontSize: '12px' }}>
                    {dateString}
                  </p>
                </div>
                <div style={{ color: '#fff', fontWeight: '800', fontSize: '16px' }}>
                  {score}/100
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}