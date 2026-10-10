/**
 * =============================================================================
 *  Header.jsx - Unicorn Pro Elite SaaS Navigation System
 * =============================================================================
 */

import React, { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  ShieldCheck, 
  PlusCircle, 
  History, 
  Info, 
  Sparkles, 
  Activity, 
  User, 
  LogOut, 
  Lock 
} from 'lucide-react';

const HEADER_STYLES = `
.unicorn-header-wrapper {
  position: sticky;
  top: 0;
  z-index: 9999;
  width: 100%;
  font-family: 'Inter', sans-serif;
  padding: 14px 20px;
  box-sizing: border-box;
  background: transparent;
}

.unicorn-navbar-card {
  max-width: 1320px;
  margin: 0 auto;
  background: rgba(6, 11, 25, 0.85);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 10px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 30px rgba(59, 130, 246, 0.1);
}

.unicorn-brand-link {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
}

.unicorn-logo-box {
  background: linear-gradient(135deg, #3b82f6 0%, #7c3aed 100%);
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.unicorn-nav-list {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.02);
  padding: 4px;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.04);
}

.unicorn-nav-tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 10px;
  font-size: 0.88rem;
  font-weight: 600;
  text-decoration: none;
  color: #94a3b8;
  transition: all 0.2s ease;
  background: transparent;
  border: none;
  cursor: pointer;
}

.unicorn-nav-tab:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.04);
}

.unicorn-nav-tab.active-tab {
  color: #ffffff;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(124, 58, 237, 0.2));
  border: 1px solid rgba(59, 130, 246, 0.35);
  box-shadow: 0 0 15px rgba(59, 130, 246, 0.2);
}

.unicorn-cta-btn {
  background: linear-gradient(135deg, #3b82f6 0%, #7c3aed 100%);
  color: #ffffff;
  padding: 9px 18px;
  border-radius: 12px;
  font-size: 0.88rem;
  font-weight: 700;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 8px 25px rgba(124, 58, 237, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.2s ease;
  cursor: pointer;
}

.unicorn-cta-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 30px rgba(124, 58, 237, 0.6);
}

.unicorn-user-box {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(255, 255, 255, 0.04);
  padding: 6px 14px;
  border-radius: 12px;
  border: 1px solid rgba(52, 211, 153, 0.3);
}
`;

const Header = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const storedUser = localStorage.getItem('authenticity_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('authenticity_user');
    setUser(null);
    navigate('/auth');
  };

  const handleProtectedAction = (path) => {
    const storedUser = localStorage.getItem('authenticity_user');
    if (!storedUser) {
      navigate('/auth');
    } else {
      navigate(path);
    }
  };

  const isActivePath = (path) => location.pathname === path;

  return (
    <div className="unicorn-header-wrapper">
      <style>{HEADER_STYLES}</style>

      <header className="unicorn-navbar-card">
        {/* Brand Logo & Title */}
        <Link to="/" className="unicorn-brand-link">
          <div className="unicorn-logo-box">
            <ShieldCheck size={24} color="#ffffff" strokeWidth={2.5} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                AuthenticityAI
              </span>
              <span style={{
                fontSize: '0.62rem', fontWeight: 800, padding: '0.1rem 0.45rem',
                borderRadius: '999px', background: 'rgba(52, 211, 153, 0.15)', color: '#34d399',
                border: '1px solid rgba(52, 211, 153, 0.3)'
              }}>
                PRO
              </span>
            </div>
            <span style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 650, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Multimodal Forensics
            </span>
          </div>
        </Link>

        {/* Central Clean Navigation */}
        <nav className="unicorn-nav-list">
          <NavLink to="/" className={`unicorn-nav-tab ${isActivePath('/') ? 'active-tab' : ''}`} end>
            <Sparkles size={15} color="#60a5fa" /> Home
          </NavLink>

          <button onClick={() => handleProtectedAction('/analyze')} className={`unicorn-nav-tab ${isActivePath('/analyze') ? 'active-tab' : ''}`}>
            <Activity size={15} color="#34d399" /> Analyze
          </button>

          <button onClick={() => handleProtectedAction('/history')} className={`unicorn-nav-tab ${isActivePath('/history') ? 'active-tab' : ''}`}>
            <History size={15} color="#c084fc" /> History
          </button>

          <NavLink to="/about" className={`unicorn-nav-tab ${isActivePath('/about') ? 'active-tab' : ''}`}>
            <Info size={15} color="#fbbf24" /> About
          </NavLink>
        </nav>

        {/* Right Actions & Auth */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => handleProtectedAction('/analyze')} className="unicorn-cta-btn">
            <PlusCircle size={16} /> New Analysis
          </button>

          {user ? (
            <div className="unicorn-user-box">
              <User size={15} color="#34d399" />
              <span style={{ fontSize: '0.82rem', fontWeight: 750, color: '#f8fafc' }}>
                {user.name || user.email.split('@')[0]}
              </span>
              <button 
                onClick={handleLogout} 
                title="Sign Out" 
                style={{ background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', cursor: 'pointer', color: '#f87171', display: 'flex', padding: '5px', borderRadius: '8px', marginLeft: '4px' }}
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <Link 
              to="/auth" 
              style={{
                background: 'rgba(255, 255, 255, 0.04)', 
                border: '1px solid rgba(255, 255, 255, 0.1)', 
                color: '#f8fafc',
                textDecoration: 'none', 
                padding: '8px 14px', 
                borderRadius: '12px', 
                fontSize: '0.85rem', 
                fontWeight: 700,
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px'
              }}
            >
              <Lock size={14} color="#60a5fa" /> Sign In
            </Link>
          )}
        </div>
      </header>
    </div>
  );
};

export default Header;