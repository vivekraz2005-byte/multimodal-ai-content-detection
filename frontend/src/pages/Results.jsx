import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  PlusCircle,
  Download,
  Printer,
  ArrowLeft,
  Share2,
  AlertTriangle,
  Lightbulb,
  FileText,
  Loader2,
  RefreshCcw,
  Copy,
  CheckCircle,
  Database,
  History,
  Search
} from 'lucide-react';

// Assumed external components based on your original imports
import ResultCard from '../components/ResultCard';
import ConfidenceMeter from '../components/ConfidenceMeter';
import RiskIndicator from '../components/RiskIndicator';
import EvidenceCard from '../components/EvidenceCard';
import MetadataPanel from '../components/MetadataPanel';
import ProvenancePanel from '../components/ProvenancePanel';
import Timeline from '../components/Timeline';
import { api } from '../services/api';

// --- Internal Helper Components ---

const SkeletonPulse = ({ width, height, borderRadius = '8px', style = {} }) => (
  <div style={{
    width,
    height,
    borderRadius,
    background: 'linear-gradient(90deg, var(--bg-surface, #1f2937) 0%, var(--bg-surface-hover, #374151) 50%, var(--bg-surface, #1f2937) 100%)',
    backgroundSize: '200% 100%',
    animation: 'pulse 1.5s infinite linear',
    ...style
  }} />
);

const Toast = ({ message, visible }) => (
  <div style={{
    position: 'fixed',
    bottom: '2rem',
    left: '50%',
    transform: `translateX(-50%) translateY(${visible ? '0' : '20px'})`,
    opacity: visible ? 1 : 0,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    background: '#10b981',
    color: '#fff',
    padding: '0.75rem 1.5rem',
    borderRadius: '9999px',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    zIndex: 50,
    pointerEvents: 'none'
  }}>
    <CheckCircle size={18} />
    <span style={{ fontWeight: 500, fontSize: '0.95rem' }}>{message}</span>
  </div>
);


// --- Main Component ---

const Results = () => {
  const { analysisId } = useParams();
  const navigate = useNavigate();
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // UI States
  const [activeTab, setActiveTab] = useState('evidence');
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  const fetchResults = useCallback(async () => {
    if (!analysisId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await api.getResults(analysisId);
      setData(res);
    } catch (err) {
      console.error('Failed to load analysis result:', err);
      setError(
        err.response?.data?.message || 
        'Report not found or session expired. Please verify the link or start a new analysis.'
      );
    } finally {
      setLoading(false);
    }
  }, [analysisId]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  // --- Handlers ---

  const handleDownloadJson = () => {
    if (!data) return;
    try {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `forensic_report_${data.filename?.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'media'}_${data.analysis_id.slice(0, 8)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to generate JSON download", err);
    }
  };

  const handlePrint = () => {
    // Optional: Switch to a 'print-friendly' view by expanding all tabs before printing
    window.print();
  };

  const showToast = (message) => {
    setToastMessage(message);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareData = {
      title: `Forensic Report: ${data?.filename}`,
      text: 'View the authenticity and provenance analysis report for this digital media.',
      url: shareUrl,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if (err.name !== 'AbortError') {
          copyToClipboard(shareUrl);
        }
      }
    } else {
      copyToClipboard(shareUrl);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast('Report link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  // --- Render States ---

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1rem 0' }}>
        {/* Header Skeleton */}
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <SkeletonPulse width="40px" height="40px" borderRadius="8px" />
            <div>
              <SkeletonPulse width="250px" height="28px" style={{ marginBottom: '8px' }} />
              <SkeletonPulse width="150px" height="16px" />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <SkeletonPulse width="100px" height="36px" />
            <SkeletonPulse width="100px" height="36px" />
            <SkeletonPulse width="140px" height="36px" />
          </div>
        </div>
        
        {/* Grid Skeleton */}
        <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <SkeletonPulse width="100%" height="220px" />
            <SkeletonPulse width="100%" height="400px" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <SkeletonPulse width="100%" height="180px" />
            <SkeletonPulse width="100%" height="250px" />
            <SkeletonPulse width="100%" height="150px" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div className="card" style={{ maxWidth: '500px', width: '100%', textAlign: 'center', padding: '3rem 2rem', borderTop: '4px solid #f87171' }}>
          <div style={{ 
            width: '64px', height: '64px', borderRadius: '50%', background: '#fee2e2', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' 
          }}>
            <AlertTriangle size={32} color="#ef4444" />
          </div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-primary, #111827)' }}>
            Report Unavailable
          </h3>
          <p style={{ color: 'var(--text-secondary, #6b7280)', marginBottom: '2rem', fontSize: '0.95rem', lineHeight: 1.6 }}>
            {error || 'We could not locate the requested forensic analysis. It may have expired or the ID is incorrect.'}
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button onClick={fetchResults} className="btn btn-outline" style={{ padding: '0.6rem 1.2rem' }}>
              <RefreshCcw size={16} /> Retry
            </button>
            <Link to="/analyze" className="btn btn-primary" style={{ padding: '0.6rem 1.2rem' }}>
              <PlusCircle size={16} /> Start New Analysis
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // --- Main Render ---

  const tabs = [
    { id: 'evidence', label: 'Evidence Log', icon: <Search size={16} />, count: data.evidence_list?.length || 0 },
    { id: 'recommendations', label: 'Action Plan', icon: <Lightbulb size={16} />, count: data.recommendations?.length || 0 },
    { id: 'metadata', label: 'Raw Metadata', icon: <Database size={16} /> },
    { id: 'provenance', label: 'C2PA Provenance', icon: <History size={16} /> }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeIn 0.5s ease-out' }}>
      <Toast message={toastMessage} visible={toastVisible} />

      {/* Top Header & Actions */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid var(--border-subtle, #e5e7eb)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button 
            onClick={() => navigate(-1)} 
            className="btn btn-outline" 
            style={{ padding: '0.5rem', borderRadius: '8px' }}
            title="Go Back"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
              Forensic Report
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.25rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                {data.filename}
              </span>
              <span style={{ color: 'var(--border-subtle)' }}>|</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary, #9ca3af)', fontFamily: 'monospace' }}>
                ID: {data.analysis_id.slice(0, 10)}...
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button type="button" onClick={handleShare} className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>
            <Share2 size={16} /> Share
          </button>
          <button type="button" onClick={handleDownloadJson} className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>
            <Download size={16} /> JSON
          </button>
          <button type="button" onClick={handlePrint} className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>
            <Printer size={16} /> Print
          </button>
          <Link to="/analyze" className="btn btn-primary" style={{ padding: '0.5rem 1.25rem', marginLeft: '0.5rem' }}>
            <PlusCircle size={16} /> New Analysis
          </Link>
        </div>
      </header>

      {/* Main Grid */}
      <div className="dashboard-grid" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
        gap: '1.5rem',
        alignItems: 'start'
      }}>
        
        {/* Left / Primary Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', gridColumn: 'span 2' }}>
          
          {/* Main Assessment */}
          <ResultCard
            assessment={data.assessment}
            confidence={data.confidence}
            whyExplanation={data.why_explanation}
            uncertaintyReasons={data.uncertainty_reasons}
          />

          {/* Tabbed Interface for Details */}
          <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            
            {/* Tab Headers */}
            <div style={{ 
              display: 'flex', 
              borderBottom: '1px solid var(--border-subtle)', 
              background: 'var(--bg-surface-alt, #f9fafb)',
              overflowX: 'auto'
            }}>
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '1rem 1.5rem',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: `2px solid ${activeTab === tab.id ? '#3b82f6' : 'transparent'}`,
                    color: activeTab === tab.id ? '#3b82f6' : 'var(--text-secondary)',
                    fontWeight: activeTab === tab.id ? 600 : 500,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {tab.icon}
                  {tab.label}
                  {tab.count !== undefined && (
                    <span style={{
                      background: activeTab === tab.id ? '#eff6ff' : 'var(--bg-muted, #e5e7eb)',
                      color: activeTab === tab.id ? '#1d4ed8' : 'var(--text-tertiary)',
                      padding: '0.1rem 0.5rem',
                      borderRadius: '999px',
                      fontSize: '0.75rem',
                      fontWeight: 700
                    }}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Tab Content Area */}
            <div style={{ padding: '1.5rem', minHeight: '300px' }}>
              
              {/* Evidence Tab */}
              {activeTab === 'evidence' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', animation: 'fadeIn 0.3s' }}>
                  {data.evidence_list && data.evidence_list.length > 0 ? (
                    data.evidence_list.map((item, idx) => (
                      <EvidenceCard key={item.id || idx} evidence={item} index={idx} />
                    ))
                  ) : (
                    <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                      <Search size={32} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                      <p style={{ fontWeight: 500 }}>No anomalous tampering evidence observed.</p>
                      <p style={{ fontSize: '0.85rem' }}>The media appears structurally sound based on current heuristics.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Recommendations Tab */}
              {activeTab === 'recommendations' && (
                <div style={{ animation: 'fadeIn 0.3s' }}>
                  {data.recommendations && data.recommendations.length > 0 ? (
                    <ul style={{ 
                      display: 'flex', flexDirection: 'column', gap: '0.75rem', 
                      margin: 0, paddingLeft: '1.25rem', color: 'var(--text-secondary)' 
                    }}>
                      {data.recommendations.map((rec, i) => (
                        <li key={i} style={{ lineHeight: 1.6, paddingLeft: '0.5rem' }}>
                          <span style={{ color: 'var(--text-primary)' }}>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                      No specific manual actions recommended at this time.
                    </div>
                  )}
                </div>
              )}

              {/* Metadata Tab */}
              {activeTab === 'metadata' && (
                <div style={{ animation: 'fadeIn 0.3s' }}>
                  <MetadataPanel metadata={data.metadata} />
                </div>
              )}

              {/* Provenance Tab */}
              {activeTab === 'provenance' && (
                <div style={{ animation: 'fadeIn 0.3s' }}>
                  <ProvenancePanel provenance={data.provenance} />
                </div>
              )}

            </div>
          </div>
        </div>

        {/* Right / Secondary Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', gridColumn: 'span 1' }}>
          
          <ConfidenceMeter
            confidence={data.confidence}
            confidenceScore={data.confidence_score}
            evidenceStrength={data.evidence_strength}
            uncertainty={data.uncertainty}
          />

          <RiskIndicator signals={data.signals} />

          {/* Enhanced Media Summary Box */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
              <FileText size={18} color="#60a5fa" />
              <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Inspected File Profile</h4>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.88rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-tertiary)' }}>Media Type:</span>
                <span style={{ 
                  background: 'var(--bg-surface-alt)', padding: '0.2rem 0.6rem', 
                  borderRadius: '4px', fontWeight: 600, color: 'var(--text-primary)', textTransform: 'uppercase' 
                }}>
                  {data.media_type || 'Unknown'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-tertiary)' }}>File Size:</span>
                <span style={{ fontWeight: 500 }}>{data.metadata?.['File Size'] || 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-tertiary)' }}>Container / Ext:</span>
                <span style={{ fontWeight: 500 }}>{data.metadata?.['File Extension'] || 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-tertiary)' }}>Analysis Engine:</span>
                <span style={{ color: '#10b981', fontWeight: 600 }}>v2.4 Heuristic + ML</span>
              </div>
            </div>
          </div>

          <Timeline timestamp={data.analyzed_at} />
        </div>
      </div>

      {/* Mandatory Disclaimer */}
      <div className="disclaimer-banner" style={{
        display: 'flex',
        gap: '1rem',
        padding: '1.25rem',
        background: 'rgba(245, 158, 11, 0.1)',
        border: '1px solid rgba(245, 158, 11, 0.3)',
        borderRadius: '8px',
        marginTop: '1rem'
      }}>
        <AlertTriangle size={24} color="#f59e0b" style={{ flexShrink: 0 }} />
        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          <strong style={{ color: '#d97706', display: 'block', marginBottom: '0.25rem', fontSize: '0.95rem' }}>
            Verification Notice & Responsible Use Policy
          </strong>
          {data.disclaimer || 'This report is generated through automated analysis and probabilistic models. It should not be used as the sole deciding factor in legal, financial, or journalistic determinations.'}
        </div>
      </div>
      
      {/* CSS Animation Injection for fadeIn */}
      <style>{`
        @keyframes pulse {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Results;