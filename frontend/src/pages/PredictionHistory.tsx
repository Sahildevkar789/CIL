import React, { useState, useEffect } from 'react';
import { HistoryItem } from '../types';
import { getHistory, clearHistory } from '../api';
import {
  History,
  Trash2,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  Car,
  Clock,
  Gauge
} from 'lucide-react';

export const PredictionHistory: React.FC = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await getHistory(100, 0);
      setHistory(data.items);
      setTotal(data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleClear = async () => {
    if (window.confirm('Are you sure you want to clear all prediction history?')) {
      await clearHistory();
      fetchHistory();
    }
  };

  const filteredHistory = history.filter(item => {
    const term = searchTerm.toLowerCase();
    return (
      item.prediction_id.toLowerCase().includes(term) ||
      item.final_action.toLowerCase().includes(term) ||
      item.rule_triggered.toLowerCase().includes(term) ||
      item.current_signal.toLowerCase().includes(term)
    );
  });

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case 'emergency_priority':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'extend_green':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'maintain':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
      case 'reduce_green':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'switch_signal':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      default:
        return 'bg-navy-800 text-slate-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="bg-navy-900/90 border border-navy-800 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <div className="p-2.5 bg-navy-800 rounded-xl border border-navy-700 text-cyan-400">
            <History size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-wide">
              Prediction Audit History (SQLite)
            </h3>
            <p className="text-xs text-slate-400">
              {total} total predictions recorded locally in <code className="text-cyan-300 font-mono">prediction_history.db</code>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
          <div className="relative flex-1 sm:w-64">
            <Search size={14} className="absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Filter by ID, action, or rule..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-navy-950 border border-navy-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <button
            onClick={fetchHistory}
            disabled={loading}
            className="p-2.5 rounded-xl bg-navy-800 hover:bg-navy-700 text-slate-300 hover:text-white border border-navy-700 transition-all"
            title="Refresh History"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin text-cyan-400' : ''} />
          </button>

          {history.length > 0 && (
            <button
              onClick={handleClear}
              className="p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-all"
              title="Clear SQLite History"
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      </div>

      {/* History Table */}
      <div className="bg-navy-900/90 border border-navy-800 rounded-2xl shadow-xl overflow-hidden">
        {filteredHistory.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-navy-950/80 border-b border-navy-800 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="p-3.5">ID / Time</th>
                  <th className="p-3.5">Inputs</th>
                  <th className="p-3.5">Emergency?</th>
                  <th className="p-3.5">LSTM Output</th>
                  <th className="p-3.5">RF Output</th>
                  <th className="p-3.5">Final Action</th>
                  <th className="p-3.5">Rule Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-800/80">
                {filteredHistory.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className="hover:bg-navy-800/50 cursor-pointer transition-all"
                  >
                    <td className="p-3.5 font-mono">
                      <div className="font-bold text-cyan-300">{item.prediction_id}</div>
                      <div className="text-[10px] text-slate-400">{item.timestamp?.replace('T', ' ').slice(0, 19)}</div>
                    </td>
                    <td className="p-3.5 text-slate-300">
                      <div>Q: {item.queue_length} veh | W: {item.waiting_time}s</div>
                      <div className="text-[10px] text-slate-400">
                        {item.average_speed} km/h • {item.current_signal.toUpperCase()} • {item.traffic_density}
                      </div>
                    </td>
                    <td className="p-3.5">
                      {item.emergency_vehicle === 1 ? (
                        <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold text-[10px]">
                          YES 🚨
                        </span>
                      ) : (
                        <span className="text-slate-400 font-mono text-[11px]">No</span>
                      )}
                    </td>
                    <td className="p-3.5 text-indigo-300 font-mono">
                      {item.lstm_prediction}
                      <span className="text-[10px] text-slate-400 block">
                        ({(item.lstm_confidence * 100).toFixed(1)}%)
                      </span>
                    </td>
                    <td className="p-3.5 text-cyan-300 font-mono">
                      {item.rf_prediction}
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-1 rounded-full border text-[11px] font-bold whitespace-nowrap ${getActionBadgeColor(item.final_action)}`}>
                        {item.final_action.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-300 text-[11px] max-w-xs truncate" title={item.reason}>
                      <span className="text-slate-400 font-semibold block text-[10px]">{item.rule_triggered}</span>
                      {item.reason}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-400">
            <History size={36} className="mx-auto mb-3 text-slate-400" />
            <h4 className="text-sm font-bold text-white mb-1">No Prediction History Found</h4>
            <p className="text-xs">Submit predictions on the Traffic Prediction page to build an audit trail.</p>
          </div>
        )}
      </div>

      {/* Modal / Detail View */}
      {selectedItem && (
        <div className="fixed inset-0 bg-navy-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-navy-900 border border-navy-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between border-b border-navy-800 pb-3">
              <div>
                <h4 className="text-sm font-bold text-white font-mono">{selectedItem.prediction_id}</h4>
                <div className="text-[10px] text-slate-400">{selectedItem.timestamp}</div>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="text-center py-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Final AI Decision</span>
              <span className={`inline-block text-xl font-black px-4 py-1.5 rounded-xl border ${getActionBadgeColor(selectedItem.final_action)}`}>
                {selectedItem.final_action.replace('_', ' ')}
              </span>
              <p className="text-xs text-slate-300 mt-2 italic">"{selectedItem.reason}"</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-navy-950 p-4 rounded-xl border border-navy-800">
              <div><span className="text-slate-400">Queue Length:</span> <strong className="text-white">{selectedItem.queue_length} veh</strong></div>
              <div><span className="text-slate-400">Waiting Time:</span> <strong className="text-white">{selectedItem.waiting_time}s</strong></div>
              <div><span className="text-slate-400">Average Speed:</span> <strong className="text-white">{selectedItem.average_speed} km/h</strong></div>
              <div><span className="text-slate-400">Emergency:</span> <strong className="text-white">{selectedItem.emergency_vehicle ? 'YES' : 'NO'}</strong></div>
              <div><span className="text-slate-400">Signal:</span> <strong className="text-white uppercase">{selectedItem.current_signal}</strong></div>
              <div><span className="text-slate-400">Density:</span> <strong className="text-white uppercase">{selectedItem.traffic_density}</strong></div>
              <div><span className="text-slate-400">LSTM:</span> <strong className="text-indigo-300">{selectedItem.lstm_prediction} ({(selectedItem.lstm_confidence * 100).toFixed(1)}%)</strong></div>
              <div><span className="text-slate-400">Random Forest:</span> <strong className="text-cyan-300">{selectedItem.rf_prediction}</strong></div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedItem(null)}
                className="px-4 py-1.5 bg-navy-800 hover:bg-navy-700 text-xs font-semibold text-white rounded-lg transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

