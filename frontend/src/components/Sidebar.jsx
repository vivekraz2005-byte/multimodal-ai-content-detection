import React from 'react';
import { LayoutDashboard, FileSearch, History, Settings, ShieldAlert } from 'lucide-react';

export default function Sidebar({ activeTab = 'dashboard', setActiveTab }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'analysis', label: 'Analysis Tool', icon: FileSearch },
    { id: 'history', label: 'Detection History', icon: History },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-gray-950 border-r border-gray-800 min-h-screen p-5 flex flex-col justify-between">
      <div className="space-y-6">
        <div className="flex items-center space-x-3 px-2">
          <div className="p-2 bg-indigo-600 rounded-lg text-white">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold text-gray-100 text-base leading-none">DeepDetect</h2>
            <span className="text-[10px] text-indigo-400 font-medium tracking-wider uppercase">AI Sentinel</span>
          </div>
        </div>

        <nav className="space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab && setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20'
                    : 'text-gray-400 hover:bg-gray-900 hover:text-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-3 bg-gray-900/60 border border-gray-800/80 rounded-xl">
        <p className="text-xs font-semibold text-gray-300">System Status</p>
        <div className="flex items-center space-x-2 mt-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-gray-400">All Detection Engines Online</span>
        </div>
      </div>
    </aside>
  );
}