import React, { useState } from 'react';
import { PredictionRequest, PredictionResponse } from '../types';
import { predictTraffic } from '../api';
import {
  Car,
  AlertOctagon,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Sliders,
  RotateCcw,
  Clock,
  Compass,
  Gauge,
  Activity,
  Layers,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

export const TrafficPredictionForm: React.FC = () => {
  const [formData, setFormData] = useState<PredictionRequest>({
    queue_length: 25,
    waiting_time: 40,
    average_speed: 28,
    emergency_vehicle: 'no',
    current_signal: 'north',
    traffic_density: 'medium',
    confidence_threshold: 0.60,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [showFeatureDrawer, setShowFeatureDrawer] = useState(false);

  // Preset scenarios
  const applyPreset = (preset: 'emergency' | 'rush_hour' | 'light_traffic' | 'low_conf') => {
    switch (preset) {
      case 'emergency':
        setFormData({
          queue_length: 12,
          waiting_time: 20,
          average_speed: 38,
          emergency_vehicle: 'yes',
          current_signal: 'north',
          traffic_density: 'medium',
          confidence_threshold: 0.60
        });
        break;
      case 'rush_hour':
        setFormData({
          queue_length: 70,
          waiting_time: 130,
          average_speed: 6,
          emergency_vehicle: 'no',
          current_signal: 'north',
          traffic_density: 'high',
          confidence_threshold: 0.60
        });
        break;
      case 'light_traffic':
        setFormData({
          queue_length: 4,
          waiting_time: 8,
          average_speed: 48,
          emergency_vehicle: 'no',
          current_signal: 'east',
          traffic_density: 'low',
          confidence_threshold: 0.60
        });
        break;
      case 'low_conf':
        setFormData({
          queue_length: 9,
          waiting_time: 16,
          average_speed: 42,
          emergency_vehicle: 'no',
          current_signal: 'west',
          traffic_density: 'low',
          confidence_threshold: 0.70
        });
        break;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await predictTraffic(formData);
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'Prediction failed');
    } finally {
      setLoading(false);
    }
  };

  // Helper colors for action badges
  const getActionColor = (action: string) => {
    switch (action) {
      case 'emergency_priority':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-rose-500/20';
      case 'extend_green':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-emerald-500/20';
      case 'maintain':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-cyan-500/20';
      case 'reduce_green':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-amber-500/20';
      case 'switch_signal':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/50 shadow-purple-500/20';
      default:
        return 'bg-navy-800 text-slate-300 border-navy-700';
    }
  };

  // Probability chart data
  const probChartData = result?.decision.probabilities
    ? Object.entries(result.decision.probabilities).map(([action, prob]) => ({
        action: action.replace('_', ' '),
        probability: Math.round(prob * 1000) / 10,
        rawAction: action
      }))
    : [];

  return (
    <div className="space-y-8">
      {/* Quick Scenario Preset Selector */}
      <div className="bg-navy-900/70 border border-navy-800 rounded-2xl p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sliders size={14} className="text-cyan-400" />
            Quick Test Scenarios
          </span>
          <span className="text-xs text-slate-400">Select a realistic traffic pattern to populate the form</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            type="button"
            onClick={() => applyPreset('emergency')}
            className="px-3 py-2 rounded-xl bg-navy-800/80 hover:bg-rose-500/15 border border-navy-700 hover:border-rose-500/40 text-xs font-medium text-slate-300 hover:text-rose-300 transition-all text-left flex items-center space-x-2"
          >
            <ShieldAlert size={16} className="text-rose-400 shrink-0" />
            <div>
              <div className="font-semibold text-white">Ambulance Present</div>
              <div className="text-[10px] text-slate-400">Rule 1 Trigger</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => applyPreset('rush_hour')}
            className="px-3 py-2 rounded-xl bg-navy-800/80 hover:bg-emerald-500/15 border border-navy-700 hover:border-emerald-500/40 text-xs font-medium text-slate-300 hover:text-emerald-300 transition-all text-left flex items-center space-x-2"
          >
            <Car size={16} className="text-emerald-400 shrink-0" />
            <div>
              <div className="font-semibold text-white">Heavy Rush Hour</div>
              <div className="text-[10px] text-slate-400">High Density</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => applyPreset('light_traffic')}
            className="px-3 py-2 rounded-xl bg-navy-800/80 hover:bg-cyan-500/15 border border-navy-700 hover:border-cyan-500/40 text-xs font-medium text-slate-300 hover:text-cyan-300 transition-all text-left flex items-center space-x-2"
          >
            <Gauge size={16} className="text-cyan-400 shrink-0" />
            <div>
              <div className="font-semibold text-white">Free-Flow Night</div>
              <div className="text-[10px] text-slate-400">Low Density</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => applyPreset('low_conf')}
            className="px-3 py-2 rounded-xl bg-navy-800/80 hover:bg-amber-500/15 border border-navy-700 hover:border-amber-500/40 text-xs font-medium text-slate-300 hover:text-amber-300 transition-all text-left flex items-center space-x-2"
          >
            <AlertOctagon size={16} className="text-amber-400 shrink-0" />
            <div>
              <div className="font-semibold text-white">Uncertain Border</div>
              <div className="text-[10px] text-slate-400">Rule 2 Fallback</div>
            </div>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Form Column (5 cols) */}
        <div className="lg:col-span-5 bg-navy-900/90 border border-navy-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-white tracking-wide">Traffic Conditions Input</h3>
              <p className="text-xs text-slate-400">Passes directly into fitted Task 4/5 pipeline</p>
            </div>
            <button
              type="button"
              onClick={() => applyPreset('rush_hour')}
              className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1"
              title="Reset to defaults"
            >
              <RotateCcw size={13} />
              <span>Reset</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Queue Length */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Car size={14} className="text-cyan-400" />
                  Queue Length (Vehicles)
                </label>
                <span className="font-mono text-cyan-300 font-bold">{formData.queue_length} veh</span>
              </div>
              <input
                type="range"
                min="0"
                max="150"
                step="1"
                value={formData.queue_length}
                onChange={(e) => setFormData({ ...formData, queue_length: Number(e.target.value) })}
                className="w-full accent-cyan-400 h-2 bg-navy-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>0 (Empty)</span>
                <span>50 (Moderate)</span>
                <span>150 (Gridlock)</span>
              </div>
            </div>

            {/* Waiting Time */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Clock size={14} className="text-cyan-400" />
                  Average Waiting Time (seconds)
                </label>
                <span className="font-mono text-cyan-300 font-bold">{formData.waiting_time} sec</span>
              </div>
              <input
                type="range"
                min="0"
                max="250"
                step="1"
                value={formData.waiting_time}
                onChange={(e) => setFormData({ ...formData, waiting_time: Number(e.target.value) })}
                className="w-full accent-cyan-400 h-2 bg-navy-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>0s (Smooth)</span>
                <span>60s (1 min)</span>
                <span>250s (Severe)</span>
              </div>
            </div>

            {/* Average Speed */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Gauge size={14} className="text-cyan-400" />
                  Approach Average Speed (km/h)
                </label>
                <span className="font-mono text-cyan-300 font-bold">{formData.average_speed} km/h</span>
              </div>
              <input
                type="range"
                min="3"
                max="65"
                step="1"
                value={formData.average_speed}
                onChange={(e) => setFormData({ ...formData, average_speed: Number(e.target.value) })}
                className="w-full accent-cyan-400 h-2 bg-navy-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>3 km/h (Crawling)</span>
                <span>30 km/h (Moderate)</span>
                <span>65 km/h (Fast)</span>
              </div>
            </div>

            {/* Emergency Vehicle Toggle */}
            <div className="p-3.5 rounded-xl bg-navy-950/80 border border-navy-800 flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-white flex items-center gap-1.5">
                  <ShieldAlert size={15} className={formData.emergency_vehicle === 'yes' ? 'text-rose-400' : 'text-slate-400'} />
                  Emergency Vehicle Detected?
                </label>
                <p className="text-[10px] text-slate-400">Triggers deterministic safety override rule</p>
              </div>
              <div className="flex bg-navy-900 rounded-lg p-1 border border-navy-700">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, emergency_vehicle: 'no' })}
                  className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                    formData.emergency_vehicle === 'no'
                      ? 'bg-navy-700 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  No
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, emergency_vehicle: 'yes' })}
                  className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                    formData.emergency_vehicle === 'yes'
                      ? 'bg-rose-500 text-white shadow shadow-rose-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Yes
                </button>
              </div>
            </div>

            {/* Current Signal Direction */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2 flex items-center gap-1.5">
                <Compass size={14} className="text-cyan-400" />
                Active Signal Direction
              </label>
              <div className="grid grid-cols-4 gap-2">
                {['north', 'south', 'east', 'west'].map((dir) => (
                  <button
                    key={dir}
                    type="button"
                    onClick={() => setFormData({ ...formData, current_signal: dir })}
                    className={`py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all border ${
                      formData.current_signal === dir
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60 shadow-sm'
                        : 'bg-navy-950/80 text-slate-400 border-navy-800 hover:border-navy-700'
                    }`}
                  >
                    {dir}
                  </button>
                ))}
              </div>
            </div>

            {/* Traffic Density */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2 flex items-center gap-1.5">
                <Activity size={14} className="text-cyan-400" />
                Observed Traffic Density
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['low', 'medium', 'high'].map((density) => (
                  <button
                    key={density}
                    type="button"
                    onClick={() => setFormData({ ...formData, traffic_density: density })}
                    className={`py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all border ${
                      formData.traffic_density === density
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60 shadow-sm'
                        : 'bg-navy-950/80 text-slate-400 border-navy-800 hover:border-navy-700'
                    }`}
                  >
                    {density}
                  </button>
                ))}
              </div>
            </div>

            {/* Confidence Threshold */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <label className="text-slate-400">LSTM Confidence Cutoff Threshold</label>
                <span className="font-mono text-cyan-300 font-bold">{formData.confidence_threshold}</span>
              </div>
              <input
                type="range"
                min="0.40"
                max="0.90"
                step="0.05"
                value={formData.confidence_threshold}
                onChange={(e) => setFormData({ ...formData, confidence_threshold: Number(e.target.value) })}
                className="w-full accent-cyan-400 h-1.5 bg-navy-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-navy-950 font-bold text-sm tracking-wide shadow-lg shadow-cyan-500/25 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Activity size={16} className="animate-spin" />
                  <span>Processing Through Models...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Predict Traffic Signal Action</span>
                </>
              )}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs">
              {error}
            </div>
          )}
        </div>

        {/* Prediction Results Column (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {result ? (
            <div className="space-y-6">
              {/* Primary Decision Banner */}
              <div className="bg-navy-900 border border-navy-700/80 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-navy-800 pb-4 mb-4">
                  <div>
                    <span className="text-[11px] font-mono text-slate-400">Prediction ID: {result.prediction_id}</span>
                    <div className="text-[11px] text-slate-400">{result.timestamp}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {result.decision.model_agreement ? (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
                        <CheckCircle2 size={13} />
                        <span>Models Agree</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-semibold">
                        <AlertOctagon size={13} />
                        <span>Disagreement / Override</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-center py-4">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">
                    Final Integrated AI Decision
                  </span>
                  <div className="inline-block">
                    <span className={`text-2xl sm:text-3xl font-black px-6 py-2.5 rounded-2xl border shadow-xl uppercase tracking-wide ${getActionColor(result.decision.final_action)}`}>
                      {result.decision.final_action.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="mt-4 max-w-lg mx-auto">
                    <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full bg-navy-800 text-cyan-300 border border-navy-700 mb-2">
                      Rule Triggered: {result.decision.rule_triggered}
                    </span>
                    <p className="text-xs text-slate-300 font-medium italic">
                      "{result.decision.reason}"
                    </p>
                  </div>
                </div>
              </div>

              {/* Dual Model Breakdown: LSTM vs Random Forest */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* LSTM Card */}
                <div className="bg-navy-900/80 border border-navy-800 rounded-xl p-5 shadow-lg">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Layers size={14} className="text-indigo-400" />
                      Task 7 LSTM Model
                    </span>
                    <span className="text-xs font-mono font-bold text-indigo-300">
                      {(result.model_details.lstm.confidence * 100).toFixed(1)}% Conf
                    </span>
                  </div>
                  <div className="text-lg font-bold text-white capitalize">
                    {result.model_details.lstm.prediction.replace('_', ' ')}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Recurrent sequence network over 1-step transformed feature vector.
                  </p>
                </div>

                {/* Random Forest Card */}
                <div className="bg-navy-900/80 border border-navy-800 rounded-xl p-5 shadow-lg">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Activity size={14} className="text-cyan-400" />
                      Task 6 Random Forest
                    </span>
                    <span className="text-xs font-mono font-bold text-cyan-300">
                      100 Trees
                    </span>
                  </div>
                  <div className="text-lg font-bold text-white capitalize">
                    {result.model_details.random_forest.prediction.replace('_', ' ')}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Ensemble decision trees with Gini feature importance weighting.
                  </p>
                </div>
              </div>

              {/* LSTM Class Probability Distribution Chart */}
              {probChartData.length > 0 && (
                <div className="bg-navy-900/80 border border-navy-800 rounded-xl p-5 shadow-lg">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                    LSTM Class Softmax Probabilities
                  </h4>
                  <div className="h-44">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={probChartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                        <XAxis dataKey="action" stroke="#94a3b8" fontSize={11} angle={-15} textAnchor="end" />
                        <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} unit="%" />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#0d1527', borderColor: '#1d2f56', borderRadius: '8px' }}
                          formatter={(val: any) => [`${val}%`, 'Confidence']}
                        />
                        <Bar dataKey="probability" radius={[4, 4, 0, 0]}>
                          {probChartData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={entry.rawAction === result.decision.final_action ? '#06b6d4' : '#334155'}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Feature Preparation Inspection Drawer */}
              <div className="bg-navy-950 border border-navy-800 rounded-xl p-4">
                <button
                  type="button"
                  onClick={() => setShowFeatureDrawer(!showFeatureDrawer)}
                  className="w-full flex items-center justify-between text-xs text-slate-400 hover:text-slate-200 font-semibold"
                >
                  <span>Inspect StandardScaler Normalized Feature Vector (Task 4 & 5)</span>
                  {showFeatureDrawer ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                {showFeatureDrawer && (
                  <div className="mt-3 pt-3 border-t border-navy-800 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                    {Object.entries(result.features_prepared).map(([feat, val]) => (
                      <div key={feat} className="p-2 bg-navy-900 rounded border border-navy-800">
                        <div className="text-[10px] text-slate-400 truncate" title={feat}>{feat}</div>
                        <div className="text-cyan-300 font-semibold">{val.toFixed(4)}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Disclaimer */}
              <div className="text-[11px] text-slate-400 border-l-2 border-cyan-500/40 pl-3 italic">
                {result.disclaimer}
              </div>
            </div>
          ) : (
            /* Empty State */
            <div className="h-full flex flex-col items-center justify-center p-12 text-center bg-navy-900/40 border border-dashed border-navy-800 rounded-2xl">
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4 shadow-lg shadow-cyan-500/10">
                <Car size={32} />
              </div>
              <h4 className="text-base font-bold text-white mb-2">Awaiting Traffic Conditions</h4>
              <p className="text-xs text-slate-400 max-w-sm mb-6">
                Adjust parameters on the left or select a quick scenario, then click "Predict Traffic Signal Action" to execute the integrated pipeline.
              </p>
              <button
                onClick={() => applyPreset('rush_hour')}
                className="px-4 py-2 rounded-xl bg-navy-800 hover:bg-navy-700 text-xs font-semibold text-cyan-300 border border-navy-700 transition-all"
              >
                Load Default Rush Hour Test
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

