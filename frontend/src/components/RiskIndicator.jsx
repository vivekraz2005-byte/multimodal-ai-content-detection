import React from 'react';
import { Cpu, Sliders, Database, Shield } from 'lucide-react';

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
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, letterSpacing: '-0.01em' }}>Signal Breakdown</h3>
        <span className="badge badge-neutral" style={{ fontSize: '0.72rem', background: 'rgba(255, 255, 255, 0.05)' }}>4 Forensic Vectors</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
        {channels.map((chan) => {
          const Icon = chan.icon;
          const score = chan.data?.score || 0;
          const pct = Math.round(score * 100);
          const barColor = getColor(score);

          return (
            <div key={chan.key} style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.88rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f3f4f6' }}>
                  <div style={{
                    padding: '5px',
                    borderRadius: '6px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid var(--border-subtle)'
                  }}>
                    <Icon size={14} color="#94a3b8" />
                  </div>
                  <span style={{ fontWeight: 600 }}>{chan.label}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontWeight: 700, color: barColor, fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}>{pct}%</span>
                  <span className="badge badge-neutral" style={{ fontSize: '0.68rem', padding: '0.12rem 0.45rem', textTransform: 'uppercase' }}>
                    {chan.data?.confidence || 'Med'}
                  </span>
                </div>
              </div>

              <div style={{
                width: '100%',
                height: '8px',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '999px',
                overflow: 'hidden',
                boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.5)',
                border: '1px solid rgba(255, 255, 255, 0.03)'
              }}>
                <div style={{
                  width: `${pct}%`,
                  height: '100%',
                  background: `linear-gradient(90deg, ${barColor}aa, ${barColor})`,
                  borderRadius: '999px',
                  transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: `0 0 12px ${barColor}66`
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