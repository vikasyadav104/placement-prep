import React from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import { Tooltip } from 'react-tooltip';
import 'react-calendar-heatmap/dist/styles.css';

export default function InterviewHeatmap({ history = [] }) {
  // 1. Calculate Date Range (Past 1 Year)
  const today = new Date();
  const shiftDate = (date, numDays) => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + numDays);
    return newDate;
  };
  const startDate = shiftDate(today, -365);

  // 2. Process Backend Data into { date: 'YYYY-MM-DD', count: X }
  const getHeatmapData = () => {
    const dateCounts = {};
    
    history.forEach(session => {
      // Extract just the YYYY-MM-DD part of the date
      const dateStr = new Date(session.createdAt || session.date || Date.now()).toISOString().split('T')[0];
      dateCounts[dateStr] = (dateCounts[dateStr] || 0) + 1;
    });

    return Object.keys(dateCounts).map(date => ({
      date: date,
      count: dateCounts[date]
    }));
  };

  const values = getHeatmapData();

  return (
    <div style={{ padding: '24px', background: 'rgba(12, 12, 16, 0.8)', border: '1px solid #1c1c24', borderRadius: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <h3 style={{ margin: 0, color: '#fff', fontSize: '18px', fontWeight: '700' }}>Consistency Tracker</h3>
        <span style={{ color: '#888', fontSize: '14px' }}>{history.length} sessions in the past year</span>
      </div>

      <div style={{ width: '100%', overflowX: 'auto' }}>
        <div style={{ minWidth: '700px' }}> {/* Ensures it doesn't crush on small screens */}
          <CalendarHeatmap
            startDate={startDate}
            endDate={today}
            values={values}
            classForValue={(value) => {
              if (!value || value.count === 0) return 'color-empty';
              // Cap the color intensity at 4 interviews per day
              return `color-scale-${Math.min(value.count, 4)}`;
            }}
            tooltipDataAttrs={(value) => {
              if (!value || !value.date) return { 'data-tooltip-content': 'No interviews' };
              return { 'data-tooltip-content': `${value.count} interviews on ${value.date}` };
            }}
          />
          <Tooltip id="heatmap-tooltip" />
        </div>
      </div>

      {/* --- CSS overrides for the Dark Theme & Green Colors --- */}
      <style>{`
        .react-calendar-heatmap text {
          font-size: 10px;
          fill: #888;
        }
        .react-calendar-heatmap .color-empty { fill: #1f2937; } /* Dark gray for 0 */
        .react-calendar-heatmap .color-scale-1 { fill: #064e3b; } /* Darkest green */
        .react-calendar-heatmap .color-scale-2 { fill: #047857; }
        .react-calendar-heatmap .color-scale-3 { fill: #10b981; }
        .react-calendar-heatmap .color-scale-4 { fill: #34d399; } /* Brightest green */
        
        .react-calendar-heatmap rect:hover {
          stroke: #fff;
          stroke-width: 1px;
        }
      `}</style>
    </div>
  );
}