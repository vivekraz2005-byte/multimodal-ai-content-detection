import React from 'react';
import { CheckCircle2, Clock } from 'lucide-react';

const Timeline = ({ timestamp, stages = [] }) => {
  const defaultStages = [
    { title: 'Upload Handshake', desc: 'Secure payload checksum verified', time: 'T+0ms' },
    { title: 'Container Classification', desc: 'Header stream & MIME type checked', time: 'T+12ms' },
    { title: 'Forensic Signal Extraction', desc: 'FFT spectrum, ELA & acoustic metrics', time: 'T+85ms' },
    { title: 'Provenance Signature Match', desc: 'C2PA JUMBF manifests scanned', time: 'T+120ms' },
    { title: 'Multi-Channel Fusion', desc: 'Synthesized signals fused with confidence calibration', time: 'T+160ms' }
  ];

  const items = stages.length > 0 ? stages : defaultStages;

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Clock size={18} color="#60a5fa" />
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Execution Pipeline Audit</h3>
        </div>
        <span style={{ fontSize: '0.78rem', color: '#9ca3af' }}>{timestamp ? new Date(timestamp).toLocaleTimeString() : 'Realtime'}</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {items.map((it, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.85rem' }}>
            <CheckCircle2 size={16} color="#10b981" style={{ marginTop: '2px', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, color: '#f3f4f6' }}>{it.title}</div>
              <div style={{ fontSize: '0.78rem', color: '#9ca3af' }}>{it.desc}</div>
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#6b7280' }}>{it.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Timeline;
