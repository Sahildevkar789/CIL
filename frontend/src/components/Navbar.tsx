import React from 'react';
import { PageId } from './Sidebar';
import { ShieldCheck, RefreshCw, Layers } from 'lucide-react';

interface NavbarProps {
  currentPage: PageId;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onRefresh,
  isRefreshing,
}) => {
  const titles: Record<PageId, { title: string; subtitle: string }> = {
    overview: {
      title: 'SMARTFLOW AI Dashboard',
      subtitle: 'Real-time multi-model traffic signal optimization & management system',
    },
    predict: {
      title: 'Traffic Prediction & Signal Control Form',
      subtitle: 'Predict actions using the fitted Random Forest, LSTM, and Task 9 AI rule engine',
    },
    dataset: {
      title: 'Task 4: Data Exploration & Preprocessing Summary',
      subtitle: 'Dataset cleaning, missing value imputation, duplicate handling, and feature standardization',
    },
    ml_models: {
      title: 'Task 6: Machine Learning Model Comparison',
      subtitle: 'Performance comparison of Logistic Regression, Decision Tree, and Random Forest',
    },
    lstm: {
      title: 'Task 7: LSTM Deep Representation & Sequence Learning',
      subtitle: '64-unit recurrent neural network architecture, training curves, and held-out evaluation',
    },
    explainability: {
      title: 'Task 8: Interpretability & Feature Importance',
      subtitle: 'Random Forest MDI Gini importance vs. LSTM permutation drop analysis',
    },
    decision_engine: {
      title: 'Task 9: Integrated Intelligent Decision Engine',
      subtitle: 'Safety-critical emergency overrides, confidence fallback, and model conflict policies',
    },
    validation: {
      title: 'Task 10: System Validation & Responsible AI',
      subtitle: 'Held-out test verification (196 samples), confusion matrices, and fairness audit checklist',
    },
    history: {
      title: 'Prediction History & Audit Trail',
      subtitle: 'SQLite stored predictions, user inputs, model outputs, and decision explanations',
    },
    about: {
      title: 'About SMARTFLOW AI & Project Details',
      subtitle: 'CELBC710 Computational Intelligence Laboratory Tasks 4–10 Academic Project',
    },
  };

  const current = titles[currentPage] || { title: 'Dashboard', subtitle: '' };

  return (
    <header className="h-20 bg-navy-900/90 backdrop-blur border-b border-navy-800 px-8 flex items-center justify-between sticky top-0 z-20">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          {current.title}
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">{current.subtitle}</p>
      </div>

      <div className="flex items-center space-x-4">
        {/* Model Accuracy Badges */}
        <div className="hidden lg:flex items-center space-x-2 text-xs">
          <div className="px-3 py-1.5 rounded-lg bg-navy-800 border border-navy-700 flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span className="text-slate-400">Random Forest:</span>
            <span className="font-bold text-cyan-300">88.27%</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-navy-800 border border-navy-700 flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-indigo-400" />
            <span className="text-slate-400">LSTM:</span>
            <span className="font-bold text-indigo-300">80.10%</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center space-x-2 text-emerald-300">
            <ShieldCheck size={14} />
            <span className="font-bold">Integrated: 88.27%</span>
          </div>
        </div>

        {/* Refresh button */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="p-2.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-slate-300 hover:text-white border border-navy-700 transition-all"
          title="Refresh Data & Model Status"
        >
          <RefreshCw size={16} className={isRefreshing ? 'animate-spin text-cyan-400' : ''} />
        </button>
      </div>
    </header>
  );
};

