import React from 'react';
import { HardDrive, Calendar, Tag, FileCode } from 'lucide-react';

const MediaInfo = ({ file }) => {
  if (!file) return null;

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const ext = file.name.split('.').pop().toUpperCase();
  const dateFormatted = file.lastModified
    ? new Date(file.lastModified).toLocaleString()
    : 'Not available';

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
      gap: '0.85rem',
      padding: '1rem',
      background: 'rgba(255, 255, 255, 0.02)',
      borderRadius: 'var(--radius-md)',
      border: '1px solid var(--border-subtle)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <FileCode size={18} color="#60a5fa" />
        <div>
          <div style={{ fontSize: '0.72rem', color: '#9ca3af', textTransform: 'uppercase' }}>Extension</div>
          <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>.{ext}</div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <HardDrive size={18} color="#34d399" />
        <div>
          <div style={{ fontSize: '0.72rem', color: '#9ca3af', textTransform: 'uppercase' }}>File Size</div>
          <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{formatSize(file.size)}</div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <Tag size={18} color="#f59e0b" />
        <div>
          <div style={{ fontSize: '0.72rem', color: '#9ca3af', textTransform: 'uppercase' }}>MIME Type</div>
          <div style={{ fontSize: '0.9rem', fontWeight: 600, wordBreak: 'break-all' }}>{file.type || 'Inferred'}</div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <Calendar size={18} color="#a78bfa" />
        <div>
          <div style={{ fontSize: '0.72rem', color: '#9ca3af', textTransform: 'uppercase' }}>Local Modified</div>
          <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{dateFormatted}</div>
        </div>
      </div>
    </div>
  );
};

export default MediaInfo;
