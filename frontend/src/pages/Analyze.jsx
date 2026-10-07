import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Play, 
  Sparkles, 
  AlertCircle, 
  ArrowLeft, 
  RefreshCw, 
  ShieldCheck, 
  Sliders, 
  FileCheck, 
  Cpu, 
  CheckCircle2, 
  HelpCircle, 
  Info,
  Layers,
  Zap,
  Lock,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import UploadBox from '../components/UploadBox';
import FilePreview from '../components/FilePreview';
import MediaInfo from '../components/MediaInfo';
import AnalysisProgress from '../components/AnalysisProgress';
import { api } from '../services/api';

// --- Advanced Forensic Scan Modes ---
const SCAN_MODES = [
  { id: 'standard', label: 'Standard Heuristic', desc: 'Fast structural & metadata scan (Recommended)', icon: <Zap size={16} /> },
  { id: 'deep', label: 'Deep Forensic (FFT + ELA)', desc: 'Rigorous error level analysis and frequency domain check', icon: <Cpu size={16} /> },
  { id: 'provenance', label: 'C2PA Credentials Only', desc: 'Verify cryptographic content signing history', icon: <Lock size={16} /> }
];

const Analyze = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Core State
  const [selectedFile, setSelectedFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState(null);
  
  // Advanced Unicorn UI States
  const [scanMode, setScanMode] = useState('standard');
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [autoNavigate, setAutoNavigate] = useState(true);
  const [diagnosticLogs, setDiagnosticLogs] = useState([]);
  const [showLogsAccordion, setShowLogsAccordion] = useState(false);
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState(null);

  // Load preset options or files from query params if available
  useEffect(() => {
    const modeParam = searchParams.get('mode');
    if (modeParam && SCAN_MODES.some(m => m.id === modeParam)) {
      setScanMode(modeParam);
    }
  }, [searchParams]);

  // Log diagnostic events during analysis
  const appendLog = useCallback((message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setDiagnosticLogs(prev => [...prev, { timestamp, message, type }]);
  }, []);

  const handleFileSelected = (file) => {
    if (!file) return;
    
    // File validation check (e.g., max 100MB)
    const MAX_SIZE = 100 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setErrorMessage(`File size exceeds the 100MB limit. Selected file is ${(file.size / (1024 * 1024)).toFixed(2)}MB.`);
      return;
    }

    setSelectedFile(file);
    setErrorMessage(null);
    appendLog(`File loaded successfully: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`, 'success');
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setErrorMessage(null);
    setDiagnosticLogs([]);
    setUploadProgress(0);
    setIsAnalyzing(false);
  };

  const startAnalysis = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    setErrorMessage(null);
    setCurrentStep(0);
    setDiagnosticLogs([]);
    
    const startTime = Date.now();
    appendLog(`Initializing forensic pipeline [Mode: ${scanMode.toUpperCase()}].`, 'info');

    try {
      // Step 0: Uploading & Chunk Verification
      setCurrentStep(0);
      setEstimatedTimeRemaining('Calculating...');
      appendLog(`Uploading file stream to secure analysis node...`, 'info');
      
      const uploadRes = await api.uploadFile(selectedFile, (progress) => {
        setUploadProgress(progress);
      });
      
      appendLog(`Upload complete. Assigned File ID: ${uploadRes.file_id}`, 'success');

      // Step 1: Media Classified
      setCurrentStep(1);
      appendLog(`Classifying media container and cryptographic signatures...`, 'info');
      await new Promise(r => setTimeout(r, 400));

      // Step 2: Metadata Extraction
      setCurrentStep(2);
      appendLog(`Extracting EXIF, XMP, and embedded device markers...`, 'info');
      await new Promise(r => setTimeout(r, 450));

      // Step 3: Content Analysis & FFT
      setCurrentStep(3);
      if (scanMode === 'deep') {
        appendLog(`Executing Fast Fourier Transform (FFT) frequency spectrum analysis...`, 'warning');
        await new Promise(r => setTimeout(r, 800));
      } else {
        await new Promise(r => setTimeout(r, 550));
      }

      // Step 4: Manipulation / ELA check
      setCurrentStep(4);
      appendLog(`Running Error Level Analysis (ELA) for localized splicing detection...`, 'info');
      await new Promise(r => setTimeout(r, 450));

      // Step 5: Provenance C2PA check
      setCurrentStep(5);
      appendLog(`Querying C2PA Content Credentials ledger and tamper seals...`, 'info');
      await new Promise(r => setTimeout(r, 400));

      // Step 6: Evidence Fusion
      setCurrentStep(6);
      appendLog(`Synthesizing confidence weights and final verdict heuristics...`, 'info');

      // Perform actual analysis API call with scan parameters
      const analysisRes = await api.analyzeFile(uploadRes.file_id, { mode: scanMode });

      // Step 7: Done!
      setCurrentStep(7);
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      appendLog(`Analysis completed successfully in ${elapsed}s.`, 'success');
      await new Promise(r => setTimeout(r, 500));

      if (autoNavigate) {
        navigate(`/results/${analysisRes.analysis_id}`);
      }

    } catch (err) {
      console.error('Analysis failed:', err);
      setIsAnalyzing(false);
      const errorMsg = 
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.message ||
        "We couldn't analyze this file. It may be corrupted, too large, or using an unsupported format.";
      
      setErrorMessage(errorMsg);
      appendLog(`FATAL ERROR: ${errorMsg}`, 'error');
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem', animation: 'fadeIn 0.4s ease-out' }}>
      
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
            <span style={{ 
              background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', 
              padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700,
              display: 'flex', alignItems: 'center', gap: '0.3rem'
            }}>
              <Sparkles size={12} /> Unicorn Forensic Engine v4.2
            </span>
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.02em', margin: 0, color: 'var(--text-primary)' }}>
            Analyze Digital Content
          </h1>
          <p style={{ color: 'var(--text-secondary, #9ca3af)', fontSize: '1rem', lineHeight: 1.5, marginTop: '0.3rem' }}>
            Inspect an image, video, audio file, or document for manipulation markers, synthetic generator tags, and C2PA Content Credentials.
          </p>
        </div>

        {/* Quick Config Toggle */}
        {!isAnalyzing && (
          <button 
            type="button"
            onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
            className="btn btn-outline"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}
          >
            <Sliders size={15} /> {showAdvancedOptions ? 'Hide Config' : 'Scan Options'}
          </button>
        )}
      </div>

      {/* Advanced Scan Configuration Drawer */}
      {showAdvancedOptions && !isAnalyzing && (
        <div className="card" style={{ 
          background: 'var(--bg-surface-alt, #1f2937)', 
          border: '1px solid var(--border-subtle, #374151)',
          display: 'flex', 
          flexDirection: 'column', 
          gap: '1rem',
          animation: 'slideDown 0.3s ease-out'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Layers size={16} color="#3b82f6" /> Advanced Forensic Configuration
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Custom Engine Parameters</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem' }}>
            {SCAN_MODES.map((mode) => (
              <div 
                key={mode.id}
                onClick={() => setScanMode(mode.id)}
                style={{
                  padding: '0.85rem 1rem',
                  borderRadius: '8px',
                  border: `2px solid ${scanMode === mode.id ? '#3b82f6' : 'var(--border-subtle, #374151)'}`,
                  background: scanMode === mode.id ? 'rgba(59, 130, 246, 0.08)' : 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.3rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.9rem', color: scanMode === mode.id ? '#3b82f6' : 'var(--text-primary)' }}>
                  {mode.icon} {mode.label}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  {mode.desc}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer', color: 'var(--text-secondary)' }}>
              <input 
                type="checkbox" 
                checked={autoNavigate} 
                onChange={(e) => setAutoNavigate(e.target.checked)}
                style={{ accentColor: '#3b82f6' }}
              />
              Automatically redirect to full report upon completion
            </label>
            <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>Ready for Processing</span>
          </div>
        </div>
      )}

      {/* Main Execution View */}
      {isAnalyzing ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <AnalysisProgress currentStepIndex={currentStep} uploadProgress={uploadProgress} />
          
          {/* Diagnostic Console Accordion */}
          <div className="card" style={{ padding: '1rem 1.25rem', background: '#0f172a', border: '1px solid #1e293b' }}>
            <div 
              onClick={() => setShowLogsAccordion(!showLogsAccordion)}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#94a3b8', fontFamily: 'monospace' }}>
                <Cpu size={15} color="#38bdf8" /> Live Diagnostic Logs ({diagnosticLogs.length} events)
              </div>
              <button type="button" style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                {showLogsAccordion ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            </div>

            {showLogsAccordion && (
              <div style={{ 
                marginTop: '0.75rem', 
                maxHeight: '180px', 
                overflowY: 'auto', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '0.3rem',
                fontFamily: 'monospace',
                fontSize: '0.78rem',
                borderTop: '1px solid #1e293b',
                paddingTop: '0.75rem'
              }}>
                {diagnosticLogs.map((log, index) => (
                  <div key={index} style={{ display: 'flex', gap: '0.75rem', color: log.type === 'error' ? '#f87171' : log.type === 'success' ? '#4ade80' : '#cbd5e1' }}>
                    <span style={{ color: '#64748b' }}>[{log.timestamp}]</span>
                    <span style={{ flex: 1 }}>{log.message}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {!selectedFile ? (
            <UploadBox onFileSelected={handleFileSelected} disabled={isAnalyzing} />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', animation: 'fadeIn 0.3s' }}>
              <FilePreview file={selectedFile} onRemove={handleRemoveFile} disabled={isAnalyzing} />
              <MediaInfo file={selectedFile} />

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>
                  Selected mode: <strong style={{ color: 'var(--text-primary)', textTransform: 'capitalize' }}>{scanMode}</strong>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="btn btn-secondary"
                  >
                    Choose Different File
                  </button>
                  <button
                    type="button"
                    onClick={startAnalysis}
                    className="btn btn-primary"
                    style={{ padding: '0.75rem 1.8rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    <Play size={18} fill="#ffffff" /> Run Authenticity Analysis
                  </button>
                </div>
              </div>
            </div>
          )}

          {errorMessage && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '1rem 1.25rem',
              borderRadius: 'var(--radius-md, 8px)',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#f87171',
              fontSize: '0.92rem',
              animation: 'shake 0.4s ease-in-out'
            }}>
              <AlertCircle size={20} style={{ flexShrink: 0 }} />
              <div style={{ flex: 1 }}>{errorMessage}</div>
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="btn btn-outline"
                style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
              >
                Dismiss
              </button>
            </div>
          )}
        </div>
      )}

      {/* Global CSS Animation Keyframes */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-4px); }
          40%, 80% { transform: translateX(4px); }
        }
      `}</style>
    </div>
  );
};

export default Analyze;