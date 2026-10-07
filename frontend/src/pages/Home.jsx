import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Image as ImageIcon,
  Video,
  Music,
  FileText,
  Cpu,
  Layers,
  Search,
  CheckCircle2,
  AlertTriangle,
  FileKey,
  Activity,
  Eye,
  ChevronDown,
  ChevronUp,
  Fingerprint,
  Lock,
  Zap,
  Globe,
  FileCheck,
  HelpCircle,
  BarChart3,
  Terminal,
  Share2
} from 'lucide-react';

// --- DATA ARRAYS ---

const TRUST_BADGES = [
  { text: "No Misleading Binary Real/Fake", icon: CheckCircle2 },
  { text: "Transparent Evidence Cards", icon: CheckCircle2 },
  { text: "C2PA Content Credentials Standard", icon: CheckCircle2 },
  { text: "NIST-Aligned Forensic Pipeline", icon: CheckCircle2 }
];

const WORKFLOW_STEPS = [
  {
    num: '01',
    title: 'Secure Sandbox Intake',
    shortDesc: 'Isolated drag-and-drop container intake with cryptographic hashing.',
    detail: 'Files are uploaded directly into an ephemeral, air-gapped processing sandbox. SHA-256 and MD5 hashes are generated immediately to maintain chain-of-custody integrity before analysis.',
    tags: ['SHA-256', 'Sandbox', 'Air-Gapped']
  },
  {
    num: '02',
    title: 'Container & Magic Bytes Validation',
    shortDesc: 'Deterministic file header and structural metadata verification.',
    detail: 'Inspects magic byte headers, MIME types, chunk alignment, and container integrity (e.g., ISO BMFF for videos, RIFF for audio) to detect payload obfuscation or header spoofing.',
    tags: ['Magic Bytes', 'HEX Audit', 'MIME Check']
  },
  {
    num: '03',
    title: 'Multi-Signal Signal Processing',
    shortDesc: 'Frequency domain transform, noise variance, and neural artifact extraction.',
    detail: 'Executes modal-specific signal analysis: 2D-FFT frequency spectrum analysis, Error Level Analysis (ELA), Laplacian noise distribution, pitch jitter analysis, and frame-rate PTS jitter.',
    tags: ['2D-FFT', 'ELA', 'Spectral Jitter']
  },
  {
    num: '04',
    title: 'Provenance & C2PA Cryptographic Audit',
    shortDesc: 'Sensor EXIF extraction and X.509 certificate trust verification.',
    detail: 'Scans for embedded C2PA manifests, hardware security module signatures (HSM), EXIF camera pipeline data, GPS timestamps, and edit history trees verified against trusted root CAs.',
    tags: ['C2PA', 'EXIF', 'X.509 Certs']
  },
  {
    num: '05',
    title: 'Evidence Fusion & Calibrated Reasoning',
    shortDesc: 'Cross-modal evidence synthesis with probability calibration.',
    detail: 'Aggregates signals into an explainable report. Assigns confidence scores with calibrated uncertainty ranges instead of arbitrary binary verdicts, highlighting key supporting evidence.',
    tags: ['Evidence Fusion', 'Confidence Interval', 'XAI Report']
  }
];

const MEDIA_ANALYZERS = [
  {
    id: 'images',
    title: 'Image Forensics',
    icon: ImageIcon,
    color: '#60a5fa',
    bg: 'rgba(59, 130, 246, 0.12)',
    border: 'rgba(59, 130, 246, 0.3)',
    desc: 'Deep structural and pixel-level analysis to spot synthetic generation, splicing, and local modifications.',
    features: [
      'Error Level Analysis (ELA) for quantization mismatch detection',
      '2D Fast Fourier Transform (FFT) grid artifact analysis',
      'Laplacian noise grain variance and sensor pattern noise (PRNU)',
      'Prompt and metadata extraction from Stable Diffusion, Midjourney, and DALL-E'
    ],
    formats: ['JPG', 'PNG', 'WEBP', 'TIFF', 'AVIF']
  },
  {
    id: 'videos',
    title: 'Video & Motion Forensics',
    icon: Video,
    color: '#fbbf24',
    bg: 'rgba(245, 158, 11, 0.12)',
    border: 'rgba(245, 158, 11, 0.3)',
    desc: 'Temporal continuity and frame-by-frame container inspection for synthetic swap detection.',
    features: [
      'Presentation Timestamp (PTS/DTS) continuity and frame drop audit',
      'Inter-frame motion vector variance and optical flow anomalies',
      'Audio/Video lip-sync drift detection via cross-correlation',
      'Generative video model tag detection (Sora, Runway Gen-2, Pika)'
    ],
    formats: ['MP4', 'MOV', 'WEBM', 'AVI', 'MKV']
  },
  {
    id: 'audio',
    title: 'Audio & Voice Analysis',
    icon: Music,
    color: '#34d399',
    bg: 'rgba(16, 185, 129, 0.12)',
    border: 'rgba(16, 185, 129, 0.3)',
    desc: 'Acoustic waveform and spectral bandwidth decomposition for synthetic voice detection.',
    features: [
      'Neural vocoder high-frequency cutoff detection (22.05 kHz / 24 kHz limits)',
      'Synthetic voice clone acoustic tag and formant continuity check',
      'Microphone phase consistency and room impulse response (RIR) modeling',
      'Cadence, respiration gap, and unnatural prosody artifact tagging'
    ],
    formats: ['MP3', 'WAV', 'FLAC', 'AAC', 'OGG']
  },
  {
    id: 'documents',
    title: 'Document & Text Forensics',
    icon: FileText,
    color: '#c084fc',
    bg: 'rgba(168, 85, 247, 0.12)',
    border: 'rgba(168, 85, 247, 0.3)',
    desc: 'PDF internal structure, font embedding, and text stylometric provenance evaluation.',
    features: [
      'PDF producer software fingerprinting (ReportLab, Adobe, Ghostscript)',
      'Incremental revision tree tracking and hidden object extraction',
      'Single-session creation timestamps vs font stream metadata mismatches',
      'Stylometric perplexity and burstiness mapping for LLM text scoring'
    ],
    formats: ['PDF', 'DOCX', 'TXT', 'EPUB']
  }
];

const DEMO_LAYERS = [
  { id: 'rgb', label: 'Standard View', desc: 'Original input RGB payload without forensic filters applied.' },
  { id: 'ela', label: 'Error Level Analysis (ELA)', desc: 'Highlights compression variance. Brighter regions indicate localized edits or synthetic insertions.' },
  { id: 'fft', label: '2D Frequency Spectrum (FFT)', desc: 'Reveals high-frequency grid artifacts typical of diffusion and GAN upsamplers.' },
  { id: 'c2pa', label: 'C2PA Manifest Graph', desc: 'Displays verified cryptographic signing certs, tool history, and sensor lineage.' }
];

const COMPARISON_ROWS = [
  { feature: 'Primary Output', traditional: 'Binary Verdict ("Real" or "Fake")', platform: 'Multi-Signal Evidence Report + Calibration' },
  { feature: 'Auditability', traditional: 'Black-box neural net confidence score', platform: 'Layered signal breakdowns (ELA, FFT, C2PA, EXIF)' },
  { feature: 'Provenance Tracking', traditional: 'Not supported (Pixel analysis only)', platform: 'Native C2PA cryptographic chain verification' },
  { feature: 'False Positive Handling', traditional: 'High error rate on edited genuine media', platform: 'Contextual uncertainty ranges & raw artifact viewers' },
  { feature: 'Modality Support', traditional: 'Single modal (Images only)', platform: 'Unified 4-in-1 (Image, Video, Audio, Document)' }
];

const USE_CASES = [
  {
    title: 'Journalism & Fact-Checking',
    icon: Globe,
    desc: 'Verify user-generated media from conflict zones before broadcast using C2PA credentials and satellite timestamp matching.'
  },
  {
    title: 'Legal & Digital Forensics',
    icon: Lock,
    desc: 'Establish unbroken evidentiary chain-of-custody with cryptographic SHA-256 intake logging and court-admissible reports.'
  },
  {
    title: 'Enterprise Cyber Defense',
    icon: ShieldCheck,
    desc: 'Defend executive teams against deepfake voice-cloning fraud, fake invoices, and synthetic spear-phishing campaigns.'
  },
  {
    title: 'Academic & IP Protection',
    icon: FileCheck,
    desc: 'Audit research papers, figures, and patent submissions for AI-generated synthetic data or image manipulation.'
  }
];

const FAQS = [
  {
    q: 'Why does this platform avoid giving a simple "Real" or "Fake" score?',
    a: 'Binary labels are dangerous and misleading. A real photo modified with basic noise reduction or cropped in Photoshop might trigger an AI detector, while a heavily synthesized image might bypass basic models. We provide a breakdown of all forensic signals (ELA, FFT, EXIF, C2PA) with confidence ranges so experts can draw well-founded conclusions.'
  },
  {
    q: 'What are C2PA Content Credentials?',
    a: 'C2PA (Coalition for Content Provenance and Authenticity) is an open technical standard that allows creators and camera hardware to cryptographically bind metadata to media. It records who created the media, what camera took it, and what edits were made using verified X.509 certificates.'
  },
  {
    q: 'Can this platform detect deepfake voices and synthetic speech?',
    a: 'Yes. Our Audio Analyzer evaluates vocoder cutoff frequencies, speech prosody, acoustic phase continuity, and synthetic voice markers to highlight generated or cloned audio clips.'
  },
  {
    q: 'Is my uploaded content private and confidential?',
    a: 'All uploads are processed inside isolated ephemeral sandboxes. Files are automatically purged following session completion, and content is never used to train machine learning models.'
  }
];

// --- SUB-COMPONENTS ---

const FeatureBadge = ({ text, icon: Icon }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: '0.45rem',
    fontSize: '0.85rem',
    color: '#9ca3af',
    background: 'rgba(255, 255, 255, 0.03)',
    padding: '0.4rem 0.8rem',
    borderRadius: '20px',
    border: '1px solid rgba(255, 255, 255, 0.08)'
  }}>
    <Icon size={16} color="#10b981" />
    <span>{text}</span>
  </div>
);

const SectionHeader = ({ tag, tagColor = '#60a5fa', title, description }) => (
  <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 2.5rem' }}>
    <span style={{
      fontSize: '0.78rem',
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      color: tagColor,
      fontWeight: 700,
      display: 'inline-block',
      marginBottom: '0.4rem'
    }}>
      {tag}
    </span>
    <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#f3f4f6', letterSpacing: '-0.02em' }}>
      {title}
    </h2>
    {description && (
      <p style={{ color: '#9ca3af', marginTop: '0.6rem', fontSize: '0.98rem', lineHeight: 1.6 }}>
        {description}
      </p>
    )}
  </div>
);

// --- MAIN COMPONENT ---

const Home = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [activeLayer, setActiveLayer] = useState('rgb');
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '5.5rem',
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 1rem 4rem',
      color: '#e5e7eb'
    }}>
      
      {/* HERO SECTION */}
      <section style={{
        textAlign: 'center',
        padding: '3.5rem 1rem 2rem',
        maxWidth: '920px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.6rem'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.55rem',
          padding: '0.45rem 1.1rem',
          borderRadius: '9999px',
          background: 'rgba(59, 130, 246, 0.12)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          color: '#60a5fa',
          fontSize: '0.85rem',
          fontWeight: 600
        }}>
          <Sparkles size={16} /> Multimodal Forensic & Provenance Platform
        </div>

        <h1 style={{
          fontSize: 'clamp(2.5rem, 5.5vw, 3.8rem)',
          fontWeight: 800,
          letterSpacing: '-0.03em',
          lineHeight: 1.12,
          color: '#ffffff'
        }}>
          Know What's Real in a World of{' '}
          <span style={{
            background: 'linear-gradient(135deg, #60a5fa 10%, #a855f7 60%, #ec4899 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Synthetic Media
          </span>
        </h1>

        <p style={{
          fontSize: '1.18rem',
          color: '#9ca3af',
          maxWidth: '720px',
          lineHeight: 1.65
        }}>
          Analyze images, videos, audio, and documents using multiple authenticity signals, metadata forensics, C2PA Content Credentials, and multi-channel evidence fusion.
        </p>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '0.5rem' }}>
          <Link
            to="/analyze"
            className="btn btn-primary"
            style={{
              padding: '0.9rem 2rem',
              fontSize: '1.05rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.6rem',
              fontWeight: 600,
              borderRadius: '8px'
            }}
          >
            Analyze Content Now <ArrowRight size={18} />
          </Link>
          <Link
            to="/about"
            className="btn btn-secondary"
            style={{
              padding: '0.9rem 2rem',
              fontSize: '1.05rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.6rem',
              fontWeight: 600,
              borderRadius: '8px'
            }}
          >
            How Verification Works
          </Link>
        </div>

        {/* Feature Badges Grid */}
        <div style={{
          display: 'flex',
          gap: '0.8rem',
          flexWrap: 'wrap',
          justify: 'center',
          marginTop: '1.2rem'
        }}>
          {TRUST_BADGES.map((badge, idx) => (
            <FeatureBadge key={idx} text={badge.text} icon={badge.icon} />
          ))}
        </div>
      </section>

      {/* QUICK STATS BAR */}
      <section style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.25rem',
        padding: '1.5rem',
        background: 'rgba(17, 24, 39, 0.6)',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#60a5fa' }}>4 Modalities</div>
          <div style={{ fontSize: '0.85rem', color: '#9ca3af', marginTop: '0.2rem' }}>Images, Video, Audio, Docs</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#a855f7' }}>C2PA Ready</div>
          <div style={{ fontSize: '0.85rem', color: '#9ca3af', marginTop: '0.2rem' }}>Hardware & Cryptographic Certs</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#34d399' }}>Zero-Storage</div>
          <div style={{ fontSize: '0.85rem', color: '#9ca3af', marginTop: '0.2rem' }}>Ephemeral Sandbox Processing</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fbbf24' }}>Explainable</div>
          <div style={{ fontSize: '0.85rem', color: '#9ca3af', marginTop: '0.2rem' }}>No Misleading Binary Verdicts</div>
        </div>
      </section>

      {/* 5-STAGE WORKFLOW (INTERACTIVE) */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <SectionHeader
          tag="Methodology"
          tagColor="#60a5fa"
          title="The 5-Stage Verification Workflow"
          description="We follow an evidence-based pipeline that inspects data at every layer rather than relying on a single opaque black-box detector."
        />

        {/* Workflow Stepper Navigation */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem'
        }}>
          {WORKFLOW_STEPS.map((step, idx) => {
            const isActive = activeStep === idx;
            return (
              <div
                key={step.num}
                onClick={() => setActiveStep(idx)}
                style={{
                  cursor: 'pointer',
                  padding: '1.2rem',
                  borderRadius: '12px',
                  background: isActive ? 'rgba(59, 130, 246, 0.12)' : 'rgba(17, 24, 39, 0.5)',
                  border: `1px solid ${isActive ? '#3b82f6' : 'rgba(255, 255, 255, 0.08)'}`,
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{
                    fontFamily: 'monospace',
                    fontSize: '1.2rem',
                    fontWeight: 800,
                    color: isActive ? '#60a5fa' : '#6b7280'
                  }}>
                    {step.num}
                  </span>
                  {isActive && <Activity size={16} color="#60a5fa" />}
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: isActive ? '#ffffff' : '#d1d5db' }}>
                  {step.title}
                </h3>
                <p style={{ fontSize: '0.82rem', color: '#9ca3af', lineHeight: 1.4 }}>
                  {step.shortDesc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Selected Step Detail Panel */}
        <div style={{
          background: 'rgba(17, 24, 39, 0.8)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: '14px',
          padding: '1.8rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span style={{
              background: '#2563eb',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '0.85rem',
              padding: '0.2rem 0.6rem',
              borderRadius: '6px',
              fontFamily: 'monospace'
            }}>
              STAGE {WORKFLOW_STEPS[activeStep].num}
            </span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff' }}>
              {WORKFLOW_STEPS[activeStep].title}
            </h3>
          </div>

          <p style={{ fontSize: '0.95rem', color: '#d1d5db', lineHeight: 1.6 }}>
            {WORKFLOW_STEPS[activeStep].detail}
          </p>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
            {WORKFLOW_STEPS[activeStep].tags.map((tag) => (
              <span
                key={tag}
                style={{
                  fontSize: '0.78rem',
                  background: 'rgba(255, 255, 255, 0.06)',
                  color: '#93c5fd',
                  padding: '0.25rem 0.65rem',
                  borderRadius: '4px',
                  border: '1px solid rgba(147, 197, 253, 0.2)'
                }}
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* FOUR MULTIMODAL ANALYZERS */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <SectionHeader
          tag="Comprehensive Coverage"
          tagColor="#a855f7"
          title="Four Distinct Media Analyzers"
          description="Tailored forensic algorithms built specifically for each media type's unique artifact vectors."
        />

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))',
          gap: '1.5rem'
        }}>
          {MEDIA_ANALYZERS.map((analyzer) => {
            const IconComponent = analyzer.icon;
            return (
              <div
                key={analyzer.id}
                style={{
                  background: 'rgba(17, 24, 39, 0.5)',
                  border: `1px solid ${analyzer.border}`,
                  borderRadius: '16px',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.1rem'
                }}
              >
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  background: analyzer.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justify: 'center',
                  color: analyzer.color
                }}>
                  <IconComponent size={24} />
                </div>

                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff' }}>{analyzer.title}</h3>
                  <p style={{ fontSize: '0.88rem', color: '#9ca3af', marginTop: '0.35rem', lineHeight: 1.5 }}>
                    {analyzer.desc}
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.2rem' }}>
                  {analyzer.features.map((feat, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.45rem', fontSize: '0.82rem', color: '#d1d5db' }}>
                      <CheckCircle2 size={15} color={analyzer.color} style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: 'auto', paddingTop: '0.8rem' }}>
                  {analyzer.formats.map((fmt) => (
                    <span
                      key={fmt}
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        background: 'rgba(255, 255, 255, 0.06)',
                        color: '#9ca3af',
                        padding: '0.2rem 0.55rem',
                        borderRadius: '4px'
                      }}
                    >
                      {fmt}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* FORENSIC INSPECTOR SIMULATOR */}
      <section style={{
        background: 'rgba(15, 23, 42, 0.8)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '20px',
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#34d399', fontWeight: 700, letterSpacing: '0.08em' }}>
              Interactive Demo
            </span>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff' }}>Live Forensic Layer Inspection</h3>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {DEMO_LAYERS.map((layer) => (
              <button
                key={layer.id}
                onClick={() => setActiveLayer(layer.id)}
                style={{
                  padding: '0.45rem 0.85rem',
                  borderRadius: '6px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: activeLayer === layer.id ? '#3b82f6' : 'rgba(255, 255, 255, 0.05)',
                  color: activeLayer === layer.id ? '#ffffff' : '#9ca3af',
                  border: 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                {layer.label}
              </button>
            ))}
          </div>
        </div>

        {/* Simulator Viewer Canvas */}
        <div style={{
          height: '240px',
          borderRadius: '12px',
          background: activeLayer === 'rgb'
            ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
            : activeLayer === 'ela'
            ? 'radial-gradient(circle at 50% 50%, rgba(239, 68, 68, 0.35) 0%, rgba(0, 0, 0, 0.9) 70%)'
            : activeLayer === 'fft'
            ? 'repeating-radial-gradient(circle at 50% 50%, #3b82f6 0, #3b82f6 2px, transparent 4px, transparent 10px)'
            : 'linear-gradient(90deg, rgba(16,185,129,0.15) 0%, rgba(15,23,42,0.95) 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justify: 'center',
          border: '1px stroke rgba(255,255,255,0.05)',
          padding: '1.5rem',
          textAlign: 'center',
          position: 'relative'
        }}>
          <Eye size={36} color={activeLayer === 'ela' ? '#f87171' : activeLayer === 'fft' ? '#60a5fa' : '#34d399'} style={{ marginBottom: '0.8rem' }} />
          <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>
            {DEMO_LAYERS.find(l => l.id === activeLayer)?.label}
          </h4>
          <p style={{ fontSize: '0.88rem', color: '#cbd5e1', maxWidth: '520px', marginTop: '0.4rem', lineHeight: 1.5 }}>
            {DEMO_LAYERS.find(l => l.id === activeLayer)?.desc}
          </p>
        </div>
      </section>

      {/* COMPARISON MATRIX */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <SectionHeader
          tag="Why Modern Forensics"
          tagColor="#fbbf24"
          title="Traditional AI Detectors vs Our Platform"
          description="Move beyond simplistic binary guesses toward auditable, multi-signal evidence fusion."
        />

        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            textAlign: 'left',
            fontSize: '0.9rem',
            background: 'rgba(17, 24, 39, 0.4)',
            borderRadius: '12px',
            overflow: 'hidden'
          }}>
            <thead>
              <tr style={{ background: 'rgba(31, 41, 55, 0.8)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <th style={{ padding: '1rem', color: '#f3f4f6', width: '25%' }}>Capability</th>
                <th style={{ padding: '1rem', color: '#9ca3af', width: '35%' }}>Traditional AI Detectors</th>
                <th style={{ padding: '1rem', color: '#60a5fa', width: '40%' }}>Multimodal Forensic Platform</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ROWS.map((row, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <td style={{ padding: '1rem', fontWeight: 600, color: '#ffffff' }}>{row.feature}</td>
                  <td style={{ padding: '1rem', color: '#9ca3af' }}>{row.traditional}</td>
                  <td style={{ padding: '1rem', color: '#93c5fd', fontWeight: 500 }}>{row.platform}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* USE CASES GRID */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <SectionHeader
          tag="Applications"
          tagColor="#34d399"
          title="Built for High-Stakes Environments"
          description="Engineered to meet the rigorous standards required by media rooms, legal teams, and cybersecurity operations."
        />

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.25rem'
        }}>
          {USE_CASES.map((uc, idx) => {
            const IconComp = uc.icon;
            return (
              <div key={idx} style={{
                padding: '1.4rem',
                borderRadius: '12px',
                background: 'rgba(17, 24, 39, 0.5)',
                border: '1px solid rgba(255, 255, 255, 0.07)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem'
              }}>
                <IconComp size={22} color="#34d399" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff' }}>{uc.title}</h3>
                <p style={{ fontSize: '0.85rem', color: '#9ca3af', lineHeight: 1.5 }}>{uc.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* FAQ ACCORDION */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <SectionHeader
          tag="Knowledge Base"
          tagColor="#c084fc"
          title="Frequently Asked Questions"
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
          {FAQS.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                style={{
                  background: 'rgba(17, 24, 39, 0.5)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  transition: 'all 0.2s ease'
                }}
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  style={{
                    width: '100%',
                    padding: '1.1rem 1.25rem',
                    display: 'flex',
                    justify: 'space-between',
                    alignItems: 'center',
                    background: 'none',
                    border: 'none',
                    color: '#ffffff',
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    textAlign: 'left',
                    cursor: 'pointer'
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <HelpCircle size={18} color="#c084fc" />
                    {faq.q}
                  </span>
                  {isOpen ? <ChevronUp size={18} color="#9ca3af" /> : <ChevronDown size={18} color="#9ca3af" />}
                </button>
                {isOpen && (
                  <div style={{
                    padding: '0 1.25rem 1.1rem 2.6rem',
                    color: '#9ca3af',
                    fontSize: '0.88rem',
                    lineHeight: 1.6,
                    borderTop: '1px solid rgba(255, 255, 255, 0.04)'
                  }}>
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* DISCLAIMER BANNER */}
      <section className="disclaimer-banner" style={{
        display: 'flex',
        gap: '1rem',
        padding: '1.5rem',
        background: 'rgba(245, 158, 11, 0.05)',
        border: '1px solid rgba(245, 158, 11, 0.25)',
        borderRadius: '14px',
        alignItems: 'flex-start'
      }}>
        <AlertTriangle size={24} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <strong style={{ color: '#fbbf24', fontSize: '0.98rem' }}>Evidence-Based Responsibility Statement</strong>
          <p style={{ color: '#d1d5db', fontSize: '0.88rem', lineHeight: 1.55, margin: 0 }}>
            This system provides evidence-based authenticity indicators, not absolute proof of whether content is real or fake.
            AI detection algorithms can yield false positives and false negatives due to re-compression, social media filters, or novel synthesis methods. Results should always be interpreted in context and verified with trusted primary sources and cryptographic C2PA Content Credentials.
          </p>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section style={{
        textAlign: 'center',
        padding: '3rem 1.5rem',
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(168, 85, 247, 0.12) 100%)',
        borderRadius: '20px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.2rem'
      }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff' }}>
          Ready to Analyze Your First File?
        </h2>
        <p style={{ color: '#9ca3af', maxWidth: '560px', fontSize: '0.98rem', lineHeight: 1.5 }}>
          Upload images, audio clips, video clips, or PDF documents into our isolated sandbox and inspect transparent evidence signals instantly.
        </p>
        <Link
          to="/analyze"
          className="btn btn-primary"
          style={{
            padding: '0.9rem 2.2rem',
            fontSize: '1.05rem',
            fontWeight: 700,
            borderRadius: '8px',
            marginTop: '0.5rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          Launch Forensic Workbench <ArrowRight size={18} />
        </Link>
      </section>

    </div>
  );
};

export default Home;