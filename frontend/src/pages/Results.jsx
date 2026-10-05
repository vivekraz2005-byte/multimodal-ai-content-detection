import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
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
  Loader2
} from 'lucide-react';
import ResultCard from '../components/ResultCard';
import ConfidenceMeter from '../components/ConfidenceMeter';
import RiskIndicator from '../components/RiskIndicator';
import EvidenceCard from '../components/EvidenceCard';
import MetadataPanel from '../components/MetadataPanel';
import ProvenancePanel from '../components/ProvenancePanel';
import Timeline from '../components/Timeline';
import { api } from '../services/api';

const Results = () => {
  const { analysisId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      if (!analysisId) return;
      try {
        setLoading(true);
        const res = await api.getResults(analysisId);
        setData(res);
      } catch (err) {
        console.error('Failed to load analysis result:', err);
        setError('Report not found or session expired. Please start a new analysis.');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [analysisId]);

  const handleDownloadJson = () => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `authenticity_report_${data.filename}_${data.analysis_id.slice(0, 8)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 1rem' }}>
        <Loader2 size={36} color="#3b82f6" className="animate-spin" style={{ margin: '0 auto 1rem' }} />
        <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Loading Forensic Report...</h3>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="card" style={{ maxWidth: '560px', margin: '3rem auto', textAlign: 'center', padding: '2.5rem' }}>
        <AlertTriangle size={36} color="#f87171" style={{ margin: '0 auto 1rem' }} />
        <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>Report Unavailable</h3>
        <p style={{ color: '#9ca3af', marginBottom: '1.5rem', fontSize: '0.95rem' }}>{error || 'Could not find requested analysis.'}</p>
        <Link to="/analyze" className="btn btn-primary">
          <PlusCircle size={16} /> Start New Analysis
        </Link>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Header & Actions */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        paddingBottom: '0.5rem',
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link to="/analyze" className="btn btn-outline" style={{ padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}>
            <ArrowLeft size={16} /> New Upload
          </Link>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>
              Forensic Report: {data.filename}
            </h1>
            <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
              Report ID: {data.analysis_id.slice(0, 13)} • {new Date(data.analyzed_at).toLocaleString()}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem' }}>
          <button
            type="button"
            onClick={handleDownloadJson}
            className="btn btn-secondary"
            style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
          >
            <Download size={15} /> Export JSON
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="btn btn-secondary"
            style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
          >
            <Printer size={15} /> Print Report
          </button>
          <Link
            to="/analyze"
            className="btn btn-primary"
            style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
          >
            <PlusCircle size={15} /> New Analysis
          </Link>
        </div>
      </div>

      {/* Main Grid */}
      <div className="dashboard-grid">
        {/* Left / Primary Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Authenticity Assessment Card */}
          <ResultCard
            assessment={data.assessment}
            confidence={data.confidence}
            whyExplanation={data.why_explanation}
            uncertaintyReasons={data.uncertainty_reasons}
          />

          {/* Evidence List */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
                Synthesized Evidence Catalog
              </h3>
              <span className="badge badge-neutral" style={{ fontSize: '0.78rem' }}>
                {data.evidence_list?.length || 0} Findings
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {data.evidence_list && data.evidence_list.length > 0 ? (
                data.evidence_list.map((item, idx) => (
                  <EvidenceCard key={item.id || idx} evidence={item} index={idx} />
                ))
              ) : (
                <div style={{ padding: '1.5rem', textAlign: 'center', color: '#9ca3af', fontSize: '0.9rem' }}>
                  No anomalous tampering or AI generation evidence observed.
                </div>
              )}
            </div>
          </div>

          {/* Actionable Recommendations */}
          {data.recommendations && data.recommendations.length > 0 && (
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.25)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Lightbulb size={20} color="#60a5fa" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f3f4f6' }}>
                  Recommended Verification Actions
                </h3>
              </div>
              <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.9rem', color: '#d1d5db' }}>
                {data.recommendations.map((rec, i) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Metadata Panel */}
          <MetadataPanel metadata={data.metadata} />

          {/* Provenance Panel */}
          <ProvenancePanel provenance={data.provenance} />
        </div>

        {/* Right / Secondary Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Confidence Meter */}
          <ConfidenceMeter
            confidence={data.confidence}
            confidenceScore={data.confidence_score}
            evidenceStrength={data.evidence_strength}
            uncertainty={data.uncertainty}
          />

          {/* Forensic Signals Risk Indicator */}
          <RiskIndicator signals={data.signals} />

          {/* Media Summary Box */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Inspected Media Profile</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#9ca3af' }}>Media Type:</span>
                <strong style={{ textTransform: 'uppercase', color: '#60a5fa' }}>{data.media_type}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#9ca3af' }}>File Size:</span>
                <span>{data.metadata?.['File Size'] || 'Unknown'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#9ca3af' }}>Container / Ext:</span>
                <span>{data.metadata?.['File Extension'] || 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#9ca3af' }}>Analysis Engine:</span>
                <span style={{ color: '#34d399', fontSize: '0.75rem' }}>Heuristic + Pluggable ML</span>
              </div>
            </div>
          </div>

          {/* Pipeline Audit Timeline */}
          <Timeline timestamp={data.analyzed_at} />
        </div>
      </div>

      {/* Mandatory Disclaimer */}
      <div className="disclaimer-banner">
        <AlertTriangle size={22} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div style={{ fontSize: '0.85rem', color: '#d1d5db', lineHeight: 1.5 }}>
          <strong style={{ color: '#fbbf24', display: 'block', marginBottom: '0.2rem' }}>
            Verification Notice & Responsible Use Policy
          </strong>
          {data.disclaimer}
        </div>
      </div>
    </div>
  );
};

export default Results;
