import React, { useState, useEffect } from 'react';
import { PageId, Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { MetricsResponse } from './types';
import { checkHealth, getMetrics } from './api';

// Pages
import { OverviewDashboard } from './pages/OverviewDashboard';
import { TrafficPredictionForm } from './pages/TrafficPredictionForm';
import { DatasetSummary } from './pages/DatasetSummary';
import { ModelComparison } from './pages/ModelComparison';
import { LstmResults } from './pages/LstmResults';
import { Explainability } from './pages/Explainability';
import { DecisionEnginePage } from './pages/DecisionEnginePage';
import { ResponsibleAIValidation } from './pages/ResponsibleAIValidation';
import { PredictionHistory } from './pages/PredictionHistory';
import { AboutProject } from './pages/AboutProject';

export const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageId>('overview');
  const [metrics, setMetrics] = useState<MetricsResponse | null>(null);
  const [backendOnline, setBackendOnline] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = async () => {
    setIsRefreshing(true);
    try {
      const health = await checkHealth();
      setBackendOnline(health.status === 'healthy');
      const metricsData = await getMetrics();
      setMetrics(metricsData);
    } catch (err) {
      console.error('Failed to load metrics or health:', err);
      setBackendOnline(false);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
    // Periodic health check every 15 seconds
    const interval = setInterval(async () => {
      try {
        const h = await checkHealth();
        setBackendOnline(h.status === 'healthy');
      } catch {
        setBackendOnline(false);
      }
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case 'overview':
        return <OverviewDashboard metrics={metrics} onNavigate={setCurrentPage} />;
      case 'predict':
        return <TrafficPredictionForm />;
      case 'dataset':
        return <DatasetSummary metrics={metrics} />;
      case 'ml_models':
        return <ModelComparison metrics={metrics} />;
      case 'lstm':
        return <LstmResults metrics={metrics} />;
      case 'explainability':
        return <Explainability metrics={metrics} />;
      case 'decision_engine':
        return <DecisionEnginePage />;
      case 'validation':
        return <ResponsibleAIValidation metrics={metrics} />;
      case 'history':
        return <PredictionHistory />;
      case 'about':
        return <AboutProject />;
      default:
        return <OverviewDashboard metrics={metrics} onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-navy-950 text-slate-100">
      {/* Sidebar Navigation */}
      <Sidebar
        currentPage={currentPage}
        onSelectPage={setCurrentPage}
        backendOnline={backendOnline}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          currentPage={currentPage}
          onRefresh={loadData}
          isRefreshing={isRefreshing}
        />

        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {!backendOnline && (
            <div className="mb-6 p-4 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span>Backend Flask API not detected on port 5000. Start the backend with: <code>powershell -File .\run_backend.ps1</code></span>
              </div>
              <button
                onClick={loadData}
                className="underline hover:text-white font-semibold"
              >
                Retry Connection
              </button>
            </div>
          )}

          {renderPage()}
        </main>
      </div>
    </div>
  );
};

export default App;

