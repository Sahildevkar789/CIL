"""
Task 9 AI Decision Engine for Smart Traffic Management System.
Implements the exact AI reasoning rules from notebook Cell 64.
"""

import numpy as np

def evaluate_decision(
    traffic_input,
    lstm_probabilities,
    rf_prediction_index,
    target_classes,
    confidence_threshold=0.60
):
    """
    Executes the exact decision logic from Task 9:
    1. Safety rule: emergency vehicle gets priority (emergency override).
    2. Low confidence rule: if LSTM confidence < threshold, fallback to Random Forest.
    3. Agreement rule: if LSTM and RF agree, use agreed action.
    4. Conflict rule: if models disagree and LSTM >= threshold, apply RF fallback policy.

    Parameters:
        traffic_input (dict): features dict containing 'emergency_vehicle'
        lstm_probabilities (np.ndarray): 1D array of class probabilities from LSTM
        rf_prediction_index (int): class index predicted by Random Forest
        target_classes (list): list of class label strings
        confidence_threshold (float): confidence cutoff (default 0.60)

    Returns:
        dict: decision results with reasons and rule trigger status
    """
    lstm_index = int(np.argmax(lstm_probabilities))
    lstm_action = target_classes[lstm_index]
    lstm_confidence = float(np.max(lstm_probabilities))
    rf_action = target_classes[int(rf_prediction_index)]

    # Rule 1: Emergency priority rule
    if int(traffic_input.get("emergency_vehicle", 0)) == 1:
        final_action = "emergency_priority"
        reason = "Emergency vehicle detected; emergency priority rule applied."
        rule_triggered = "Emergency Priority Override"
    # Rule 2: Low-confidence fallback
    elif lstm_confidence < confidence_threshold:
        final_action = rf_action
        reason = "LSTM confidence is low; Random Forest fallback used."
        rule_triggered = "Low-Confidence Fallback"
    # Rule 3: Agreement
    elif lstm_action == rf_action:
        final_action = lstm_action
        reason = "LSTM and Random Forest predictions agree."
        rule_triggered = "Model Agreement"
    # Rule 4: Conflict fallback policy
    else:
        final_action = rf_action
        reason = "Models disagree; Random Forest fallback policy applied."
        rule_triggered = "Conflict Fallback Policy"

    prob_dict = {
        cls: round(float(prob), 4)
        for cls, prob in zip(target_classes, lstm_probabilities)
    }

    return {
        "lstm_prediction": lstm_action,
        "lstm_confidence": round(lstm_confidence, 4),
        "rf_prediction": rf_action,
        "model_agreement": bool(lstm_action == rf_action),
        "final_action": final_action,
        "reason": reason,
        "rule_triggered": rule_triggered,
        "probabilities": prob_dict
    }

