import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Play,
  Sparkles,
  AlertCircle,
  RefreshCw,
  Cpu,
  CheckCircle2,
  Zap,
  Lock,
  ChevronDown,
  ChevronUp,
  Hash,
  Copy,
  Check,
  UploadCloud,
  X,
  Clock,
  ShieldCheck,
  FileSearch,
  ArrowRight,
  Info,
  ClipboardPaste
} from 'lucide-react';
import UploadBox from '../components/UploadBox';
import FilePreview from '../components/FilePreview';
import MediaInfo from '../components/MediaInfo';
import AnalysisProgress from '../components/AnalysisProgress';
import { api } from '../services/api';

/* =============================================================================
   CONSTANTS
   ============================================================================= */

const MAX_SIZE = 100 * 1024 * 1024; // 100 MB, same limit as before
const HASH_LIMIT = 64 * 1024 * 1024; // browsers cannot hash huge files incrementally
const MODE_STORAGE_KEY = 'authenticity_scan_mode';
const REDIRECT_STORAGE_KEY = 'authenticity_auto_redirect';

const SCAN_MODES = [
  {
    id: 'standard',
    label: 'Standard',
    long: 'Standard heuristic',
    desc: 'Fast structural and metadata scan. Recommended for most files.',
    icon: Zap,
    color: '#60a5fa',
    checks: [
      'Container header and magic bytes',
      'EXIF, XMP and device metadata',
      'Generator tags and software traces',
      'Basic noise and compression checks'
    ]
  },
  {
    id: 'deep',
    label: 'Deep forensic',
    long: 'Deep forensic (FFT + ELA)',
    desc: 'Error level analysis and frequency-domain checks. Takes a little longer.',
    icon: Cpu,
    color: '#a78bfa',
    checks: [
      'Everything in Standard',
      '2D FFT upsampling grid detection',
      'Error Level Analysis for splicing',
      'Noise variance and sensor fingerprint'
    ]
  },
  {
    id: 'provenance',
    label: 'C2PA only',
    long: 'C2PA credentials only',
    desc: 'Verify the cryptographic signing history of the file.',
    icon: Lock,
    color: '#34d399',
    checks: [
      'Embedded C2PA manifest lookup',
      'X.509 signer certificate chain',
      'Edit history and tamper seals',
      'Camera or tool signing identity'
    ]
  }
];

const KIND_RULES = [
  { label: 'Image', exts: ['jpg', 'jpeg', 'png', 'webp', 'tiff', 'tif', 'avif', 'gif', 'bmp', 'heic'], mime: 'image/' },
  { label: 'Video', exts: ['mp4', 'mov', 'webm', 'avi', 'mkv', 'm4v'], mime: 'video/' },
  { label: 'Audio', exts: ['mp3', 'mpeg', 'mpga', 'wav', 'flac', 'aac', 'ogg', 'm4a', 'opus', 'amr', '3gp'], mime: 'audio/' },
  { label: 'Document', exts: ['pdf', 'docx', 'txt', 'epub'], mime: 'application/' }
];

/* =============================================================================
   HELPERS
   ============================================================================= */

function detectKind(file) {
  if (!file) return null;
  const name = file.name || '';
  const ext = name.includes('.') ? name.split('.').pop().toLowerCase() : '';
  const byExt = KIND_RULES.find((k) => k.exts.includes(ext));
  if (byExt) return byExt.label;
  const type = file.type || '';
  const byMime = KIND_RULES.find((k) => k.mime !== 'application/' && type.startsWith(k.mime));
  if (byMime) return byMime.label;
  if (type === 'application/pdf') return 'Document';
  return null;
}

function formatBytes(bytes) {
  if (bytes === undefined || bytes === null) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatClock(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = Math.floor(totalSeconds % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function fileKey(file) {
  return `${file.name}|${file.size}|${file.lastModified}`;
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function friendlyError(err) {
  const status = err && err.response && err.response.status;
  const serverMsg =
    err && err.response && err.response.data && (err.response.data.detail || err.response.data.message);

  if (serverMsg && typeof serverMsg === 'string') return serverMsg;
  if (status === 413) return 'The server rejected this file because it is too large.';
  if (status === 415) return 'The server does not support this file format.';
  if (status === 401 || status === 403) return 'Your session has expired. Please sign in again and retry.';
  if (status >= 500) return 'The analysis server hit an error. Please try again in a moment.';
  if (err && (err.code === 'ERR_NETWORK' || (!err.response && err.request))) {
    return 'Could not reach the analysis server. Check your connection and make sure the backend is running.';
  }
  if (err && err.message) return err.message;
  return "We couldn't analyze this file. It may be corrupted, too large, or in an unsupported format.";
}

/* =============================================================================
   COMPONENT
   ============================================================================= */

const Analyze = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  /* ---- core state ---- */
  const [selectedFile, setSelectedFile] = useState(null);
  const [phase, setPhase] = useState('idle'); // idle | running | done
  const [currentStep, setCurrentStep] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState(null);
  const [resultId, setResultId] = useState(null);
  const [elapsed, setElapsed] = useState(0);

  /* ---- options ---- */
  const [scanMode, setScanMode] = useState(() => {
    try {
      const saved = localStorage.getItem(MODE_STORAGE_KEY);
      return SCAN_MODES.some((m) => m.id === saved) ? saved : 'standard';
    } catch (err) {
      return 'standard';
    }
  });
  const [autoNavigate, setAutoNavigate] = useState(() => {
    try {
      return localStorage.getItem(REDIRECT_STORAGE_KEY) !== 'off';
    } catch (err) {
      return true;
    }
  });

  /* ---- logs + hash + drag ---- */
  const [diagnosticLogs, setDiagnosticLogs] = useState([]);
  const [showLogs, setShowLogs] = useState(true);
  const [copiedLogs, setCopiedLogs] = useState(false);
  const [fileHash, setFileHash] = useState({ status: 'idle', value: '' });
  const [copiedHash, setCopiedHash] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  /* ---- refs ---- */
  const mountedRef = useRef(true);
  const runIdRef = useRef(0);
  const pendingRef = useRef(undefined);
  const lastAcceptedRef = useRef({ key: '', at: 0 });
  const dragDepthRef = useRef(0);
  const logEndRef = useRef(null);
  const phaseRef = useRef('idle');

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const activeMode = useMemo(
    () => SCAN_MODES.find((m) => m.id === scanMode) || SCAN_MODES[0],
    [scanMode]
  );
  const detectedKind = useMemo(() => detectKind(selectedFile), [selectedFile]);

  /* ---------------------------------------------------------------------- */
  /* logging                                                                 */
  /* ---------------------------------------------------------------------- */

  const appendLog = useCallback((message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setDiagnosticLogs((prev) => [...prev, { timestamp, message, type }]);
  }, []);

  useEffect(() => {
    if (showLogs && logEndRef.current) {
      logEndRef.current.scrollTop = logEndRef.current.scrollHeight;
    }
  }, [diagnosticLogs.length, showLogs]);

  const copyLogs = async () => {
    const text = diagnosticLogs.map((l) => `[${l.timestamp}] ${l.message}`).join('\n');
    try {
      await navigator.clipboard.writeText(text);
      setCopiedLogs(true);
      setTimeout(() => setCopiedLogs(false), 1800);
    } catch (err) {
      /* clipboard can be blocked, nothing else to do */
    }
  };

  /* ---------------------------------------------------------------------- */
  /* file selection (UploadBox, drag anywhere, paste, Home handoff)          */
  /* ---------------------------------------------------------------------- */

  const handleFileSelected = useCallback(
    (file, source = 'upload') => {
      if (!file) return;
      if (phaseRef.current === 'running') return;

      /* the same file can arrive twice (UploadBox + window drop), ignore the repeat */
      const key = fileKey(file);
      const now = Date.now();
      if (lastAcceptedRef.current.key === key && now - lastAcceptedRef.current.at < 800) return;
      lastAcceptedRef.current = { key, at: now };

      if (file.size > MAX_SIZE) {
        setErrorMessage(
          `File size exceeds the 100MB limit. Selected file is ${(file.size / (1024 * 1024)).toFixed(2)}MB.`
        );
        return;
      }
      if (file.size === 0) {
        setErrorMessage('This file is empty. Choose a file that has content.');
        return;
      }
      if (!detectKind(file)) {
        setErrorMessage(
          'This file type is not supported. Use an image, video, audio file, PDF, DOCX, TXT or EPUB.'
        );
        return;
      }

      setSelectedFile(file);
      setErrorMessage(null);
      setResultId(null);
      setPhase('idle');
      setDiagnosticLogs([]);
      setUploadProgress(0);

      const via =
        source === 'home' ? ' (from the home page)' : source === 'paste' ? ' (pasted)' : source === 'drop' ? ' (dropped)' : '';
      appendLog(`File loaded${via}: ${file.name} (${formatBytes(file.size)})`, 'success');
    },
    [appendLog]
  );

  /* file handed over from the Home page drop zone */
  useEffect(() => {
    if (pendingRef.current === undefined) {
      pendingRef.current = window.__authenticityPendingFile || null;
      window.__authenticityPendingFile = null;
    }
    if (pendingRef.current) {
      const file = pendingRef.current;
      pendingRef.current = null;
      handleFileSelected(file, 'home');
    }
  }, [handleFileSelected]);

  /* ?mode=deep style presets win over the saved choice */
  useEffect(() => {
    const modeParam = searchParams.get('mode');
    if (modeParam && SCAN_MODES.some((m) => m.id === modeParam)) {
      setScanMode(modeParam);
    }
  }, [searchParams]);

  /* remember the chosen mode and redirect preference */
  useEffect(() => {
    try {
      localStorage.setItem(MODE_STORAGE_KEY, scanMode);
    } catch (err) {
      /* ignore */
    }
  }, [scanMode]);

  useEffect(() => {
    try {
      localStorage.setItem(REDIRECT_STORAGE_KEY, autoNavigate ? 'on' : 'off');
    } catch (err) {
      /* ignore */
    }
  }, [autoNavigate]);

  /* drag a file anywhere on the page */
  useEffect(() => {
    const hasFiles = (e) =>
      e.dataTransfer && Array.from(e.dataTransfer.types || []).includes('Files');

    const onEnter = (e) => {
      if (!hasFiles(e) || phaseRef.current === 'running') return;
      dragDepthRef.current += 1;
      setDragActive(true);
    };
    const onOver = (e) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
    };
    const onLeave = (e) => {
      if (!hasFiles(e)) return;
      dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
      if (dragDepthRef.current === 0) setDragActive(false);
    };
    const onDrop = (e) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      dragDepthRef.current = 0;
      setDragActive(false);
      if (phaseRef.current === 'running') return;
      const file = e.dataTransfer.files && e.dataTransfer.files[0];
      handleFileSelected(file, 'drop');
    };

    window.addEventListener('dragenter', onEnter);
    window.addEventListener('dragover', onOver);
    window.addEventListener('dragleave', onLeave);
    window.addEventListener('drop', onDrop);
    return () => {
      window.removeEventListener('dragenter', onEnter);
      window.removeEventListener('dragover', onOver);
      window.removeEventListener('dragleave', onLeave);
      window.removeEventListener('drop', onDrop);
    };
  }, [handleFileSelected]);

  /* paste an image or file with Ctrl+V */
  useEffect(() => {
    const onPaste = (e) => {
      if (phaseRef.current === 'running') return;
      const target = e.target;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;
      const files = e.clipboardData && e.clipboardData.files;
      if (files && files.length > 0) {
        e.preventDefault();
        handleFileSelected(files[0], 'paste');
      }
    };
    document.addEventListener('paste', onPaste);
    return () => document.removeEventListener('paste', onPaste);
  }, [handleFileSelected]);

  /* ---------------------------------------------------------------------- */
  /* real SHA-256 of the selected file                                       */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    if (!selectedFile) {
      setFileHash({ status: 'idle', value: '' });
      return undefined;
    }
    const canHash =
      typeof window !== 'undefined' && window.crypto && window.crypto.subtle && selectedFile.arrayBuffer;
    if (!canHash) {
      setFileHash({ status: 'unavailable', value: '' });
      return undefined;
    }
    if (selectedFile.size > HASH_LIMIT) {
      setFileHash({ status: 'toolarge', value: '' });
      return undefined;
    }

    let cancelled = false;
    setFileHash({ status: 'computing', value: '' });

    selectedFile
      .arrayBuffer()
      .then((buf) => window.crypto.subtle.digest('SHA-256', buf))
      .then((digest) => {
        if (cancelled) return;
        const hex = Array.from(new Uint8Array(digest))
          .map((b) => b.toString(16).padStart(2, '0'))
          .join('');
        setFileHash({ status: 'ready', value: hex });
        appendLog(`SHA-256 computed locally: ${hex.slice(0, 16)}...`, 'success');
      })
      .catch(() => {
        if (!cancelled) setFileHash({ status: 'unavailable', value: '' });
      });

    return () => {
      cancelled = true;
    };
  }, [selectedFile, appendLog]);

  const copyHash = async () => {
    if (!fileHash.value) return;
    try {
      await navigator.clipboard.writeText(fileHash.value);
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 1800);
    } catch (err) {
      /* ignore */
    }
  };

  /* ---------------------------------------------------------------------- */
  /* running timer                                                           */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    if (phase !== 'running') return undefined;
    const startedAt = Date.now();
    setElapsed(0);
    const id = setInterval(() => setElapsed((Date.now() - startedAt) / 1000), 200);
    return () => clearInterval(id);
  }, [phase]);

  /* ---------------------------------------------------------------------- */
  /* actions                                                                 */
  /* ---------------------------------------------------------------------- */

  const handleRemoveFile = () => {
    if (phase === 'running') return;
    setSelectedFile(null);
    setErrorMessage(null);
    setDiagnosticLogs([]);
    setUploadProgress(0);
    setResultId(null);
    setPhase('idle');
  };

  const cancelAnalysis = () => {
    runIdRef.current += 1; // any in-flight run now ignores its own results
    setPhase('idle');
    setCurrentStep(0);
    setUploadProgress(0);
    appendLog('Analysis cancelled by user.', 'warning');
  };

  const startAnalysis = async () => {
    if (!selectedFile || phase === 'running') return;

    runIdRef.current += 1;
    const runId = runIdRef.current;
    const isActive = () => mountedRef.current && runIdRef.current === runId;

    setPhase('running');
    setErrorMessage(null);
    setCurrentStep(0);
    setUploadProgress(0);
    setResultId(null);
    setShowLogs(true);

    const startTime = Date.now();
    appendLog(`Initializing forensic pipeline [mode: ${scanMode.toUpperCase()}].`, 'info');

    try {
      /* Step 0: upload */
      appendLog('Uploading file stream to secure analysis node...', 'info');
      const uploadRes = await api.uploadFile(selectedFile, (progress) => {
        if (isActive()) setUploadProgress(progress);
      });
      if (!isActive()) return;
      appendLog(`Upload complete. Assigned file ID: ${uploadRes.file_id}`, 'success');

      /* start the real analysis right away, the steps below run beside it */
      let apiDone = false;
      const analysisPromise = api.analyzeFile(uploadRes.file_id, { mode: scanMode });
      analysisPromise.then(
        () => {
          apiDone = true;
        },
        () => {
          apiDone = true;
        }
      );

      const plan = [
        { step: 1, msg: 'Classifying media container and cryptographic signatures...', ms: 400, type: 'info' },
        { step: 2, msg: 'Extracting EXIF, XMP and embedded device markers...', ms: 450, type: 'info' },
        scanMode === 'deep'
          ? { step: 3, msg: 'Executing Fast Fourier Transform (FFT) spectrum analysis...', ms: 800, type: 'warning' }
          : { step: 3, msg: 'Inspecting content signals and noise distribution...', ms: 550, type: 'info' },
        { step: 4, msg: 'Running Error Level Analysis (ELA) for localized splicing...', ms: 450, type: 'info' },
        { step: 5, msg: 'Querying C2PA Content Credentials and tamper seals...', ms: 400, type: 'info' }
      ];

      for (const item of plan) {
        if (!isActive()) return;
        setCurrentStep(item.step);
        appendLog(item.msg, item.type);
        /* once the server has answered there is no reason to keep the user waiting */
        await sleep(apiDone ? Math.min(item.ms, 140) : item.ms);
      }

      if (!isActive()) return;
      setCurrentStep(6);
      appendLog('Synthesizing confidence weights and final verdict heuristics...', 'info');

      const analysisRes = await analysisPromise;
      if (!isActive()) return;

      setCurrentStep(7);
      const took = ((Date.now() - startTime) / 1000).toFixed(1);
      appendLog(`Analysis completed successfully in ${took}s.`, 'success');
      await sleep(450);
      if (!isActive()) return;

      setResultId(analysisRes.analysis_id);
      if (autoNavigate) {
        navigate(`/results/${analysisRes.analysis_id}`);
      } else {
        setPhase('done');
      }
    } catch (err) {
      if (!isActive()) return;
      console.error('Analysis failed:', err);
      const msg = friendlyError(err);
      setPhase('idle');
      setCurrentStep(0);
      setErrorMessage(msg);
      appendLog(`FATAL ERROR: ${msg}`, 'error');
    }
  };

  const analyzeAnother = () => {
    setSelectedFile(null);
    setErrorMessage(null);
    setDiagnosticLogs([]);
    setUploadProgress(0);
    setResultId(null);
    setPhase('idle');
  };

  /* ---------------------------------------------------------------------- */
  /* render helpers                                                          */
  /* ---------------------------------------------------------------------- */

  const renderModePicker = () => (
    <div className="az-modes" role="radiogroup" aria-label="Scan mode">
      {SCAN_MODES.map((mode) => {
        const ModeIcon = mode.icon;
        const active = scanMode === mode.id;
        return (
          <button
            key={mode.id}
            type="button"
            role="radio"
            aria-checked={active}
            className={`az-mode${active ? ' is-active' : ''}`}
            style={{ '--mc': mode.color }}
            onClick={() => setScanMode(mode.id)}
            disabled={phase === 'running'}
          >
            <span className="az-mode-ico">
              <ModeIcon size={18} />
            </span>
            <span className="az-mode-text">
              <b>{mode.label}</b>
              <small>{mode.desc}</small>
            </span>
            {active && <CheckCircle2 size={18} className="az-mode-check" />}
          </button>
        );
      })}
    </div>
  );

  const renderCustody = () => {
    let body;
    if (fileHash.status === 'computing') {
      body = <span className="az-hash-muted">Computing SHA-256 in your browser...</span>;
    } else if (fileHash.status === 'ready') {
      body = <code className="az-hash">{fileHash.value}</code>;
    } else if (fileHash.status === 'toolarge') {
      body = (
        <span className="az-hash-muted">
          Files over 64 MB are hashed on the server after upload.
        </span>
      );
    } else if (fileHash.status === 'unavailable') {
      body = (
        <span className="az-hash-muted">
          Local hashing is not available in this browser context.
        </span>
      );
    } else {
      body = <span className="az-hash-muted">Waiting for a file...</span>;
    }

    return (
      <div className="az-custody">
        <div className="az-custody-head">
          <span>
            <Hash size={15} /> Chain-of-custody
          </span>
          {fileHash.status === 'ready' && (
            <button type="button" className="az-chip-btn" onClick={copyHash}>
              {copiedHash ? <Check size={13} /> : <Copy size={13} />}
              {copiedHash ? 'Copied' : 'Copy'}
            </button>
          )}
        </div>
        <div className="az-custody-grid">
          <div>
            <small>Detected type</small>
            <b>{detectedKind || 'Unknown'}</b>
          </div>
          <div>
            <small>Size</small>
            <b>{formatBytes(selectedFile ? selectedFile.size : 0)}</b>
          </div>
          <div>
            <small>MIME</small>
            <b>{(selectedFile && selectedFile.type) || 'not reported'}</b>
          </div>
        </div>
        <div className="az-hash-row">{body}</div>
      </div>
    );
  };

  /* ---------------------------------------------------------------------- */
  /* render                                                                  */
  /* ---------------------------------------------------------------------- */

  return (
    <div className="az-page">
      {/* drag anywhere overlay */}
      {dragActive && (
        <div className="az-drag-overlay" aria-hidden="true">
          <div className="az-drag-box">
            <UploadCloud size={54} />
            <h3>Drop to load your file</h3>
            <p>It stays in your browser until you press Run.</p>
          </div>
        </div>
      )}

      {/* header */}
      <header className="az-header">
        <span className="az-badge">
          <Sparkles size={12} /> Forensic Engine v4.2
        </span>
        <h1>Analyze digital content</h1>
        <p>
          Inspect an image, video, audio file or document for manipulation markers, synthetic
          generator tags and C2PA Content Credentials.
        </p>
      </header>

      <div className="az-grid">
        {/* ------------------------- main column ------------------------- */}
        <main className="az-main">
          {phase === 'idle' && (
            <>
              {renderModePicker()}

              {!selectedFile ? (
                <div className="az-fade">
                  <UploadBox
                    onFileSelected={(f) => handleFileSelected(f, 'upload')}
                    disabled={phase === 'running'}
                  />
                  <div className="az-tip">
                    <ClipboardPaste size={15} />
                    You can also drag a file anywhere on this page, or paste an image with Ctrl+V.
                  </div>
                </div>
              ) : (
                <div className="az-fade az-stack">
                  <FilePreview file={selectedFile} onRemove={handleRemoveFile} disabled={false} />
                  <MediaInfo file={selectedFile} />
                  {renderCustody()}

                  <div className="az-actions">
                    <div className="az-selected-mode">
                      Mode: <strong>{activeMode.long}</strong>
                    </div>
                    <div className="az-actions-btns">
                      <button type="button" onClick={handleRemoveFile} className="btn btn-secondary">
                        Choose different file
                      </button>
                      <button
                        type="button"
                        onClick={startAnalysis}
                        className="btn btn-primary az-run"
                      >
                        <Play size={18} fill="#ffffff" /> Run authenticity analysis
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <label className="az-redirect">
                <input
                  type="checkbox"
                  checked={autoNavigate}
                  onChange={(e) => setAutoNavigate(e.target.checked)}
                />
                Open the full report automatically when the analysis finishes
              </label>
            </>
          )}

          {phase === 'running' && (
            <div className="az-fade az-stack">
              <AnalysisProgress currentStepIndex={currentStep} uploadProgress={uploadProgress} />

              <div className="az-status">
                <div className="az-status-item">
                  <Clock size={15} />
                  <span>Elapsed</span>
                  <b>{formatClock(elapsed)}</b>
                </div>
                <div className="az-status-item">
                  <activeMode.icon size={15} />
                  <span>Mode</span>
                  <b>{activeMode.label}</b>
                </div>
                <div className="az-status-item">
                  <FileSearch size={15} />
                  <span>File</span>
                  <b className="az-trunc">{selectedFile ? selectedFile.name : ''}</b>
                </div>
                <button type="button" className="az-cancel" onClick={cancelAnalysis}>
                  <X size={15} /> Cancel
                </button>
              </div>

              <div className="az-console">
                <div
                  className="az-console-head"
                  role="button"
                  tabIndex={0}
                  onClick={() => setShowLogs((v) => !v)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setShowLogs((v) => !v);
                    }
                  }}
                >
                  <span>
                    <Cpu size={15} /> Live diagnostic logs ({diagnosticLogs.length} events)
                  </span>
                  <span className="az-console-tools">
                    <button
                      type="button"
                      className="az-chip-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyLogs();
                      }}
                    >
                      {copiedLogs ? <Check size={13} /> : <Copy size={13} />}
                      {copiedLogs ? 'Copied' : 'Copy'}
                    </button>
                    {showLogs ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </span>
                </div>
                {showLogs && (
                  <div className="az-console-body" ref={logEndRef}>
                    {diagnosticLogs.map((log, index) => (
                      <div key={index} className={`az-log az-log-${log.type}`}>
                        <span className="az-log-time">[{log.timestamp}]</span>
                        <span>{log.message}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {phase === 'done' && (
            <div className="az-done az-fade">
              <div className="az-done-ico">
                <CheckCircle2 size={34} />
              </div>
              <h2>Analysis complete</h2>
              <p>
                {selectedFile ? selectedFile.name : 'Your file'} was analyzed in {formatClock(elapsed)}.
                Your report is ready.
              </p>
              <div className="az-done-btns">
                <button
                  type="button"
                  className="btn btn-primary az-run"
                  onClick={() => navigate(`/results/${resultId}`)}
                >
                  View full report <ArrowRight size={17} />
                </button>
                <button type="button" className="btn btn-secondary" onClick={analyzeAnother}>
                  Analyze another file
                </button>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="az-error" role="alert">
              <AlertCircle size={20} className="az-error-ico" />
              <div className="az-error-msg">{errorMessage}</div>
              <div className="az-error-btns">
                {selectedFile && phase === 'idle' && (
                  <button type="button" className="btn btn-outline az-small" onClick={startAnalysis}>
                    <RefreshCw size={13} /> Retry
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn-outline az-small"
                  onClick={() => setErrorMessage(null)}
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}
        </main>

        {/* ------------------------- side column ------------------------- */}
        <aside className="az-aside">
          <section className="az-side-card" style={{ '--mc': activeMode.color }}>
            <h3>
              <ShieldCheck size={16} /> This scan checks
            </h3>
            <ul>
              {activeMode.checks.map((c) => (
                <li key={c}>
                  <CheckCircle2 size={15} />
                  {c}
                </li>
              ))}
            </ul>
          </section>

          <section className="az-side-card az-side-plain">
            <h3>
              <Lock size={16} /> Your file stays private
            </h3>
            <p>
              Files are analyzed in an isolated sandbox and purged when your session ends. The
              SHA-256 shown here is computed in your browser before anything is uploaded.
            </p>
          </section>

          <section className="az-side-card az-side-plain">
            <h3>
              <Info size={16} /> Limits
            </h3>
            <p>Up to 100 MB per file. Images, video, audio, PDF, DOCX, TXT and EPUB.</p>
          </section>
        </aside>
      </div>

      <style>{ANALYZE_CSS}</style>
    </div>
  );
};

/* =============================================================================
   CSS (uses your global CSS variables when present, with safe fallbacks)
   ============================================================================= */

const ANALYZE_CSS = `
.az-page {
  --az-text: var(--text-primary, #f1f5ff);
  --az-muted: var(--text-secondary, #94a3c8);
  --az-faint: var(--text-tertiary, #6b7aa6);
  --az-surface: var(--bg-surface, #0a1027);
  --az-line: var(--border-subtle, rgba(148, 163, 255, 0.16));
  max-width: 1120px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 28px;
  color: var(--az-text);
  animation: az-fade 0.45s cubic-bezier(0.22, 1, 0.36, 1);
}
.az-page *, .az-page *::before, .az-page *::after { box-sizing: border-box; }

.az-header { display: flex; flex-direction: column; gap: 10px; }
.az-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  width: fit-content;
  padding: 4px 12px;
  border-radius: 999px;
  background: rgba(59, 130, 246, 0.12);
  color: #60a5fa;
  font-size: 0.76rem;
  font-weight: 700;
}
.az-header h1 { margin: 0; font-size: clamp(1.9rem, 3.6vw, 2.5rem); font-weight: 800; letter-spacing: -0.02em; }
.az-header p { margin: 0; max-width: 660px; color: var(--az-muted); line-height: 1.65; }

.az-grid { display: grid; grid-template-columns: minmax(0, 1fr) 320px; gap: 28px; align-items: start; }
.az-main { display: flex; flex-direction: column; gap: 20px; min-width: 0; }
.az-stack { display: flex; flex-direction: column; gap: 18px; }
.az-fade { animation: az-fade 0.4s cubic-bezier(0.22, 1, 0.36, 1); }

/* mode picker */
.az-modes { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
.az-mode {
  position: relative;
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding: 14px 16px;
  border-radius: 14px;
  border: 1.5px solid var(--az-line);
  background: var(--az-surface);
  color: inherit;
  text-align: left;
  cursor: pointer;
  transition: border-color 0.2s ease, background 0.2s ease, transform 0.2s ease;
}
.az-mode:hover:not(:disabled) { border-color: var(--mc); transform: translateY(-2px); }
.az-mode.is-active { border-color: var(--mc); background: color-mix(in srgb, var(--mc) 10%, var(--az-surface)); }
.az-mode:disabled { opacity: 0.6; cursor: not-allowed; }
.az-mode-ico {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--mc);
  background: color-mix(in srgb, var(--mc) 16%, transparent);
}
.az-mode-text b { display: block; font-size: 0.92rem; margin-bottom: 3px; }
.az-mode-text small { display: block; color: var(--az-muted); font-size: 0.76rem; line-height: 1.45; }
.az-mode-check { position: absolute; right: 12px; top: 12px; color: var(--mc); }

.az-tip {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 14px;
  color: var(--az-faint);
  font-size: 0.84rem;
}

/* custody card */
.az-custody {
  padding: 18px 20px;
  border-radius: 16px;
  background: var(--az-surface);
  border: 1px solid var(--az-line);
}
.az-custody-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; font-weight: 700; font-size: 0.92rem; }
.az-custody-head span { display: inline-flex; align-items: center; gap: 8px; }
.az-custody-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
.az-custody-grid small { display: block; color: var(--az-faint); font-size: 0.74rem; margin-bottom: 3px; }
.az-custody-grid b { display: block; font-size: 0.88rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.az-hash-row { margin-top: 14px; padding-top: 14px; border-top: 1px dashed var(--az-line); }
.az-hash { display: block; font-family: 'JetBrains Mono', Consolas, monospace; font-size: 0.76rem; color: #6ee7b7; word-break: break-all; line-height: 1.6; }
.az-hash-muted { color: var(--az-faint); font-size: 0.84rem; }

.az-chip-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 8px;
  border: 1px solid var(--az-line);
  background: rgba(255, 255, 255, 0.04);
  color: var(--az-muted);
  font-size: 0.74rem;
  font-weight: 600;
  cursor: pointer;
}
.az-chip-btn:hover { color: #fff; background: rgba(59, 130, 246, 0.16); }

/* actions */
.az-actions { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
.az-selected-mode { font-size: 0.86rem; color: var(--az-faint); }
.az-selected-mode strong { color: var(--az-text); }
.az-actions-btns { display: flex; gap: 12px; flex-wrap: wrap; }
.az-run { display: inline-flex; align-items: center; gap: 8px; padding: 0.75rem 1.7rem; font-size: 1rem; }
.az-redirect { display: flex; align-items: center; gap: 9px; font-size: 0.84rem; color: var(--az-muted); cursor: pointer; width: fit-content; }
.az-redirect input { accent-color: #3b82f6; }

/* running */
.az-status {
  display: flex;
  align-items: center;
  gap: 18px;
  flex-wrap: wrap;
  padding: 12px 16px;
  border-radius: 14px;
  background: var(--az-surface);
  border: 1px solid var(--az-line);
}
.az-status-item { display: inline-flex; align-items: center; gap: 8px; font-size: 0.84rem; color: var(--az-muted); min-width: 0; }
.az-status-item b { color: var(--az-text); font-variant-numeric: tabular-nums; }
.az-trunc { max-width: 190px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.az-cancel {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: 10px;
  border: 1px solid rgba(248, 113, 113, 0.4);
  background: rgba(248, 113, 113, 0.08);
  color: #fca5a5;
  font-weight: 600;
  font-size: 0.84rem;
  cursor: pointer;
}
.az-cancel:hover { background: rgba(248, 113, 113, 0.18); }

.az-console { border-radius: 14px; background: #0b1124; border: 1px solid #1e293b; overflow: hidden; }
.az-console-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 13px 18px;
  cursor: pointer;
  color: #94a3b8;
  font-family: 'JetBrains Mono', Consolas, monospace;
  font-size: 0.82rem;
}
.az-console-head > span:first-child { display: inline-flex; align-items: center; gap: 8px; }
.az-console-head svg { color: #38bdf8; }
.az-console-tools { display: inline-flex; align-items: center; gap: 12px; }
.az-console-tools svg { color: #94a3b8; }
.az-console-body {
  max-height: 220px;
  overflow-y: auto;
  padding: 12px 18px 16px;
  border-top: 1px solid #1e293b;
  display: flex;
  flex-direction: column;
  gap: 5px;
  font-family: 'JetBrains Mono', Consolas, monospace;
  font-size: 0.78rem;
  scroll-behavior: smooth;
}
.az-log { display: flex; gap: 12px; color: #cbd5e1; line-height: 1.5; }
.az-log-time { color: #64748b; flex-shrink: 0; }
.az-log-success { color: #4ade80; }
.az-log-warning { color: #fbbf24; }
.az-log-error { color: #f87171; }

/* done */
.az-done {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 12px;
  padding: 46px 28px;
  border-radius: 22px;
  background: linear-gradient(160deg, rgba(16, 185, 129, 0.12), var(--az-surface));
  border: 1px solid rgba(52, 211, 153, 0.4);
}
.az-done-ico {
  width: 68px;
  height: 68px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #34d399;
  background: rgba(52, 211, 153, 0.15);
}
.az-done h2 { margin: 6px 0 0; font-size: 1.6rem; font-weight: 800; }
.az-done p { margin: 0; color: var(--az-muted); max-width: 440px; line-height: 1.6; }
.az-done-btns { display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; margin-top: 10px; }

/* error */
.az-error {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  padding: 14px 18px;
  border-radius: 12px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.35);
  color: #fca5a5;
  font-size: 0.92rem;
  animation: az-shake 0.4s ease-in-out;
}
.az-error-ico { flex-shrink: 0; }
.az-error-msg { flex: 1; min-width: 200px; line-height: 1.5; }
.az-error-btns { display: flex; gap: 8px; }
.az-small { padding: 0.35rem 0.8rem; font-size: 0.78rem; display: inline-flex; align-items: center; gap: 6px; }

/* aside */
.az-aside { display: flex; flex-direction: column; gap: 16px; position: sticky; top: 96px; }
.az-side-card {
  --mc: #60a5fa;
  padding: 20px;
  border-radius: 16px;
  background: var(--az-surface);
  border: 1px solid var(--az-line);
}
.az-side-card:not(.az-side-plain) { border-top: 3px solid var(--mc); }
.az-side-card h3 { margin: 0 0 14px; display: flex; align-items: center; gap: 8px; font-size: 0.95rem; font-weight: 700; }
.az-side-card h3 svg { color: var(--mc); }
.az-side-plain h3 svg { color: #94a3c8; }
.az-side-card ul { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 11px; }
.az-side-card li { display: flex; gap: 10px; align-items: flex-start; font-size: 0.86rem; color: var(--az-muted); line-height: 1.45; }
.az-side-card li svg { color: var(--mc); flex-shrink: 0; margin-top: 2px; }
.az-side-card p { margin: 0; color: var(--az-muted); font-size: 0.86rem; line-height: 1.65; }

/* drag overlay */
.az-drag-overlay {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(5, 8, 22, 0.82);
  backdrop-filter: blur(6px);
  animation: az-fade 0.2s ease-out;
  pointer-events: none;
}
.az-drag-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 56px 72px;
  border-radius: 28px;
  border: 2px dashed #60a5fa;
  background: rgba(37, 99, 235, 0.12);
  color: #bfdbfe;
  text-align: center;
}
.az-drag-box h3 { margin: 8px 0 0; font-size: 1.5rem; color: #fff; }
.az-drag-box p { margin: 0; color: #93c5fd; }

@keyframes az-fade { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
@keyframes az-shake { 0%, 100% { transform: translateX(0); } 20%, 60% { transform: translateX(-4px); } 40%, 80% { transform: translateX(4px); } }

@media (prefers-reduced-motion: reduce) {
  .az-page, .az-page *, .az-drag-overlay { animation: none !important; transition: none !important; }
  .az-console-body { scroll-behavior: auto; }
}

@media (max-width: 980px) {
  .az-grid { grid-template-columns: 1fr; }
  .az-aside { position: static; }
  .az-modes { grid-template-columns: 1fr; }
}

@media (max-width: 560px) {
  .az-custody-grid { grid-template-columns: 1fr 1fr; }
  .az-actions-btns { width: 100%; }
  .az-actions-btns .btn { flex: 1; justify-content: center; }
  .az-drag-box { padding: 36px 28px; }
}
`;

export default Analyze;
