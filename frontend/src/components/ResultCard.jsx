import React from 'react';
import { ShieldCheck, AlertTriangle, HelpCircle, Sparkles, CheckCircle2, ShieldAlert } from 'lucide-react';

const ASSESSMENT_CONFIG = {
  'Likely Authentic': {
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.12)',
    borderColor: 'rgba(16, 185, 129, 0.35)',
    icon: ShieldCheck,
    badgeClass: 'badge-success'
  },
  'Likely AI-Generated': {
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.12)',
    borderColor: 'rgba(239, 68, 68, 0.35)',
    icon: Sparkles,
    badgeClass: 'badge-danger'
  },
  'Potentially Manipulated': {
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.12)',
    borderColor: 'rgba(245, 158, 11, 0.35)',
    icon: AlertTriangle,
    badgeClass: 'badge-warning'
  },
  'Suspicious': {
    color: '#f97316',
    bgColor: 'rgba(249, 115, 22, 0.12)',
    borderColor: 'rgba(249, 115, 22, 0.35)',
    icon: ShieldAlert,
    badgeClass: 'badge-warning'
  },
  'Inconclusive': {
    color: '#9ca3af',
    bgColor: 'rgba(156, 163, 175, 0.12)',
    borderColor: 'rgba(156, 163, 175, 0.3)',
    icon: HelpCircle,
    badgeClass: 'badge-neutral'
  }
};

const ResultCard = ({ assessment, confidence, whyExplanation, uncertaintyReasons = [] }) => {
  const config = ASSESSMENT_CONFIG[assessment] || ASSESSMENT_CONFIG['Inconclusive'];
  const Icon = config.icon;

  return (
    <div className="card" style={{
      borderLeft: `4px solid ${config.color}`,
      background: 'var(--bg-card)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute',
        top: '-40px',
        right: '-40px',
        width: '160px',
        height: '160px',
        borderRadius: '50%',
        background: config.bgColor,
        filter: 'blur(30px)',
        pointerEvents: 'none'
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
        <div>
          <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9ca3af', fontWeight: 600 }}>
            Overall Authenticity Assessment
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.35rem' }}>
            <div style={{
              background: config.bgColor,
              padding: '8px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `1px solid ${config.borderColor}`
            }}>
              <Icon size={26} color={config.color} />
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: config.color }}>
              {assessment}
            </h2>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
          <span className={`badge ${config.badgeClass}`} style={{ fontSize: '0.85rem', padding: '0.35rem 0.85rem' }}>
            {confidence} Confidence
          </span>
        </div>
      </div>

      {/* "Why?" section */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.03)',
        borderRadius: 'var(--radius-md)',
        padding: '1.2rem',
        border: '1px solid var(--border-subtle)',
        marginBottom: '1rem'
      }}>
        <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f3f4f6', marginBottom: '0.4rem' }}>
          Why this assessment?
        </h4>
        <p style={{ color: '#d1d5db', fontSize: '0.95rem', lineHeight: 1.6 }}>
          {whyExplanation}
        </p>
      </div>

      {/* Uncertainty Warnings */}
      {uncertaintyReasons && uncertaintyReasons.length > 0 && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.4rem',
          padding: '0.85rem 1rem',
          borderRadius: 'var(--radius-sm)',
          background: 'rgba(245, 158, 11, 0.05)',
          border: '1px solid rgba(245, 158, 11, 0.2)'
        }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Uncertainty & Contextual Factors
          </span>
          {uncertaintyReasons.map((reason, idx) => (
            <p key={idx} style={{ fontSize: '0.85rem', color: '#d1d5db', margin: 0, lineHeight: 1.4 }}>
              • {reason}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResultCard;
