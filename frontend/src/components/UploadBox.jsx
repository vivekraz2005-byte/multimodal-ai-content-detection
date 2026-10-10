import React, { useState, useRef } from 'react';
import { UploadCloud, Image, Video, Music, FileText, AlertCircle, FileCheck } from 'lucide-react';

const ACCEPTED_TYPES = {
  image: ['.jpg', '.jpeg', '.png', '.webp'],
  video: ['.mp4', '.mov', '.avi', '.webm'],
 audio: [
  '.mp3', '.mpeg', '.mpga', '.wav',
  '.m4a', '.flac', '.ogg', '.aac',
  '.opus', '.amr', '.3gp'
],
  document: ['.pdf', '.docx', '.txt'],
};

const ALL_ACCEPTED_EXTS = Object.values(ACCEPTED_TYPES).flat();
const MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024; // 100 MB

const UploadBox = ({ onFileSelected, disabled }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [validationError, setValidationError] = useState(null);
  const fileInputRef = useRef(null);

  const validateAndHandle = (file) => {
    setValidationError(null);
    if (!file) return;

    const ext = '.' + file.name.split('.').pop().toLowerCase();

    if (!ALL_ACCEPTED_EXTS.includes(ext)) {
      setValidationError(`Unsupported file extension: ${ext}. Please upload a supported image, video, audio, or document.`);
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setValidationError(`File is too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Maximum allowed size is 100 MB.`);
      return;
    }

    onFileSelected(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!disabled) setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndHandle(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndHandle(e.target.files[0]);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div
        className={`upload-dropzone ${isDragOver ? 'dragover' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInputChange}
          style={{ display: 'none' }}
         accept=".jpg,.jpeg,.png,.webp,.mp4,.mov,.avi,.webm,.mp3,.mpeg,.mpga,.wav,.m4a,.flac,.ogg,.aac,.opus,.amr,.3gp,.pdf,.docx,.txt"
          disabled={disabled}
        />

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'var(--primary-glow)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#60a5fa',
            border: '1px solid rgba(59, 130, 246, 0.3)'
          }}>
            <UploadCloud size={32} />
          </div>

          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.4rem' }}>
              Verify Your Digital Content
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '560px', margin: '0 auto', lineHeight: 1.5 }}>
              Upload an image, video, audio file, or document to inspect authenticity signals, manipulation indicators, metadata, and provenance.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <span className="badge badge-neutral"><Image size={13} /> JPG, PNG, WEBP</span>
            <span className="badge badge-neutral"><Video size={13} /> MP4, MOV, WEBM</span>
            <span className="badge badge-neutral"><Music size={13} /> MP3, WAV, FLAC</span>
            <span className="badge badge-neutral"><FileText size={13} /> PDF, DOCX, TXT</span>
          </div>

          <button
            type="button"
            className="btn btn-secondary"
            style={{ marginTop: '0.75rem', pointerEvents: 'none' }}
          >
            Browse Local Files
          </button>
        </div>
      </div>

      {validationError && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          padding: '0.85rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          background: 'var(--danger-bg)',
          border: '1px solid var(--danger-border)',
          color: '#f87171',
          fontSize: '0.9rem'
        }}>
          <AlertCircle size={18} />
          <span>{validationError}</span>
        </div>
      )}
    </div>
  );
};

export default UploadBox;
