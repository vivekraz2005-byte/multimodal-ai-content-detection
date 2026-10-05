import React from 'react';
import { Image, Video, Music, FileText, CheckCircle2, AlertTriangle, ShieldCheck, ShieldAlert } from 'lucide-react';

const Sidebar = ({ activeTab, onSelectTab, stats }) => {
  const items = [
    { id: 'all', label: 'All Media', icon: ShieldCheck, count: stats?.total || 0 },
    { id: 'image', label: 'Images', icon: Image, count: stats?.images || 0 },
    { id: 'video', label: 'Videos', icon: Video, count: stats?.videos || 0 },
    { id: 'audio', label: 'Audio', icon: Music, count: stats?.audio || 0 },
    { id: 'document', label: 'Documents', icon: FileText, count: stats?.documents || 0 },
  ];

  return (
    <aside style={{
      width: '240px',
      background: 'var(--bg-card)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-lg)',
      padding: '1.25rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      height: 'fit-content'
    }}>
      <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#9ca3af', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
        Filter Media
      </span>
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onSelectTab(item.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.65rem 0.85rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: isActive ? 'var(--primary-glow)' : 'transparent',
              color: isActive ? '#60a5fa' : 'var(--text-muted)',
              fontWeight: isActive ? 600 : 500,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Icon size={16} />
              <span style={{ fontSize: '0.9rem' }}>{item.label}</span>
            </div>
            {item.count > 0 && (
              <span style={{
                fontSize: '0.75rem',
                background: 'rgba(255, 255, 255, 0.08)',
                padding: '0.1rem 0.45rem',
                borderRadius: '10px'
              }}>
                {item.count}
              </span>
            )}
          </button>
        );
      })}
    </aside>
  );
};

export default Sidebar;
