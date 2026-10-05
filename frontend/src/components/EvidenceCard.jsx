import React, { useState } from 'react';
import { AlertCircle, AlertTriangle, Info, CheckCircle, ChevronDown, ChevronUp, Cpu, Sliders, Database, Shield } from 'lucide-react';

const SEVERITY_CONFIG = {
  'High': {
    color: '#ef4444',
    bg: 'var(--danger-bg)',
    border: 'var(--danger-border)',
    icon: AlertCircle,
    badgeClass: 'badge-danger'
  },
  'Medium': {
    color: '#f59e0b',
    bg: 'var(--warning-bg)',
    border: 'var(--warning-border)',
    icon: AlertTriangle,
    badgeClass: 'badge-warning'
  },
  'Low': {
    color: '#3b82f6',
    bg: 'var(--info-bg)',
    border: 'var(--info-border)',
    icon: Info,
    badgeClass: 'badge-info'
  },
  'Informational': {
    color: '#10b981',
    bg: 'var(--success-bg)',
    border: 'var(--success-border)',
    icon: CheckCircle,
    badgeClass: 'badge-success'
  }
};

const EvidenceCard = ({ evidence, index }) => {
  const [expanded, setExpanded] = useState(false);
  const severity = evidence.severity || 'Low';
  const config = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG['Low'];
  const Icon = config.icon;

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.02)',
      border: `1px solid ${config.border}`,
      borderRadius: 'var(--radius-md)',
      padding: '1.25rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
      transition: 'all 0.2s ease'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{
            background: config.bg,
            padding: '6px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Icon size={18} color={config.color} />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Evidence #{String(index + 1).padStart(2, '0')} • {evidence.category}
            </div>
            <h4 style={{ fontSize: '1.02rem', fontWeight: 700, color: '#f3f4f6' }}>
              {evidence.title}
            </h4>
          </div>
        </div>

        <span className={`badge ${config.badgeClass}`} style={{ fontSize: '0.75rem' }}>
          Severity: {severity}
        </span>
      </div>

      <p style={{ color: '#d1d5db', fontSize: '0.92rem', lineHeight: 1.5, margin: 0 }}>
        {evidence.description}
      </p>

      {evidence.technical_details && (
        <div>
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#60a5fa',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              padding: 0
            }}
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {expanded ? 'Hide Technical Signal Details' : 'View Technical Signal Details'}
          </button>

          {expanded && (
            <div style={{
              marginTop: '0.5rem',
              padding: '0.75rem',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid var(--border-subtle)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.82rem',
              color: '#93c5fd'
            }}>
              {evidence.technical_details}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EvidenceCard;
