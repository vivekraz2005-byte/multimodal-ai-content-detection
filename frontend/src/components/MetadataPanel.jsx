import React, { useState } from 'react';
import { Database, ChevronDown, ChevronUp, Copy, Check, Search } from 'lucide-react';

const MetadataPanel = ({ metadata }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [copied, setCopied] = useState(false);

  if (!metadata || Object.keys(metadata).length === 0) return null;

  const entries = Object.entries(metadata);

  const filteredEntries = entries.filter(([k, v]) =>
    k.toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(v).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCopyAll = () => {
    navigator.clipboard.writeText(JSON.stringify(metadata, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'inherit',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            cursor: 'pointer',
            textAlign: 'left'
          }}
        >
          <Database size={20} color="#3b82f6" />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
            Extracted Metadata Forensics
          </h3>
          <span className="badge badge-neutral" style={{ fontSize: '0.75rem' }}>
            {entries.length} Fields
          </span>
          {isOpen ? <ChevronUp size={18} color="#9ca3af" /> : <ChevronDown size={18} color="#9ca3af" />}
        </button>

        <button
          type="button"
          onClick={handleCopyAll}
          className="btn btn-outline"
          style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
        >
          {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
          {copied ? 'Copied JSON' : 'Copy JSON'}
        </button>
      </div>

      {isOpen && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Quick filter input */}
          <div style={{ position: 'relative' }}>
            <Search size={16} color="#9ca3af" style={{ position: 'absolute', left: '12px', top: '12px' }} />
            <input
              type="text"
              placeholder="Search extracted metadata tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.6rem 0.85rem 0.6rem 2.4rem',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-subtle)',
                color: '#ffffff',
                fontSize: '0.85rem'
              }}
            />
          </div>

          <div style={{
            maxHeight: '360px',
            overflowY: 'auto',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: 'rgba(255, 255, 255, 0.04)', borderBottom: '1px solid var(--border-subtle)' }}>
                  <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: '#9ca3af', fontWeight: 600, width: '38%' }}>Property / Tag</th>
                  <th style={{ textAlign: 'left', padding: '0.75rem 1rem', color: '#9ca3af', fontWeight: 600 }}>Value</th>
                </tr>
              </thead>
              <tbody>
                {filteredEntries.map(([key, val], idx) => {
                  const valStr = String(val);
                  const isNotAvailable = valStr === 'Not available' || valStr === 'None' || val === false;

                  return (
                    <tr
                      key={key}
                      style={{
                        borderBottom: '1px solid var(--border-subtle)',
                        background: idx % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.015)'
                      }}
                    >
                      <td style={{ padding: '0.65rem 1rem', fontWeight: 600, color: '#e5e7eb' }}>
                        {key}
                      </td>
                      <td style={{
                        padding: '0.65rem 1rem',
                        color: isNotAvailable ? '#6b7280' : '#93c5fd',
                        fontStyle: isNotAvailable ? 'italic' : 'normal',
                        fontFamily: typeof val === 'number' || key.includes('Size') ? 'var(--font-mono)' : 'inherit'
                      }}>
                        {valStr}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default MetadataPanel;
