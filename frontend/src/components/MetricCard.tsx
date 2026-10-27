import React from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  badge?: string;
  badgeColor?: 'cyan' | 'emerald' | 'amber' | 'rose' | 'indigo';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  badge,
  badgeColor = 'cyan',
}) => {
  const badgeClasses = {
    cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    rose: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    indigo: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
  }[badgeColor];

  return (
    <div className="bg-navy-900/80 border border-navy-700/60 rounded-xl p-5 hover:border-cyan-500/40 transition-all duration-200 shadow-lg relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/10 transition-all pointer-events-none" />
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-slate-400 tracking-wide">{title}</span>
        {icon && <div className="text-cyan-400 p-2 bg-navy-800 rounded-lg border border-navy-700">{icon}</div>}
      </div>
      <div className="flex items-baseline space-x-3">
        <div className="text-2xl font-bold text-white tracking-tight">{value}</div>
        {badge && (
          <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${badgeClasses}`}>
            {badge}
          </span>
        )}
      </div>
      {subtitle && <p className="text-xs text-slate-400 mt-2 font-normal">{subtitle}</p>}
    </div>
  );
};

