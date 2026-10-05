import React, { useMemo } from 'react';
import { X, Image, Video, Music, FileText, CheckCircle2 } from 'lucide-react';

const FilePreview = ({ file, onRemove, disabled }) => {
  if (!file) return null;

  const ext = '.' + file.name.split('.').pop().toLowerCase();

  const mediaType = useMemo(() => {
    if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) return 'image';
    if (['.mp4', '.mov', '.avi', '.webm'].includes(ext)) return 'video';
    if (['.mp3', '.wav', '.m4a', '.flac', '.ogg'].includes(ext)) return 'audio';
    return 'document';
  }, [ext]);

  const previewUrl = useMemo(() => {
    try {
      return URL.createObjectURL(file);
    } catch {
      return null;
    }
  }, [file]);

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <CheckCircle2 size={18} color="#10b981" />
          <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>File Ready for Analysis</span>
          <span className="badge badge-info" style={{ textTransform: 'uppercase' }}>{mediaType}</span>
        </div>
        <button
          type="button"
          onClick={onRemove}
          disabled={disabled}
          className="btn btn-outline"
          style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem', borderRadius: 'var(--radius-sm)' }}
          title="Remove file"
        >
          <X size={15} /> Remove
        </button>
      </div>

      {/* Render Preview according to media type */}
      <div style={{
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        background: 'rgba(0, 0, 0, 0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '160px',
        maxHeight: '340px'
      }}>
        {mediaType === 'image' && previewUrl && (
          <img
            src={previewUrl}
            alt="Upload preview"
            style={{ maxWidth: '100%', maxHeight: '320px', objectFit: 'contain', display: 'block' }}
          />
        )}

        {mediaType === 'video' && previewUrl && (
          <video
            src={previewUrl}
            controls
            style={{ width: '100%', maxHeight: '320px', background: '#000' }}
          />
        )}

        {mediaType === 'audio' && previewUrl && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '2rem', width: '100%' }}>
            <Music size={42} color="#60a5fa" />
            <audio src={previewUrl} controls style={{ width: '90%', maxWidth: '450px' }} />
          </div>
        )}

        {mediaType === 'document' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', padding: '2rem' }}>
            <FileText size={48} color="#93c5fd" />
            <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>{file.name}</span>
            <span style={{ fontSize: '0.85rem', color: '#9ca3af' }}>
              {(file.size / 1024).toFixed(1)} KB Document Stream
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilePreview;
