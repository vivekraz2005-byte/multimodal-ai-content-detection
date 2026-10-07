import React from 'react';
import { ShieldCheck, ShieldAlert, FileKey, Info, History } from 'lucide-react';

const ProvenancePanel = ({ provenance }) => {
  if (!provenance) return null;

  const isDetected = provenance.detected;

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            background: 'rgba(168, 85, 247, 0.1)',
            padding: '8px',
            borderRadius: '10px',
            border: '1px solid rgba(168, 85, 247, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <FileKey size={20} color="#a855f7" />
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, letterSpacing: '-0.01em' }}>
            Provenance & Content Credentials (C2PA)
          </h3>
        </div>

        <span className={`badge ${isDetected ? 'badge-success' : 'badge-neutral'}`} style={{ fontSize: '0.8rem', padding: '0.3rem 0.8rem' }}>
          {isDetected ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
          <span style={{ marginLeft: '4px' }}>{provenance.status}</span>
        </span>
      </div>

      {/* Explanation banner */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.02)',
        borderRadius: 'var(--radius-md)',
        padding: '1.1rem',
        border: '1px solid var(--border-subtle)',
        fontSize: '0.9rem',
        color: '#cbd5e1',
        lineHeight: 1.6
      }}>
        {provenance.explanation}
      </div>

      {/* Manifest fields if detected */}
      {isDetected ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          padding: '1.15rem',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(16, 185, 129, 0.05)',
          border: '1px solid rgba(16, 185, 129, 0.25)'
        }}>
          <div>
            <div style={{ fontSize: '0.72rem', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em' }}>Manifest Type</div>
            <div style={{ fontWeight: 600, color: '#34d399', marginTop: '0.2rem' }}>{provenance.manifest_type || 'C2PA Manifest'}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em' }}>Claim Generator</div>
            <div style={{ fontWeight: 600, color: '#f3f4f6', marginTop: '0.2rem' }}>{provenance.claim_generator || 'Standard C2PA Tool'}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em' }}>Digital Source Type</div>
            <div style={{ fontWeight: 600, color: '#93c5fd', marginTop: '0.2rem' }}>{provenance.digital_source_type || 'Unspecified'}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em' }}>Signing Creator</div>
            <div style={{ fontWeight: 600, color: '#f3f4f6', marginTop: '0.2rem' }}>{provenance.creator || 'Self-signed assertion'}</div>
          </div>
        </div>
      ) : (
        <div style={{
          display: 'flex',
          gap: '0.85rem',
          alignItems: 'flex-start',
          padding: '1.15rem',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(59, 130, 246, 0.05)',
          border: '1px solid rgba(59, 130, 246, 0.2)'
        }}>
          <Info size={20} color="#60a5fa" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ fontSize: '0.88rem', color: '#bfdbfe', lineHeight: 1.6 }}>
            <strong style={{ color: '#ffffff', display: 'block', marginBottom: '0.25rem' }}>
              Important Provenance Principle:
            </strong>
            The Coalition for Content Provenance and Authenticity (C2PA) standard is an opt-in cryptographic manifest framework.
            Absence of credentials simply indicates that this content was captured or exported through standard pipelines without an active C2PA certificate.
            <strong style={{ color: '#ffffff' }}> It does NOT mean the content is fake.</strong>
          </div>
        </div>
      )}

      {/* Actions history if available */}
      {provenance.actions && provenance.actions.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: '#9ca3af' }}>
            <History size={15} /> Recorded Ingredient Action History
          </div>
          {provenance.actions.map((act, i) => (
            <div key={i} style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(255, 255, 255, 0.025)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.85rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span><strong>Action:</strong> {act.action}</span>
              <span style={{ color: '#9ca3af', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{act.software || act.detail || 'Logged'}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProvenancePanel;