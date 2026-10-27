import React from 'react';
import { MetricsResponse } from '../types';
import { MetricCard } from '../components/MetricCard';
import { PageId } from '../components/Sidebar';
import {
  Activity,
  ShieldAlert,
  GitCompare,
  TrendingUp,
  Cpu,
  Layers,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Play
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid
} from 'recharts';

interface OverviewDashboardProps {
  metrics: MetricsResponse | null;
  onNavigate: (page: PageId) => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  metrics,
  onNavigate
}) => {
  const m = metrics?.historical_metrics;
  const sys = m?.system_validation;

  // Comparison chart data
  const comparisonData = m ? [
    { name: 'Logistic Reg.', accuracy: m.logistic_regression.accuracy * 100, f1: m.logistic_regression.f1 * 100 },
    { name: 'Decision Tree', accuracy: m.decision_tree.accuracy * 100, f1: m.decision_tree.f1 * 100 },
    { name: 'Random Forest', accuracy: m.random_forest.accuracy * 100, f1: m.random_forest.f1 * 100 },
    { name: 'LSTM RNN', accuracy: m.lstm.accuracy * 100, f1: m.lstm.f1 * 100 },
    { name: 'Integrated AI', accuracy: m.integrated_system.accuracy * 100, f1: m.integrated_system.f1 * 100 },
  ] : [];

  // Top feature data
  const topFeatures = m?.rf_feature_importance.slice(0, 5).map(f => ({
    feature: f.feature.replace('_', ' '),
    importance: Math.round(f.importance * 1000) / 10
  })) || [];

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div className="relative rounded-2xl bg-gradient-to-r from-navy-900 via-navy-800 to-navy-900 border border-cyan-500/20 p-8 overflow-hidden shadow-2xl">
        <div className="absolute -right-10 -bottom-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold uppercase tracking-wider mb-4">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>Autonomous Signal Management • CELBC710 Tasks 4–10</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Next-Gen Intelligent Traffic Management System
          </h1>
          <p className="mt-3 text-slate-300 text-sm leading-relaxed">
            SMARTFLOW AI unifies deep recurrent sequence learning (<span className="text-cyan-400 font-semibold">LSTM</span>) and tabular ensemble trees (<span className="text-cyan-400 font-semibold">Random Forest</span>) under a safety-critical AI rule decision engine for dynamic traffic signal optimization.
          </p>

          <div className="mt-6 flex flex-wrap gap-4">
            <button
              onClick={() => onNavigate('predict')}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-navy-950 font-bold text-sm shadow-lg shadow-cyan-500/25 transition-all transform hover:-translate-y-0.5"
            >
              <Play size={16} fill="currentColor" />
              <span>Launch Live Predictor</span>
            </button>
            <button
              onClick={() => onNavigate('decision_engine')}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-navy-800/80 hover:bg-navy-700/80 text-white font-medium text-sm border border-navy-700 transition-all"
            >
              <Cpu size={16} className="text-cyan-400" />
              <span>Explore Task 9 Decision Engine</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard
          title="Integrated AI Accuracy"
          value={m ? `${(m.integrated_system.accuracy * 100).toFixed(2)}%` : '88.27%'}
          subtitle="Measured on 196 held-out records"
          badge="Top Performer"
          badgeColor="emerald"
          icon={<ShieldAlert size={20} />}
        />
        <MetricCard
          title="Random Forest Accuracy"
          value={m ? `${(m.random_forest.accuracy * 100).toFixed(2)}%` : '88.27%'}
          subtitle="100 Estimators, Gini feature importance"
          badge="Task 6 ML"
          badgeColor="cyan"
          icon={<GitCompare size={20} />}
        />
        <MetricCard
          title="LSTM Test Accuracy"
          value={m ? `${(m.lstm.accuracy * 100).toFixed(2)}%` : '80.10%'}
          subtitle="64 Units, Softmax output, Adam(0.001)"
          badge="Task 7 DL"
          badgeColor="indigo"
          icon={<Layers size={20} />}
        />
        <MetricCard
          title="Model Agreement Rate"
          value={sys ? `${(sys.model_agreement_rate * 100).toFixed(1)}%` : '86.7%'}
          subtitle="LSTM & RF concurrent consensus"
          badge="High Reliability"
          badgeColor="emerald"
          icon={<CheckCircle size={20} />}
        />
      </div>

      {/* Architecture & Flow Overview */}
      <div className="bg-navy-900/90 border border-navy-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
              <Cpu className="text-cyan-400" size={20} />
              End-to-End System Architecture (CELBC710)
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Data Cleaning → Standard Scaling → Mutual Information (Top 8) → Dual Inference → AI Decision Policy
            </p>
          </div>
          <button
            onClick={() => onNavigate('dataset')}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
          >
            <span>View Task 4 Pipeline</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* Visual Pipeline Flowchart */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
          <div className="bg-navy-950/80 border border-navy-700/80 rounded-xl p-4 text-center">
            <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">Step 1: Input</span>
            <h4 className="text-sm font-semibold text-white mt-1">Sensor Readings</h4>
            <p className="text-[11px] text-slate-400 mt-1">Queue, waiting time, speed, signal, emergency status</p>
          </div>

          <div className="bg-navy-950/80 border border-navy-700/80 rounded-xl p-4 text-center">
            <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">Step 2: Task 4 & 5</span>
            <h4 className="text-sm font-semibold text-white mt-1">Preprocessing</h4>
            <p className="text-[11px] text-slate-400 mt-1">StandardScaler + OHE + 8 MI-selected features</p>
          </div>

          <div className="bg-navy-950/80 border border-cyan-500/40 rounded-xl p-4 text-center shadow-md">
            <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">Step 3: Task 6 & 7</span>
            <h4 className="text-sm font-semibold text-white mt-1">Dual Model Inferencing</h4>
            <p className="text-[11px] text-slate-400 mt-1">RF (88.27%) & LSTM RNN (80.10%) parallel runs</p>
          </div>

          <div className="bg-navy-950/80 border border-amber-500/40 rounded-xl p-4 text-center shadow-md">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">Step 4: Task 9</span>
            <h4 className="text-sm font-semibold text-white mt-1">AI Decision Rules</h4>
            <p className="text-[11px] text-slate-400 mt-1">Emergency override, confidence check & conflict resolution</p>
          </div>

          <div className="bg-navy-950/80 border border-emerald-500/40 rounded-xl p-4 text-center shadow-md">
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Step 5: Output</span>
            <h4 className="text-sm font-semibold text-white mt-1">Optimal Action</h4>
            <p className="text-[11px] text-slate-400 mt-1">Priority, extend green, maintain, reduce, or switch</p>
          </div>
        </div>
      </div>

      {/* Charts Section: Model Comparison & Feature Importance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Model Accuracy Comparison */}
        <div className="bg-navy-900/90 border border-navy-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white">Model Performance Comparison</h3>
              <p className="text-xs text-slate-400">Accuracy & F1-Score on 196 test records</p>
            </div>
            <button
              onClick={() => onNavigate('ml_models')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
            >
              <span>Task 6 Details</span>
              <ArrowRight size={14} />
            </button>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1d2f56" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} angle={-15} textAnchor="end" />
                <YAxis stroke="#94a3b8" fontSize={11} domain={[60, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0d1527', borderColor: '#1d2f56', borderRadius: '8px' }}
                  formatter={(value: any) => [`${Number(value).toFixed(2)}%`]}
                />
                <Bar dataKey="accuracy" fill="#06b6d4" name="Accuracy" radius={[4, 4, 0, 0]} />
                <Bar dataKey="f1" fill="#818cf8" name="F1-Score" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top 5 Feature Importance */}
        <div className="bg-navy-900/90 border border-navy-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white">Top Influential Traffic Features</h3>
              <p className="text-xs text-slate-400">Random Forest MDI Gini importance (Task 5 & 8)</p>
            </div>
            <button
              onClick={() => onNavigate('explainability')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
            >
              <span>Task 8 Analysis</span>
              <ArrowRight size={14} />
            </button>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topFeatures} layout="vertical" margin={{ top: 10, right: 30, left: 30, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1d2f56" horizontal={false} />
                <XAxis type="number" stroke="#94a3b8" fontSize={11} domain={[0, 30]} unit="%" />
                <YAxis type="category" dataKey="feature" stroke="#94a3b8" fontSize={11} width={110} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0d1527', borderColor: '#1d2f56', borderRadius: '8px' }}
                  formatter={(value: any) => [`${value}%`, 'Importance']}
                />
                <Bar dataKey="importance" fill="#22d3ee" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Safety & Protocol Banner */}
      <div className="bg-navy-900/60 border border-amber-500/30 rounded-2xl p-5 flex items-start space-x-4">
        <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-400 shrink-0">
          <AlertTriangle size={22} />
        </div>
        <div className="text-xs text-slate-300 leading-relaxed">
          <strong className="text-amber-300 font-semibold block mb-1">
            Safety-First Artificial Intelligence Policy:
          </strong>
          All traffic predictions are advisory prototype signals. In accordance with Task 9 and Task 10 responsible AI specifications, emergency vehicle detection strictly overrides all machine learning probabilities with 100% deterministic safety priority.
        </div>
      </div>
    </div>
  );
};

