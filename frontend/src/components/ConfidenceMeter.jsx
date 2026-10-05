import React from 'react';
import { Gauge, HelpCircle, ShieldAlert, Sparkles, Activity } from 'lucide-react';

const ConfidenceMeter = ({ confidence, confidenceScore = 0.7, evidenceStrength, uncertainty }) => {
  const percent = Math.round(confidenceScore * 100);

  const getMeterColor = (val) => {
    if (val >= 75) return '#3b82f6';
    if (val >= 50) return '#f59e0b';
    return '#9ca3af';
  };

  const meterColor = getMeterColor(percent);

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Activity size={18} color="#60a5fa" />
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Analysis Confidence</h3>
        </div>
        <span className="badge badge-neutral" style={{ fontSize: '0.75rem' }}>
          Signal Reliability
        </span>
      </div>

      {/* Visual meter bar */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.85rem' }}>
          <span style={{ color: '#9ca3af' }}>Confidence Index</span>
          <span style={{ fontWeight: 700, color: meterColor }}>{confidence} ({percent}%)</span>
        </div>
        <div style={{
          width: '100%',
          height: '10px',
          background: 'rgba(255, 255, 255, 0.08)',
          borderRadius: '5px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${percent}%`,
            height: '100%',
            background: `linear-gradient(90deg, #2563eb, ${meterColor})`,
            borderRadius: '5px',
            transition: 'width 0.6s ease'
          }} />
        </div>
      </div>

      {/* Grid of Confidence Dimensions */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '0.75rem',
        paddingTop: '0.5rem',
        borderTop: '1px solid var(--border-subtle)'
      }}>
        <div style={{
          padding: '0.75rem',
          borderRadius: 'var(--radius-sm)',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--border-subtle)'
        }}>
          <div style={{ fontSize: '0.72rem', color: '#9ca3af', textTransform: 'uppercase' }}>Evidence Strength</div>
          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f3f4f6', marginTop: '0.2rem' }}>
            {evidenceStrength || 'Medium'}
          </div>
        </div>

        <div style={{
          padding: '0.75rem',
          borderRadius: 'var(--radius-sm)',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--border-subtle)'
        }}>
          <div style={{ fontSize: '0.72rem', color: '#9ca3af', textTransform: 'uppercase' }}>Uncertainty Rating</div>
          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: uncertainty === 'High' ? '#f87171' : (uncertainty === 'Moderate' ? '#fbbf24' : '#34d399'), marginTop: '0.2rem' }}>
            {uncertainty || 'Moderate'}
          </div>
        </div>
      </div>

      <p style={{ fontSize: '0.78rem', color: '#9ca3af', lineHeight: 1.4, margin: 0 }}>
        * Confidence represents statistical agreement among extracted heuristics, not absolute infallibility.
      </p>
    </div>
  );
};

export default ConfidenceMeter;
