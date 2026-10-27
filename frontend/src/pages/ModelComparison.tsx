import React from 'react';
import { MetricsResponse } from '../types';
import { MetricCard } from '../components/MetricCard';
import { ConfusionMatrixView } from '../components/ConfusionMatrixView';
import {
  GitCompare,
  CheckCircle2,
  AlertCircle,
  BarChart2,
  Award,
  Layers
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

interface ModelComparisonProps {
  metrics: MetricsResponse | null;
}

export const ModelComparison: React.FC<ModelComparisonProps> = ({ metrics }) => {
  const m = metrics?.historical_metrics;
  const classes = m?.target_classes || [
    'emergency_priority',
    'extend_green',
    'maintain',
    'reduce_green',
    'switch_signal'
  ];

  const modelsTable = m ? [
    {
      name: 'Logistic Regression',
      type: 'Linear / Softmax',
      accuracy: m.logistic_regression.accuracy,
      precision: m.logistic_regression.precision,
      recall: m.logistic_regression.recall,
      f1: m.logistic_regression.f1,
      best: false,
    },
    {
      name: 'Decision Tree (depth=6)',
      type: 'Single Tree',
      accuracy: m.decision_tree.accuracy,
      precision: m.decision_tree.precision,
      recall: m.decision_tree.recall,
      f1: m.decision_tree.f1,
      best: false,
    },
    {
      name: 'Random Forest (100 trees)',
      type: 'Ensemble Bagging',
      accuracy: m.random_forest.accuracy,
      precision: m.random_forest.precision,
      recall: m.random_forest.recall,
      f1: m.random_forest.f1,
      best: true,
    },
  ] : [];

  const chartData = modelsTable.map(model => ({
    name: model.name.split(' ')[0],
    Accuracy: Number((model.accuracy * 100).toFixed(2)),
    Precision: Number((model.precision * 100).toFixed(2)),
    Recall: Number((model.recall * 100).toFixed(2)),
    'F1-Score': Number((model.f1 * 100).toFixed(2)),
  }));

  return (
    <div className="space-y-8">
      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard
          title="Best Model (Task 6)"
          value="Random Forest"
          subtitle="100 trees, random_state=42"
          badge="88.27% Acc"
          badgeColor="emerald"
          icon={<Award size={20} />}
        />
        <MetricCard
          title="Decision Tree Accuracy"
          value={m ? `${(m.decision_tree.accuracy * 100).toFixed(2)}%` : '86.22%'}
          subtitle="max_depth=6, single tree"
          badge="84.57% F1"
          badgeColor="cyan"
          icon={<GitCompare size={20} />}
        />
        <MetricCard
          title="Logistic Regression Accuracy"
          value={m ? `${(m.logistic_regression.accuracy * 100).toFixed(2)}%` : '80.10%'}
          subtitle="max_iter=1000, L2 regularization"
          badge="76.73% F1"
          badgeColor="indigo"
          icon={<Layers size={20} />}
        />
        <MetricCard
          title="RF Misclassification Rate"
          value="11.73%"
          subtitle="23 misclassified / 196 test samples"
          badge="173 Correct"
          badgeColor="emerald"
          icon={<CheckCircle2 size={20} />}
        />
      </div>

      {/* Model Performance Comparison Table */}
      <div className="bg-navy-900/90 border border-navy-800 rounded-2xl p-6 shadow-xl overflow-x-auto">
        <h3 className="text-base font-bold text-white mb-1">Task 6 Machine Learning Model Evaluation</h3>
        <p className="text-xs text-slate-400 mb-6">
          Weighted metrics calculated on the 196 stratified held-out test records.
        </p>

        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-navy-800 text-xs text-slate-400 font-semibold uppercase tracking-wider">
              <th className="pb-3">Model</th>
              <th className="pb-3">Architecture</th>
              <th className="pb-3 text-right">Accuracy</th>
              <th className="pb-3 text-right">Precision</th>
              <th className="pb-3 text-right">Recall</th>
              <th className="pb-3 text-right">F1-Score</th>
              <th className="pb-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-800">
            {modelsTable.map((row) => (
              <tr key={row.name} className={row.best ? 'bg-cyan-500/5' : ''}>
                <td className="py-3.5 font-bold text-white flex items-center gap-2">
                  {row.name}
                  {row.best && (
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-semibold">
                      Champion
                    </span>
                  )}
                </td>
                <td className="py-3.5 text-slate-400 text-xs font-mono">{row.type}</td>
                <td className="py-3.5 text-right font-mono font-bold text-cyan-300">{(row.accuracy * 100).toFixed(2)}%</td>
                <td className="py-3.5 text-right font-mono text-slate-300">{(row.precision * 100).toFixed(2)}%</td>
                <td className="py-3.5 text-right font-mono text-slate-300">{(row.recall * 100).toFixed(2)}%</td>
                <td className="py-3.5 text-right font-mono font-bold text-indigo-300">{(row.f1 * 100).toFixed(2)}%</td>
                <td className="py-3.5 text-center">
                  <span className="text-[11px] px-2 py-0.5 rounded bg-navy-800 text-slate-300 border border-navy-700">
                    Fitted & Saved
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Multi-Metric Grouped Bar Chart */}
      <div className="bg-navy-900/90 border border-navy-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-base font-bold text-white mb-1">Comparative Metric Distribution</h3>
        <p className="text-xs text-slate-400 mb-6">Bar comparison across Accuracy, Precision, Recall, and F1-Score</p>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1d2f56" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={11} domain={[70, 100]} unit="%" />
              <Tooltip
                contentStyle={{ backgroundColor: '#0d1527', borderColor: '#1d2f56', borderRadius: '8px' }}
                formatter={(val: any) => [`${val}%`]}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey="Accuracy" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Precision" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Recall" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="F1-Score" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Random Forest Confusion Matrix & Misclassification Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          {m?.confusion_matrices.random_forest && (
            <ConfusionMatrixView
              matrix={m.confusion_matrices.random_forest}
              classes={classes}
              title="Random Forest Test Confusion Matrix"
            />
          )}
        </div>

        <div className="lg:col-span-5 bg-navy-900/90 border border-navy-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h4 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <AlertCircle size={18} className="text-amber-400" />
              Task 6 Error & Misclassification Analysis
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Random Forest achieves near-perfect classification for <strong>emergency_priority (100% recall, 96% precision)</strong> and <strong>extend_green (97% precision, 97% recall)</strong>.
            </p>
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-navy-950 rounded-xl border border-navy-800">
                <div className="font-semibold text-slate-200">Main source of confusion:</div>
                <div className="text-slate-400 mt-1">
                  8 records labeled <code className="text-amber-300">reduce_green</code> were predicted as <code className="text-cyan-300">maintain</code> due to overlapping speed/queue boundaries in medium-low transitions.
                </div>
              </div>
              <div className="p-3 bg-navy-950 rounded-xl border border-navy-800">
                <div className="font-semibold text-slate-200">Switch Signal:</div>
                <div className="text-slate-400 mt-1">
                  6 switch signals were predicted as <code className="text-cyan-300">maintain</code> when wait times had not yet reached threshold.
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-navy-800 text-[11px] text-emerald-400 font-semibold flex items-center gap-1.5">
            <CheckCircle2 size={15} />
            <span>0 false negatives for emergency vehicle safety override</span>
          </div>
        </div>
      </div>
    </div>
  );
};

