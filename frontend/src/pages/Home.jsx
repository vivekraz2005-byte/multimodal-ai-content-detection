import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Image,
  Video,
  Music,
  FileText,
  Cpu,
  Layers,
  Search,
  CheckCircle2,
  AlertTriangle,
  FileKey
} from 'lucide-react';

const Home = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4.5rem' }}>
      {/* Hero Section */}
      <section style={{
        textAlign: 'center',
        padding: '3rem 1rem 1.5rem',
        maxWidth: '860px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.5rem'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.4rem 1rem',
          borderRadius: 'var(--radius-full)',
          background: 'rgba(59, 130, 246, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.25)',
          color: '#60a5fa',
          fontSize: '0.85rem',
          fontWeight: 600
        }}>
          <Sparkles size={16} /> Multimodal Forensic & Provenance Platform
        </div>

        <h1 style={{
          fontSize: 'clamp(2.4rem, 5vw, 3.6rem)',
          fontWeight: 800,
          letterSpacing: '-0.03em',
          lineHeight: 1.15
        }}>
          Know What's Real in a World of <span style={{
            background: 'linear-gradient(135deg, #60a5fa 20%, #a855f7 80%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>Synthetic Media</span>
        </h1>

        <p style={{
          fontSize: '1.15rem',
          color: '#9ca3af',
          maxWidth: '680px',
          lineHeight: 1.6
        }}>
          Analyze images, videos, audio, and documents using multiple authenticity signals, metadata forensics, C2PA Content Credentials, and multi-channel evidence fusion.
        </p>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '0.5rem' }}>
          <Link to="/analyze" className="btn btn-primary" style={{ padding: '0.85rem 1.8rem', fontSize: '1.05rem' }}>
            Analyze Content Now <ArrowRight size={18} />
          </Link>
          <Link to="/about" className="btn btn-secondary" style={{ padding: '0.85rem 1.8rem', fontSize: '1.05rem' }}>
            How Verification Works
          </Link>
        </div>

        {/* Feature badges */}
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: '#9ca3af' }}>
            <CheckCircle2 size={16} color="#10b981" /> No Misleading Binary "Real/Fake"
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: '#9ca3af' }}>
            <CheckCircle2 size={16} color="#10b981" /> Transparent Evidence Cards
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: '#9ca3af' }}>
            <CheckCircle2 size={16} color="#10b981" /> C2PA Content Credentials
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#60a5fa', fontWeight: 700 }}>
            Methodology
          </span>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.3rem' }}>
            The 5-Stage Verification Workflow
          </h2>
          <p style={{ color: '#9ca3af', maxWidth: '600px', margin: '0.4rem auto 0', fontSize: '0.95rem' }}>
            We follow an evidence-based pipeline that inspects data at every layer rather than relying on a single opaque black-box detector.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '1.25rem'
        }}>
          {[
            { num: '01', title: 'Upload', desc: 'Secure drag-and-drop intake into an isolated sandbox environment.' },
            { num: '02', title: 'Identify', desc: 'Deterministic container detection and magic bytes validation.' },
            { num: '03', title: 'Analyze', desc: 'Media-specific signal extraction, FFT frequency domain, and error levels.' },
            { num: '04', title: 'Verify', desc: 'EXIF sensor metadata checks and C2PA Content Credentials audit.' },
            { num: '05', title: 'Explain', desc: 'Synthesized evidence fusion with calibrated uncertainty and reasoning.' }
          ].map((step) => (
            <div key={step.num} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '1.5rem',
                fontWeight: 800,
                color: '#3b82f6',
                opacity: 0.8
              }}>
                {step.num}
              </span>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{step.title}</h3>
              <p style={{ fontSize: '0.85rem', color: '#9ca3af', lineHeight: 1.5 }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Multimodal Capabilities Grid */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#a855f7', fontWeight: 700 }}>
            Comprehensive Coverage
          </span>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.3rem' }}>
            Four Distinct Media Analyzers
          </h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1.5rem'
        }}>
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60a5fa' }}>
              <Image size={22} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Images</h3>
            <p style={{ fontSize: '0.88rem', color: '#9ca3af', lineHeight: 1.5 }}>
              Error Level Analysis (ELA), 2D Fourier (FFT) grid artifacts, Laplacian noise grain variance, and Stable Diffusion / Midjourney metadata prompt scraping.
            </p>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: 'auto' }}>
              <span className="badge badge-neutral">JPG</span>
              <span className="badge badge-neutral">PNG</span>
              <span className="badge badge-neutral">WEBP</span>
            </div>
          </div>

          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fbbf24' }}>
              <Video size={22} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Videos</h3>
            <p style={{ fontSize: '0.88rem', color: '#9ca3af', lineHeight: 1.5 }}>
              Container muxing inspection, presentation timestamp (PTS/DTS) continuity, audio/video synchronization drift, and synthetic video generator tags.
            </p>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: 'auto' }}>
              <span className="badge badge-neutral">MP4</span>
              <span className="badge badge-neutral">MOV</span>
              <span className="badge badge-neutral">WEBM</span>
            </div>
          </div>

          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399' }}>
              <Music size={22} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Audio & Voice</h3>
            <p style={{ fontSize: '0.88rem', color: '#9ca3af', lineHeight: 1.5 }}>
              Acoustic sample rate cutoffs typical of neural vocoders (22.05 kHz / 24 kHz), synthetic voice tag identification, and mono dry speech cadence checks.
            </p>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: 'auto' }}>
              <span className="badge badge-neutral">MP3</span>
              <span className="badge badge-neutral">WAV</span>
              <span className="badge badge-neutral">FLAC</span>
            </div>
          </div>

          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(168, 85, 247, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c084fc' }}>
              <FileText size={22} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Documents</h3>
            <p style={{ fontSize: '0.88rem', color: '#9ca3af', lineHeight: 1.5 }}>
              PDF producer software scrutiny (ReportLab vs Office), incremental revision anomaly detection, single-session generation flags, and text stylometrics.
            </p>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: 'auto' }}>
              <span className="badge badge-neutral">PDF</span>
              <span className="badge badge-neutral">DOCX</span>
              <span className="badge badge-neutral">TXT</span>
            </div>
          </div>
        </div>
      </section>

      {/* Disclaimer Callout */}
      <section className="disclaimer-banner">
        <AlertTriangle size={24} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <strong style={{ color: '#fbbf24', fontSize: '0.95rem' }}>Evidence-Based Responsibility Statement</strong>
          <p style={{ color: '#d1d5db', fontSize: '0.88rem', lineHeight: 1.5, margin: 0 }}>
            This system provides evidence-based authenticity indicators, not absolute proof of whether content is real or fake.
            AI detection can produce false positives and false negatives. Results should always be interpreted with context and, where necessary, verified using trusted primary sources and cryptographic Content Credentials.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Home;
