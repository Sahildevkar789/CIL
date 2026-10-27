import pytest
import numpy as np
from decision_engine import evaluate_decision

CLASSES = ["emergency_priority", "extend_green", "maintain", "reduce_green", "switch_signal"]

def test_rule_1_emergency_vehicle_override():
    # Emergency vehicle is present (1)
    traffic_input = {"emergency_vehicle": 1}
    # Even if models predict extend_green
    lstm_probs = np.array([0.05, 0.90, 0.02, 0.02, 0.01])
    rf_pred = 1 # extend_green

    res = evaluate_decision(traffic_input, lstm_probs, rf_pred, CLASSES)
    assert res["final_action"] == "emergency_priority"
    assert res["rule_triggered"] == "Emergency Priority Override"
    assert "Emergency vehicle detected" in res["reason"]

def test_rule_2_low_confidence_fallback():
    # No emergency vehicle
    traffic_input = {"emergency_vehicle": 0}
    # Max confidence is 0.55 (< threshold 0.60)
    lstm_probs = np.array([0.05, 0.55, 0.20, 0.10, 0.10])
    rf_pred = 2 # maintain

    res = evaluate_decision(traffic_input, lstm_probs, rf_pred, CLASSES, confidence_threshold=0.60)
    assert res["final_action"] == "maintain"
    assert res["rule_triggered"] == "Low-Confidence Fallback"
    assert "LSTM confidence is low" in res["reason"]

def test_rule_3_models_agree():
    traffic_input = {"emergency_vehicle": 0}
    # High confidence extend_green
    lstm_probs = np.array([0.02, 0.95, 0.01, 0.01, 0.01])
    rf_pred = 1 # extend_green

    res = evaluate_decision(traffic_input, lstm_probs, rf_pred, CLASSES, confidence_threshold=0.60)
    assert res["final_action"] == "extend_green"
    assert res["model_agreement"] is True
    assert res["rule_triggered"] == "Model Agreement"
    assert "LSTM and Random Forest predictions agree" in res["reason"]

def test_rule_4_conflict_fallback_policy():
    traffic_input = {"emergency_vehicle": 0}
    # LSTM predicts maintain with 0.70 (> 0.60), but RF predicts switch_signal
    lstm_probs = np.array([0.05, 0.10, 0.70, 0.05, 0.10]) # index 2 = maintain
    rf_pred = 4 # switch_signal

    res = evaluate_decision(traffic_input, lstm_probs, rf_pred, CLASSES, confidence_threshold=0.60)
    assert res["final_action"] == "switch_signal"
    assert res["model_agreement"] is False
    assert res["rule_triggered"] == "Conflict Fallback Policy"
    assert "Models disagree" in res["reason"]

