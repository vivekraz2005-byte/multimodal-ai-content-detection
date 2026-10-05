import React from 'react';
import { ShieldCheck, Cpu, Layers, HelpCircle, AlertTriangle, FileCode, CheckCircle2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      <div>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.4rem' }}>
          About AuthenticityAI
        </h1>
        <p style={{ color: '#9ca3af', fontSize: '1.05rem', lineHeight: 1.6 }}>
          Evidence-grounded multimodal digital forensics and provenance verification.
        </p>
      </div>

      {/* Section 1: What is this platform? */}
      <section className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <ShieldCheck size={24} color="#3b82f6" />
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>What is this platform?</h2>
        </div>
        <p style={{ color: '#d1d5db', lineHeight: 1.6, fontSize: '0.95rem' }}>
          <strong>AuthenticityAI</strong> is a multimodal digital authenticity assistant designed to help journalists, researchers, investigators, and everyday users understand whether digital content contains signs of generative AI synthesis, localized manipulation, editing, or structural anomalies.
        </p>
        <p style={{ color: '#d1d5db', lineHeight: 1.6, fontSize: '0.95rem' }}>
          The platform supports <strong>Images (JPG, PNG, WEBP)</strong>, <strong>Videos (MP4, MOV, AVI, WEBM)</strong>, <strong>Audio (MP3, WAV, FLAC, OGG)</strong>, and <strong>Documents (PDF, DOCX, TXT)</strong> under a unified forensics workflow.
        </p>
      </section>

      {/* Section 2: Why it matters */}
      <section className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <AlertTriangle size={24} color="#f59e0b" />
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Why It Matters</h2>
        </div>
        <p style={{ color: '#d1d5db', lineHeight: 1.6, fontSize: '0.95rem' }}>
          AI-generated media has crossed the threshold where human sensory perception can no longer reliably distinguish between authentic physical captures and diffusion models, GANs, or neural voice clones. At the same time, naive AI detectors that spit out a single number (e.g. <em>"98% FAKE"</em>) cause massive harm through false positives on legitimate student work, artistic photography, and compressed phone videos.
        </p>
        <p style={{ color: '#d1d5db', lineHeight: 1.6, fontSize: '0.95rem' }}>
          Digital verification requires <strong>evidence</strong>, <strong>traceability</strong>, and <strong>calibrated uncertainty</strong>, not an opaque binary verdict.
        </p>
      </section>

      {/* Section 3: Our Approach */}
      <section className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Layers size={24} color="#10b981" />
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Our Evidence-Based Approach</h2>
        </div>
        <p style={{ color: '#d1d5db', lineHeight: 1.6, fontSize: '0.95rem' }}>
          Instead of relying on one brittle model, AuthenticityAI fuses four distinct channels:
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <h4 style={{ color: '#60a5fa', marginBottom: '0.3rem' }}>1. Signal Extraction</h4>
            <p style={{ fontSize: '0.85rem', color: '#9ca3af' }}>
              Error Level Analysis (ELA), 2D Fourier (FFT) high-frequency spectrum, vocoder Nyquist bounds, and compression distributions.
            </p>
          </div>
          <div style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <h4 style={{ color: '#34d399', marginBottom: '0.3rem' }}>2. Metadata Forensics</h4>
            <p style={{ fontSize: '0.85rem', color: '#9ca3af' }}>
              Authentic EXIF camera sensor tags, software editor fingerprints, and timestamps without inventing missing fields.
            </p>
          </div>
          <div style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <h4 style={{ color: '#c084fc', marginBottom: '0.3rem' }}>3. Provenance & C2PA</h4>
            <p style={{ fontSize: '0.85rem', color: '#9ca3af' }}>
              Cryptographic Content Credentials (C2PA/CAI) and XMP edit chains, while honoring the principle that missing credentials does NOT mean fake.
            </p>
          </div>
          <div style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <h4 style={{ color: '#fbbf24', marginBottom: '0.3rem' }}>4. Evidence Fusion</h4>
            <p style={{ fontSize: '0.85rem', color: '#9ca3af' }}>
              Multi-signal synthesis calculating confidence, uncertainty boundaries, and human-readable explanations.
            </p>
          </div>
        </div>
      </section>

      {/* Section 4: Demo / Prototype Architecture Notice */}
      <section className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', background: 'rgba(59, 130, 246, 0.04)', border: '1px solid rgba(59, 130, 246, 0.25)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Cpu size={24} color="#60a5fa" />
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Engine Architecture & Pluggable ML</h2>
        </div>
        <p style={{ color: '#d1d5db', lineHeight: 1.6, fontSize: '0.95rem' }}>
          This deployment runs on a <strong>modular heuristic and signal-extraction engine</strong>. It calculates genuine Fourier transforms, JPEG Error Level Analysis, acoustic Nyquist frequencies, document structure trees, and C2PA manifest markers directly from uploaded file bytes.
        </p>
        <p style={{ color: '#d1d5db', lineHeight: 1.6, fontSize: '0.95rem' }}>
          In accordance with our core engineering rules, <strong>we never pretend that heuristic demo signals are heavy neural network weights</strong>. The backend services (<code style={{ color: '#93c5fd' }}>image_analyzer.py</code>, <code style={{ color: '#93c5fd' }}>video_analyzer.py</code>, <code style={{ color: '#93c5fd' }}>audio_analyzer.py</code>, <code style={{ color: '#93c5fd' }}>document_analyzer.py</code>) provide clean modular interfaces where PyTorch, TensorFlow, MesoNet, or Wav2Vec2 models can be connected directly.
        </p>
      </section>

      {/* CTA */}
      <div style={{ textAlign: 'center', padding: '1rem' }}>
        <Link to="/analyze" className="btn btn-primary" style={{ padding: '0.85rem 1.8rem', fontSize: '1.05rem' }}>
          Run Forensic Verification Now <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  );
};

export default About;
