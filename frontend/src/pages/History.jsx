import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { History, PlusCircle, Search, ExternalLink, Image, Video, Music, FileText, Filter } from 'lucide-react';
import { api } from '../services/api';

const ASSESSMENT_BADGES = {
  'Likely Authentic': 'badge-success',
  'Likely AI-Generated': 'badge-danger',
  'Potentially Manipulated': 'badge-warning',
  'Suspicious': 'badge-warning',
  'Inconclusive': 'badge-neutral',
};

const HistoryPage = () => {
  const [historyList, setHistoryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const records = await api.getHistory();
        setHistoryList(records || []);
      } catch (err) {
        console.error('Failed to load history:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const filtered = historyList.filter(item => {
    const matchesType = filterType === 'all' || item.media_type === filterType;
    const matchesSearch = item.filename.toLowerCase().includes(search.toLowerCase()) ||
                          item.assessment.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.3rem' }}>
            Analysis History
          </h1>
          <p style={{ color: '#9ca3af', fontSize: '0.95rem' }}>
            Review previous authenticity and manipulation verification reports from this active session.
          </p>
        </div>

        <Link to="/analyze" className="btn btn-primary" style={{ padding: '0.65rem 1.25rem', fontSize: '0.9rem' }}>
          <PlusCircle size={16} /> New Analysis
        </Link>
      </div>

      {/* Filter and search bar */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem',
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)'
      }}>
        {/* Search Input */}
        <div style={{ position: 'relative', flex: '1', minWidth: '220px' }}>
          <Search size={16} color="#9ca3af" style={{ position: 'absolute', left: '12px', top: '12px' }} />
          <input
            type="text"
            placeholder="Search by file name or assessment..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '0.6rem 0.85rem 0.6rem 2.4rem',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-subtle)',
              color: '#ffffff',
              fontSize: '0.88rem'
            }}
          />
        </div>

        {/* Media filter buttons */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {['all', 'image', 'video', 'audio', 'document'].map(type => (
            <button
              key={type}
              type="button"
              onClick={() => setFilterType(type)}
              className={filterType === type ? 'btn btn-primary' : 'btn btn-outline'}
              style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem', textTransform: 'capitalize' }}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* History table / list */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <span style={{ color: '#9ca3af' }}>Loading session records...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'var(--primary-glow)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#60a5fa'
          }}>
            <History size={26} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>No Analysis History Found</h3>
          <p style={{ color: '#9ca3af', maxWidth: '420px', fontSize: '0.9rem', lineHeight: 1.5 }}>
            {historyList.length === 0
              ? "You haven't run any verification scans yet. Upload an image, video, audio, or document to generate your first report."
              : "No analyses match your current search or filter criteria."}
          </p>
          <Link to="/analyze" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
            <PlusCircle size={16} /> Analyze Your First Media File
          </Link>
        </div>
      ) : (
        <div className="card" style={{ padding: '0.5rem' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', color: '#9ca3af' }}>
                <th style={{ padding: '1rem' }}>File Name</th>
                <th style={{ padding: '1rem' }}>Type</th>
                <th style={{ padding: '1rem' }}>Assessment</th>
                <th style={{ padding: '1rem' }}>Confidence</th>
                <th style={{ padding: '1rem' }}>Timestamp</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => {
                const badgeClass = ASSESSMENT_BADGES[item.assessment] || 'badge-neutral';
                return (
                  <tr key={item.analysis_id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '1rem', fontWeight: 600, color: '#f3f4f6' }}>
                      {item.filename}
                      <div style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 400 }}>
                        {item.file_size_formatted}
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span className="badge badge-neutral" style={{ textTransform: 'uppercase', fontSize: '0.72rem' }}>
                        {item.media_type}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span className={`badge ${badgeClass}`} style={{ fontSize: '0.78rem' }}>
                        {item.assessment}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', color: '#d1d5db' }}>
                      {item.confidence}
                    </td>
                    <td style={{ padding: '1rem', color: '#9ca3af', fontSize: '0.82rem' }}>
                      {new Date(item.analyzed_at).toLocaleString()}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <Link
                        to={`/results/${item.analysis_id}`}
                        className="btn btn-secondary"
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                      >
                        View Report <ExternalLink size={13} />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
