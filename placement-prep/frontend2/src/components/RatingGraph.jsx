import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Activity, Trophy } from 'lucide-react';

export default function RatingGraph({ history = [] }) {
  if (!history || history.length === 0) {
    return (
      <div style={{ padding: '40px', background: '#0a0a0f', borderRadius: '16px', border: '1px solid #222', textAlign: 'center' }}>
        <Activity size={48} color="#3b82f6" style={{ margin: '0 auto 16px', opacity: 0.5 }} />
        <h3 style={{ color: '#fff', fontSize: '20px', marginBottom: '8px' }}>No Rating Data Yet</h3>
        <p style={{ color: '#888' }}>Take your first mock interview to establish your baseline AI rating!</p>
      </div>
    );
  }

  // --- NEW: Calculate Current and Max Ratings ---
  // History is newest-first, so history[0] is the current score
  const currentRating = history[0]?.overallScore || 0;
  // Map through all scores and find the highest one
  const maxRating = Math.max(...history.map(session => session.overallScore || 0));

  // Format data for the chart (reversed for chronological Left-to-Right order)
  const chartData = [
    { name: 'Start', rating: 0 }, 
    ...[...history].reverse().map((session, index) => ({
      name: `Int ${index + 1}`,
      rating: session.overallScore || 0, 
      date: new Date(session.createdAt || Date.now()).toLocaleDateString()
    }))
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div style={{ background: '#111', border: '1px solid #333', padding: '12px', borderRadius: '8px', color: '#fff' }}>
          <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', color: '#888' }}>{data.name} {data.date ? `(${data.date})` : ''}</p>
          <p style={{ margin: '0 0 4px 0', fontSize: '18px', color: '#a855f7' }}>Score: {data.rating}/100</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ background: '#0a0a0f', padding: '24px', borderRadius: '16px', border: '1px solid #222' }}>
      
      {/* --- NEW: Upgraded Header with Stats --- */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TrendingUp size={24} color="#a855f7" />
          <h2 style={{ margin: 0, color: '#fff', fontSize: '20px' }}>Performance Tracker</h2>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          {/* Current Rating Badge */}
          <div style={{ background: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.3)', padding: '6px 14px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#d4d4d8', fontSize: '11px', fontWeight: '700', letterSpacing: '0.5px' }}>CURRENT</span>
            <span style={{ color: '#a855f7', fontSize: '18px', fontWeight: '800' }}>{currentRating}</span>
          </div>
          
          {/* Peak Rating Badge */}
          <div style={{ background: 'rgba(234, 179, 8, 0.1)', border: '1px solid rgba(234, 179, 8, 0.3)', padding: '6px 14px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Trophy size={14} color="#eab308" />
            <span style={{ color: '#d4d4d8', fontSize: '11px', fontWeight: '700', letterSpacing: '0.5px' }}>PEAK</span>
            <span style={{ color: '#eab308', fontSize: '18px', fontWeight: '800' }}>{maxRating}</span>
          </div>
        </div>

      </div>
      
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
            <XAxis dataKey="name" stroke="#666" tick={{ fill: '#666', fontSize: 12 }} />
            <YAxis domain={[0, 100]} stroke="#666" tick={{ fill: '#666', fontSize: 12 }} width={30} />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="rating" 
              stroke="#a855f7" 
              strokeWidth={3} 
              dot={{ r: 4, fill: '#0a0a0f', stroke: '#a855f7', strokeWidth: 2 }}
              activeDot={{ r: 7, fill: '#a855f7' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}