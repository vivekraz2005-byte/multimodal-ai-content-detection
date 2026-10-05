import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, Cpu, Github, ExternalLink } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="app-footer">
      <div className="footer-container">
        <div className="footer-top">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxWidth: '420px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <ShieldCheck size={20} color="#3b82f6" />
              <span style={{ fontWeight: 700, fontSize: '1.05rem', color: '#f3f4f6' }}>AuthenticityAI</span>
              <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>Evidence-Based Platform</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#9ca3af', lineHeight: 1.5 }}>
              Multimodal verification combining signal extraction, metadata forensics, C2PA Content Credentials, and multi-channel evidence fusion.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '2.5rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#9ca3af', letterSpacing: '0.05em' }}>Platform</span>
              <Link to="/" style={{ fontSize: '0.85rem', color: '#9ca3af' }}>Home</Link>
              <Link to="/analyze" style={{ fontSize: '0.85rem', color: '#9ca3af' }}>Analyze Media</Link>
              <Link to="/history" style={{ fontSize: '0.85rem', color: '#9ca3af' }}>Analysis History</Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#9ca3af', letterSpacing: '0.05em' }}>Methodology</span>
              <Link to="/about" style={{ fontSize: '0.85rem', color: '#9ca3af' }}>Evidence Fusion</Link>
              <Link to="/about#c2pa" style={{ fontSize: '0.85rem', color: '#9ca3af' }}>C2PA Standards</Link>
              <Link to="/about#limitations" style={{ fontSize: '0.85rem', color: '#9ca3af' }}>Uncertainty & Limits</Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#9ca3af', letterSpacing: '0.05em' }}>Architecture</span>
              <span style={{ fontSize: '0.85rem', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Cpu size={14} /> FastAPI + React</span>
              <span style={{ fontSize: '0.85rem', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Lock size={14} /> Ephemeral Uploads</span>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span>&copy; {new Date().getFullYear()} AuthenticityAI Platform. Built for robust multimodal digital authenticity research.</span>
          <div style={{ display: 'flex', gap: '1.25rem' }}>
            <span>Status: <strong style={{ color: '#10b981' }}>Operational</strong></span>
            <span>Mode: <strong style={{ color: '#60a5fa' }}>Demo / Heuristic Engine</strong></span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
