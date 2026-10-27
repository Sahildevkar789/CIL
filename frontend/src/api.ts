import {
  PredictionRequest,
  PredictionResponse,
  MetricsResponse,
  HistoryResponse
} from './types';

const API_BASE = '/api';

export async function checkHealth() {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error(`Health check failed: ${res.statusText}`);
  return res.json();
}

export async function getModelStatus() {
  const res = await fetch(`${API_BASE}/models/status`);
  if (!res.ok) throw new Error(`Model status failed: ${res.statusText}`);
  return res.json();
}

export async function getMetrics(): Promise<MetricsResponse> {
  const res = await fetch(`${API_BASE}/metrics`);
  if (!res.ok) throw new Error(`Failed to load metrics: ${res.statusText}`);
  return res.json();
}

export async function predictTraffic(req: PredictionRequest): Promise<PredictionResponse> {
  const res = await fetch(`${API_BASE}/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || data.error || 'Prediction request failed');
  }
  return data;
}

export async function getHistory(limit = 50, offset = 0): Promise<HistoryResponse> {
  const res = await fetch(`${API_BASE}/history?limit=${limit}&offset=${offset}`);
  if (!res.ok) throw new Error(`History fetch failed: ${res.statusText}`);
  return res.json();
}

export async function clearHistory() {
  const res = await fetch(`${API_BASE}/history/clear`, { method: 'POST' });
  return res.json();
}

export async function validateDataset(formData: FormData) {
  const res = await fetch(`${API_BASE}/validate`, {
    method: 'POST',
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || data.error || 'Dataset validation failed');
  }
  return data;
}

