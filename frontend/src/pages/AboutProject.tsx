import React from 'react';
import {
  Info,
  BookOpen,
  Code2,
  ShieldCheck,
  Cpu,
  CheckCircle2,
  Terminal,
  FileCode,
  Layers,
  Database
} from 'lucide-react';

export const AboutProject: React.FC = () => {
  const taskDetails = [
    {
      task: 'Task 4',
      title: 'Data Exploration & Preprocessing',
      desc: 'Explored raw sensor distributions, introduced controlled noise/missing data, imputed with medians and modes, removed duplicates, standardized numerical features with StandardScaler, and one-hot encoded signal directions and traffic densities.',
      tech: 'Pandas, NumPy, Scikit-Learn StandardScaler',
    },
    {
      task: 'Task 5',
      title: 'Feature Selection & Train-Test Split',
      desc: 'Applied Mutual Information (mutual_info_classif) to select the top 8 most informative traffic features. Stratified 80/20 train-test split (782 train / 196 test). Fitted initial Random Forest importance.',
      tech: 'Scikit-Learn mutual_info_classif, train_test_split',
    },
    {
      task: 'Task 6',
      title: 'Machine Learning Model Benchmarking',
      desc: 'Trained and evaluated Logistic Regression (max_iter=1000), Decision Tree (max_depth=6), and Random Forest (100 estimators). Random Forest emerged as the top ML model with 88.27% accuracy on held-out records.',
      tech: 'LogisticRegression, DecisionTreeClassifier, RandomForestClassifier',
    },
    {
      task: 'Task 7',
      title: 'Deep Representation Learning (LSTM)',
      desc: 'Designed and trained a deep recurrent neural network with a 64-unit LSTM layer, 30% dropout, 32-neuron Dense ReLU layer, 20% dropout, and a 5-class Softmax layer using the Adam optimizer and early stopping.',
      tech: 'TensorFlow / Keras Sequential, LSTM, Adam',
    },
    {
      task: 'Task 8',
      title: 'Interpretability & Permutation Analysis',
      desc: 'Contrasted global Random Forest Gini MDI importance against custom 3D LSTM permutation feature importance (accuracy drop upon feature shuffling). Evaluated prediction confidence distributions.',
      tech: 'Permutation Importance, Gini Impurity, Confidence Histograms',
    },
    {
      task: 'Task 9',
      title: 'Integrated AI Decision Engine',
      desc: 'Built a 4-tier safety and conflict resolution rule engine unifying LSTM sequence probabilities and Random Forest classification with strict emergency vehicle safety overrides.',
      tech: 'Python AI Rule Engine, Emergency Prioritization Protocol',
    },
    {
      task: 'Task 10',
      title: 'Held-out Validation & Responsible AI',
      desc: 'Validated the integrated system on 196 held-out records (achieving 88.27% accuracy, 86.73% agreement). Conducted a comprehensive 7-point Responsible AI ethical and safety audit.',
      tech: 'Confusion Matrices, Classification Reports, Ethical Audit Checklist',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="bg-navy-900/90 border border-navy-800 rounded-2xl p-8 shadow-xl">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/20 text-cyan-400">
            <BookOpen size={24} />
          </div>
          <div>
            <span className="text-xs font-mono text-cyan-300 font-bold uppercase tracking-wider">
              Course Project • CELBC710
            </span>
            <h1 className="text-2xl font-extrabold text-white">
              Computational Intelligence Laboratory (Tasks 4–10)
            </h1>
          </div>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed max-w-4xl">
          This application represents the complete, fully functional local graphical user interface built around the original Colab notebook <code className="text-cyan-300 bg-navy-950 px-2 py-0.5 rounded border border-navy-800">Smart_Traffic_Management_Task4_(1).ipynb</code>. It faithfully preserves all original model architectures, hyperparameters, feature order, and decision rules.
        </p>
      </div>

      {/* Task-by-Task Implementation Summary */}
      <div className="bg-navy-900/90 border border-navy-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
          <Layers className="text-cyan-400" size={18} />
          Academic Task Breakdown & Verification
        </h3>
        <p className="text-xs text-slate-400">
          Every requirement specified in Tasks 4 through 10 is executed natively by the local Flask backend and displayed in this dashboard.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {taskDetails.map((td) => (
            <div key={td.task} className="bg-navy-950/80 border border-navy-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-400 font-mono bg-navy-900 px-2.5 py-0.5 rounded border border-navy-700">
                  {td.task}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">{td.tech}</span>
              </div>
              <h4 className="text-sm font-bold text-white">{td.title}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{td.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Technology Stack & Preservation Guarantees */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-navy-900/90 border border-navy-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h4 className="text-base font-bold text-white flex items-center gap-2">
            <Cpu size={18} className="text-cyan-400" />
            Full Stack Technologies
          </h4>
          <ul className="text-xs text-slate-300 space-y-2.5">
            <li className="flex items-start gap-2">
              <CheckCircle2 size={16} className="text-cyan-400 shrink-0 mt-0.5" />
              <span><strong>Frontend:</strong> React 18, Vite 6, TypeScript 5, Tailwind CSS, Recharts for data visualizations, and Lucide React icons.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 size={16} className="text-cyan-400 shrink-0 mt-0.5" />
              <span><strong>Backend API:</strong> Python 3.11 Flask REST API with CORS, Pytest unit tests, and modular architecture.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 size={16} className="text-cyan-400 shrink-0 mt-0.5" />
              <span><strong>Machine Learning:</strong> Scikit-Learn (Random Forest, Decision Tree, Logistic Regression, StandardScaler, LabelEncoder).</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 size={16} className="text-cyan-400 shrink-0 mt-0.5" />
              <span><strong>Deep Learning:</strong> TensorFlow 2.21 / Keras LSTM with native <code className="text-cyan-300 font-mono">.keras</code> artifact export.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 size={16} className="text-cyan-400 shrink-0 mt-0.5" />
              <span><strong>Persistence:</strong> Local SQLite database with audit timestamps, inputs, model outputs, and rule reasons.</span>
            </li>
          </ul>
        </div>

        <div className="bg-navy-900/90 border border-navy-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h4 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldCheck size={18} className="text-emerald-400" />
            Integrity & Reproducibility Guarantees
          </h4>
          <ul className="text-xs text-slate-300 space-y-2.5">
            <li className="flex items-start gap-2">
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Original Notebook Untouched:</strong> <code className="text-cyan-300 font-mono">Smart_Traffic_Management_Task4_(1).ipynb</code> remains 100% unchanged.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>No Synthetic Substitutions:</strong> The models running in the Flask API were fitted with the exact random seeds (<code className="text-cyan-300">seed=42</code>) and parameters from the notebook.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>No Fabricated Accuracy:</strong> Live inputs are dynamically evaluated; historical notebook benchmarks are clearly distinguished from live test inferences.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

