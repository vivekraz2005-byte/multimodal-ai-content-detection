import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { ShieldCheck, PlusCircle, History, Info, Sparkles, Activity } from 'lucide-react';

const Header = () => {
  return (
    <header className="navbar">
      <div className="nav-container">
        <Link to="/" className="brand-link">
          <div style={{
            background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
            padding: '8px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)'
          }}>
            <ShieldCheck size={22} color="#ffffff" strokeWidth={2.2} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.02em', background: 'linear-gradient(to right, #ffffff, #93c5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              AuthenticityAI
            </span>
            <span style={{ fontSize: '0.65rem', color: '#9ca3af', fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Digital Authenticity Assistant
            </span>
          </div>
          <span className="brand-badge">v1.0 Demo</span>
        </Link>

        <nav className="nav-links">
          <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end>
            <Sparkles size={16} /> Home
          </NavLink>
          <NavLink to="/analyze" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Activity size={16} /> Analyze
          </NavLink>
          <NavLink to="/history" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <History size={16} /> History
          </NavLink>
          <NavLink to="/about" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Info size={16} /> About
          </NavLink>

          <Link to="/analyze" className="btn btn-primary" style={{ padding: '0.55rem 1.1rem', fontSize: '0.88rem' }}>
            <PlusCircle size={16} /> New Analysis
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
