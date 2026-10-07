import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { ShieldCheck, PlusCircle, History, Info, Sparkles, Activity } from 'lucide-react';

const Header = () => {
  return (
    <header className="navbar" style={{
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      background: 'rgba(15, 23, 42, 0.85)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.5)'
    }}>
      <div className="nav-container" style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0.75rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Brand Logo & Title */}
        <Link to="/" className="brand-link" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', textDecoration: 'none' }}>
          <div style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            padding: '10px',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(59, 130, 246, 0.4)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <ShieldCheck size={24} color="#ffffff" strokeWidth={2.4} />
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ 
                fontSize: '1.25rem', 
                fontWeight: 800, 
                letterSpacing: '-0.03em', 
                background: 'linear-gradient(to right, #ffffff, #93c5fd)', 
                WebkitBackgroundClip: 'text', 
                WebkitTextFillColor: 'transparent' 
              }}>
                AuthenticityAI
              </span>
              
              {/* Live Operational Badge */}
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                fontSize: '0.65rem',
                fontWeight: 600,
                padding: '0.15rem 0.5rem',
                borderRadius: '999px',
                background: 'rgba(16, 185, 129, 0.1)',
                color: '#34d399',
                border: '1px solid rgba(16, 185, 129, 0.2)'
              }}>
                <span style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: '#34d399',
                  boxShadow: '0 0 8px #34d399',
                  display: 'inline-block'
                }}></span>
                v1.0 Live
              </span>
            </div>

            <span style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Multimodal Digital Forensics
            </span>
          </div>
        </Link>

        {/* Navigation Links & Action */}
        <nav className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <NavLink 
            to="/" 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            style={navItemStyle}
            end
          >
            <Sparkles size={16} /> Home
          </NavLink>

          <NavLink 
            to="/analyze" 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            style={navItemStyle}
          >
            <Activity size={16} /> Analyze
          </NavLink>

          <NavLink 
            to="/history" 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            style={navItemStyle}
          >
            <History size={16} /> History
          </NavLink>

          <NavLink 
            to="/about" 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            style={navItemStyle}
          >
            <Info size={16} /> About
          </NavLink>

          <div style={{ width: '1px', height: '24px', background: 'rgba(255, 255, 255, 0.1)', margin: '0 0.5rem' }}></div>

          <Link 
            to="/analyze" 
            className="btn btn-primary" 
            style={{ 
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.6rem 1.2rem', 
              fontSize: '0.88rem',
              fontWeight: 600,
              background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
              color: '#ffffff',
              borderRadius: '10px',
              textDecoration: 'none',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
              transition: 'all 0.2s ease',
              border: '1px solid rgba(255, 255, 255, 0.15)'
            }}
          >
            <PlusCircle size={16} /> New Analysis
          </Link>
        </nav>
      </div>
    </header>
  );
};

// Helper style object for smooth nav links
const navItemStyle = ({ isActive }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  padding: '0.5rem 0.85rem',
  borderRadius: '8px',
  fontSize: '0.9rem',
  fontWeight: 500,
  textDecoration: 'none',
  color: isActive ? '#ffffff' : '#94a3b8',
  background: isActive ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
  border: isActive ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid transparent',
  transition: 'all 0.2s ease'
});

export default Header;