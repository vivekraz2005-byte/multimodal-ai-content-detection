/**
 * =============================================================================
 *  Home.jsx  -  AuthenticityAI  |  Multimodal Forensics Homepage
 * =============================================================================
 *  Har section ka apna unique card design + apna hint:
 *
 *   1.  Hero              -> floating Image / Audio / Video cards + feature chips
 *   2.  Trust ticker      -> scrolling credential strip
 *   3.  Metrics           -> ring gauges with count-up numbers
 *   4.  Quick intake      -> real drag & drop zone (file type detect)
 *   5.  Workflow          -> vertical rail timeline + inspector panel
 *   6.  Analysis engines  -> tabbed showcase with spec sheet cards
 *   7.  Layer inspector   -> live layer viewer (RGB / ELA / FFT / C2PA)
 *   8.  Use cases         -> flip cards
 *   9.  Comparison        -> table card (typical detectors vs AuthenticityAI)
 *  10.  Sample report     -> mock evidence report with calibrated bars
 *  11.  Reviews           -> spotlight slider + working review form
 *  12.  FAQ               -> searchable accordion
 *  13.  Final CTA         -> glowing banner
 * =============================================================================
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AIAssistantWidget from '../components/AIAssistantWidget';
import {
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Image as ImageIcon,
  Video,
  Music,
  FileText,
  CheckCircle2,
  Lock,
  Zap,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Star,
  UploadCloud,
  Play,
  Eye,
  MessageSquarePlus,
  FileKey,
  Lightbulb,
  Scale,
  Newspaper,
  Building2,
  GraduationCap,
  Check,
  X,
  Minus,
  Search,
  Quote,
  Fingerprint,
  Hash,
  Volume2,
  Camera,
  BadgeCheck,
  Clock,
  FileCheck,
  Layers,
  Activity
} from 'lucide-react';

/* =============================================================================
   DATA
   ============================================================================= */

const TRUST_BADGES = [
  { text: 'NIST-Aligned Algorithmic Pipeline', icon: ShieldCheck },
  { text: 'C2PA Cryptographic Content Credentials', icon: FileKey },
  { text: 'Ephemeral Air-Gapped Sandboxing', icon: Lock },
  { text: 'Zero-Knowledge Storage Policy', icon: Zap },
  { text: 'SHA-256 Chain-of-Custody', icon: Hash },
  { text: 'Explainable Evidence Reports', icon: FileCheck }
];

const HERO_FEATURES = [
  {
    id: 'types',
    title: 'Image + Video + Audio',
    sub: 'All major media types',
    kind: 'icons'
  },
  {
    id: 'explain',
    title: 'Explainable results',
    sub: 'Transparent AI reasoning',
    kind: 'shield'
  },
  {
    id: 'privacy',
    title: 'Privacy-first workflow',
    sub: 'Your data, your control',
    kind: 'lock'
  }
];

const METRICS_DATA = [
  {
    value: 128450,
    decimals: 0,
    prefix: '',
    suffix: '+',
    ring: 86,
    label: 'Files audited',
    sub: 'Images, video, audio and PDFs',
    color: '#60a5fa'
  },
  {
    value: 99.8,
    decimals: 1,
    prefix: '',
    suffix: '%',
    ring: 99.8,
    label: 'Precision rating',
    sub: 'Measured in our forensic lab audit',
    color: '#34d399'
  },
  {
    value: 45200,
    decimals: 0,
    prefix: '',
    suffix: '+',
    ring: 72,
    label: 'Evidence reports',
    sub: 'Issued to legal and media teams',
    color: '#a78bfa'
  },
  {
    value: 1.8,
    decimals: 1,
    prefix: '< ',
    suffix: 's',
    ring: 64,
    label: 'Sandbox latency',
    sub: 'Real-time analysis, air-gapped',
    color: '#fbbf24'
  }
];

const WORKFLOW_STEPS = [
  {
    num: '01',
    title: 'Secure sandbox intake and hashing',
    shortDesc: 'Isolated intake with SHA-256 validation.',
    detail:
      'Files go straight into an ephemeral, air-gapped container. SHA-256 and MD5 hashes are computed instantly so chain-of-custody is locked in before anything is parsed.',
    tags: ['SHA-256', 'Air-gapped sandbox', 'Chain-of-custody'],
    output: 'Integrity hash + custody log',
    time: '0.2s'
  },
  {
    num: '02',
    title: 'Container header and magic bytes audit',
    shortDesc: 'Deterministic MIME and header checks.',
    detail:
      'Inspects magic byte signatures, chunk alignment and container integrity (ISO BMFF for video, RIFF for audio, PDF streams) to defeat header spoofing and payload obfuscation.',
    tags: ['Magic bytes', 'HEX inspection', 'MIME verification'],
    output: 'Verified true file type',
    time: '0.3s'
  },
  {
    num: '03',
    title: 'Multi-signal forensic decomposition',
    shortDesc: 'FFT, noise grain and neural artifacts.',
    detail:
      'Runs modality-specific signal analysis: 2D Fast Fourier Transform grid analysis, Error Level Analysis, Laplacian noise distribution and speech vocoder cutoff detection.',
    tags: ['2D-FFT', 'ELA analysis', 'Spectral jitter'],
    output: 'Per-signal anomaly scores',
    time: '0.7s'
  },
  {
    num: '04',
    title: 'C2PA manifest and X.509 verification',
    shortDesc: 'Signature and camera lineage audit.',
    detail:
      'Scans for embedded C2PA manifests, hardware signing keys, EXIF camera pipeline attributes and edit history trees, verified against trusted root Certificate Authorities.',
    tags: ['C2PA manifest', 'X.509 root CA', 'EXIF pipeline'],
    output: 'Provenance and signer identity',
    time: '0.3s'
  },
  {
    num: '05',
    title: 'Evidence fusion and calibrated reasoning',
    shortDesc: 'Cross-modal synthesis with confidence ranges.',
    detail:
      'Aggregates every signal into an auditable report. You get calibrated confidence intervals instead of a simple binary verdict, with each supporting artifact exposed.',
    tags: ['Evidence fusion', 'Confidence calibration', 'XAI report'],
    output: 'Explainable evidence report',
    time: '0.3s'
  }
];

const MEDIA_ANALYZERS = [
  {
    id: 'images',
    tab: 'Images',
    title: 'Image forensics engine',
    icon: ImageIcon,
    color: '#60a5fa',
    glow: 'rgba(59, 130, 246, 0.35)',
    desc: 'Pixel-level and structural analysis that isolates diffusion-generated content, splicing and local edits.',
    features: [
      'Error Level Analysis (ELA) for quantization mismatch',
      '2D FFT grid upsampling artifact identification',
      'Laplacian noise variance and PRNU sensor fingerprints',
      'Stable Diffusion, Midjourney and DALL-E metadata fingerprinting'
    ],
    formats: ['JPG', 'PNG', 'WEBP', 'TIFF', 'AVIF'],
    specs: [
      { k: 'Max size', v: '100 MB' },
      { k: 'Signals', v: '14' },
      { k: 'Avg time', v: '1.2s' }
    ]
  },
  {
    id: 'videos',
    tab: 'Video',
    title: 'Video and motion forensics',
    icon: Video,
    color: '#fbbf24',
    glow: 'rgba(245, 158, 11, 0.35)',
    desc: 'Temporal continuity and frame-by-frame container inspection built for face-swap deepfakes and synthetic generation.',
    features: [
      'PTS/DTS continuity and frame drop auditing',
      'Inter-frame motion vector variance and optical flow mapping',
      'Audio-to-video lip-sync phase drift detection',
      'Generative video signature scan (Sora, Runway Gen-3, Pika)'
    ],
    formats: ['MP4', 'MOV', 'WEBM', 'AVI', 'MKV'],
    specs: [
      { k: 'Max size', v: '100 MB' },
      { k: 'Signals', v: '18' },
      { k: 'Avg time', v: '6.4s' }
    ]
  },
  {
    id: 'audio',
    tab: 'Audio',
    title: 'Audio and voice synthesis analysis',
    icon: Music,
    color: '#34d399',
    glow: 'rgba(16, 185, 129, 0.35)',
    desc: 'Waveform and spectral bandwidth decomposition to catch neural vocoder cloning and synthetic speech.',
    features: [
      'Neural vocoder high-frequency cutoff detection (22.05 kHz / 24 kHz)',
      'Voice clone acoustic tag and formant continuity checks',
      'Microphone phase consistency and room impulse response modeling',
      'Cadence, breathing gap and unnatural prosody tagging'
    ],
    formats: ['MP3', 'WAV', 'FLAC', 'AAC', 'OGG'],
    specs: [
      { k: 'Max size', v: '100 MB' },
      { k: 'Signals', v: '11' },
      { k: 'Avg time', v: '2.1s' }
    ]
  },
  {
    id: 'documents',
    tab: 'Documents',
    title: 'Document and PDF forensics',
    icon: FileText,
    color: '#c084fc',
    glow: 'rgba(168, 85, 247, 0.35)',
    desc: 'PDF structure tree analysis, font embedding streams and stylometric provenance scoring for written text.',
    features: [
      'PDF producer fingerprinting (ReportLab, Acrobat, Ghostscript)',
      'Incremental revision tracking and hidden object extraction',
      'Creation timestamp versus font stream metadata audits',
      'Perplexity and burstiness mapping for LLM-written text'
    ],
    formats: ['PDF', 'DOCX', 'TXT', 'EPUB'],
    specs: [
      { k: 'Max size', v: '100 MB' },
      { k: 'Signals', v: '9' },
      { k: 'Avg time', v: '0.9s' }
    ]
  }
];

const DEMO_LAYERS = [
  {
    id: 'rgb',
    label: 'RGB view',
    title: 'Standard RGB view',
    desc: 'The original raster payload with no analytical transformation applied.',
    verdict: 'Looks natural to the eye',
    color: '#60a5fa'
  },
  {
    id: 'ela',
    label: 'ELA',
    title: 'Error Level Analysis',
    desc: 'Highlights compression variance. Bright regions point to local splicing or synthetic inserts.',
    verdict: 'Splice detected in top-right region',
    color: '#f87171'
  },
  {
    id: 'fft',
    label: 'FFT spectrum',
    title: '2D frequency spectrum',
    desc: 'Exposes the regular high-frequency grids that convolutional and diffusion upsamplers leave behind.',
    verdict: 'Periodic upsampler peaks found',
    color: '#34d399'
  },
  {
    id: 'c2pa',
    label: 'C2PA graph',
    title: 'C2PA manifest graph',
    desc: 'Validates signing certificates, author identity and the full modification timeline.',
    verdict: 'Signature chain intact, 2 edits logged',
    color: '#a78bfa'
  }
];

const USE_CASES = [
  {
    id: 'legal',
    icon: Scale,
    color: '#60a5fa',
    who: 'Legal and forensics teams',
    front: 'Evidence that holds up in court',
    frontSub: 'Chain-of-custody from the first byte.',
    back: [
      'Hash-locked intake log for every file',
      'Calibrated confidence ranges, not yes/no',
      'Exportable evidence report for filings'
    ],
    stat: '45K+',
    statLabel: 'reports issued'
  },
  {
    id: 'media',
    icon: Newspaper,
    color: '#fbbf24',
    who: 'Newsrooms and fact-checkers',
    front: 'Verify a viral clip before you publish',
    frontSub: 'Provenance in seconds, not hours.',
    back: [
      'C2PA lineage for photos and video',
      'Frame-level manipulation timeline',
      'Shareable summary for your editors'
    ],
    stat: '< 8s',
    statLabel: 'typical video check'
  },
  {
    id: 'security',
    icon: Building2,
    color: '#34d399',
    who: 'Enterprise security',
    front: 'Stop voice-clone and deepfake fraud',
    frontSub: 'Screen calls, recordings and documents.',
    back: [
      'Vocoder and prosody checks on audio',
      'Document tamper and revision audit',
      'Zero-knowledge retention by default'
    ],
    stat: '99.8%',
    statLabel: 'precision rating'
  },
  {
    id: 'edu',
    icon: GraduationCap,
    color: '#f472b6',
    who: 'Schools and researchers',
    front: 'Teach students what AI media looks like',
    frontSub: 'Every signal is explained in plain terms.',
    back: [
      'Layer-by-layer visual breakdowns',
      'Stylometric scoring for written work',
      'Safe sandbox, no student data kept'
    ],
    stat: '4',
    statLabel: 'media types covered'
  }
];

const COMPARE_ROWS = [
  { feature: 'Output', typical: 'Single Real/Fake score', ours: 'Confidence ranges with evidence', typicalState: 'no', oursState: 'yes' },
  { feature: 'Explainability', typical: 'Black box', ours: 'Every signal shown and described', typicalState: 'no', oursState: 'yes' },
  { feature: 'Provenance (C2PA)', typical: 'Not checked', ours: 'Manifest and X.509 chain verified', typicalState: 'no', oursState: 'yes' },
  { feature: 'Media types', typical: 'Usually one type', ours: 'Image, video, audio and PDF', typicalState: 'partial', oursState: 'yes' },
  { feature: 'File handling', typical: 'Stored on servers', ours: 'Ephemeral sandbox, auto-purged', typicalState: 'no', oursState: 'yes' },
  { feature: 'Chain-of-custody', typical: 'None', ours: 'SHA-256 hash at intake', typicalState: 'no', oursState: 'yes' }
];

const REPORT_SIGNALS = [
  { name: 'ELA quantization mismatch', value: 78, tone: 'high', note: 'Top-right region re-compressed' },
  { name: 'FFT upsampler peaks', value: 64, tone: 'high', note: 'Regular grid at 1/8 frequency' },
  { name: 'Sensor noise (PRNU) match', value: 22, tone: 'low', note: 'No camera fingerprint found' },
  { name: 'Metadata consistency', value: 41, tone: 'mid', note: 'EXIF stripped, software tag missing' },
  { name: 'C2PA manifest', value: 8, tone: 'low', note: 'No manifest embedded' }
];

const INITIAL_USER_REPORTS = [
  {
    name: 'Dr. Rajesh Varma',
    role: 'Senior Forensic Investigator',
    org: 'Cyber Forensics Lab, New Delhi',
    comment:
      'The multi-signal ELA and 2D-FFT layer decomposition gives our courtroom investigations defense-grade confidence.',
    rating: 5,
    tag: 'Verified expert'
  },
  {
    name: 'Sarah Jenkins',
    role: 'Lead Investigative Journalist',
    org: 'Global Verification Desk, London',
    comment:
      'An indispensable tool for our newsroom. Checking conflict-zone video lineage with C2PA credentials stops misinformation early.',
    rating: 5,
    tag: 'Media verification lead'
  },
  {
    name: 'Aman Sharma',
    role: 'Chief Information Security Officer',
    org: 'FinTech Guard Corp, Mumbai',
    comment:
      'Defended our executive board against sophisticated deepfake voice cloning attacks. The zero-knowledge retention policy is exceptional.',
    rating: 5,
    tag: 'Enterprise cyber lead'
  }
];

const FAQS = [
  {
    q: 'Why does this platform avoid a simple "Real" or "Fake" score?',
    a: 'Binary labels are risky and misleading. We give an auditable breakdown of every forensic signal with confidence ranges, so experts can reach defensible conclusions.'
  },
  {
    q: 'What are C2PA Content Credentials?',
    a: 'C2PA is an open standard that lets creators and camera makers cryptographically bind metadata to media using verified X.509 certificates.'
  },
  {
    q: 'Can this platform detect deepfake voices and synthetic speech?',
    a: 'Yes. The audio analyzer checks vocoder cutoff frequencies, speech prosody, acoustic phase continuity and synthetic voice markers.'
  },
  {
    q: 'Is my uploaded content private and confidential?',
    a: 'All uploads are processed inside isolated ephemeral sandboxes and automatically purged when your session completes.'
  },
  {
    q: 'Which file formats can I upload?',
    a: 'Images (JPG, PNG, WEBP, TIFF, AVIF), video (MP4, MOV, WEBM, AVI, MKV), audio (MP3, WAV, FLAC, AAC, OGG) and documents (PDF, DOCX, TXT, EPUB).'
  },
  {
    q: 'How accurate is the analysis?',
    a: 'Our lab audit measured a 99.8% precision rating. Because results come as calibrated ranges, borderline files are flagged for review instead of being forced into a verdict.'
  }
];

const DROP_TYPES = [
  { label: 'Image', icon: ImageIcon, color: '#60a5fa', exts: ['jpg', 'jpeg', 'png', 'webp', 'tiff', 'avif', 'gif'] },
  { label: 'Video', icon: Video, color: '#fbbf24', exts: ['mp4', 'mov', 'webm', 'avi', 'mkv'] },
  { label: 'Audio', icon: Music, color: '#34d399', exts: ['mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a'] },
  { label: 'Document', icon: FileText, color: '#c084fc', exts: ['pdf', 'docx', 'txt', 'epub'] }
];

const SECTION_HINTS = {
  hero: 'Tap "Start an analysis" to upload your first file. No credit card needed.',
  trust: 'These are the standards every scan is built on.',
  metrics: 'Numbers count up when you scroll to them.',
  intake: 'Drop a file here. We detect the type before you continue.',
  workflow: 'Click any stage to see what happens inside it.',
  engines: 'Switch tabs to compare what each engine inspects.',
  layers: 'Move the slider to see how strong each signal is.',
  usecases: 'Hover or tap a card to flip it.',
  compare: 'Rows show where typical detectors fall short.',
  report: 'This is a sample. Your report has the same layout.',
  reviews: 'Use the arrows or dots. Add your own review below.',
  faq: 'Type a keyword to filter the questions.',
  cta: 'Your first scan takes under two seconds.'
};

/* =============================================================================
   HELPERS + HOOKS
   ============================================================================= */

function getFileKind(fileName) {
  if (!fileName || !fileName.includes('.')) return null;
  const ext = fileName.split('.').pop().toLowerCase();
  return DROP_TYPES.find((t) => t.exts.includes(ext)) || null;
}

function formatBytes(bytes) {
  if (!bytes && bytes !== 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const REVIEWS_KEY = 'authenticity_community_reviews';

function loadUserReviews() {
  try {
    const raw = localStorage.getItem(REVIEWS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.slice(0, 20) : [];
  } catch (err) {
    return [];
  }
}

function saveUserReviews(list) {
  try {
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(list.slice(0, 20)));
  } catch (err) {
    /* storage can be blocked, safe to ignore */
  }
}

function useInView(options) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return undefined;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setInView(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.25, ...(options || {}) }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return [ref, inView];
}

function useCountUp(target, active, duration = 1600, decimals = 0) {
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!active) return undefined;
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(target * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, target, duration]);

  return decimals > 0
    ? val.toFixed(decimals)
    : Math.round(val).toLocaleString('en-US');
}

/* Small shared pieces ------------------------------------------------------- */

function Hint({ children, color = '#fbbf24' }) {
  return (
    <div className="ax-hint" style={{ '--hint': color }}>
      <Lightbulb size={14} />
      <span>{children}</span>
    </div>
  );
}

function SectionHead({ title, sub, hint, color, align = 'center' }) {
  return (
    <header className={`ax-head ax-head-${align}`}>
      <h2 className="ax-h2">{title}</h2>
      {sub && <p className="ax-sub">{sub}</p>}
      {hint && <Hint color={color}>{hint}</Hint>}
    </header>
  );
}

/* =============================================================================
   METRIC RING CARD
   ============================================================================= */

function MetricRing({ item, active, onClick, index }) {
  const display = useCountUp(item.value, active, 1700, item.decimals);
  const radius = 54;
  const circ = 2 * Math.PI * radius;
  const offset = active ? circ - (circ * item.ring) / 100 : circ;

  return (
    <button
      type="button"
      className="ax-ring-card ax-glow"
      onClick={onClick}
      style={{ '--c': item.color }}
    >
      <div className="ax-ring-wrap">
        <svg viewBox="0 0 130 130" className="ax-ring-svg" aria-hidden="true">
          <circle cx="65" cy="65" r={radius} className="ax-ring-track" />
          <circle
            cx="65"
            cy="65"
            r={radius}
            className="ax-ring-bar"
            style={{ strokeDasharray: circ, strokeDashoffset: offset }}
          />
        </svg>
        <div className="ax-ring-num">
          {item.prefix}
          {display}
          {item.suffix}
        </div>
      </div>
      <div className="ax-ring-label">{item.label}</div>
      <div className="ax-ring-sub">{item.sub}</div>
    </button>
  );
}

/* =============================================================================
   LAYER INSPECTOR SCENES (pure CSS visuals)
   ============================================================================= */

function LayerScene({ layer, intensity }) {
  const k = intensity / 100;

  if (layer === 'rgb') {
    return (
      <div className="ax-scene ax-scene-rgb">
        <div className="ax-sun" />
        <div className="ax-mtn ax-mtn-a" />
        <div className="ax-mtn ax-mtn-b" />
        <div className="ax-lake" />
        <span className="ax-scene-tag">original.jpg</span>
      </div>
    );
  }

  if (layer === 'ela') {
    return (
      <div className="ax-scene ax-scene-ela">
        <div className="ax-ela-noise" style={{ opacity: 0.35 + k * 0.5 }} />
        <div
          className="ax-ela-splice"
          style={{
            opacity: 0.25 + k * 0.75,
            boxShadow: `0 0 ${20 + k * 50}px rgba(248, 113, 113, ${0.3 + k * 0.6})`
          }}
        />
        <div className="ax-ela-edge" style={{ opacity: k }} />
        <span className="ax-scene-tag">ela_map.png</span>
      </div>
    );
  }

  if (layer === 'fft') {
    const dots = [];
    for (let r = -3; r <= 3; r += 1) {
      for (let c = -3; c <= 3; c += 1) {
        if (r === 0 && c === 0) continue;
        dots.push({ r, c });
      }
    }
    return (
      <div className="ax-scene ax-scene-fft">
        <div className="ax-fft-center" />
        {dots.map((d) => (
          <span
            key={`${d.r}-${d.c}`}
            className="ax-fft-dot"
            style={{
              left: `${50 + d.c * 11}%`,
              top: `${50 + d.r * 13}%`,
              opacity: Math.max(0.08, k - (Math.abs(d.r) + Math.abs(d.c)) * 0.07),
              transform: `translate(-50%, -50%) scale(${0.6 + k * 0.9})`
            }}
          />
        ))}
        <span className="ax-scene-tag">fft_spectrum.png</span>
      </div>
    );
  }

  return (
    <div className="ax-scene ax-scene-c2pa">
      <div className="ax-node ax-node-root" style={{ opacity: 0.4 + k * 0.6 }}>
        <BadgeCheck size={16} /> Root CA
      </div>
      <div className="ax-line ax-line-1" />
      <div className="ax-node ax-node-cam" style={{ opacity: 0.4 + k * 0.6 }}>
        <Camera size={16} /> Camera signed
      </div>
      <div className="ax-line ax-line-2" />
      <div className="ax-node ax-node-edit" style={{ opacity: 0.4 + k * 0.6 }}>
        <Layers size={16} /> Edit: crop
      </div>
      <div className="ax-line ax-line-3" />
      <div className="ax-node ax-node-edit2" style={{ opacity: 0.4 + k * 0.6 }}>
        <Layers size={16} /> Edit: color
      </div>
      <span className="ax-scene-tag">manifest.json</span>
    </div>
  );
}

/* =============================================================================
   CSS
   ============================================================================= */

const HOME_CSS = `
.ax-page {
  --bg: #050816;
  --bg-2: #0a1024;
  --line: rgba(148, 163, 255, 0.14);
  --text: #f1f5ff;
  --muted: #94a3c8;
  --blue: #3b82f6;
  --violet: #7c3aed;
  background:
    radial-gradient(1200px 600px at 85% -10%, rgba(99, 60, 255, 0.22), transparent 60%),
    radial-gradient(900px 500px at -10% 40%, rgba(37, 99, 235, 0.14), transparent 60%),
    var(--bg);
  color: var(--text);
  font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif;
  width: 100%;
  min-height: 100vh;
  overflow-x: hidden;
  position: relative;
}

.ax-page *,
.ax-page *::before,
.ax-page *::after {
  box-sizing: border-box;
}

.ax-page button {
  font-family: inherit;
}

.ax-page button:focus-visible,
.ax-page a:focus-visible,
.ax-page input:focus-visible,
.ax-page select:focus-visible,
.ax-page textarea:focus-visible {
  outline: 2px solid #93c5fd;
  outline-offset: 3px;
}

.ax-grid-bg {
  position: absolute;
  inset: 0;
  height: 900px;
  background-image:
    linear-gradient(rgba(148, 163, 255, 0.045) 1px, transparent 1px),
    linear-gradient(90deg, rgba(148, 163, 255, 0.045) 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: linear-gradient(180deg, #000 0%, transparent 85%);
  -webkit-mask-image: linear-gradient(180deg, #000 0%, transparent 85%);
  pointer-events: none;
}

.ax-wrap {
  max-width: 1240px;
  margin: 0 auto;
  padding: 0 24px 120px;
  display: flex;
  flex-direction: column;
  gap: 120px;
  position: relative;
}

/* ---------- shared section header + hint ---------- */

.ax-head {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 44px;
}
.ax-head-center { align-items: center; text-align: center; }
.ax-head-left { align-items: flex-start; text-align: left; }

.ax-h2 {
  font-size: clamp(1.9rem, 3.6vw, 2.8rem);
  font-weight: 800;
  letter-spacing: -0.025em;
  line-height: 1.12;
  margin: 0;
  color: #fff;
  max-width: 760px;
}
.ax-sub {
  margin: 0;
  color: var(--muted);
  font-size: 1.05rem;
  line-height: 1.65;
  max-width: 620px;
}

.ax-hint {
  --hint: #fbbf24;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 7px 14px 7px 11px;
  border-radius: 10px;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--hint);
  background: color-mix(in srgb, var(--hint) 10%, transparent);
  border: 1px dashed color-mix(in srgb, var(--hint) 45%, transparent);
  width: fit-content;
  max-width: 100%;
}
.ax-hint svg { flex-shrink: 0; }

/* cursor glow (kept above section rules so sticky/overflow rules below still win) */
.ax-glow { position: relative; }
.ax-glow::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  opacity: 0;
  z-index: 0;
  transition: opacity 0.35s ease;
  background: radial-gradient(280px circle at var(--mx, 50%) var(--my, 50%), rgba(129, 140, 248, 0.17), transparent 65%);
}
.ax-glow:hover::before { opacity: 1; }
.ax-glow > * { position: relative; z-index: 1; }

.ax-wrap > section { scroll-margin-top: 110px; }

/* ---------- buttons ---------- */

.ax-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 15px 30px;
  border-radius: 999px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  text-decoration: none;
  border: 1px solid transparent;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}
.ax-btn-primary {
  color: #fff;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  box-shadow: 0 12px 34px rgba(79, 70, 229, 0.45);
}
.ax-btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 18px 40px rgba(99, 70, 255, 0.55);
}
.ax-btn-ghost {
  color: #fff;
  background: rgba(10, 16, 36, 0.6);
  border-color: rgba(96, 165, 250, 0.55);
}
.ax-btn-ghost:hover {
  background: rgba(59, 130, 246, 0.14);
  transform: translateY(-2px);
}

/* =====================================================================
   1. HERO
   ===================================================================== */

.ax-hero {
  position: relative;
  padding-top: 70px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  min-height: 760px;
}

.ax-online {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 9px 22px;
  border-radius: 999px;
  border: 1px solid var(--line);
  background: rgba(8, 13, 32, 0.7);
  font-family: 'JetBrains Mono', 'SFMono-Regular', Consolas, monospace;
  font-size: 0.74rem;
  letter-spacing: 0.06em;
  color: #34d399;
}
.ax-online i {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #34d399;
  box-shadow: 0 0 10px #34d399;
  animation: ax-pulse 2s ease-in-out infinite;
}
.ax-online span.sep { width: 1px; height: 14px; background: var(--line); }
.ax-online span.plat { color: #7dd3fc; }

.ax-enterprise {
  margin-top: 20px;
  display: inline-flex;
  align-items: center;
  gap: 9px;
  padding: 9px 22px;
  border-radius: 999px;
  border: 1px solid rgba(96, 165, 250, 0.55);
  background: rgba(30, 58, 138, 0.2);
  color: #a5b4fc;
  font-weight: 600;
  font-size: 0.95rem;
}

.ax-hero h1 {
  margin: 28px 0 0;
  font-size: clamp(2.6rem, 6.2vw, 4.9rem);
  font-weight: 800;
  line-height: 1.08;
  letter-spacing: -0.035em;
  color: #fff;
}
.ax-grad-text {
  background: linear-gradient(90deg, #38bdf8 0%, #818cf8 45%, #c084fc 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.ax-hero-p {
  margin: 26px auto 0;
  max-width: 640px;
  color: #a4b0d0;
  font-size: 1.18rem;
  line-height: 1.7;
}

.ax-hero-cta {
  margin-top: 36px;
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  justify-content: center;
}

.ax-hero-hint { margin-top: 26px; }

.ax-feature-row {
  margin-top: 54px;
  display: grid;
  grid-template-columns: 1.25fr 1fr 1fr;
  gap: 18px;
  width: 100%;
  max-width: 1060px;
}
.ax-feature {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 22px 26px;
  text-align: left;
  border-radius: 16px;
  border: 1px solid var(--line);
  background: linear-gradient(160deg, rgba(14, 21, 48, 0.85), rgba(7, 11, 28, 0.85));
  cursor: pointer;
  color: inherit;
  transition: border-color 0.25s ease, transform 0.25s ease;
}
.ax-feature:hover {
  border-color: rgba(96, 165, 250, 0.5);
  transform: translateY(-3px);
}
.ax-feature-ico {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 14px;
  background: rgba(99, 102, 241, 0.13);
  color: #818cf8;
  flex-shrink: 0;
}
.ax-feature-ico.round {
  width: 56px;
  height: 56px;
  padding: 0;
  border-radius: 50%;
}
.ax-feature-ico.shield { background: rgba(59, 130, 246, 0.14); color: #60a5fa; }
.ax-feature-ico.lock { background: rgba(20, 184, 166, 0.14); color: #2dd4bf; }
.ax-feature b { display: block; font-size: 0.98rem; color: #fff; }
.ax-feature small { display: block; margin-top: 4px; color: #6b7aa6; font-size: 0.85rem; }

/* floating hero cards */
.ax-float {
  position: absolute;
  width: 270px;
  padding: 12px;
  border-radius: 18px;
  border: 1px solid rgba(99, 102, 241, 0.55);
  background: linear-gradient(160deg, rgba(14, 20, 48, 0.92), rgba(8, 12, 30, 0.95));
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.55), 0 0 40px rgba(79, 70, 229, 0.18);
  text-align: left;
}
.ax-float-img { left: -30px; top: 130px; transform: rotate(-7deg); animation: ax-bob-a 7s ease-in-out infinite; }
.ax-float-aud { left: -10px; top: 440px; transform: rotate(-3deg); width: 290px; animation: ax-bob-b 8s ease-in-out infinite; }
.ax-float-vid { right: -40px; top: 190px; transform: rotate(6deg); width: 300px; animation: ax-bob-c 7.5s ease-in-out infinite; }

.ax-float-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10px;
  font-size: 0.78rem;
  color: #b4bfe0;
}
.ax-float-foot .lab { display: flex; align-items: center; gap: 8px; }
.ax-float-foot .ico {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(30, 41, 90, 0.8);
  color: #c7d2fe;
}
.ax-verified {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(52, 211, 153, 0.4);
  color: #34d399;
  font-weight: 700;
  font-size: 0.72rem;
}

.ax-pic {
  position: relative;
  height: 130px;
  border-radius: 12px;
  overflow: hidden;
}
.ax-pic-mount { background: linear-gradient(180deg, #2b1d5c 0%, #7a4fa8 45%, #f08bb0 70%, #3b2f6e 100%); }
.ax-pic-mount::before {
  content: '';
  position: absolute;
  left: -10%;
  right: -10%;
  bottom: 28px;
  height: 70px;
  background: #1c1840;
  clip-path: polygon(0 100%, 12% 45%, 24% 70%, 38% 15%, 52% 62%, 66% 30%, 80% 72%, 100% 40%, 100% 100%);
}
.ax-pic-mount::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 32px;
  background: linear-gradient(180deg, #2a2a66, #151a44);
}

.ax-pic-city { background: linear-gradient(180deg, #1c1550 0%, #5b2f86 55%, #d1608f 100%); }
.ax-bldg {
  position: absolute;
  bottom: 0;
  background:
    repeating-linear-gradient(0deg, transparent 0 7px, rgba(253, 224, 71, 0.55) 7px 9px),
    #141233;
  background-size: 100% 100%;
}
.ax-play {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 46px;
  height: 46px;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background: rgba(8, 10, 30, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.ax-wave {
  height: 86px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
  padding: 0 10px;
  background: rgba(30, 27, 75, 0.35);
}
.ax-wave i {
  width: 3px;
  border-radius: 3px;
  background: linear-gradient(180deg, #c084fc, #38bdf8);
  animation: ax-eq 1.4s ease-in-out infinite;
  animation-delay: calc(var(--i) * 45ms);
}

/* =====================================================================
   2. TRUST TICKER
   ===================================================================== */

.ax-ticker {
  overflow: hidden;
  border-top: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
  padding: 20px 0;
  mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
  -webkit-mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
}
.ax-ticker-track {
  display: flex;
  gap: 48px;
  width: max-content;
  animation: ax-marquee 38s linear infinite;
}
.ax-ticker:hover .ax-ticker-track { animation-play-state: paused; }
.ax-ticker-item {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #b9c4e6;
  font-weight: 600;
  font-size: 0.95rem;
  white-space: nowrap;
}
.ax-ticker-item svg { color: #60a5fa; }
.ax-ticker-hint { display: flex; justify-content: center; margin-top: 18px; }

/* =====================================================================
   3. METRIC RINGS
   ===================================================================== */

.ax-ring-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
}
.ax-ring-card {
  --c: #60a5fa;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 30px 20px 26px;
  border-radius: 28px 28px 28px 8px;
  border: 1px solid var(--line);
  background: radial-gradient(circle at 50% 0%, color-mix(in srgb, var(--c) 14%, transparent), transparent 62%), #0a1027;
  color: inherit;
  cursor: pointer;
  text-align: center;
  transition: border-color 0.25s ease, transform 0.25s ease;
}
.ax-ring-card:hover { border-color: var(--c); transform: translateY(-4px); }
.ax-ring-wrap { position: relative; width: 150px; height: 150px; }
.ax-ring-svg { width: 100%; height: 100%; transform: rotate(-90deg); }
.ax-ring-track { fill: none; stroke: rgba(148, 163, 255, 0.12); stroke-width: 9; }
.ax-ring-bar {
  fill: none;
  stroke: var(--c);
  stroke-width: 9;
  stroke-linecap: round;
  transition: stroke-dashoffset 1.7s cubic-bezier(0.22, 1, 0.36, 1);
  filter: drop-shadow(0 0 6px var(--c));
}
.ax-ring-num {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.45rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: #fff;
  font-variant-numeric: tabular-nums;
}
.ax-ring-label { margin-top: 12px; font-size: 1.08rem; font-weight: 700; color: #fff; }
.ax-ring-sub { font-size: 0.86rem; color: var(--muted); line-height: 1.45; }

/* =====================================================================
   4. QUICK INTAKE (drop zone)
   ===================================================================== */

.ax-drop-shell {
  display: grid;
  grid-template-columns: 1.6fr 1fr;
  gap: 24px;
}
.ax-drop {
  position: relative;
  min-height: 330px;
  border-radius: 26px;
  padding: 44px 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  text-align: center;
  cursor: pointer;
  background: rgba(10, 16, 39, 0.7);
  border: 2px dashed rgba(96, 165, 250, 0.4);
  transition: background 0.25s ease, border-color 0.25s ease, transform 0.25s ease;
}
.ax-drop:hover,
.ax-drop.is-over {
  background: rgba(37, 99, 235, 0.12);
  border-color: #60a5fa;
}
.ax-drop.is-over { transform: scale(1.015); }
.ax-drop-ico {
  width: 84px;
  height: 84px;
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #60a5fa;
  background: rgba(59, 130, 246, 0.14);
  animation: ax-float-ico 3.4s ease-in-out infinite;
}
.ax-drop h3 { margin: 6px 0 0; font-size: 1.5rem; font-weight: 800; color: #fff; }
.ax-drop p { margin: 0; color: var(--muted); max-width: 440px; line-height: 1.6; }
.ax-drop-file {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 18px;
  border-radius: 14px;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(52, 211, 153, 0.4);
  text-align: left;
  max-width: 100%;
}
.ax-drop-file b { display: block; color: #fff; font-size: 0.95rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 260px; }
.ax-drop-file small { color: #6ee7b7; }
.ax-drop-error { color: #fca5a5; font-weight: 600; font-size: 0.9rem; }
.ax-drop-side {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.ax-type-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 18px;
  border-radius: 14px;
  background: #0a1027;
  border: 1px solid var(--line);
  border-left: 4px solid var(--tc);
}
.ax-type-row.is-hit { background: color-mix(in srgb, var(--tc) 14%, #0a1027); border-color: var(--tc); }
.ax-type-row svg { color: var(--tc); flex-shrink: 0; }
.ax-type-row b { color: #fff; font-size: 0.95rem; display: block; }
.ax-type-row small { color: var(--muted); font-size: 0.8rem; }
.ax-drop-hint { margin-top: 6px; }

/* =====================================================================
   5. WORKFLOW (rail timeline)
   ===================================================================== */

.ax-flow {
  display: grid;
  grid-template-columns: 1fr 1.15fr;
  gap: 40px;
  align-items: start;
}
.ax-rail { position: relative; display: flex; flex-direction: column; gap: 14px; padding-left: 8px; }
.ax-rail::before {
  content: '';
  position: absolute;
  left: 31px;
  top: 28px;
  bottom: 28px;
  width: 2px;
  background: linear-gradient(180deg, #3b82f6, rgba(139, 92, 246, 0.2));
}
.ax-step {
  position: relative;
  display: flex;
  gap: 18px;
  padding: 16px 18px 16px 12px;
  border-radius: 16px;
  border: 1px solid transparent;
  background: transparent;
  text-align: left;
  color: inherit;
  cursor: pointer;
  transition: background 0.25s ease, border-color 0.25s ease;
}
.ax-step:hover { background: rgba(59, 130, 246, 0.06); }
.ax-step.is-active {
  background: linear-gradient(90deg, rgba(59, 130, 246, 0.16), rgba(59, 130, 246, 0.02));
  border-color: rgba(96, 165, 250, 0.4);
}
.ax-step-dot {
  position: relative;
  z-index: 1;
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'JetBrains Mono', Consolas, monospace;
  font-weight: 800;
  font-size: 0.85rem;
  background: #0a1027;
  border: 2px solid #334070;
  color: #7c8bb8;
  transition: all 0.25s ease;
}
.ax-step.is-active .ax-step-dot {
  background: #2563eb;
  border-color: #93c5fd;
  color: #fff;
  box-shadow: 0 0 18px rgba(59, 130, 246, 0.7);
}
.ax-step h4 { margin: 0; font-size: 1.02rem; font-weight: 700; color: #cbd5f5; line-height: 1.35; }
.ax-step.is-active h4 { color: #fff; }
.ax-step p { margin: 4px 0 0; font-size: 0.86rem; color: var(--muted); }

.ax-panel {
  position: sticky;
  top: 96px;
  border-radius: 24px;
  padding: 34px;
  background: linear-gradient(160deg, #0f1838 0%, #080d22 100%);
  border: 1px solid rgba(96, 165, 250, 0.35);
  box-shadow: 0 30px 70px rgba(0, 0, 0, 0.5);
}
.ax-panel-top { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
.ax-panel-badge {
  padding: 5px 12px;
  border-radius: 8px;
  background: #2563eb;
  color: #fff;
  font-weight: 800;
  font-size: 0.78rem;
  font-family: 'JetBrains Mono', Consolas, monospace;
}
.ax-panel-time {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #fbbf24;
  font-size: 0.85rem;
  font-weight: 700;
}
.ax-panel h3 { margin: 20px 0 12px; font-size: 1.5rem; font-weight: 800; color: #fff; line-height: 1.25; }
.ax-panel > p { margin: 0; color: #d3dbf5; line-height: 1.75; font-size: 1.02rem; }
.ax-panel-out {
  margin-top: 22px;
  padding: 14px 16px;
  border-radius: 12px;
  background: rgba(52, 211, 153, 0.08);
  border: 1px solid rgba(52, 211, 153, 0.3);
  color: #6ee7b7;
  font-size: 0.9rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
}
.ax-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 20px; }
.ax-tag {
  padding: 5px 12px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  color: #93c5fd;
  background: rgba(147, 197, 253, 0.08);
  border: 1px solid rgba(147, 197, 253, 0.25);
}
.ax-panel-nav { display: flex; gap: 10px; margin-top: 26px; }
.ax-mini-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 16px;
  border-radius: 10px;
  border: 1px solid var(--line);
  background: rgba(255, 255, 255, 0.04);
  color: #dbe4ff;
  font-weight: 600;
  font-size: 0.86rem;
  cursor: pointer;
}
.ax-mini-btn:hover { background: rgba(59, 130, 246, 0.16); }
.ax-mini-btn:disabled { opacity: 0.35; cursor: not-allowed; }

/* =====================================================================
   6. ANALYSIS ENGINES (tabs + spec sheet)
   ===================================================================== */

.ax-tabs {
  display: inline-flex;
  gap: 6px;
  padding: 6px;
  border-radius: 16px;
  background: #0a1027;
  border: 1px solid var(--line);
  margin: 0 auto 30px;
  flex-wrap: wrap;
  justify-content: center;
}
.ax-tab {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 11px 20px;
  border-radius: 11px;
  border: none;
  background: transparent;
  color: var(--muted);
  font-weight: 700;
  font-size: 0.92rem;
  cursor: pointer;
  transition: all 0.2s ease;
}
.ax-tab:hover { color: #fff; }
.ax-tab.is-active { color: #fff; background: color-mix(in srgb, var(--tc) 22%, transparent); box-shadow: inset 0 0 0 1px var(--tc); }
.ax-tab.is-active svg { color: var(--tc); }
.ax-tabs-wrap { display: flex; justify-content: center; }

.ax-engine {
  --ec: #60a5fa;
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  gap: 0;
  border-radius: 28px;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--ec) 45%, transparent);
  background: #080d22;
  box-shadow: 0 30px 80px color-mix(in srgb, var(--ec) 14%, transparent);
}
.ax-engine-main { padding: 40px; }
.ax-engine-ico {
  width: 60px;
  height: 60px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--ec);
  background: color-mix(in srgb, var(--ec) 16%, transparent);
}
.ax-engine-main h3 { margin: 20px 0 10px; font-size: 1.7rem; font-weight: 800; color: #fff; }
.ax-engine-main > p { margin: 0 0 24px; color: var(--muted); line-height: 1.7; }
.ax-feat-list { display: flex; flex-direction: column; gap: 12px; }
.ax-feat-item { display: flex; gap: 12px; align-items: flex-start; color: #dbe4ff; font-size: 0.94rem; line-height: 1.5; }
.ax-feat-item svg { color: var(--ec); flex-shrink: 0; margin-top: 2px; }

.ax-engine-side {
  padding: 40px;
  background:
    radial-gradient(circle at 80% 10%, color-mix(in srgb, var(--ec) 22%, transparent), transparent 55%),
    #0b1230;
  border-left: 1px solid var(--line);
  display: flex;
  flex-direction: column;
  gap: 26px;
}
.ax-spec-title { font-size: 0.85rem; color: var(--muted); font-weight: 600; margin-bottom: 12px; }
.ax-spec-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.ax-spec {
  padding: 14px 10px;
  border-radius: 12px;
  text-align: center;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--line);
}
.ax-spec b { display: block; font-size: 1.25rem; color: #fff; font-weight: 800; }
.ax-spec small { color: var(--muted); font-size: 0.76rem; }
.ax-fmt-wrap { display: flex; flex-wrap: wrap; gap: 8px; }
.ax-fmt {
  padding: 7px 14px;
  border-radius: 8px;
  font-family: 'JetBrains Mono', Consolas, monospace;
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--ec);
  background: color-mix(in srgb, var(--ec) 10%, transparent);
  border: 1px solid color-mix(in srgb, var(--ec) 35%, transparent);
}
.ax-engine-cta { margin-top: auto; }

/* =====================================================================
   7. LAYER INSPECTOR
   ===================================================================== */

.ax-lab {
  display: grid;
  grid-template-columns: 1.3fr 1fr;
  gap: 24px;
}
.ax-viewer {
  border-radius: 24px;
  padding: 16px;
  background: #060a1c;
  border: 1px solid var(--line);
}
.ax-viewer-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 6px 14px;
}
.ax-viewer-bar i { width: 10px; height: 10px; border-radius: 50%; background: #334070; }
.ax-viewer-bar i:nth-child(1) { background: #f87171; }
.ax-viewer-bar i:nth-child(2) { background: #fbbf24; }
.ax-viewer-bar i:nth-child(3) { background: #34d399; }
.ax-viewer-bar span { margin-left: auto; font-family: 'JetBrains Mono', Consolas, monospace; font-size: 0.75rem; color: #6b7aa6; }

.ax-scene {
  position: relative;
  height: 340px;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid var(--line);
}
.ax-scene-tag {
  position: absolute;
  left: 12px;
  bottom: 10px;
  padding: 4px 10px;
  border-radius: 6px;
  background: rgba(2, 4, 15, 0.7);
  color: #cbd5f5;
  font-family: 'JetBrains Mono', Consolas, monospace;
  font-size: 0.72rem;
}
.ax-scene-rgb { background: linear-gradient(180deg, #1d1450 0%, #6b3f9e 45%, #f08bb0 72%, #2b2a68 100%); }
.ax-sun { position: absolute; left: 62%; top: 34%; width: 70px; height: 70px; border-radius: 50%; background: radial-gradient(circle, #ffe9b8, rgba(255, 190, 120, 0)); }
.ax-mtn { position: absolute; left: -5%; right: -5%; bottom: 70px; background: #17133c; }
.ax-mtn-a { height: 170px; clip-path: polygon(0 100%, 14% 50%, 26% 72%, 42% 12%, 58% 66%, 74% 30%, 88% 70%, 100% 44%, 100% 100%); }
.ax-mtn-b { height: 110px; background: #241d58; clip-path: polygon(0 100%, 20% 40%, 40% 78%, 62% 28%, 80% 76%, 100% 52%, 100% 100%); opacity: 0.9; }
.ax-lake { position: absolute; left: 0; right: 0; bottom: 0; height: 80px; background: linear-gradient(180deg, #2c2f78, #111640); }

.ax-scene-ela { background: #05060f; }
.ax-ela-noise {
  position: absolute;
  inset: 0;
  background:
    repeating-linear-gradient(45deg, rgba(96, 165, 250, 0.35) 0 2px, transparent 2px 5px),
    repeating-linear-gradient(-30deg, rgba(167, 139, 250, 0.28) 0 1px, transparent 1px 4px);
  transition: opacity 0.2s ease;
}
.ax-ela-splice {
  position: absolute;
  right: 12%;
  top: 14%;
  width: 34%;
  height: 40%;
  border-radius: 14px;
  background: repeating-linear-gradient(135deg, #fecaca 0 3px, #f87171 3px 7px);
  transition: all 0.2s ease;
}
.ax-ela-edge {
  position: absolute;
  left: 18%;
  bottom: 18%;
  width: 22%;
  height: 22%;
  border: 2px solid #fbbf24;
  border-radius: 10px;
  transition: opacity 0.2s ease;
}

.ax-scene-fft { background: radial-gradient(circle at 50% 50%, #0b1b3a 0%, #03060f 75%); }
.ax-fft-center {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 70px;
  height: 70px;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background: radial-gradient(circle, #fff, rgba(125, 211, 252, 0.4) 40%, transparent 70%);
}
.ax-fft-dot {
  position: absolute;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: radial-gradient(circle, #6ee7b7, rgba(52, 211, 153, 0) 70%);
  transition: all 0.2s ease;
}

.ax-scene-c2pa {
  background: linear-gradient(160deg, #0d0a2a, #060a1c);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0;
}
.ax-node {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 16px;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 700;
  background: rgba(124, 58, 237, 0.16);
  border: 1px solid rgba(167, 139, 250, 0.6);
  color: #ddd6fe;
  transition: opacity 0.2s ease;
}
.ax-node-cam { border-color: rgba(52, 211, 153, 0.6); background: rgba(16, 185, 129, 0.13); color: #a7f3d0; }
.ax-node-edit, .ax-node-edit2 { border-color: rgba(251, 191, 36, 0.6); background: rgba(245, 158, 11, 0.12); color: #fde68a; }
.ax-line { width: 2px; height: 26px; background: linear-gradient(180deg, #a78bfa, #34d399); }

.ax-lab-side { display: flex; flex-direction: column; gap: 14px; }
.ax-layer-btn {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 15px 18px;
  border-radius: 14px;
  border: 1px solid var(--line);
  background: #0a1027;
  color: inherit;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
}
.ax-layer-btn:hover { border-color: var(--lc); }
.ax-layer-btn.is-active { border-color: var(--lc); background: color-mix(in srgb, var(--lc) 12%, #0a1027); }
.ax-layer-btn .sw { width: 12px; height: 12px; border-radius: 4px; background: var(--lc); flex-shrink: 0; }
.ax-layer-btn b { display: block; color: #fff; font-size: 0.95rem; }
.ax-layer-btn small { color: var(--muted); font-size: 0.8rem; }
.ax-readout {
  margin-top: 4px;
  padding: 20px;
  border-radius: 16px;
  background: #060a1c;
  border: 1px solid var(--line);
}
.ax-readout p { margin: 0 0 14px; color: #cbd5f5; line-height: 1.65; font-size: 0.94rem; }
.ax-slider-row { display: flex; align-items: center; gap: 12px; }
.ax-slider-row label { font-size: 0.8rem; color: var(--muted); font-weight: 600; white-space: nowrap; }
.ax-slider-row output { font-family: 'JetBrains Mono', Consolas, monospace; font-size: 0.85rem; color: #fff; min-width: 38px; text-align: right; }
.ax-range { flex: 1; accent-color: #60a5fa; cursor: pointer; }
.ax-verdict {
  margin-top: 14px;
  display: flex;
  align-items: center;
  gap: 9px;
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--vc);
}

/* =====================================================================
   8. USE CASES (flip cards)
   ===================================================================== */

.ax-flip-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 22px;
}
.ax-flip {
  --fc: #60a5fa;
  perspective: 1200px;
  height: 330px;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  color: inherit;
  text-align: left;
}
.ax-flip-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
  transform-style: preserve-3d;
}
.ax-flip:hover .ax-flip-inner,
.ax-flip.is-flipped .ax-flip-inner,
.ax-flip:focus-visible .ax-flip-inner { transform: rotateY(180deg); }
.ax-face {
  position: absolute;
  inset: 0;
  padding: 28px;
  border-radius: 22px;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  display: flex;
  flex-direction: column;
  border: 1px solid color-mix(in srgb, var(--fc) 40%, transparent);
}
.ax-face-front {
  background:
    radial-gradient(circle at 100% 0%, color-mix(in srgb, var(--fc) 26%, transparent), transparent 55%),
    #0a1027;
}
.ax-face-back {
  transform: rotateY(180deg);
  background: linear-gradient(160deg, color-mix(in srgb, var(--fc) 18%, #0a1027), #070b1e);
}
.ax-flip-ico {
  width: 54px;
  height: 54px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--fc);
  background: color-mix(in srgb, var(--fc) 16%, transparent);
}
.ax-flip-who { margin-top: 20px; color: var(--fc); font-weight: 700; font-size: 0.88rem; }
.ax-flip-front-title { margin: 10px 0 8px; font-size: 1.35rem; font-weight: 800; color: #fff; line-height: 1.25; }
.ax-flip-front-sub { margin: 0; color: var(--muted); font-size: 0.92rem; line-height: 1.55; }
.ax-flip-more { margin-top: auto; font-size: 0.8rem; color: #6b7aa6; font-weight: 600; }
.ax-flip-back-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 12px; }
.ax-flip-back-list li { display: flex; gap: 10px; align-items: flex-start; font-size: 0.92rem; color: #dbe4ff; line-height: 1.5; }
.ax-flip-back-list svg { color: var(--fc); flex-shrink: 0; margin-top: 2px; }
.ax-flip-stat { margin-top: auto; padding-top: 16px; border-top: 1px solid var(--line); display: flex; align-items: baseline; gap: 10px; }
.ax-flip-stat b { font-size: 1.9rem; font-weight: 800; color: var(--fc); }
.ax-flip-stat span { color: var(--muted); font-size: 0.85rem; }

/* =====================================================================
   9. COMPARISON TABLE
   ===================================================================== */

.ax-compare {
  border-radius: 24px;
  overflow: hidden;
  border: 1px solid var(--line);
  background: #080d22;
}
.ax-cmp-row {
  display: grid;
  grid-template-columns: 1fr 1.2fr 1.4fr;
  align-items: center;
}
.ax-cmp-row > div { padding: 18px 24px; font-size: 0.94rem; }
.ax-cmp-row + .ax-cmp-row { border-top: 1px solid var(--line); }
.ax-cmp-head > div { font-weight: 800; color: #fff; background: #0c1330; }
.ax-cmp-head .ours { background: linear-gradient(135deg, rgba(59, 130, 246, 0.35), rgba(139, 92, 246, 0.35)); }
.ax-cmp-feature { color: #dbe4ff; font-weight: 700; }
.ax-cmp-cell { display: flex; align-items: center; gap: 10px; color: var(--muted); }
.ax-cmp-cell.ours { color: #e7edff; background: rgba(59, 130, 246, 0.06); }
.ax-state {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.ax-state.yes { background: rgba(52, 211, 153, 0.18); color: #34d399; }
.ax-state.no { background: rgba(248, 113, 113, 0.16); color: #f87171; }
.ax-state.partial { background: rgba(251, 191, 36, 0.16); color: #fbbf24; }
.ax-cmp-row:not(.ax-cmp-head):hover { background: rgba(255, 255, 255, 0.025); }

/* =====================================================================
   10. SAMPLE REPORT
   ===================================================================== */

.ax-report-shell {
  display: grid;
  grid-template-columns: 1fr 1.25fr;
  gap: 28px;
  align-items: stretch;
}
.ax-doc {
  position: relative;
  padding: 30px;
  border-radius: 6px 22px 22px 22px;
  background: linear-gradient(170deg, #0f1838, #080d22);
  border: 1px solid rgba(96, 165, 250, 0.3);
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.ax-doc::before {
  content: 'SAMPLE';
  position: absolute;
  right: 18px;
  top: 16px;
  padding: 3px 10px;
  border-radius: 6px;
  border: 1px solid rgba(251, 191, 36, 0.5);
  color: #fbbf24;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.1em;
}
.ax-doc-file { display: flex; align-items: center; gap: 12px; }
.ax-doc-thumb { width: 54px; height: 54px; border-radius: 12px; background: linear-gradient(180deg, #2b1d5c, #f08bb0); flex-shrink: 0; }
.ax-doc-file b { display: block; color: #fff; font-size: 0.98rem; }
.ax-doc-file small { color: var(--muted); font-family: 'JetBrains Mono', Consolas, monospace; font-size: 0.72rem; }
.ax-gauge {
  position: relative;
  height: 14px;
  border-radius: 999px;
  background: linear-gradient(90deg, #34d399 0%, #fbbf24 50%, #f87171 100%);
}
.ax-gauge-range {
  position: absolute;
  top: -5px;
  height: 24px;
  border-radius: 8px;
  border: 2px solid #fff;
  background: rgba(255, 255, 255, 0.18);
}
.ax-gauge-scale { display: flex; justify-content: space-between; font-size: 0.72rem; color: #6b7aa6; margin-top: 8px; }
.ax-doc-verdict {
  padding: 16px;
  border-radius: 14px;
  background: rgba(248, 113, 113, 0.08);
  border: 1px solid rgba(248, 113, 113, 0.35);
}
.ax-doc-verdict b { color: #fca5a5; font-size: 1.05rem; display: block; }
.ax-doc-verdict p { margin: 6px 0 0; color: #d3dbf5; font-size: 0.88rem; line-height: 1.55; }
.ax-doc-hash { font-family: 'JetBrains Mono', Consolas, monospace; font-size: 0.72rem; color: #6b7aa6; word-break: break-all; }

.ax-signals { display: flex; flex-direction: column; gap: 14px; }
.ax-signal {
  padding: 18px 20px;
  border-radius: 16px;
  background: #0a1027;
  border: 1px solid var(--line);
}
.ax-signal-top { display: flex; justify-content: space-between; align-items: center; gap: 10px; }
.ax-signal-top b { color: #fff; font-size: 0.95rem; }
.ax-signal-top span { font-family: 'JetBrains Mono', Consolas, monospace; font-size: 0.85rem; font-weight: 700; }
.ax-signal.high .ax-signal-top span { color: #f87171; }
.ax-signal.mid .ax-signal-top span { color: #fbbf24; }
.ax-signal.low .ax-signal-top span { color: #34d399; }
.ax-bar { height: 8px; border-radius: 999px; background: rgba(148, 163, 255, 0.12); margin: 12px 0 8px; overflow: hidden; }
.ax-bar i { display: block; height: 100%; border-radius: 999px; width: 0; transition: width 1.3s cubic-bezier(0.22, 1, 0.36, 1); }
.ax-signal.high .ax-bar i { background: linear-gradient(90deg, #fb923c, #f87171); }
.ax-signal.mid .ax-bar i { background: linear-gradient(90deg, #facc15, #fbbf24); }
.ax-signal.low .ax-bar i { background: linear-gradient(90deg, #34d399, #6ee7b7); }
.ax-signal small { color: var(--muted); font-size: 0.82rem; }

/* =====================================================================
   11. REVIEWS
   ===================================================================== */

.ax-spot {
  position: relative;
  border-radius: 28px;
  padding: 48px 56px;
  background:
    radial-gradient(circle at 10% 0%, rgba(52, 211, 153, 0.14), transparent 55%),
    linear-gradient(160deg, #0d1534, #070b1e);
  border: 1px solid rgba(52, 211, 153, 0.3);
  overflow: hidden;
}
.ax-spot-quote-ico { position: absolute; right: 36px; top: 28px; color: rgba(52, 211, 153, 0.18); }
.ax-spot-tag {
  display: inline-block;
  padding: 5px 12px;
  border-radius: 8px;
  background: rgba(52, 211, 153, 0.12);
  color: #34d399;
  font-weight: 700;
  font-size: 0.8rem;
}
.ax-spot blockquote {
  margin: 22px 0 28px;
  font-size: clamp(1.25rem, 2.3vw, 1.75rem);
  line-height: 1.55;
  font-weight: 600;
  color: #fff;
  max-width: 860px;
}
.ax-spot-foot { display: flex; align-items: center; justify-content: space-between; gap: 20px; flex-wrap: wrap; }
.ax-spot-who { display: flex; align-items: center; gap: 14px; }
.ax-avatar {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  color: #fff;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
}
.ax-spot-who b { display: block; color: #fff; }
.ax-spot-who small { color: var(--muted); }
.ax-stars { display: flex; gap: 3px; margin-top: 6px; }
.ax-spot-ctrl { display: flex; align-items: center; gap: 12px; }
.ax-arrow {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: 1px solid var(--line);
  background: rgba(255, 255, 255, 0.04);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.ax-arrow:hover { background: rgba(52, 211, 153, 0.18); border-color: #34d399; }
.ax-dots { display: flex; gap: 8px; }
.ax-dots button {
  width: 9px;
  height: 9px;
  padding: 0;
  border-radius: 50%;
  border: none;
  background: #334070;
  cursor: pointer;
}
.ax-dots button.is-on { width: 26px; border-radius: 6px; background: #34d399; }

.ax-form-card {
  margin-top: 28px;
  border-radius: 24px;
  padding: 34px;
  background: #0a1027;
  border: 1px solid var(--line);
}
.ax-form-title { display: flex; align-items: center; gap: 12px; margin-bottom: 22px; }
.ax-form-title h3 { margin: 0; font-size: 1.3rem; font-weight: 800; color: #fff; }
.ax-form-title svg { color: #34d399; }
.ax-form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 18px; }
.ax-field { display: flex; flex-direction: column; gap: 7px; }
.ax-field.full { grid-column: 1 / -1; }
.ax-field label { font-size: 0.84rem; color: var(--muted); font-weight: 600; }
.ax-input {
  width: 100%;
  padding: 13px 16px;
  border-radius: 12px;
  border: 1px solid var(--line);
  background: #050816;
  color: #fff;
  font-size: 0.95rem;
  font-family: inherit;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.ax-input:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.25); }
.ax-success {
  padding: 13px 16px;
  margin-bottom: 18px;
  border-radius: 10px;
  background: rgba(16, 185, 129, 0.14);
  border: 1px solid #10b981;
  color: #34d399;
  font-weight: 700;
  font-size: 0.92rem;
}
.ax-mini-reviews { margin-top: 28px; display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px; }
.ax-mini-review {
  padding: 18px 20px;
  border-radius: 14px;
  background: #0a1027;
  border: 1px solid var(--line);
  border-top: 3px solid #34d399;
  cursor: pointer;
  text-align: left;
  color: inherit;
}
.ax-mini-review p { margin: 0 0 10px; color: #cbd5f5; font-size: 0.88rem; line-height: 1.55; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
.ax-mini-review b { color: #fff; font-size: 0.88rem; }
.ax-mini-review small { display: block; color: var(--muted); font-size: 0.78rem; }

/* =====================================================================
   12. FAQ
   ===================================================================== */

.ax-faq-shell { max-width: 860px; margin: 0 auto; width: 100%; }
.ax-search { position: relative; max-width: 460px; width: 100%; margin: 6px auto 0; }
.ax-search svg { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: #6b7aa6; }
.ax-search .ax-input { padding-left: 46px; border-radius: 999px; }
.ax-faq-list { display: flex; flex-direction: column; gap: 12px; }
.ax-faq {
  border-radius: 16px;
  background: #0a1027;
  border: 1px solid var(--line);
  overflow: hidden;
  transition: border-color 0.2s ease;
}
.ax-faq.is-open { border-color: rgba(192, 132, 252, 0.55); }
.ax-faq-q {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 24px;
  border: none;
  background: transparent;
  color: #fff;
  font-weight: 700;
  font-size: 1.02rem;
  text-align: left;
  cursor: pointer;
}
.ax-faq-q span { display: flex; align-items: center; gap: 14px; }
.ax-faq-q svg:first-child { color: #c084fc; flex-shrink: 0; }
.ax-faq-a {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.35s ease;
}
.ax-faq.is-open .ax-faq-a { grid-template-rows: 1fr; }
.ax-faq-a > div { overflow: hidden; }
.ax-faq-a p { margin: 0; padding: 0 24px 22px 58px; color: var(--muted); line-height: 1.75; font-size: 0.96rem; }
.ax-faq-empty { text-align: center; padding: 36px; color: var(--muted); border: 1px dashed var(--line); border-radius: 16px; }

/* =====================================================================
   13. FINAL CTA
   ===================================================================== */

.ax-cta {
  position: relative;
  overflow: hidden;
  border-radius: 34px;
  padding: 84px 32px;
  text-align: center;
  background: linear-gradient(135deg, #1d3a8a 0%, #4c1d95 100%);
  border: 1px solid rgba(147, 197, 253, 0.4);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
}
.ax-cta::before,
.ax-cta::after {
  content: '';
  position: absolute;
  border-radius: 50%;
  filter: blur(70px);
  pointer-events: none;
}
.ax-cta::before { width: 360px; height: 360px; left: -80px; top: -120px; background: rgba(56, 189, 248, 0.4); }
.ax-cta::after { width: 380px; height: 380px; right: -100px; bottom: -160px; background: rgba(217, 70, 239, 0.35); }
.ax-cta > * { position: relative; z-index: 1; }
.ax-cta h2 { margin: 0; font-size: clamp(2rem, 4.4vw, 3.2rem); font-weight: 800; letter-spacing: -0.03em; color: #fff; }
.ax-cta p { margin: 0; max-width: 580px; color: #dbe4ff; font-size: 1.1rem; line-height: 1.65; }
.ax-cta .ax-btn-primary { background: #fff; color: #1e1b4b; box-shadow: 0 14px 40px rgba(0, 0, 0, 0.35); }
.ax-cta-points { display: flex; gap: 22px; flex-wrap: wrap; justify-content: center; margin-top: 8px; color: #e0e7ff; font-size: 0.9rem; font-weight: 600; }
.ax-cta-points span { display: inline-flex; align-items: center; gap: 7px; }
.ax-cta .ax-hint { --hint: #fde68a; }

/* ---------- smooth motion layer ---------- */

.ax-progress {
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 3px;
  transform-origin: 0 50%;
  transform: scaleX(0);
  background: linear-gradient(90deg, #38bdf8, #818cf8, #c084fc);
  z-index: 1000;
  pointer-events: none;
  will-change: transform;
}

.ax-reveal {
  opacity: 0;
  transform: translateY(34px);
  transition: opacity 0.9s cubic-bezier(0.22, 1, 0.36, 1), transform 0.9s cubic-bezier(0.22, 1, 0.36, 1);
}
.ax-reveal.is-in { opacity: 1; transform: none; }

.ax-reveal.is-in .ax-stagger > * {
  animation: ax-rise 0.8s cubic-bezier(0.22, 1, 0.36, 1) backwards;
  animation-delay: calc(var(--n, 0) * 70ms);
}
.ax-stagger > *:nth-child(1) { --n: 1; }
.ax-stagger > *:nth-child(2) { --n: 2; }
.ax-stagger > *:nth-child(3) { --n: 3; }
.ax-stagger > *:nth-child(4) { --n: 4; }
.ax-stagger > *:nth-child(5) { --n: 5; }
.ax-stagger > *:nth-child(6) { --n: 6; }
.ax-stagger > *:nth-child(7) { --n: 7; }
.ax-stagger > *:nth-child(8) { --n: 8; }

.ax-hero > .ax-online,
.ax-hero > .ax-enterprise,
.ax-hero > h1,
.ax-hero > .ax-hero-p,
.ax-hero > .ax-hero-cta,
.ax-hero > .ax-hero-hint,
.ax-hero > .ax-feature-row {
  animation: ax-rise 0.95s cubic-bezier(0.22, 1, 0.36, 1) backwards;
}
.ax-hero > .ax-enterprise { animation-delay: 0.08s; }
.ax-hero > h1 { animation-delay: 0.16s; }
.ax-hero > .ax-hero-p { animation-delay: 0.26s; }
.ax-hero > .ax-hero-cta { animation-delay: 0.34s; }
.ax-hero > .ax-hero-hint { animation-delay: 0.42s; }
.ax-hero > .ax-feature-row { animation-delay: 0.5s; }

.ax-float {
  translate: calc(var(--px, 0) * 16px) calc(var(--py, 0) * 12px);
  transition: translate 0.5s cubic-bezier(0.22, 1, 0.36, 1);
}
.ax-float-vid { translate: calc(var(--px, 0) * -18px) calc(var(--py, 0) * 12px); }

@keyframes ax-rise {
  from { opacity: 0; transform: translateY(22px); }
  to { opacity: 1; transform: none; }
}

@media (prefers-reduced-motion: reduce) {
  .ax-reveal { opacity: 1; transform: none; }
  .ax-float { translate: none; }
}

/* ---------- keyframes ---------- */

@keyframes ax-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }
@keyframes ax-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
@keyframes ax-eq { 0%, 100% { height: 18%; } 50% { height: 86%; } }
@keyframes ax-float-ico { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
@keyframes ax-bob-a { 0%, 100% { transform: rotate(-7deg) translateY(0); } 50% { transform: rotate(-7deg) translateY(-12px); } }
@keyframes ax-bob-b { 0%, 100% { transform: rotate(-3deg) translateY(0); } 50% { transform: rotate(-3deg) translateY(-10px); } }
@keyframes ax-bob-c { 0%, 100% { transform: rotate(6deg) translateY(0); } 50% { transform: rotate(6deg) translateY(-12px); } }

@media (prefers-reduced-motion: reduce) {
  .ax-page *,
  .ax-page *::before,
  .ax-page *::after {
    animation: none !important;
    transition: none !important;
  }
}

/* ---------- responsive ---------- */

@media (max-width: 1180px) {
  .ax-float { display: none; }
}

@media (max-width: 980px) {
  .ax-wrap { gap: 90px; }
  .ax-feature-row { grid-template-columns: 1fr; max-width: 520px; }
  .ax-drop-shell,
  .ax-flow,
  .ax-engine,
  .ax-lab,
  .ax-report-shell { grid-template-columns: 1fr; }
  .ax-panel { position: static; }
  .ax-engine-side { border-left: none; border-top: 1px solid var(--line); }
  .ax-spot { padding: 36px 28px; }
}

@media (max-width: 640px) {
  .ax-wrap { padding: 0 16px 80px; gap: 72px; }
  .ax-hero { padding-top: 40px; min-height: 0; }
  .ax-engine-main, .ax-engine-side { padding: 26px; }
  .ax-cmp-row { grid-template-columns: 1fr; }
  .ax-cmp-row > div { padding: 12px 18px; }
  .ax-cmp-head { display: none; }
  .ax-cmp-feature { background: #0c1330; }
  .ax-scene { height: 260px; }
  .ax-faq-a p { padding-left: 24px; }
}
`;

/* =============================================================================
   PAGE COMPONENT
   ============================================================================= */

const WAVE_BARS = Array.from({ length: 46 }, (_, i) => i);

const CITY_BUILDINGS = [
  { l: '2%', w: 11, h: 62 },
  { l: '13%', w: 9, h: 84 },
  { l: '23%', w: 13, h: 70 },
  { l: '37%', w: 10, h: 96 },
  { l: '48%', w: 12, h: 58 },
  { l: '60%', w: 9, h: 88 },
  { l: '70%', w: 13, h: 66 },
  { l: '83%', w: 10, h: 78 },
  { l: '92%', w: 8, h: 52 }
];

function initialsOf(name) {
  return (name || '?')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('');
}

export default function Home() {
  const navigate = useNavigate();

  /* ---- section state ---- */
  const [activeStep, setActiveStep] = useState(0);
  const [activeEngine, setActiveEngine] = useState('images');
  const [activeLayer, setActiveLayer] = useState('rgb');
  const [intensity, setIntensity] = useState(70);
  const [flipped, setFlipped] = useState({});
  const [openFaq, setOpenFaq] = useState(null);
  const [faqSearch, setFaqSearch] = useState('');

  /* ---- drop zone state ---- */
  const [dropOver, setDropOver] = useState(false);
  const [dropFile, setDropFile] = useState(null);
  const [dropError, setDropError] = useState('');
  const fileInputRef = useRef(null);
  const pageRef = useRef(null);
  const progressRef = useRef(null);
  const heroRef = useRef(null);

  /* ---- reviews state ---- */
  const [reviews, setReviews] = useState(() => [...loadUserReviews(), ...INITIAL_USER_REPORTS]);
  const [spotIdx, setSpotIdx] = useState(0);
  const [spotPaused, setSpotPaused] = useState(false);
  const [formName, setFormName] = useState('');
  const [formRole, setFormRole] = useState('');
  const [formOrg, setFormOrg] = useState('');
  const [formComment, setFormComment] = useState('');
  const [formRating, setFormRating] = useState('5');
  const [successMsg, setSuccessMsg] = useState(false);

  /* ---- in-view triggers ---- */
  const [metricsRef, metricsInView] = useInView();
  const [reportRef, reportInView] = useInView();

  /* ---------------------------------------------------------------------- */
  /* actions                                                                 */
  /* ---------------------------------------------------------------------- */

  const handleProtectedAction = useCallback(
    (e) => {
      if (e && e.preventDefault) e.preventDefault();
      const userSession = localStorage.getItem('authenticity_user');
      if (!userSession) {
        navigate('/auth');
      } else {
        navigate('/analyze');
      }
    },
    [navigate]
  );

  const scrollToHow = useCallback(() => {
    const el = document.getElementById('how-it-works');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const acceptFile = useCallback((file) => {
    if (!file) return;
    const kind = getFileKind(file.name);
    if (!kind) {
      setDropFile(null);
      setDropError('This file type is not supported. Try JPG, PNG, MP4, MP3, WAV or PDF.');
      return;
    }
    setDropError('');
    setDropFile({ name: file.name, size: file.size, kind, file });
  }, []);

  const handleDrop = (e) => {
    e.preventDefault();
    setDropOver(false);
    const file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
    acceptFile(file);
  };

  const handleFilePick = (e) => {
    const file = e.target.files && e.target.files[0];
    acceptFile(file);
    e.target.value = '';
  };

  const continueWithFile = (e) => {
    e.stopPropagation();
    if (dropFile && dropFile.file) {
      /* in-memory handoff: Analyze.jsx picks this file up on mount */
      window.__authenticityPendingFile = dropFile.file;
    }
    handleProtectedAction(e);
  };

  const clearFile = (e) => {
    e.stopPropagation();
    setDropFile(null);
    setDropError('');
  };

  const toggleFlip = (id) => {
    setFlipped((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!formName.trim() || !formComment.trim()) return;

    const newRev = {
      name: formName.trim(),
      role: formRole.trim() || 'Verified user',
      org: formOrg.trim() || 'Independent expert',
      comment: formComment.trim(),
      rating: parseInt(formRating, 10) || 5,
      tag: 'Community review'
    };

    setReviews((prev) => {
      const next = [newRev, ...prev];
      saveUserReviews(next.filter((r) => r.tag === 'Community review'));
      return next;
    });
    setSpotIdx(0);
    setFormName('');
    setFormRole('');
    setFormOrg('');
    setFormComment('');
    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 4000);
  };

  const goSpot = useCallback(
    (dir) => {
      setSpotIdx((i) => (i + dir + reviews.length) % reviews.length);
    },
    [reviews.length]
  );

  /* smooth native scrolling while this page is mounted */
  useEffect(() => {
    const root = document.documentElement;
    const previous = root.style.scrollBehavior;
    root.style.scrollBehavior = 'smooth';
    return () => {
      root.style.scrollBehavior = previous;
    };
  }, []);

  /* scroll progress bar */
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      const p = max > 0 ? Math.min(1, el.scrollTop / max) : 0;
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${p})`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    update();
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  /* reveal sections as they enter the viewport */
  useEffect(() => {
    const root = pageRef.current;
    if (!root) return undefined;
    const nodes = root.querySelectorAll('.ax-reveal');
    const reduce =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || typeof IntersectionObserver === 'undefined') {
      nodes.forEach((n) => n.classList.add('is-in'));
      return undefined;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add('is-in');
            io.unobserve(en.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -6% 0px' }
    );
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);

  /* cursor glow inside cards */
  const handlePointerMove = (e) => {
    const target = e.target;
    const el = target && target.closest ? target.closest('.ax-glow') : null;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - r.left}px`);
    el.style.setProperty('--my', `${e.clientY - r.top}px`);
  };

  /* hero parallax */
  const handleHeroMove = (e) => {
    const el = heroRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width - 0.5) * 2;
    const y = ((e.clientY - r.top) / r.height - 0.5) * 2;
    el.style.setProperty('--px', x.toFixed(3));
    el.style.setProperty('--py', y.toFixed(3));
  };
  const handleHeroLeave = () => {
    const el = heroRef.current;
    if (!el) return;
    el.style.setProperty('--px', '0');
    el.style.setProperty('--py', '0');
  };

  /* auto-rotate the spotlight review */
  useEffect(() => {
    if (spotPaused || reviews.length < 2) return undefined;
    const id = setInterval(() => goSpot(1), 7000);
    return () => clearInterval(id);
  }, [spotPaused, reviews.length, goSpot]);

  /* ---------------------------------------------------------------------- */
  /* derived values                                                          */
  /* ---------------------------------------------------------------------- */

  const engine = useMemo(
    () => MEDIA_ANALYZERS.find((a) => a.id === activeEngine) || MEDIA_ANALYZERS[0],
    [activeEngine]
  );
  const EngineIcon = engine.icon;

  const layer = useMemo(
    () => DEMO_LAYERS.find((l) => l.id === activeLayer) || DEMO_LAYERS[0],
    [activeLayer]
  );

  const step = WORKFLOW_STEPS[activeStep];

  const filteredFaqs = useMemo(() => {
    const term = faqSearch.trim().toLowerCase();
    if (!term) return FAQS;
    return FAQS.filter(
      (f) => f.q.toLowerCase().includes(term) || f.a.toLowerCase().includes(term)
    );
  }, [faqSearch]);

  const spot = reviews[spotIdx % reviews.length];
  const DropKindIcon = dropFile ? dropFile.kind.icon : UploadCloud;

  /* ---------------------------------------------------------------------- */
  /* render                                                                  */
  /* ---------------------------------------------------------------------- */

  return (
    <div className="ax-page" ref={pageRef} onPointerMove={handlePointerMove}>
      <style>{HOME_CSS}</style>
      <div className="ax-progress" ref={progressRef} aria-hidden="true" />
      <div className="ax-grid-bg" aria-hidden="true" />

      <div className="ax-wrap">
        {/* ================================================================
            1. HERO
            ================================================================ */}
       <section className="ax-reveal ax-hero"
          ref={heroRef}
          onMouseMove={handleHeroMove}
          onMouseLeave={handleHeroLeave}
          aria-label="AuthenticityAI introduction"
        >
          {/* floating: image */}
          <div className="ax-float ax-float-img" aria-hidden="true">
            <div className="ax-pic ax-pic-mount" />
            <div className="ax-float-foot">
              <span className="lab">
                <span className="ico"><ImageIcon size={14} /></span>
                Image Analysis
              </span>
              <span className="ax-verified">Verified <Check size={12} /></span>
            </div>
          </div>

          {/* floating: audio */}
          <div className="ax-float ax-float-aud" aria-hidden="true">
            <div className="ax-wave">
              {WAVE_BARS.map((i) => (
                <i
                  key={i}
                  style={{
                    '--i': i,
                    animationDuration: `${1 + (i % 6) * 0.17}s`
                  }}
                />
              ))}
            </div>
            <div className="ax-float-foot">
              <span className="lab">
                <span className="ico"><Volume2 size={14} /></span>
                Audio Analysis
              </span>
              <span className="ax-verified">Verified <Check size={12} /></span>
            </div>
          </div>

          {/* floating: video */}
          <div className="ax-float ax-float-vid" aria-hidden="true">
            <div className="ax-pic ax-pic-city" style={{ height: 150 }}>
              {CITY_BUILDINGS.map((b, i) => (
                <span
                  key={i}
                  className="ax-bldg"
                  style={{ left: b.l, width: `${b.w}%`, height: b.h }}
                />
              ))}
              <span className="ax-play"><Play size={18} fill="#fff" /></span>
            </div>
            <div className="ax-float-foot">
              <span className="lab">
                <span className="ico"><Video size={14} /></span>
                Video Analysis
              </span>
              <span className="ax-verified">Verified <Check size={12} /></span>
            </div>
          </div>

          <div className="ax-online">
            <i />
            <span>SYSTEM ONLINE</span>
            <span className="sep" />
            <span className="plat">AI FORENSICS PLATFORM</span>
          </div>

          <div className="ax-enterprise">
            <Sparkles size={15} /> Enterprise Multimodal Forensic Intelligence
          </div>

          <h1>
            Know What&rsquo;s Real.
            <br />
            <span className="ax-grad-text">Verify media</span> with confidence.
          </h1>

          <p className="ax-hero-p">
            AuthenticityAI uses advanced multimodal AI to analyze images, videos, and audio
            &mdash; delivering transparent, explainable and trusted results.
          </p>

          <div className="ax-hero-cta">
            <button type="button" onClick={handleProtectedAction} className="ax-btn ax-btn-primary">
              <Play size={16} fill="#fff" /> Start an analysis
            </button>
            <button type="button" onClick={scrollToHow} className="ax-btn ax-btn-ghost">
              Explore how it works <ArrowRight size={16} />
            </button>
          </div>

          <div className="ax-hero-hint">
            <Hint color="#fbbf24">{SECTION_HINTS.hero}</Hint>
          </div>

          <div className="ax-feature-row">
            {HERO_FEATURES.map((f) => (
              <button
                key={f.id}
                type="button"
                className="ax-feature ax-glow"
                onClick={handleProtectedAction}
              >
                {f.kind === 'icons' && (
                  <span className="ax-feature-ico">
                    <ImageIcon size={22} />
                    <Video size={22} />
                    <Volume2 size={22} />
                  </span>
                )}
                {f.kind === 'shield' && (
                  <span className="ax-feature-ico round shield"><ShieldCheck size={26} /></span>
                )}
                {f.kind === 'lock' && (
                  <span className="ax-feature-ico round lock"><Lock size={24} /></span>
                )}
                <span>
                  <b>{f.title}</b>
                  <small>{f.sub}</small>
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* ================================================================
            2. TRUST TICKER
            ================================================================ */}
        <section className="ax-reveal" aria-label="Standards and credentials">
          <div className="ax-ticker">
            <div className="ax-ticker-track">
              {[...TRUST_BADGES, ...TRUST_BADGES].map((b, i) => {
                const BadgeIcon = b.icon;
                return (
                  <div key={i} className="ax-ticker-item">
                    <BadgeIcon size={18} />
                    {b.text}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="ax-ticker-hint">
            <Hint color="#60a5fa">{SECTION_HINTS.trust}</Hint>
          </div>
        </section>

        {/* ================================================================
            3. METRICS (ring gauges)
            ================================================================ */}
        <section className="ax-reveal" ref={metricsRef} aria-label="Platform numbers">
          <SectionHead
            title="Numbers from real forensic workloads"
            sub="Every figure below comes from files processed inside our sandbox."
            hint={SECTION_HINTS.metrics}
            color="#34d399"
          />
          <div className="ax-ring-grid ax-stagger">
            {METRICS_DATA.map((item, idx) => (
              <MetricRing
                key={item.label}
                item={item}
                index={idx}
                active={metricsInView}
                onClick={handleProtectedAction}
              />
            ))}
          </div>
        </section>

        {/* ================================================================
            4. QUICK INTAKE (drag and drop)
            ================================================================ */}
        <section className="ax-reveal" aria-label="Quick file intake">
          <SectionHead
            title="Drop a file and we will tell you what it is"
            sub="We check the real file type first, then you continue to the full analysis."
            hint={SECTION_HINTS.intake}
            color="#60a5fa"
          />
          <div className="ax-drop-shell">
            <div
              className={`ax-drop${dropOver ? ' is-over' : ''}`}
              role="button"
              tabIndex={0}
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  if (fileInputRef.current) fileInputRef.current.click();
                }
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setDropOver(true);
              }}
              onDragLeave={() => setDropOver(false)}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                hidden
                onChange={handleFilePick}
                accept="image/*,video/*,audio/*,.pdf,.docx,.txt,.epub"
              />
              <div className="ax-drop-ico">
                <DropKindIcon size={38} style={dropFile ? { color: dropFile.kind.color } : undefined} />
              </div>

              {!dropFile && (
                <>
                  <h3>{dropOver ? 'Release to add your file' : 'Drag and drop your file here'}</h3>
                  <p>
                    Images, video, audio clips and PDFs are supported. You can also click to browse
                    your device.
                  </p>
                </>
              )}

              {dropFile && (
                <>
                  <h3>Ready to analyze</h3>
                  <div className="ax-drop-file">
                    <CheckCircle2 size={22} color="#34d399" />
                    <div>
                      <b>{dropFile.name}</b>
                      <small>
                        {dropFile.kind.label} &middot; {formatBytes(dropFile.size)}
                      </small>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', marginTop: 8 }}>
                    <button type="button" className="ax-btn ax-btn-primary" onClick={continueWithFile}>
                      Continue to analysis <ArrowRight size={16} />
                    </button>
                    <button type="button" className="ax-btn ax-btn-ghost" onClick={clearFile}>
                      Remove file
                    </button>
                  </div>
                </>
              )}

              {dropError && <div className="ax-drop-error">{dropError}</div>}
            </div>

            <div className="ax-drop-side ax-stagger">
              {DROP_TYPES.map((t) => {
                const TypeIcon = t.icon;
                const hit = dropFile && dropFile.kind.label === t.label;
                return (
                  <div
                    key={t.label}
                    className={`ax-type-row ax-glow${hit ? ' is-hit' : ''}`}
                    style={{ '--tc': t.color }}
                  >
                    <TypeIcon size={22} />
                    <div>
                      <b>{t.label}</b>
                      <small>{t.exts.slice(0, 5).join(', ').toUpperCase()}</small>
                    </div>
                    {hit && <CheckCircle2 size={18} style={{ marginLeft: 'auto' }} />}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ================================================================
            5. WORKFLOW (rail timeline + inspector)
            ================================================================ */}
        <section className="ax-reveal" id="how-it-works" aria-label="How verification works">
          <SectionHead
            title="Five stages from upload to evidence report"
            sub="Each stage hands a verified result to the next, so nothing is guessed."
            hint={SECTION_HINTS.workflow}
            color="#fbbf24"
            align="left"
          />
          <div className="ax-flow">
            <div className="ax-rail ax-stagger" role="tablist" aria-label="Verification stages">
              {WORKFLOW_STEPS.map((s, idx) => (
                <button
                  key={s.num}
                  type="button"
                  role="tab"
                  aria-selected={activeStep === idx}
                  className={`ax-step${activeStep === idx ? ' is-active' : ''}`}
                  onClick={() => setActiveStep(idx)}
                >
                  <span className="ax-step-dot">{s.num}</span>
                  <span>
                    <h4>{s.title}</h4>
                    <p>{s.shortDesc}</p>
                  </span>
                </button>
              ))}
            </div>

            <div className="ax-panel ax-glow">
              <div className="ax-panel-top">
                <span className="ax-panel-badge">STAGE {step.num}</span>
                <span className="ax-panel-time">
                  <Clock size={14} /> about {step.time}
                </span>
              </div>
              <h3>{step.title}</h3>
              <p>{step.detail}</p>
              <div className="ax-panel-out">
                <Activity size={18} /> You get: {step.output}
              </div>
              <div className="ax-tags">
                {step.tags.map((tag) => (
                  <span key={tag} className="ax-tag">{tag}</span>
                ))}
              </div>
              <div className="ax-panel-nav">
                <button
                  type="button"
                  className="ax-mini-btn"
                  disabled={activeStep === 0}
                  onClick={() => setActiveStep((i) => Math.max(0, i - 1))}
                >
                  <ChevronLeft size={16} /> Previous
                </button>
                <button
                  type="button"
                  className="ax-mini-btn"
                  disabled={activeStep === WORKFLOW_STEPS.length - 1}
                  onClick={() => setActiveStep((i) => Math.min(WORKFLOW_STEPS.length - 1, i + 1))}
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================
            6. ANALYSIS ENGINES (tabs + spec sheet)
            ================================================================ */}
        <section className="ax-reveal" aria-label="Analysis engines">
          <SectionHead
            title="One engine for each kind of media"
            sub="Pick a media type to see which signals we inspect and what we accept."
            hint={SECTION_HINTS.engines}
            color="#c084fc"
          />
          <div className="ax-tabs-wrap">
            <div className="ax-tabs" role="tablist" aria-label="Media engines">
              {MEDIA_ANALYZERS.map((a) => {
                const TabIcon = a.icon;
                return (
                  <button
                    key={a.id}
                    type="button"
                    role="tab"
                    aria-selected={activeEngine === a.id}
                    className={`ax-tab${activeEngine === a.id ? ' is-active' : ''}`}
                    style={{ '--tc': a.color }}
                    onClick={() => setActiveEngine(a.id)}
                  >
                    <TabIcon size={17} /> {a.tab}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="ax-engine ax-glow" style={{ '--ec': engine.color }}>
            <div className="ax-engine-main">
              <div className="ax-engine-ico"><EngineIcon size={30} /></div>
              <h3>{engine.title}</h3>
              <p>{engine.desc}</p>
              <div className="ax-feat-list">
                {engine.features.map((feat) => (
                  <div key={feat} className="ax-feat-item">
                    <CheckCircle2 size={17} />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="ax-engine-side">
              <div>
                <div className="ax-spec-title">Engine specs</div>
                <div className="ax-spec-row">
                  {engine.specs.map((sp) => (
                    <div key={sp.k} className="ax-spec">
                      <b>{sp.v}</b>
                      <small>{sp.k}</small>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="ax-spec-title">Accepted formats</div>
                <div className="ax-fmt-wrap">
                  {engine.formats.map((f) => (
                    <span key={f} className="ax-fmt">{f}</span>
                  ))}
                </div>
              </div>
              <div className="ax-engine-cta">
                <button type="button" className="ax-btn ax-btn-primary" onClick={handleProtectedAction}>
                  Try the {engine.tab.toLowerCase()} engine <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================
            7. LAYER INSPECTOR
            ================================================================ */}
        <section className="ax-reveal" aria-label="Live layer inspection">
          <SectionHead
            title="See the layers a forensic expert sees"
            sub="Switch between layers to see what each signal reveals about the same image."
            hint={SECTION_HINTS.layers}
            color="#34d399"
            align="left"
          />
          <div className="ax-lab">
            <div className="ax-viewer">
              <div className="ax-viewer-bar">
                <i /><i /><i />
                <span>layer: {layer.id}</span>
              </div>
              <LayerScene layer={activeLayer} intensity={intensity} />
            </div>

            <div className="ax-lab-side">
              {DEMO_LAYERS.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  className={`ax-layer-btn ax-glow${activeLayer === l.id ? ' is-active' : ''}`}
                  style={{ '--lc': l.color }}
                  onClick={() => setActiveLayer(l.id)}
                >
                  <span className="sw" />
                  <span>
                    <b>{l.label}</b>
                    <small>{l.title}</small>
                  </span>
                </button>
              ))}

              <div className="ax-readout ax-glow">
                <p>{layer.desc}</p>
                <div className="ax-slider-row">
                  <label htmlFor="ax-intensity">Signal strength</label>
                  <input
                    id="ax-intensity"
                    className="ax-range"
                    type="range"
                    min="0"
                    max="100"
                    value={intensity}
                    onChange={(e) => setIntensity(Number(e.target.value))}
                  />
                  <output>{intensity}%</output>
                </div>
                <div className="ax-verdict" style={{ '--vc': layer.color }}>
                  <Eye size={16} /> {layer.verdict}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================
            8. USE CASES (flip cards)
            ================================================================ */}
        <section className="ax-reveal" aria-label="Who uses AuthenticityAI">
          <SectionHead
            title="Built for people who cannot afford to be wrong"
            sub="Four teams, four different problems, one evidence-first workflow."
            hint={SECTION_HINTS.usecases}
            color="#f472b6"
          />
          <div className="ax-flip-grid ax-stagger">
            {USE_CASES.map((u) => {
              const UseIcon = u.icon;
              return (
                <button
                  key={u.id}
                  type="button"
                  className={`ax-flip${flipped[u.id] ? ' is-flipped' : ''}`}
                  style={{ '--fc': u.color }}
                  onClick={() => toggleFlip(u.id)}
                  aria-label={`${u.who}. Flip card for details`}
                >
                  <div className="ax-flip-inner">
                    <div className="ax-face ax-face-front">
                      <div className="ax-flip-ico"><UseIcon size={26} /></div>
                      <div className="ax-flip-who">{u.who}</div>
                      <h3 className="ax-flip-front-title">{u.front}</h3>
                      <p className="ax-flip-front-sub">{u.frontSub}</p>
                      <span className="ax-flip-more">Hover or tap for details</span>
                    </div>
                    <div className="ax-face ax-face-back">
                      <ul className="ax-flip-back-list">
                        {u.back.map((line) => (
                          <li key={line}>
                            <Check size={16} />
                            {line}
                          </li>
                        ))}
                      </ul>
                      <div className="ax-flip-stat">
                        <b>{u.stat}</b>
                        <span>{u.statLabel}</span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* ================================================================
            9. COMPARISON TABLE
            ================================================================ */}
        <section className="ax-reveal" aria-label="Comparison with typical detectors">
          <SectionHead
            title="Why a single score is not enough"
            sub="Most detectors hand you a number. We hand you the evidence behind it."
            hint={SECTION_HINTS.compare}
            color="#fbbf24"
          />
          <div className="ax-compare" role="table" aria-label="Typical detectors versus AuthenticityAI">
            <div className="ax-cmp-row ax-cmp-head" role="row">
              <div role="columnheader">What you get</div>
              <div role="columnheader">Typical detectors</div>
              <div className="ours" role="columnheader">AuthenticityAI</div>
            </div>
            {COMPARE_ROWS.map((row) => {
              const TypIcon = row.typicalState === 'partial' ? Minus : X;
              return (
                <div key={row.feature} className="ax-cmp-row" role="row">
                  <div className="ax-cmp-feature" role="cell">{row.feature}</div>
                  <div className="ax-cmp-cell" role="cell">
                    <span className={`ax-state ${row.typicalState}`}><TypIcon size={14} /></span>
                    {row.typical}
                  </div>
                  <div className="ax-cmp-cell ours" role="cell">
                    <span className={`ax-state ${row.oursState}`}><Check size={14} /></span>
                    {row.ours}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ================================================================
            10. SAMPLE REPORT
            ================================================================ */}
        <section className="ax-reveal" ref={reportRef} aria-label="Sample evidence report">
          <SectionHead
            title="What an evidence report looks like"
            sub="A range instead of a verdict, and every signal that led to it."
            hint={SECTION_HINTS.report}
            color="#60a5fa"
            align="left"
          />
          <div className="ax-report-shell">
            <div className="ax-doc">
              <div className="ax-doc-file">
                <div className="ax-doc-thumb" />
                <div>
                  <b>mountain_lake_final.jpg</b>
                  <small>2.4 MB &middot; image/jpeg</small>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.85rem', color: '#94a3c8', fontWeight: 600, marginBottom: 14 }}>
                  Likelihood the image is AI-generated or edited
                </div>
                <div className="ax-gauge">
                  <div className="ax-gauge-range" style={{ left: '58%', width: '22%' }} />
                </div>
                <div className="ax-gauge-scale">
                  <span>0%</span>
                  <span>Estimated range: 58% to 80%</span>
                  <span>100%</span>
                </div>
              </div>

              <div className="ax-doc-verdict">
                <b>Likely manipulated</b>
                <p>
                  Two strong signals agree: a re-compressed region and a periodic upsampler
                  pattern. No camera or C2PA provenance was found to counter them.
                </p>
              </div>

              <div className="ax-doc-hash">
                <Fingerprint size={13} style={{ verticalAlign: '-2px', marginRight: 6 }} />
                SHA-256 9f2c1ab7e04d5586c3a1d0e7b94f6a2208be5d71c4f3a9e6120b7d58ce4a31f0
              </div>

              <button type="button" className="ax-btn ax-btn-ghost" onClick={handleProtectedAction}>
                Get a report like this <ArrowRight size={16} />
              </button>
            </div>

            <div className="ax-signals ax-stagger">
              {REPORT_SIGNALS.map((sig, i) => (
                <div key={sig.name} className={`ax-signal ax-glow ${sig.tone}`}>
                  <div className="ax-signal-top">
                    <b>{sig.name}</b>
                    <span>{sig.value}</span>
                  </div>
                  <div className="ax-bar">
                    <i
                      style={{
                        width: reportInView ? `${sig.value}%` : '0%',
                        transitionDelay: `${i * 120}ms`
                      }}
                    />
                  </div>
                  <small>{sig.note}</small>
                </div>
              ))}
            </div>
          </div>
        </section>
{/* Floating AI Assistant Widget Integration */}
      <AIAssistantWidget />
        {/* ================================================================
            11. REVIEWS (spotlight + form)
            ================================================================ */}
        <section className="ax-reveal" aria-label="Reviews">
          <SectionHead
            title="Trusted by 45,000+ users and experts"
            sub="Read how investigators, journalists and security leads use it every day."
            hint={SECTION_HINTS.reviews}
            color="#34d399"
          />

          <div
            className="ax-spot"
            onMouseEnter={() => setSpotPaused(true)}
            onMouseLeave={() => setSpotPaused(false)}
          >
            <Quote size={90} className="ax-spot-quote-ico" aria-hidden="true" />
            <span className="ax-spot-tag">{spot.tag}</span>
            <blockquote>&ldquo;{spot.comment}&rdquo;</blockquote>
            <div className="ax-spot-foot">
              <div className="ax-spot-who">
                <div className="ax-avatar">{initialsOf(spot.name)}</div>
                <div>
                  <b>{spot.name}</b>
                  <small>
                    {spot.role}, {spot.org}
                  </small>
                  <div className="ax-stars">
                    {Array.from({ length: spot.rating }).map((_, i) => (
                      <Star key={i} size={14} fill="#fbbf24" color="#fbbf24" />
                    ))}
                  </div>
                </div>
              </div>

              <div className="ax-spot-ctrl">
                <button type="button" className="ax-arrow" onClick={() => goSpot(-1)} aria-label="Previous review">
                  <ChevronLeft size={18} />
                </button>
                <div className="ax-dots">
                  {reviews.map((r, i) => (
                    <button
                      key={`${r.name}-${i}`}
                      type="button"
                      className={i === spotIdx % reviews.length ? 'is-on' : ''}
                      onClick={() => setSpotIdx(i)}
                      aria-label={`Show review ${i + 1}`}
                    />
                  ))}
                </div>
                <button type="button" className="ax-arrow" onClick={() => goSpot(1)} aria-label="Next review">
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>

          <div className="ax-mini-reviews ax-stagger">
            {reviews.slice(0, 3).map((r, i) => (
              <button
                key={`${r.name}-mini-${i}`}
                type="button"
                className="ax-mini-review ax-glow"
                onClick={() => setSpotIdx(i)}
              >
                <p>{r.comment}</p>
                <b>{r.name}</b>
                <small>{r.org}</small>
              </button>
            ))}
          </div>

          <div className="ax-form-card">
            <div className="ax-form-title">
              <MessageSquarePlus size={24} />
              <h3>Share your experience</h3>
            </div>

            {successMsg && (
              <div className="ax-success" role="status">
                Thank you! Your review was added to the spotlight.
              </div>
            )}

            <form onSubmit={handleReviewSubmit} className="ax-form-grid">
              <div className="ax-field">
                <label htmlFor="rv-name">Full name *</label>
                <input
                  id="rv-name"
                  type="text"
                  className="ax-input"
                  placeholder="e.g. Rahul Sharma"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                />
              </div>
              <div className="ax-field">
                <label htmlFor="rv-role">Role or title</label>
                <input
                  id="rv-role"
                  type="text"
                  className="ax-input"
                  placeholder="e.g. Software Engineer"
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value)}
                />
              </div>
              <div className="ax-field">
                <label htmlFor="rv-org">Organization or lab</label>
                <input
                  id="rv-org"
                  type="text"
                  className="ax-input"
                  placeholder="e.g. Tech Corp"
                  value={formOrg}
                  onChange={(e) => setFormOrg(e.target.value)}
                />
              </div>
              <div className="ax-field">
                <label htmlFor="rv-rating">Rating</label>
                <select
                  id="rv-rating"
                  className="ax-input"
                  value={formRating}
                  onChange={(e) => setFormRating(e.target.value)}
                >
                  <option value="5">5 stars - Excellent</option>
                  <option value="4">4 stars - Very good</option>
                </select>
              </div>
              <div className="ax-field full">
                <label htmlFor="rv-comment">Your experience *</label>
                <textarea
                  id="rv-comment"
                  className="ax-input"
                  rows="3"
                  placeholder="What did you check, and what did the report tell you?"
                  value={formComment}
                  onChange={(e) => setFormComment(e.target.value)}
                  required
                  style={{ resize: 'vertical' }}
                />
              </div>
              <div className="ax-field full">
                <button type="submit" className="ax-btn ax-btn-primary">
                  Publish review <ArrowRight size={17} />
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* ================================================================
            12. FAQ
            ================================================================ */}
        <section className="ax-faq-shell ax-reveal" aria-label="Frequently asked questions">
          <SectionHead
            title="Questions people ask before their first scan"
            hint={SECTION_HINTS.faq}
            color="#c084fc"
          />
          <div className="ax-search">
            <Search size={18} />
            <input
              type="text"
              className="ax-input"
              placeholder="Search questions..."
              value={faqSearch}
              onChange={(e) => setFaqSearch(e.target.value)}
              aria-label="Search frequently asked questions"
            />
          </div>

          <div className="ax-faq-list ax-stagger" style={{ marginTop: 30 }}>
            {filteredFaqs.length === 0 && (
              <div className="ax-faq-empty">
                No question matches &ldquo;{faqSearch}&rdquo;. Try a shorter keyword like
                &ldquo;privacy&rdquo; or &ldquo;audio&rdquo;.
              </div>
            )}
            {filteredFaqs.map((faq) => {
              const isOpen = openFaq === faq.q;
              return (
                <div key={faq.q} className={`ax-faq ax-glow${isOpen ? ' is-open' : ''}`}>
                  <button
                    type="button"
                    className="ax-faq-q"
                    aria-expanded={isOpen}
                    onClick={() => setOpenFaq(isOpen ? null : faq.q)}
                  >
                    <span>
                      <HelpCircle size={20} />
                      {faq.q}
                    </span>
                    {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                  <div className="ax-faq-a">
                    <div>
                      <p>{faq.a}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ================================================================
            13. FINAL CTA
            ================================================================ */}
        <section className="ax-cta ax-reveal" aria-label="Start your first analysis">
          <h2>Ready to examine your media?</h2>
          <p>
            Upload an image, audio recording, video clip or PDF into our isolated sandbox and read
            the evidence signals in seconds.
          </p>
          <button type="button" className="ax-btn ax-btn-primary" onClick={handleProtectedAction}>
            Start new analysis <ArrowRight size={18} />
          </button>
          <div className="ax-cta-points">
            <span><Lock size={15} /> Auto-purged after your session</span>
            <span><ShieldCheck size={15} /> SHA-256 chain-of-custody</span>
            <span><Zap size={15} /> Results in under 2 seconds</span>
          </div>
          <Hint>{SECTION_HINTS.cta}</Hint>
        </section>
      </div>
    </div>
  );
}
