import React from 'react';
import { MetricsResponse } from '../types';
import { MetricCard } from '../components/MetricCard';
import {
  Sparkles,
  Info,
  CheckCircle2,
  TrendingUp,
  Cpu,
  Layers,
  HelpCircle
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid
} from 'recharts';

interface ExplainabilityProps {
  metrics: MetricsResponse | null;
}

export const Explainability: React.FC<ExplainabilityProps> = ({ metrics }) => {
  const m = metrics?.historical_metrics;

  // Comparison of RF vs LSTM importance
  const rfImp = m?.rf_feature_importance || [];
  const lstmImp = m?.lstm_feature_importance || [];

  const combinedData = rfImp.map(item => {
    const lstmMatch = lstmImp.find(l => l.feature === item.feature);
    return {
      feature: item.feature.replace('_', ' '),
      'Random Forest (MDI)': Number((item.importance * 100).toFixed(2)),
      'LSTM (Permutation Drop)': lstmMatch ? Number((lstmMatch.importance * 100).toFixed(2)) : 0,
    };
  });

  return (
    <div className="space-y-8">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard
          title="#1 RF Influential Feature"
          value="Queue Length"
          subtitle="24.93% Gini impurity reduction"
          badge="RF Global"
          badgeColor="cyan"
          icon={<Sparkles size={20} />}
        />
        <MetricCard
          title="#1 LSTM Permutation Impact"
          value="Emergency Vehicle"
          subtitle="19.49% accuracy drop when shuffled"
          badge="LSTM Critical"
          badgeColor="rose"
          icon={<TrendingUp size={20} />}
        />
        <MetricCard
          title="Average Speed Impact"
          value="19.38% (RF)"
          subtitle="7.76% accuracy drop in LSTM"
          badge="Kinetic Indicator"
          badgeColor="indigo"
          icon={<Cpu size={20} />}
        />
        <MetricCard
          title="Waiting Time Importance"
          value="24.47% (RF)"
          subtitle="Direct indicator for signal switches"
          badge="Delay Metric"
          badgeColor="emerald"
          icon={<Layers size={20} />}
        />
      </div>

      {/* Comparative Bar Chart: RF vs LSTM Importance */}
      <div className="bg-navy-900/90 border border-navy-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-2">
          <div>
            <h3 className="text-base font-bold text-white tracking-wide">
              Dual-Model Interpretability Comparison
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Random Forest Gini MDI Importance vs. LSTM Permutation Accuracy Drop (%)
            </p>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono">
            Task 8 Explainability
          </span>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={combinedData} margin={{ top: 10, right: 30, left: 30, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1d2f56" vertical={false} />
              <XAxis dataKey="feature" stroke="#94a3b8" fontSize={11} angle={-15} textAnchor="end" />
              <YAxis stroke="#94a3b8" fontSize={11} unit="%" domain={[0, 30]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0d1527', borderColor: '#1d2f56', borderRadius: '8px' }}
                formatter={(val: any) => [`${val}%`]}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey="Random Forest (MDI)" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              <Bar dataKey="LSTM (Permutation Drop)" fill="#ec4899" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Global vs Local Explainability Guidance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Global Explainability */}
        <div className="bg-navy-900/90 border border-navy-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h4 className="text-base font-bold text-white flex items-center gap-2">
            <Info size={18} className="text-cyan-400" />
            Global Interpretability
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            Global importance measures how features contribute across the <em>entire training distribution</em>:
          </p>
          <ul className="text-xs text-slate-400 space-y-2 list-disc list-inside">
            <li><strong className="text-white">Random Forest (MDI):</strong> Calculates total mean decrease in node impurity (Gini index) brought by each feature over all 100 decision trees.</li>
            <li><strong className="text-white">LSTM Permutation Importance:</strong> Evaluates accuracy reduction when individual feature columns are randomly shuffled on the held-out test set, breaking the feature-target link.</li>
          </ul>
          <div className="p-3 bg-navy-950 rounded-xl border border-navy-800 text-[11px] text-slate-400">
            <strong>Key Finding:</strong> Both models independently agree that <span className="text-cyan-300">emergency_vehicle</span>, <span className="text-cyan-300">queue_length</span>, <span className="text-cyan-300">waiting_time</span>, and <span className="text-cyan-300">average_speed</span> govern over <strong>90%</strong> of signal decisions.
          </div>
        </div>

        {/* Local Prediction Explainability */}
        <div className="bg-navy-900/90 border border-navy-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h4 className="text-base font-bold text-white flex items-center gap-2">
            <HelpCircle size={18} className="text-cyan-400" />
            Local Prediction Reasoning (Task 9 Rule Engine)
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            Global importance cannot explain <em>why a specific individual car or signal action was selected right now</em>. SMARTFLOW AI solves this via the <strong>Task 9 Natural Language Reason Engine</strong>:
          </p>
          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-lg bg-navy-950 border border-navy-800">
              <span className="font-semibold text-rose-300">Emergency Override:</span>
              <p className="text-[11px] text-slate-400 mt-0.5">"Emergency vehicle detected; emergency priority rule applied."</p>
            </div>
            <div className="p-2.5 rounded-lg bg-navy-950 border border-navy-800">
              <span className="font-semibold text-amber-300">Low-Confidence Fallback:</span>
              <p className="text-[11px] text-slate-400 mt-0.5">"LSTM confidence is low; Random Forest fallback used."</p>
            </div>
            <div className="p-2.5 rounded-lg bg-navy-950 border border-navy-800">
              <span className="font-semibold text-emerald-300">Model Consensus:</span>
              <p className="text-[11px] text-slate-400 mt-0.5">"LSTM and Random Forest predictions agree."</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

