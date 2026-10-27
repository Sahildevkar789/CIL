export interface PredictionRequest {
  queue_length: number;
  waiting_time: number;
  average_speed: number;
  emergency_vehicle: string;
  current_signal: string;
  traffic_density: string;
  confidence_threshold?: number;
}

export interface DecisionResult {
  lstm_prediction: string;
  lstm_confidence: number;
  rf_prediction: string;
  model_agreement: boolean;
  final_action: string;
  reason: string;
  rule_triggered: string;
  probabilities: Record<string, number>;
}

export interface PredictionResponse {
  prediction_id: string;
  timestamp: string;
  inputs: {
    queue_length: number;
    waiting_time: number;
    average_speed: number;
    emergency_vehicle: number;
    current_signal: string;
    traffic_density: string;
  };
  features_prepared: Record<string, number>;
  decision: DecisionResult;
  model_details: {
    lstm: {
      prediction: string;
      confidence: number;
      class_probabilities: Record<string, number>;
    };
    random_forest: {
      prediction: string;
      class_probabilities?: Record<string, number>;
    };
  };
  disclaimer: string;
}

export interface HistoricalMetrics {
  logistic_regression: { accuracy: number; precision: number; recall: number; f1: number };
  decision_tree: { accuracy: number; precision: number; recall: number; f1: number };
  random_forest: { accuracy: number; precision: number; recall: number; f1: number };
  lstm: { accuracy: number; precision: number; recall: number; f1: number };
  integrated_system: { accuracy: number; precision: number; recall: number; f1: number };
  confusion_matrices: {
    random_forest: number[][];
    lstm: number[][];
    integrated_system: number[][];
  };
  target_classes: string[];
  test_records_count: number;
  system_validation: {
    test_records: number;
    correct_decisions: number;
    incorrect_decisions: number;
    model_agreement_rate: number;
    low_confidence_lstm_rate: number;
    emergency_override_count: number;
  };
  rf_feature_importance: Array<{ feature: string; importance: number }>;
  lstm_feature_importance: Array<{ feature: string; importance: number }>;
  mutual_information_scores: Array<{ feature: string; score: number }>;
}

export interface DatasetSummary {
  raw_total_records: number;
  clean_records: number;
  clean_columns: number;
  missing_values_handled: number;
  duplicates_removed: number;
  outliers_detected: number;
  numerical_medians: Record<string, number>;
  categorical_modes: Record<string, string>;
  scaling_means: Record<string, number>;
  scaling_scales: Record<string, number>;
  action_distribution: Record<string, number>;
  traffic_density_distribution: Record<string, number>;
  current_signal_distribution: Record<string, number>;
  emergency_vehicle_distribution: Record<string, number>;
}

export interface LstmHistory {
  epochs: number[];
  accuracy: number[];
  val_accuracy: number[];
  loss: number[];
  val_loss: number[];
}

export interface MetricsResponse {
  status: string;
  historical_metrics: HistoricalMetrics;
  dataset_summary: DatasetSummary;
  lstm_training_history: LstmHistory;
  target_classes: string[];
  is_historical: boolean;
  notes: string;
}

export interface HistoryItem {
  id: number;
  prediction_id: string;
  timestamp: string;
  queue_length: number;
  waiting_time: number;
  average_speed: number;
  emergency_vehicle: number;
  current_signal: string;
  traffic_density: string;
  lstm_prediction: string;
  lstm_confidence: number;
  rf_prediction: string;
  model_agreement: number;
  final_action: string;
  reason: string;
  rule_triggered: string;
}

export interface HistoryResponse {
  items: HistoryItem[];
  total: number;
  limit: number;
  offset: number;
}

