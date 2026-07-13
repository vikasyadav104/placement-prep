import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Activity } from 'lucide-react';

export default function RatingGraph({ history = [] }) {
  // If no history, show a placeholder
  if (!history || history.length === 0) {
    return (
      <div style={{ padding: '40px', background: '#0a0a0f', borderRadius: '16px', border: '1px solid #222', textAlign: 'center' }}>
        <Activity size={48} color="#3b82f6" style={{ margin: '0 auto 16px', opacity: 0.5 }} />
        <h3 style={{ color: '#fff', fontSize: '20px', marginBottom: '8px' }}>No Rating Data Yet</h3>
        <p style={{ color: '#888' }}>Take your first mock interview to establish your baseline ai rating!</p>
      </div>
    );
  }

  // Format the data for the chart, starting with the 1200 baseline
  const chartData = [
    { name: 'Start', rating: 1200 }, // Baseline point
    ...history.map((session, index) => ({
      name: `Int ${index + 1}`,
      rating: session.newRating,
      score: session.score,
      change: session.ratingChange,
      date: new Date(session.date).toLocaleDateString()
    }))
  ];

  // Custom Tooltip when you hover over a point on the graph
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div style={{ background: '#111', border: '1px solid #333', padding: '12px', borderRadius: '8px', color: '#fff' }}>
          <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', color: '#888' }}>{data.name} {data.date ? `(${data.date})` : ''}</p>
          <p style={{ margin: '0 0 4px 0', fontSize: '18px', color: '#a855f7' }}>Rating: {data.rating}</p>
          {data.change !== undefined && (
            <p style={{ margin: 0, color: data.change >= 0 ? '#86efac' : '#ef4444', fontSize: '14px' }}>
              {data.change >= 0 ? '+' : ''}{data.change} points (Score: {data.score}/10)
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ background: '#0a0a0f', padding: '24px', borderRadius: '16px', border: '1px solid #222' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
        <TrendingUp size={24} color="#a855f7" />
        <h2 style={{ margin: 0, color: '#fff', fontSize: '20px' }}>Interview Rating Progress</h2>
      </div>
      
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
            <XAxis dataKey="name" stroke="#666" tick={{ fill: '#666' }} />
            <YAxis 
              domain={['dataMin - 50', 'dataMax + 50']} 
              stroke="#666" 
              tick={{ fill: '#666' }} 
              width={60}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="rating" 
              stroke="#a855f7" 
              strokeWidth={3} 
              dot={{ r: 5, fill: '#0a0a0f', stroke: '#a855f7', strokeWidth: 2 }}
              activeDot={{ r: 8, fill: '#a855f7' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}