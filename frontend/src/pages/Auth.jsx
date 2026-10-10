import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, User, ArrowRight, AlertCircle, Sparkles, FileKey, Zap, Radio } from 'lucide-react';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      if (!email.includes('@')) {
        setError('Please enter a valid corporate or personal email address.');
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        setError('Security rule: Password must be at least 6 characters long.');
        setLoading(false);
        return;
      }

      const userPayload = {
        email,
        name: isLogin ? email.split('@')[0] : fullName,
        token: 'auth_token_' + Date.now()
      };

      localStorage.setItem('authenticity_user', JSON.stringify(userPayload));
      setLoading(false);
      
      // Redirect to Home page after successful sign in / register
      navigate('/');
    }, 900);
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
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(59, 130, 246, 0.12)', border: '1px solid rgba(59, 130, 246, 0.3)', padding: '6px 16px', borderRadius: '30px', color: '#60a5fa', fontSize: '0.85rem', fontWeight: 700, width: 'fit-content' }}>
            <Sparkles size={15} /> Enterprise Secure Gateway
          </div>

          <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.03em', margin: 0 }}>
            Defense-Grade <br />
            <span style={{ background: 'linear-gradient(135deg, #60a5fa 20%, #a855f7 60%, #ec4899 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Multimodal Forensics
            </span>
          </h1>

          <p style={{ color: '#94a3b8', fontSize: '1.08rem', lineHeight: 1.6, margin: 0, maxWidth: '520px' }}>
            Authenticate to access isolated ephemeral sandboxes, compute cryptographic SHA-256 hashes, and verify C2PA provenance credentials instantly.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.07)', padding: '14px 18px', borderRadius: '14px' }}>
              <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '8px', borderRadius: '10px', color: '#34d399', display: 'flex' }}>
                <Zap size={20} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 750, margin: '0 0 2px 0', color: '#fff' }}>Air-Gapped Isolation</h4>
                <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: 0 }}>Zero persistent storage with automated session data purging.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="auth-glass-card">
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              width: '56px', height: '56px', borderRadius: '18px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 14px', boxShadow: '0 0 30px rgba(59, 130, 246, 0.5)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <ShieldCheck size={28} color="#fff" strokeWidth={2.4} />
            </div>

            <h2 style={{ fontSize: '1.6rem', fontWeight: 900, marginBottom: '6px', letterSpacing: '-0.02em', color: '#fff' }}>
              {isLogin ? 'Sign In to Portal' : 'Create Forensic ID'}
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: 0 }}>
              {isLogin ? 'Enter your credentials to access workbench' : 'Register for secure container verification'}
            </p>
          </div>

          <div style={{
            display: 'flex', background: '#090f22', padding: '5px',
            borderRadius: '14px', marginBottom: '24px', border: '1px solid rgba(255, 255, 255, 0.08)'
          }}>
            <button
              onClick={() => setIsLogin(true)}
              style={{
                flex: 1, padding: '10px', border: 'none', borderRadius: '10px',
                background: isLogin ? 'linear-gradient(135deg, #2563eb, #1d4ed8)' : 'transparent',
                color: isLogin ? '#fff' : '#94a3b8', fontWeight: 750, cursor: 'pointer',
                transition: 'all 0.25s ease', boxShadow: isLogin ? '0 4px 15px rgba(37, 99, 235, 0.4)' : 'none'
              }}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              style={{
                flex: 1, padding: '10px', border: 'none', borderRadius: '10px',
                background: !isLogin ? 'linear-gradient(135deg, #2563eb, #1d4ed8)' : 'transparent',
                color: !isLogin ? '#fff' : '#94a3b8', fontWeight: 750, cursor: 'pointer',
                transition: 'all 0.25s ease', boxShadow: !isLogin ? '0 4px 15px rgba(37, 99, 235, 0.4)' : 'none'
              }}
            >
              Register
            </button>
          </div>

          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#f87171', padding: '12px 16px', borderRadius: '12px',
              marginBottom: '18px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '10px'
            }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} /> <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {!isLogin && (
              <div style={{ position: 'relative' }}>
                <User size={18} color="#64748b" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                <input type="text" placeholder="Full Name / Examiner ID" className="auth-input-field" value={fullName} onChange={e => setFullName(e.target.value)} required />
              </div>
            )}

            <div style={{ position: 'relative' }}>
              <Mail size={18} color="#64748b" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
              <input type="email" placeholder="Corporate Email Address" className="auth-input-field" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>

            <div style={{ position: 'relative' }}>
              <Lock size={18} color="#64748b" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
              <input type="password" placeholder="Master Password" className="auth-input-field" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>

            {isLogin && (
              <div style={{ textAlign: 'right', marginTop: '-4px' }}>
                <Link to="/forgot-password" style={{ color: '#60a5fa', fontSize: '0.84rem', textDecoration: 'none', fontWeight: 600 }}>
                  Forgot Password?
                </Link>
              </div>
            )}

            <button type="submit" className="auth-submit-btn" disabled={loading} style={{ marginTop: '4px' }}>
              {loading ? 'Establishing Session...' : (isLogin ? 'Sign In & Go to Home' : 'Create Secure Profile')} <ArrowRight size={18} />
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '28px', paddingTop: '18px', borderTop: '1px solid rgba(255,255,255,0.06)', fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <Radio size={13} color="#34d399" /> AES-256 Encrypted Session Token
          </div>
        </div>
      </div>
    </div>
  );
}