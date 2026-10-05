import React from 'react';
import { AlertCircle, Cpu, Sliders, Database, Shield } from 'lucide-react';

const RiskIndicator = ({ signals }) => {
  if (!signals) return null;

  const channels = [
    { key: 'ai_generation', label: 'AI Generation Signal', icon: Cpu, data: signals.ai_generation },
    { key: 'manipulation', label: 'Manipulation / Splicing', icon: Sliders, data: signals.manipulation },
    { key: 'metadata', label: 'Metadata Inconsistency', icon: Database, data: signals.metadata },
    { key: 'provenance', label: 'Provenance Verification', icon: Shield, data: signals.provenance },
  ];

  const getColor = (score) => {
    if (score >= 0.7) return '#ef4444';
    if (score >= 0.45) return '#f59e0b';
    return '#10b981';
  };

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Signal Breakdown</h3>
        <span className="badge badge-neutral" style={{ fontSize: '0.75rem' }}>4 Forensic Vectors</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {channels.map((chan) => {
          const Icon = chan.icon;
          const score = chan.data?.score || 0;
          const pct = Math.round(score * 100);
          const barColor = getColor(score);

          return (
            <div key={chan.key} style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#e5e7eb' }}>
                  <Icon size={15} color="#9ca3af" />
                  <span style={{ fontWeight: 600 }}>{chan.label}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ fontWeight: 700, color: barColor }}>{pct}%</span>
                  <span className="badge badge-neutral" style={{ fontSize: '0.68rem', padding: '0.1rem 0.4rem' }}>
                    {chan.data?.confidence || 'Med'}
                  </span>
                </div>
              </div>

              <div style={{
                width: '100%',
                height: '7px',
                background: 'rgba(255, 255, 255, 0.08)',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${pct}%`,
                  height: '100%',
                  background: barColor,
                  borderRadius: '4px',
                  transition: 'width 0.5s ease'
                }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RiskIndicator;
