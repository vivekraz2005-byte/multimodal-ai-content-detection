import React, { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, Sparkles, ShieldCheck } from 'lucide-react';

const STEPS = [
  { id: 'upload', label: 'File uploaded safely to isolated sandbox' },
  { id: 'classify', label: 'Media container and signature verified' },
  { id: 'metadata', label: 'Extracting metadata, EXIF tags & streams' },
  { id: 'content', label: 'Running multimodal signal analysis & frequency transforms' },
  { id: 'manipulation', label: 'Checking compression discrepancy & tampering indicators' },
  { id: 'provenance', label: 'Scanning for C2PA Content Credentials & manifests' },
  { id: 'fusion', label: 'Combining evidence & calibrating uncertainty bounds' },
  { id: 'report', label: 'Generating comprehensive authenticity assessment' },
];

const AnalysisProgress = ({ currentStepIndex = 0 }) => {
  return (
    <div className="card" style={{ maxWidth: '640px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'var(--primary-glow)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1rem',
          color: '#60a5fa'
        }}>
          <Sparkles size={28} className="animate-pulse" />
        </div>
        <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.3rem' }}>
          Multimodal Analysis in Progress
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Executing deterministic forensic tests and evidence synthesis...
        </p>
      </div>

      <div className="step-list">
        {STEPS.map((step, idx) => {
          const isCompleted = idx < currentStepIndex;
          const isActive = idx === currentStepIndex;
          const isPending = idx > currentStepIndex;

          return (
            <div
              key={step.id}
              className={`step-item ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}
            >
              <div style={{ width: '24px', display: 'flex', justifyContent: 'center' }}>
                {isCompleted && <CheckCircle2 size={20} color="#10b981" />}
                {isActive && <div className="spinner" />}
                {isPending && (
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.2)'
                  }} />
                )}
              </div>

              <div style={{ flex: 1 }}>
                <span style={{
                  fontSize: '0.92rem',
                  fontWeight: isActive ? 600 : 500,
                  color: isCompleted ? '#e5e7eb' : (isActive ? '#60a5fa' : '#6b7280')
                }}>
                  {step.label}
                </span>
              </div>

              {isCompleted && (
                <span className="badge badge-success" style={{ fontSize: '0.72rem', padding: '0.15rem 0.5rem' }}>
                  Done
                </span>
              )}
              {isActive && (
                <span className="badge badge-info" style={{ fontSize: '0.72rem', padding: '0.15rem 0.5rem' }}>
                  Processing
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AnalysisProgress;
