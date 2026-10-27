"""
Smart Traffic Management System - Flask REST API Backend (SMARTFLOW AI)
Loads trained notebook artifacts once and serves real-time traffic predictions,
Task 8 explainability data, Task 9 decision engine, and Task 10 validation.
"""

import os
import sys
import uuid
import json
from io import StringIO
from datetime import datetime

import numpy as np
import pandas as pd
import joblib

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    confusion_matrix, classification_report
)

import tensorflow as tf
from tensorflow.keras.models import load_model

from preprocessor import Preprocessor
from decision_engine import evaluate_decision
import database

DIST_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist"))
app = Flask(__name__, static_folder=DIST_DIR if os.path.exists(DIST_DIR) else None)
CORS(app, resources={r"/api/*": {"origins": "*"}})

MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")

# Global model state
models_loaded = False
load_errors = {}
preprocessor = None
random_forest = None
decision_tree = None
logistic_model = None
lstm_model = None
label_encoder = None
target_classes = []
historical_metrics = {}
dataset_summary = {}
lstm_history = {}

def load_all_artifacts():
    global models_loaded, load_errors, preprocessor
    global random_forest, decision_tree, logistic_model, lstm_model
    global label_encoder, target_classes, historical_metrics, dataset_summary, lstm_history

    load_errors = {}
    preprocessor = Preprocessor(model_dir=MODEL_DIR)

    # Load LabelEncoder
    le_path = os.path.join(MODEL_DIR, "label_encoder.joblib")
    if os.path.exists(le_path):
        try:
            label_encoder = joblib.load(le_path)
            target_classes = list(label_encoder.classes_)
        except Exception as e:
            load_errors["label_encoder"] = str(e)
    else:
        load_errors["label_encoder"] = "File not found"

    # Load Random Forest
    rf_path = os.path.join(MODEL_DIR, "random_forest.joblib")
    if os.path.exists(rf_path):
        try:
            random_forest = joblib.load(rf_path)
        except Exception as e:
            load_errors["random_forest"] = str(e)
    else:
        load_errors["random_forest"] = "File not found"

    # Load Decision Tree
    dt_path = os.path.join(MODEL_DIR, "decision_tree.joblib")
    if os.path.exists(dt_path):
        try:
            decision_tree = joblib.load(dt_path)
        except Exception as e:
            load_errors["decision_tree"] = str(e)

    # Load Logistic Regression
    lr_path = os.path.join(MODEL_DIR, "logistic_regression.joblib")
    if os.path.exists(lr_path):
        try:
            logistic_model = joblib.load(lr_path)
        except Exception as e:
            load_errors["logistic_regression"] = str(e)

    # Load native Keras LSTM
    lstm_path = os.path.join(MODEL_DIR, "lstm_model.keras")
    if os.path.exists(lstm_path):
        try:
            lstm_model = load_model(lstm_path)
        except Exception as e:
            load_errors["lstm_model"] = str(e)
    else:
        load_errors["lstm_model"] = "File not found"

    # Load JSON metrics
    hist_path = os.path.join(MODEL_DIR, "historical_metrics.json")
    if os.path.exists(hist_path):
        try:
            with open(hist_path, "r") as f:
                historical_metrics = json.load(f)
        except Exception as e:
            load_errors["historical_metrics"] = str(e)

    sum_path = os.path.join(MODEL_DIR, "dataset_summary.json")
    if os.path.exists(sum_path):
        try:
            with open(sum_path, "r") as f:
                dataset_summary = json.load(f)
        except Exception as e:
            load_errors["dataset_summary"] = str(e)

    hist_lstm_path = os.path.join(MODEL_DIR, "lstm_history.json")
    if os.path.exists(hist_lstm_path):
        try:
            with open(hist_lstm_path, "r") as f:
                lstm_history = json.load(f)
        except Exception as e:
            load_errors["lstm_history"] = str(e)

    if not preprocessor.is_ready():
        load_errors["preprocessor"] = "Fitted scaler or feature metadata missing"

    models_loaded = (
        len(load_errors) == 0
        and random_forest is not None
        and lstm_model is not None
        and preprocessor.is_ready()
    )

# Initialize database and load artifacts
database.init_db()
load_all_artifacts()

# -------------------------------------------------------------
# 1. GET /api/health
# -------------------------------------------------------------
@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({
        "status": "healthy" if models_loaded else "degraded",
        "service": "SMARTFLOW AI Traffic Management Engine",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "artifacts_loaded": models_loaded,
        "active_models": {
            "random_forest": random_forest is not None,
            "lstm": lstm_model is not None,
            "decision_tree": decision_tree is not None,
            "logistic_regression": logistic_model is not None,
            "scaler": preprocessor.scaler is not None,
            "label_encoder": label_encoder is not None
        }
    })

# -------------------------------------------------------------
# 2. GET /api/models/status
# -------------------------------------------------------------
@app.route("/api/models/status", methods=["GET"])
def model_status():
    return jsonify({
        "models_ready": models_loaded,
        "load_errors": load_errors,
        "target_classes": target_classes,
        "selected_features": preprocessor.selected_features if preprocessor else [],
        "models": {
            "random_forest": {
                "loaded": random_forest is not None,
                "type": "RandomForestClassifier(n_estimators=100, random_state=42)",
                "historical_accuracy": historical_metrics.get("random_forest", {}).get("accuracy", 0.8827)
            },
            "lstm": {
                "loaded": lstm_model is not None,
                "type": "Sequential(LSTM(64) -> Dropout(0.3) -> Dense(32) -> Dropout(0.2) -> Dense(5))",
                "historical_accuracy": historical_metrics.get("lstm", {}).get("accuracy", 0.8010)
            },
            "decision_tree": {
                "loaded": decision_tree is not None,
                "type": "DecisionTreeClassifier(max_depth=6, random_state=42)",
                "historical_accuracy": historical_metrics.get("decision_tree", {}).get("accuracy", 0.8622)
            },
            "logistic_regression": {
                "loaded": logistic_model is not None,
                "type": "LogisticRegression(max_iter=1000, random_state=42)",
                "historical_accuracy": historical_metrics.get("logistic_regression", {}).get("accuracy", 0.8010)
            }
        }
    })

# -------------------------------------------------------------
# 3. POST /api/predict
# -------------------------------------------------------------
@app.route("/api/predict", methods=["POST"])
def predict():
    if not models_loaded:
        return jsonify({
            "error": "Models or preprocessing artifacts are not fully loaded.",
            "details": load_errors
        }), 503

    payload = request.get_json(silent=True)
    if not payload:
        return jsonify({"error": "Request body must be valid JSON."}), 400

    try:
        # Validate inputs
        validated = preprocessor.validate_input(payload)
        confidence_threshold = float(payload.get("confidence_threshold", 0.60))

        # Transform features
        X_2d, X_3d, full_features = preprocessor.transform(validated)

        # Scikit-learn Random Forest prediction
        rf_pred_idx = int(random_forest.predict(X_2d)[0])
        rf_probs = random_forest.predict_proba(X_2d)[0] if hasattr(random_forest, "predict_proba") else []

        # Keras LSTM prediction
        lstm_raw_probs = lstm_model.predict(X_3d, verbose=0)[0]

        # Decision engine
        decision = evaluate_decision(
            traffic_input=full_features,
            lstm_probabilities=lstm_raw_probs,
            rf_prediction_index=rf_pred_idx,
            target_classes=target_classes,
            confidence_threshold=confidence_threshold
        )

        prediction_id = f"PRED-{uuid.uuid4().hex[:8].upper()}"
        timestamp = datetime.utcnow().isoformat() + "Z"

        # Record to SQLite database
        history_record = {
            "prediction_id": prediction_id,
            "timestamp": timestamp,
            "queue_length": validated["queue_length"],
            "waiting_time": validated["waiting_time"],
            "average_speed": validated["average_speed"],
            "emergency_vehicle": validated["emergency_vehicle"],
            "current_signal": validated["current_signal"],
            "traffic_density": validated["traffic_density"],
            "lstm_prediction": decision["lstm_prediction"],
            "lstm_confidence": decision["lstm_confidence"],
            "rf_prediction": decision["rf_prediction"],
            "model_agreement": decision["model_agreement"],
            "final_action": decision["final_action"],
            "reason": decision["reason"],
            "rule_triggered": decision["rule_triggered"]
        }
        database.insert_prediction(history_record)

        response = {
            "prediction_id": prediction_id,
            "timestamp": timestamp,
            "inputs": validated,
            "features_prepared": {col: float(val) for col, val in full_features.items()},
            "decision": decision,
            "model_details": {
                "lstm": {
                    "prediction": decision["lstm_prediction"],
                    "confidence": decision["lstm_confidence"],
                    "class_probabilities": decision["probabilities"]
                },
                "random_forest": {
                    "prediction": decision["rf_prediction"],
                    "class_probabilities": {
                        cls: round(float(prob), 4)
                        for cls, prob in zip(target_classes, rf_probs)
                    } if len(rf_probs) > 0 else {}
                }
            },
            "disclaimer": "Prototype advisory system for research demonstration. Does not directly actuate physical signals."
        }
        return jsonify(response), 200

    except ValueError as ve:
        return jsonify({"error": "Validation error", "message": str(ve)}), 422
    except Exception as e:
        return jsonify({"error": "Prediction failure", "message": str(e)}), 500

# -------------------------------------------------------------
# 4. GET /api/metrics
# -------------------------------------------------------------
@app.route("/api/metrics", methods=["GET"])
def metrics():
    return jsonify({
        "status": "success",
        "historical_metrics": historical_metrics,
        "dataset_summary": dataset_summary,
        "lstm_training_history": lstm_history,
        "target_classes": target_classes,
        "is_historical": True,
        "notes": "Historical notebook evaluation metrics measured on 196 stratified held-out test records."
    })

# -------------------------------------------------------------
# 5. GET /api/history
# -------------------------------------------------------------
@app.route("/api/history", methods=["GET"])
def history():
    limit = request.args.get("limit", default=50, type=int)
    offset = request.args.get("offset", default=0, type=int)
    data = database.get_predictions(limit=limit, offset=offset)
    return jsonify(data)

@app.route("/api/history/clear", methods=["POST"])
def clear_history():
    database.clear_predictions()
    return jsonify({"status": "success", "message": "Prediction history cleared."})

# -------------------------------------------------------------
# 6. POST /api/validate
# -------------------------------------------------------------
@app.route("/api/validate", methods=["POST"])
def validate_dataset():
    """
    Evaluates new or held-out dataset records.
    Accepts CSV file upload or JSON payload list of records.
    Calculates live metrics if ground-truth labels ('action' or 'actual_action') exist.
    """
    if not models_loaded:
        return jsonify({"error": "Models are not loaded."}), 503

    rows_data = []

    # Check file upload
    if "file" in request.files:
        uploaded_file = request.files["file"]
        if uploaded_file.filename == "":
            return jsonify({"error": "No file selected."}), 400
        content = uploaded_file.read().decode("utf-8")
        df_upload = pd.read_csv(StringIO(content))
        rows_data = df_upload.to_dict(orient="records")
    else:
        req_json = request.get_json(silent=True)
        if isinstance(req_json, list):
            rows_data = req_json
        elif isinstance(req_json, dict) and "records" in req_json:
            rows_data = req_json["records"]
        else:
            return jsonify({"error": "Invalid input format. Provide CSV file or JSON records array."}), 400

    if not rows_data:
        return jsonify({"error": "Empty dataset provided."}), 400

    results = []
    has_labels = False
    y_true_list = []
    y_pred_rf_list = []
    y_pred_lstm_list = []
    y_pred_system_list = []

    for idx, row in enumerate(rows_data):
        try:
            # Check if record already has processed features or raw features
            has_raw = all(k in row for k in ["queue_length", "waiting_time", "average_speed", "emergency_vehicle", "current_signal", "traffic_density"])
            if has_raw:
                val_row = preprocessor.validate_input(row)
                X_2d, X_3d, full_feat = preprocessor.transform(val_row)
            else:
                # Pre-scaled format matching selected features
                feat_vals = [float(row[f]) for f in preprocessor.selected_features]
                X_2d = np.array([feat_vals], dtype=np.float32)
                X_3d = X_2d.reshape(1, 1, len(preprocessor.selected_features))
                full_feat = row

            rf_idx = int(random_forest.predict(X_2d)[0])
            lstm_probs = lstm_model.predict(X_3d, verbose=0)[0]
            lstm_idx = int(np.argmax(lstm_probs))

            decision = evaluate_decision(
                traffic_input=full_feat,
                lstm_probabilities=lstm_probs,
                rf_prediction_index=rf_idx,
                target_classes=target_classes
            )

            # Ground-truth label check
            true_label = row.get("actual_action") or row.get("action")
            if true_label and str(true_label).strip() in target_classes:
                has_labels = True
                y_true_list.append(str(true_label).strip())
                y_pred_rf_list.append(decision["rf_prediction"])
                y_pred_lstm_list.append(decision["lstm_prediction"])
                y_pred_system_list.append(decision["final_action"])
                decision["actual_action"] = str(true_label).strip()
                decision["correct"] = bool(decision["final_action"] == str(true_label).strip())

            decision["record_index"] = idx
            results.append(decision)

        except Exception as e:
            results.append({
                "record_index": idx,
                "error": str(e)
            })

    summary = {
        "total_records": len(results),
        "has_ground_truth": has_labels,
        "agreement_count": sum(1 for r in results if r.get("model_agreement", False)),
        "emergency_overrides": sum(1 for r in results if r.get("rule_triggered") == "Emergency Priority Override"),
        "low_confidence_fallbacks": sum(1 for r in results if r.get("rule_triggered") == "Low-Confidence Fallback"),
        "conflict_fallbacks": sum(1 for r in results if r.get("rule_triggered") == "Conflict Fallback Policy"),
    }

    if has_labels and len(y_true_list) > 0:
        y_true = np.array(y_true_list)
        y_sys = np.array(y_pred_system_list)
        y_rf = np.array(y_pred_rf_list)
        y_lstm = np.array(y_pred_lstm_list)

        correct_count = int(np.sum(y_true == y_sys))
        summary["evaluation"] = {
            "correct_decisions": correct_count,
            "incorrect_decisions": len(y_true) - correct_count,
            "integrated_accuracy": float(round(accuracy_score(y_true, y_sys), 4)),
            "rf_accuracy": float(round(accuracy_score(y_true, y_rf), 4)),
            "lstm_accuracy": float(round(accuracy_score(y_true, y_lstm), 4)),
            "precision": float(round(precision_score(y_true, y_sys, average="weighted", zero_division=0), 4)),
            "recall": float(round(recall_score(y_true, y_sys, average="weighted", zero_division=0), 4)),
            "f1_score": float(round(f1_score(y_true, y_sys, average="weighted", zero_division=0), 4)),
            "confusion_matrix": confusion_matrix(y_true, y_sys, labels=target_classes).tolist(),
            "target_classes": target_classes
        }

    return jsonify({
        "status": "success",
        "summary": summary,
        "sample_records": results[:50]
    })

# -------------------------------------------------------------
# 7. Frontend Static Files Route
# -------------------------------------------------------------
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_frontend(path):
    if app.static_folder and os.path.exists(app.static_folder):
        if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
            return send_from_directory(app.static_folder, path)
        index_file = os.path.join(app.static_folder, "index.html")
        if os.path.exists(index_file):
            return send_from_directory(app.static_folder, "index.html")
    return jsonify({
        "status": "SMARTFLOW AI API Backend",
        "message": "API is active. Frontend is building or running on Vite dev server."
    })

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print(f"Starting SMARTFLOW AI API Server on http://127.0.0.1:{port}")
    app.run(host="0.0.0.0", port=port, debug=False)
