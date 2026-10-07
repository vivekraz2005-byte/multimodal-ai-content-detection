import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, Cpu, Terminal, Zap, Globe, ShieldAlert } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="app-footer" style={{
      borderTop: '1px solid var(--border-subtle)',
      background: 'linear-gradient(180deg, rgba(3, 7, 18, 0.9) 0%, rgba(2, 4, 10, 1) 100%)',
      padding: '3rem 1.5rem 2rem 1.5rem',
      marginTop: 'auto',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background ambient glow */}
      <div style={{
        position: 'absolute',
        bottom: '-100px',
        left: '50%',
        transform: 'translateX(-50광역시)',
        width: '600px',
        height: '150px',
        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.06) 0%, transparent 70%)',
        filter: 'blur(50px)',
        pointerEvents: 'none'
      }} />

      <div className="footer-container" style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Top Section */}
        <div className="footer-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '2rem' }}>
          
          {/* Brand & Mission */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '380px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                padding: '7px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 15px rgba(59, 130, 246, 0.4)'
              }}>
                <ShieldCheck size={18} color="#ffffff" strokeWidth={2.5} />
              </div>
              <span style={{ fontWeight: 800, fontSize: '1.15rem', color: '#f8fafc', letterSpacing: '-0.02em' }}>AuthenticityAI</span>
              <span className="badge badge-neutral" style={{ fontSize: '0.68rem', padding: '0.1rem 0.5rem' }}>Enterprise Core v3.5</span>
            </div>
            <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.6 }}>
              Next-generation multimodal digital forensics platform combining high-frequency spectral decomposition, metadata integrity, and cryptographic C2PA provenance verification.
            </p>
            
            {/* Live Security Badges */}
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
              <span style={badgeStyle}><Lock size={12} color="#34d399" /> Zero-Retention Storage</span>
              <span style={badgeStyle}><Zap size={12} color="#60a5fa" /> Edge Accelerated</span>
              <span style={badgeStyle}><ShieldAlert size={12} color="#a855f7" /> C2PA Compliant</span>
            </div>
          </div>

          {/* Navigation Links Grid */}
          <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <span style={footerHeaderStyle}>Platform</span>
              <Link to="/" style={footerLinkStyle}>Overview</Link>
              <Link to="/analyze" style={footerLinkStyle}>Multimodal Engine</Link>
              <Link to="/history" style={footerLinkStyle}>Verification Logs</Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <span style={footerHeaderStyle}>Methodology</span>
              <Link to="/about" style={footerLinkStyle}>Evidence Fusion</Link>
              <Link to="/about#c2pa" style={footerLinkStyle}>C2PA Standards</Link>
              <Link to="/about#limitations" style={footerLinkStyle}>Uncertainty Metrics</Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <span style={footerHeaderStyle}>Architecture</span>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Cpu size={14} color="#3b82f6" /> FastAPI + React/Vite
              </span>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Terminal size={14} color="#10b981" /> NumPy / ELA / FFT Core
              </span>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Globe size={14} color="#a855f7" /> Ephemeral Sandbox
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Section: Telemetry & Copyright */}
        <div className="footer-bottom" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          fontSize: '0.82rem',
          color: '#64748b',
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '1.25rem'
        }}>
          <div>
            &copy; {new Date().getFullYear()} AuthenticityAI Platform. Built for robust digital trust and multimedia verification.
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: '#10b981',
                boxShadow: '0 0 10px #10b981',
                display: 'inline-block'
              }} />
              <span style={{ color: '#94a3b8' }}>Core Node: <strong style={{ color: '#34d399' }}>Operational (24ms)</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ color: '#94a3b8' }}>Mode: <strong style={{ color: '#60a5fa' }}>Advanced Heuristic Engine</strong></span>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
};

// Helper styles for clean inline styling
const footerHeaderStyle = {
  fontSize: '0.75rem',
  fontWeight: 700,
  textTransform: 'uppercase',
  color: '#cbd5e1',
  letterSpacing: '0.06em',
  marginBottom: '0.2rem'
};

const footerLinkStyle = {
  fontSize: '0.85rem',
  color: '#94a3b8',
  textDecoration: 'none',
  transition: 'color 0.2s ease'
};

const badgeStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.3rem',
  fontSize: '0.7rem',
  fontWeight: 500,
  padding: '0.2rem 0.55rem',
  borderRadius: '6px',
  background: 'rgba(255, 255, 255, 0.03)',
  border: '1px solid var(--border-subtle)',
  color: '#cbd5e1'
};

export default Footer;