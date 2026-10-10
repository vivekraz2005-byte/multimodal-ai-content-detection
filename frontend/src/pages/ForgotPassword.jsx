import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2, KeyRound, Sparkles, ShieldCheck } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleReset = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!email.includes('@')) {
      setError('Please enter a valid email address.');
      setLoading(false);
      return;
    }

    // Simulate secure token generation and dispatch
    setTimeout(() => {
      const resetToken = Math.random().toString(36).substring(2, 10).toUpperCase();
      console.log('Secure Reset Token generated for', email, ':', resetToken);
      setLoading(false);
      setSubmitted(true);
    }, 1000);
  };

  return (
    <div style={{
      background: 'radial-gradient(circle at 30% 20%, #0f172a 0%, #020617 70%)',
      color: '#f8fafc',
      minHeight: 'calc(100vh - 80px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
      position: 'relative',
      overflow: 'hidden',
      boxSizing: 'border-box'
    }}>
      <div style={{
        position: 'absolute', width: '600px', height: '600px',
        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.12) 0%, transparent 70%)',
        top: '5%', left: '10%', pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute', width: '500px', height: '500px',
        background: 'radial-gradient(circle, rgba(168, 85, 247, 0.1) 0%, transparent 70%)',
        bottom: '5%', right: '10%', pointerEvents: 'none'
      }} />

      <style>{`
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus,
        input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 30px #090f22 inset !important;
          -webkit-text-fill-color: #ffffff !important;
          transition: background-color 5000s ease-in-out 0s;
        }

        .auth-split-wrapper {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 50px;
          width: 100%;
          max-width: 1160px;
          align-items: center;
          position: relative;
          z-index: 10;
        }

        @media (max-width: 968px) {
          .auth-split-wrapper {
            grid-template-columns: 1fr;
            gap: 30px;
          }
        }

        .auth-glass-card {
          background: linear-gradient(135deg, rgba(15, 23, 42, 0.88) 0%, rgba(6, 11, 29, 0.96) 100%);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 28px;
          padding: 42px;
          width: 100%;
          box-shadow: 0 40px 90px -20px rgba(0, 0, 0, 0.95), 0 0 40px rgba(59, 130, 246, 0.12);
          backdrop-filter: blur(24px);
          box-sizing: border-box;
        }

        .auth-input-field {
          width: 100%;
          background: #090f22;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 14px;
          color: #ffffff;
          padding: 15px 18px 15px 48px;
          outline: none;
          font-size: 0.95rem;
          box-sizing: border-box;
          transition: all 0.25s ease;
        }

        .auth-input-field:focus {
          border-color: #3b82f6;
          background: #0d1531;
          box-shadow: 0 0 20px rgba(59, 130, 246, 0.35);
        }

        .auth-submit-btn {
          width: 100%;
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          color: #ffffff;
          border: none;
          padding: 16px;
          border-radius: 14px;
          font-weight: 750;
          font-size: 1.02rem;
          cursor: pointer;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 10px;
          box-shadow: 0 12px 35px rgba(59, 130, 246, 0.5);
          transition: all 0.25s ease;
        }

        .auth-submit-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 18px 45px rgba(59, 130, 246, 0.75);
        }
      `}</style>

      <div className="auth-split-wrapper">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(168, 85, 247, 0.12)', border: '1px solid rgba(168, 85, 247, 0.3)', padding: '6px 16px', borderRadius: '30px', color: '#c084fc', fontSize: '0.85rem', fontWeight: 700, width: 'fit-content' }}>
            <Sparkles size={15} /> Secure Account Recovery
          </div>

          <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.03em', margin: 0 }}>
            Recover Access to <br />
            <span style={{ background: 'linear-gradient(135deg, #a855f7 20%, #60a5fa 60%, #34d399 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Forensic Workbench
            </span>
          </h1>

          <p style={{ color: '#94a3b8', fontSize: '1.08rem', lineHeight: 1.6, margin: 0, maxWidth: '520px' }}>
            Apne registered email se secure recovery token generate karein aur apna workbench access turant restore karein.
          </p>
        </div>

        <div className="auth-glass-card">
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{
              background: 'linear-gradient(135deg, #a855f7 0%, #3b82f6 100%)',
              width: '56px', height: '56px', borderRadius: '18px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 14px', boxShadow: '0 0 30px rgba(168, 85, 247, 0.5)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <KeyRound size={28} color="#fff" strokeWidth={2.4} />
            </div>

            <h2 style={{ fontSize: '1.6rem', fontWeight: 900, marginBottom: '6px', letterSpacing: '-0.02em', color: '#fff' }}>
              Reset Master Password
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: 0 }}>
              Apna registered email address enter karein
            </p>
          </div>

          {error && (
            <div style={{ background: 'rgba(239, 68, 68, 0.12)', border: '1px solid #ef4444', color: '#f87171', padding: '12px', borderRadius: '10px', marginBottom: '16px', fontSize: '0.85rem' }}>
              {error}
            </div>
          )}

          {submitted ? (
            <div style={{ background: 'rgba(16, 185, 129, 0.12)', border: '1px solid #10b981', padding: '28px 20px', borderRadius: '16px', textAlign: 'center' }}>
              <CheckCircle2 color="#34d399" size={42} style={{ marginBottom: '12px' }} />
              <h4 style={{ color: '#34d399', fontSize: '1.15rem', fontWeight: 800, marginBottom: '8px' }}>Recovery Token Dispatched!</h4>
              <p style={{ color: '#cbd5e1', fontSize: '0.88rem', lineHeight: 1.5, marginBottom: '20px' }}>
                Secure recovery token <strong>{email}</strong> ke liye successfully generate ho gaya hai.
              </p>
              <Link to="/auth" style={{ color: '#60a5fa', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 700 }}>
                Return to Sign In Gateway
              </Link>
            </div>
          ) : (
            <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ position: 'relative' }}>
                <Mail size={18} color="#64748b" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                <input type="email" placeholder="Registered Corporate Email" className="auth-input-field" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>

              <button type="submit" className="auth-submit-btn" disabled={loading} style={{ marginTop: '4px' }}>
                {loading ? 'Generating Recovery Token...' : 'Send Recovery Token'}
              </button>
            </form>
          )}

          <div style={{ textAlign: 'center', marginTop: '28px', paddingTop: '18px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <Link to="/auth" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.88rem', display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
              <ArrowLeft size={16} /> Back to Sign In Gateway
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}