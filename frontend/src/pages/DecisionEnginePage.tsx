import React, { useState } from 'react';
import { MetricCard } from '../components/MetricCard';
import {
  Cpu,
  ShieldAlert,
  AlertOctagon,
  CheckCircle2,
  GitMerge,
  ArrowRight,
  Play,
  RotateCcw
} from 'lucide-react';

export const DecisionEnginePage: React.FC = () => {
  // Interactive sandbox state
  const [hasEmergency, setHasEmergency] = useState(false);
  const [lstmConfidence, setLstmConfidence] = useState(0.85);
  const [lstmPrediction, setLstmPrediction] = useState('extend_green');
  const [rfPrediction, setRfPrediction] = useState('extend_green');
  const [threshold, setThreshold] = useState(0.60);

  // Compute live sandbox decision
  const computeDecision = () => {
    if (hasEmergency) {
      return {
        rule: 'Rule 1: Emergency Vehicle Safety Override',
        branch: 1,
        action: 'emergency_priority',
        reason: 'Emergency vehicle detected; emergency priority rule applied.',
        color: 'rose',
      };
    } else if (lstmConfidence < threshold) {
      return {
        rule: 'Rule 2: Low-Confidence Fallback Policy',
        branch: 2,
        action: rfPrediction,
        reason: 'LSTM confidence is low; Random Forest fallback used.',
        color: 'amber',
      };
    } else if (lstmPrediction === rfPrediction) {
      return {
        rule: 'Rule 3: Concurrent Model Consensus Agreement',
        branch: 3,
        action: lstmPrediction,
        reason: 'LSTM and Random Forest predictions agree.',
        color: 'emerald',
      };
    } else {
      return {
        rule: 'Rule 4: Model Disagreement Fallback Policy',
        branch: 4,
        action: rfPrediction,
        reason: 'Models disagree; Random Forest fallback policy applied.',
        color: 'indigo',
      };
    }
  };

  const decision = computeDecision();

  const sampleDecisions = [
    { row: 0, actual: 'extend_green', lstm: 'extend_green', conf: 0.9996, rf: 'extend_green', final: 'extend_green', reason: 'LSTM and Random Forest predictions agree.', correct: true },
    { row: 3, actual: 'switch_signal', lstm: 'maintain', conf: 0.6548, rf: 'switch_signal', final: 'switch_signal', reason: 'Models disagree; Random Forest fallback policy applied.', correct: true },
    { row: 8, actual: 'reduce_green', lstm: 'reduce_green', conf: 0.5408, rf: 'reduce_green', final: 'reduce_green', reason: 'LSTM confidence is low; Random Forest fallback used.', correct: true },
    { row: 12, actual: 'emergency_priority', lstm: 'emergency_priority', conf: 0.9993, rf: 'emergency_priority', final: 'emergency_priority', reason: 'Emergency vehicle detected; emergency priority rule applied.', correct: true },
    { row: 17, actual: 'switch_signal', lstm: 'maintain', conf: 0.5249, rf: 'maintain', final: 'maintain', reason: 'LSTM confidence is low; Random Forest fallback used.', correct: false },
  ];

  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard
          title="Rule 1: Emergency Override"
          value="100% Deterministic"
          subtitle="Preempts all ML model outputs"
          badge="Safety Critical"
          badgeColor="rose"
          icon={<ShieldAlert size={20} />}
        />
        <MetricCard
          title="Rule 2: Low-Conf Fallback"
          value="Cutoff < 0.60"
          subtitle="Random Forest acts as safe fallback"
          badge="31.6% of Test"
          badgeColor="amber"
          icon={<AlertOctagon size={20} />}
        />
        <MetricCard
          title="Rule 3: Agreement Rate"
          value="86.73%"
          subtitle="LSTM & RF predict identical action"
          badge="Consensus"
          badgeColor="emerald"
          icon={<CheckCircle2 size={20} />}
        />
        <MetricCard
          title="Rule 4: Conflict Fallback"
          value="RF Policy"
          subtitle="Selects higher-accuracy RF action"
          badge="Arbitration"
          badgeColor="indigo"
          icon={<GitMerge size={20} />}
        />
      </div>

      {/* Interactive Rule Sandbox */}
      <div className="bg-navy-900/90 border border-navy-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
              <Cpu className="text-cyan-400" size={18} />
              Task 9 Decision Engine Interactive Sandbox
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Adjust simulated model outputs and emergency states below to observe which rule branch triggers in real time.
            </p>
          </div>
          <button
            onClick={() => {
              setHasEmergency(false);
              setLstmConfidence(0.85);
              setLstmPrediction('extend_green');
              setRfPrediction('extend_green');
              setThreshold(0.60);
            }}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
          >
            <RotateCcw size={13} />
            <span>Reset</span>
          </button>
        </div>

        {/* Sandbox Controls */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-navy-950 rounded-xl border border-navy-800 mb-6">
          {/* Emergency vehicle toggle */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">Emergency Vehicle</label>
            <button
              onClick={() => setHasEmergency(!hasEmergency)}
              className={`w-full py-2 rounded-lg text-xs font-bold transition-all border ${
                hasEmergency
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/60 shadow-sm'
                  : 'bg-navy-900 text-slate-400 border-navy-700 hover:text-white'
              }`}
            >
              {hasEmergency ? '🚨 Detected (Yes)' : 'None (No)'}
            </button>
          </div>

          {/* LSTM Confidence */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <label className="text-slate-300 font-semibold">LSTM Confidence</label>
              <span className="font-mono text-cyan-300 font-bold">{(lstmConfidence * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0.30"
              max="1.00"
              step="0.05"
              value={lstmConfidence}
              onChange={(e) => setLstmConfidence(Number(e.target.value))}
              className="w-full accent-cyan-400 h-2 bg-navy-800 rounded-lg cursor-pointer"
            />
            <div className="text-[10px] text-slate-400 mt-1">Threshold: {(threshold * 100).toFixed(0)}%</div>
          </div>

          {/* LSTM Prediction */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">LSTM Prediction</label>
            <select
              value={lstmPrediction}
              onChange={(e) => setLstmPrediction(e.target.value)}
              className="w-full bg-navy-900 border border-navy-700 text-white text-xs rounded-lg p-2 font-medium"
            >
              <option value="extend_green">extend_green</option>
              <option value="maintain">maintain</option>
              <option value="reduce_green">reduce_green</option>
              <option value="switch_signal">switch_signal</option>
              <option value="emergency_priority">emergency_priority</option>
            </select>
          </div>

          {/* RF Prediction */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">RF Prediction</label>
            <select
              value={rfPrediction}
              onChange={(e) => setRfPrediction(e.target.value)}
              className="w-full bg-navy-900 border border-navy-700 text-white text-xs rounded-lg p-2 font-medium"
            >
              <option value="extend_green">extend_green</option>
              <option value="maintain">maintain</option>
              <option value="reduce_green">reduce_green</option>
              <option value="switch_signal">switch_signal</option>
              <option value="emergency_priority">emergency_priority</option>
            </select>
          </div>
        </div>

        {/* Live Active Rule Branch Highlight */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
          <div className={`p-4 rounded-xl border transition-all ${
            decision.branch === 1
              ? 'bg-rose-500/15 border-rose-500/60 shadow-lg shadow-rose-500/10'
              : 'bg-navy-950/60 border-navy-800 opacity-50'
          }`}>
            <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">Branch 1</span>
            <h5 className="text-xs font-bold text-white mt-1">Emergency Override</h5>
            <p className="text-[11px] text-slate-400 mt-1">if emergency == 1 → priority</p>
          </div>

          <div className={`p-4 rounded-xl border transition-all ${
            decision.branch === 2
              ? 'bg-amber-500/15 border-amber-500/60 shadow-lg shadow-amber-500/10'
              : 'bg-navy-950/60 border-navy-800 opacity-50'
          }`}>
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Branch 2</span>
            <h5 className="text-xs font-bold text-white mt-1">Low Confidence</h5>
            <p className="text-[11px] text-slate-400 mt-1">if conf &lt; {threshold} → RF fallback</p>
          </div>

          <div className={`p-4 rounded-xl border transition-all ${
            decision.branch === 3
              ? 'bg-emerald-500/15 border-emerald-500/60 shadow-lg shadow-emerald-500/10'
              : 'bg-navy-950/60 border-navy-800 opacity-50'
          }`}>
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Branch 3</span>
            <h5 className="text-xs font-bold text-white mt-1">Model Consensus</h5>
            <p className="text-[11px] text-slate-400 mt-1">if LSTM == RF → Agree</p>
          </div>

          <div className={`p-4 rounded-xl border transition-all ${
            decision.branch === 4
              ? 'bg-indigo-500/15 border-indigo-500/60 shadow-lg shadow-indigo-500/10'
              : 'bg-navy-950/60 border-navy-800 opacity-50'
          }`}>
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Branch 4</span>
            <h5 className="text-xs font-bold text-white mt-1">Conflict Policy</h5>
            <p className="text-[11px] text-slate-400 mt-1">if LSTM ≠ RF → RF fallback</p>
          </div>
        </div>

        {/* Live Output Banner */}
        <div className="p-5 rounded-xl bg-navy-950 border border-cyan-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider block">
              Active Rule Engine Output
            </span>
            <div className="text-xl font-extrabold text-white capitalize mt-1">
              {decision.action.replace('_', ' ')}
            </div>
            <p className="text-xs text-slate-300 italic mt-1">
              "{decision.reason}"
            </p>
          </div>
          <div className="shrink-0">
            <span className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/40">
              {decision.rule}
            </span>
          </div>
        </div>
      </div>

      {/* Historical Sample End-to-End Decisions Table (Task 9 Cell 64) */}
      <div className="bg-navy-900/90 border border-navy-800 rounded-2xl p-6 shadow-xl overflow-x-auto">
        <h3 className="text-base font-bold text-white mb-1">Task 9 Sample End-to-End Decisions</h3>
        <p className="text-xs text-slate-400 mb-4">Direct verification from notebook cell 64 execution log</p>

        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-navy-800 text-slate-400 font-semibold uppercase tracking-wider">
              <th className="pb-3">Row</th>
              <th className="pb-3">Ground Truth</th>
              <th className="pb-3">LSTM Pred (Conf)</th>
              <th className="pb-3">Random Forest</th>
              <th className="pb-3">Final Decision</th>
              <th className="pb-3">Rule Reason</th>
              <th className="pb-3 text-center">Correct?</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-800 text-slate-300 font-mono">
            {sampleDecisions.map((row) => (
              <tr key={row.row} className="hover:bg-navy-800/40">
                <td className="py-3 text-slate-400 font-bold">#{row.row}</td>
                <td className="py-3 font-semibold text-white">{row.actual}</td>
                <td className="py-3 text-indigo-300">{row.lstm} ({(row.conf * 100).toFixed(1)}%)</td>
                <td className="py-3 text-cyan-300">{row.rf}</td>
                <td className="py-3 font-bold text-emerald-300">{row.final}</td>
                <td className="py-3 text-slate-400 font-sans text-[11px]">{row.reason}</td>
                <td className="py-3 text-center">
                  {row.correct ? (
                    <span className="text-emerald-400 font-bold">✓ True</span>
                  ) : (
                    <span className="text-rose-400 font-bold">✗ False</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

