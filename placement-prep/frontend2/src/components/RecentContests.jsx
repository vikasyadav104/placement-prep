import React from 'react';
import { History } from 'lucide-react';

export default function RecentContests({ history = [] }) {
  // If no history, show a clean empty state
  if (!history || history.length === 0) {
    return (
      <div style={{ background: '#0a0a0f', padding: '24px', borderRadius: '16px', border: '1px solid #222', minWidth: '300px' }}>
        <h3 style={{ margin: '0 0 20px 0', color: '#fff', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <History size={18} color="#a855f7" /> Recent Contests
        </h3>
        <p style={{ color: '#888', textAlign: 'center', margin: '20px 0' }}>No Interviews completed yet.</p>
      </div>
    );
  }

  // Create a copy of the history array and reverse it so the newest interview is at the top
  const sortedHistory = [...history].reverse();
  const totalContests = history.length;

  return (
    <div style={{ background: '#0a0a0f', padding: '24px', borderRadius: '16px', border: '1px solid #222', minWidth: '300px', flex: 1 }}>
      
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ margin: 0, color: '#fff', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <History size={18} color="#a855f7" /> Recent Interviews
        </h3>
        <span style={{ color: '#3b82f6', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}>View All</span>
      </div>

      {/* Dynamic List Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {sortedHistory.slice(0, 5).map((session, index) => {
          // Calculate the exact session number (e.g., if you have 3 total, the top one is Session #03)
          const sessionNumber = totalContests - index;
          
          // Re-multiply by 10 for the UI display (since backend stores it out of 10)
          const displayScore = Math.round(session.score * 10);
          
          // Check if rating went up or down to set the color
          const isPositive = session.ratingChange >= 0;

          return (
            <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: '#11111a', borderRadius: '12px', border: '1px solid #222' }}>
              
              {/* Left Side: Session Name & Date */}
              <div>
                <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '15px', marginBottom: '4px' }}>
                  Session #{sessionNumber < 10 ? `0${sessionNumber}` : sessionNumber}
                </div>
                <div style={{ color: '#666', fontSize: '12px' }}>
                  {new Date(session.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              </div>

              {/* Right Side: Score & Rating Change */}
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: '#fff', fontWeight: '800', fontSize: '15px', marginBottom: '4px' }}>
                  {displayScore}/100
                </div>
                <div style={{ color: isPositive ? '#22c55e' : '#ef4444', fontSize: '13px', fontWeight: 'bold' }}>
                  {isPositive ? '+' : ''}{session.ratingChange}
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}