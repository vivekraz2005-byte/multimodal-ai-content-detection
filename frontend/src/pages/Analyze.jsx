import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Sparkles, AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import UploadBox from '../components/UploadBox';
import FilePreview from '../components/FilePreview';
import MediaInfo from '../components/MediaInfo';
import AnalysisProgress from '../components/AnalysisProgress';
import { api } from '../services/api';

const Analyze = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState(null);

  const navigate = useNavigate();

  const handleFileSelected = (file) => {
    setSelectedFile(file);
    setErrorMessage(null);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setErrorMessage(null);
  };

  const startAnalysis = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    setErrorMessage(null);
    setCurrentStep(0);

    try {
      // Step 0: Uploading
      setCurrentStep(0);
      const uploadRes = await api.uploadFile(selectedFile, (progress) => {
        setUploadProgress(progress);
      });

      // Step 1: Media Classified
      setCurrentStep(1);
      await new Promise(r => setTimeout(r, 400));

      // Step 2: Metadata Extraction
      setCurrentStep(2);
      await new Promise(r => setTimeout(r, 450));

      // Step 3: Content Analysis & FFT
      setCurrentStep(3);
      await new Promise(r => setTimeout(r, 550));

      // Step 4: Manipulation / ELA check
      setCurrentStep(4);
      await new Promise(r => setTimeout(r, 450));

      // Step 5: Provenance C2PA check
      setCurrentStep(5);
      await new Promise(r => setTimeout(r, 400));

      // Step 6: Evidence Fusion
      setCurrentStep(6);

      // Perform actual analysis API call
      const analysisRes = await api.analyzeFile(uploadRes.file_id);

      // Step 7: Done!
      setCurrentStep(7);
      await new Promise(r => setTimeout(r, 500));

      // Navigate to Results page
      navigate(`/results/${analysisRes.analysis_id}`);

    } catch (err) {
      console.error('Analysis failed:', err);
      setIsAnalyzing(false);
      setErrorMessage(
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "We couldn't analyze this file. It may be corrupted, too large, or using an unsupported format."
      );
    }
  };

  return (
    <div style={{ maxWidth: '840px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.4rem' }}>
          Analyze Digital Content
        </h1>
        <p style={{ color: '#9ca3af', fontSize: '1rem', lineHeight: 1.5 }}>
          Inspect an image, video, audio file, or document for manipulation markers, synthetic generator tags, and C2PA Content Credentials.
        </p>
      </div>

      {isAnalyzing ? (
        <AnalysisProgress currentStepIndex={currentStep} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {!selectedFile ? (
            <UploadBox onFileSelected={handleFileSelected} disabled={isAnalyzing} />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <FilePreview file={selectedFile} onRemove={handleRemoveFile} disabled={isAnalyzing} />
              <MediaInfo file={selectedFile} />

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
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
                  style={{ padding: '0.75rem 1.6rem', fontSize: '1rem' }}
                >
                  <Play size={18} fill="#ffffff" /> Run Authenticity Analysis
                </button>
              </div>
            </div>
          )}

          {errorMessage && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '1rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--danger-bg)',
              border: '1px solid var(--danger-border)',
              color: '#f87171',
              fontSize: '0.92rem'
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
    </div>
  );
};

export default Analyze;
