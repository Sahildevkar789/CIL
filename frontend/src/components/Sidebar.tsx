import React from 'react';
import {
  LayoutDashboard,
  Cpu,
  Database,
  GitCompare,
  Activity,
  Layers,
  Sparkles,
  ShieldCheck,
  History,
  Info,
  Car
} from 'lucide-react';

export type PageId =
  | 'overview'
  | 'predict'
  | 'dataset'
  | 'ml_models'
  | 'lstm'
  | 'explainability'
  | 'decision_engine'
  | 'validation'
  | 'history'
  | 'about';

interface SidebarProps {
  currentPage: PageId;
  onSelectPage: (page: PageId) => void;
  backendOnline: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onSelectPage,
  backendOnline,
}) => {
  const navItems: Array<{ id: PageId; label: string; task: string; icon: React.ReactNode }> = [
    { id: 'overview', label: 'Overview Dashboard', task: 'Hub', icon: <LayoutDashboard size={18} /> },
    { id: 'predict', label: 'Traffic Prediction', task: 'Live AI', icon: <Car size={18} /> },
    { id: 'dataset', label: 'Dataset & Cleaning', task: 'Task 4', icon: <Database size={18} /> },
    { id: 'ml_models', label: 'ML Model Comparison', task: 'Task 6', icon: <GitCompare size={18} /> },
    { id: 'lstm', label: 'LSTM Deep Learning', task: 'Task 7', icon: <Layers size={18} /> },
    { id: 'explainability', label: 'Explainability & MDI', task: 'Task 8', icon: <Sparkles size={18} /> },
    { id: 'decision_engine', label: 'Integrated AI Engine', task: 'Task 9', icon: <Cpu size={18} /> },
    { id: 'validation', label: 'Held-out & Responsible AI', task: 'Task 10', icon: <ShieldCheck size={18} /> },
    { id: 'history', label: 'Prediction History', task: 'SQLite', icon: <History size={18} /> },
    { id: 'about', label: 'About Project', task: 'CELBC710', icon: <Info size={18} /> },
  ];

  return (
    <aside className="w-64 bg-navy-900 border-r border-navy-800 flex flex-col shrink-0 h-screen sticky top-0">
      {/* Brand Header */}
      <div className="p-5 border-b border-navy-800 flex items-center space-x-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-cyan-400 flex items-center justify-center text-navy-950 font-black shadow-lg shadow-cyan-500/20">
          <Activity size={22} className="text-navy-950" />
        </div>
        <div>
          <h1 className="font-bold text-white text-base tracking-wide flex items-center gap-1.5">
            SMARTFLOW <span className="text-cyan-400 font-extrabold text-xs px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30">AI</span>
          </h1>
          <p className="text-[11px] text-slate-400 font-medium">Smart Traffic Management</p>
        </div>
      </div>

      {/* Nav List */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">
          Project Tasks (4–10)
        </div>
        {navItems.map((item) => {
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectPage(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 text-left ${
                isActive
                  ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-navy-800/60'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className={isActive ? 'text-cyan-400' : 'text-slate-400'}>{item.icon}</span>
                <span className="truncate">{item.label}</span>
              </div>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                isActive ? 'bg-cyan-500/20 text-cyan-300' : 'bg-navy-800 text-slate-400'
              }`}>
                {item.task}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Connection Status Footer */}
      <div className="p-4 border-t border-navy-800 bg-navy-950/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className={`w-2.5 h-2.5 rounded-full ${backendOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
            <span className="text-xs font-medium text-slate-300">
              {backendOnline ? 'Backend Online' : 'Backend Disconnected'}
            </span>
          </div>
          <span className="text-[11px] text-cyan-400 font-mono">Port 5000</span>
        </div>
        <p className="text-[10px] text-slate-400 mt-1">CELBC710 Computational Intelligence</p>
      </div>
    </aside>
  );
};

