import React from 'react';
import { MetricsResponse } from '../types';
import { MetricCard } from '../components/MetricCard';
import {
  Database,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Layers,
  BarChart2,
  Table,
  Sliders
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface DatasetSummaryProps {
  metrics: MetricsResponse | null;
}

export const DatasetSummary: React.FC<DatasetSummaryProps> = ({ metrics }) => {
  const ds = metrics?.dataset_summary;

  // Chart data for action distribution
  const actionData = ds?.action_distribution
    ? Object.entries(ds.action_distribution).map(([action, count]) => ({
        name: action.replace('_', ' '),
        count,
      }))
    : [];

  // Chart data for traffic density
  const densityData = ds?.traffic_density_distribution
    ? Object.entries(ds.traffic_density_distribution).map(([density, count]) => ({
        name: density.toUpperCase(),
        count,
      }))
    : [];

  const COLORS = ['#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b'];

  return (
    <div className="space-y-8">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard
          title="Cleaned Dataset Records"
          value={ds ? ds.clean_records : 978}
          subtitle="Final usable traffic observations"
          badge="Task 4 Clean"
          badgeColor="cyan"
          icon={<Database size={20} />}
        />
        <MetricCard
          title="Missing Values Handled"
          value={ds ? ds.missing_values_handled : 25}
          subtitle="Median (numerical) & Mode (categorical)"
          badge="Imputed"
          badgeColor="indigo"
          icon={<Filter size={20} />}
        />
        <MetricCard
          title="Duplicate Records Removed"
          value={ds ? ds.duplicates_removed : 10}
          subtitle="Identified & purged in Task 4"
          badge="Deduplicated"
          badgeColor="emerald"
          icon={<CheckCircle2 size={20} />}
        />
        <MetricCard
          title="IQR Outliers Analyzed"
          value={ds ? ds.outliers_detected : 5}
          subtitle="Q1 - 1.5*IQR to Q3 + 1.5*IQR bounds"
          badge="Analyzed"
          badgeColor="amber"
          icon={<AlertTriangle size={20} />}
        />
      </div>

      {/* Task 4 Data Cleaning & Preprocessing Flow */}
      <div className="bg-navy-900/90 border border-navy-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
          <Layers className="text-cyan-400" size={18} />
          Task 4 Preprocessing & Standardization Pipeline
        </h3>
        <p className="text-xs text-slate-400 mb-6">
          The original dataset of 49 base records was expanded to 1,000 observations with realistic sensor variations, missing entries, duplicates, and outliers.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Step A */}
          <div className="bg-navy-950/80 border border-navy-800 rounded-xl p-5">
            <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2">Step 1: Imputation</div>
            <h4 className="text-sm font-semibold text-white mb-2">Missing Value Strategy</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Numerical columns (<code className="text-cyan-300">queue_length</code>, <code className="text-cyan-300">waiting_time</code>, <code className="text-cyan-300">average_speed</code>) filled with the <strong>median</strong> to avoid outlier skew. Categorical columns filled with the <strong>mode</strong>.
            </p>
            {ds?.numerical_medians && (
              <div className="mt-4 pt-3 border-t border-navy-800 text-[11px] font-mono text-slate-400 space-y-1">
                <div>Queue Med: <span className="text-cyan-300">{ds.numerical_medians.queue_length}</span></div>
                <div>Wait Med: <span className="text-cyan-300">{ds.numerical_medians.waiting_time}s</span></div>
                <div>Speed Med: <span className="text-cyan-300">{ds.numerical_medians.average_speed} km/h</span></div>
              </div>
            )}
          </div>

          {/* Step B */}
          <div className="bg-navy-950/80 border border-navy-800 rounded-xl p-5">
            <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2">Step 2: Encoding</div>
            <h4 className="text-sm font-semibold text-white mb-2">Categorical Encoders</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Binary mapping for <code className="text-cyan-300">emergency_vehicle</code> (0=no, 1=yes). One-hot encoding for 4 signal directions (<code className="text-cyan-300">east, north, south, west</code>) and 3 densities (<code className="text-cyan-300">high, low, medium</code>).
            </p>
            <div className="mt-4 pt-3 border-t border-navy-800 text-[11px] text-slate-400">
              Total encoded feature columns: <strong>11</strong> + 1 target (<code className="text-cyan-300">action</code>)
            </div>
          </div>

          {/* Step C */}
          <div className="bg-navy-950/80 border border-navy-800 rounded-xl p-5">
            <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2">Step 3: Standardization</div>
            <h4 className="text-sm font-semibold text-white mb-2">StandardScaler Parameters</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Numerical columns transformed to have <span className="text-cyan-300">zero mean (\(\mu = 0\))</span> and <span className="text-cyan-300">unit variance (\(\sigma = 1\))</span>.
            </p>
            {ds?.scaling_means && (
              <div className="mt-4 pt-3 border-t border-navy-800 text-[11px] font-mono text-slate-400 space-y-1">
                <div>Queue Mean: <span className="text-cyan-300">{ds.scaling_means.queue_length?.toFixed(2)}</span> (Std: {ds.scaling_scales?.queue_length?.toFixed(2)})</div>
                <div>Wait Mean: <span className="text-cyan-300">{ds.scaling_means.waiting_time?.toFixed(2)}</span> (Std: {ds.scaling_scales?.waiting_time?.toFixed(2)})</div>
                <div>Speed Mean: <span className="text-cyan-300">{ds.scaling_means.average_speed?.toFixed(2)}</span> (Std: {ds.scaling_scales?.average_speed?.toFixed(2)})</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Visual Distributions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Action Target Class Distribution */}
        <div className="bg-navy-900/90 border border-navy-800 rounded-2xl p-6 shadow-xl">
          <h3 className="text-base font-bold text-white mb-1">Target Class Distribution (Action)</h3>
          <p className="text-xs text-slate-400 mb-4">Frequency of traffic control actions in cleaned dataset</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={actionData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} angle={-15} textAnchor="end" />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0d1527', borderColor: '#1d2f56', borderRadius: '8px' }}
                />
                <Bar dataKey="count" fill="#06b6d4" radius={[4, 4, 0, 0]}>
                  {actionData.map((_, idx) => (
                    <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Traffic Density Distribution */}
        <div className="bg-navy-900/90 border border-navy-800 rounded-2xl p-6 shadow-xl">
          <h3 className="text-base font-bold text-white mb-1">Traffic Density Breakdown</h3>
          <p className="text-xs text-slate-400 mb-4">Distribution across low, medium, and high traffic states</p>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={densityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="count"
                  label={({ name, percent }: { name?: string; percent?: number }) => `${name ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%`}
                >
                  {densityData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0d1527', borderColor: '#1d2f56', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

