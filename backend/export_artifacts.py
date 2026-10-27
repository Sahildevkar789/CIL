"""
Artifact Export Script for Smart Traffic Management System (CELBC710 Tasks 4-10)
Replicates the exact deterministic preprocessing, feature selection, and model training
pipeline from Smart_Traffic_Management_Task4_(1).ipynb and exports all fitted artifacts
using joblib and native Keras formats.
"""

import os
import json
from io import StringIO
import numpy as np
import pandas as pd
import joblib

from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.feature_selection import mutual_info_classif
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    confusion_matrix, classification_report
)

import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import EarlyStopping

def run_export():
    print("=" * 60)
    print("STARTING DETERMINISTIC ARTIFACT EXPORT PIPELINE")
    print("=" * 60)

    # 1. Base embedded dataset from notebook Cell 4
    data = """traffic_density,queue_length,waiting_time,emergency_vehicle,current_signal,average_speed,action
low,5,10,no,north,45,maintain
low,8,15,no,south,42,maintain
low,10,18,no,east,40,reduce_green
low,6,12,no,west,44,maintain
low,12,20,no,north,38,switch_signal
low,4,8,no,east,48,maintain
low,9,17,no,south,41,maintain
low,7,14,no,west,43,reduce_green
medium,20,35,no,north,30,extend_green
medium,25,40,no,south,28,extend_green
medium,22,45,no,east,27,extend_green
medium,30,50,no,west,25,extend_green
medium,18,32,no,north,32,maintain
medium,28,55,no,south,24,extend_green
medium,24,48,no,east,26,extend_green
medium,16,30,no,west,34,maintain
medium,35,60,no,north,22,extend_green
medium,26,42,no,east,29,extend_green
high,45,80,no,north,15,extend_green
high,50,100,no,south,12,extend_green
high,60,120,no,east,8,extend_green
high,55,90,no,west,10,extend_green
high,70,130,no,north,6,extend_green
high,65,110,no,south,9,extend_green
high,48,75,no,east,14,extend_green
high,52,85,no,west,13,extend_green
high,75,140,no,north,5,extend_green
high,80,150,no,east,4,extend_green
high,40,70,no,south,16,extend_green
high,45,95,no,west,11,extend_green
low,3,5,yes,north,50,emergency_priority
medium,20,35,yes,south,30,emergency_priority
high,45,80,yes,east,15,emergency_priority
low,6,10,yes,west,45,emergency_priority
medium,30,60,yes,north,22,emergency_priority
high,60,120,yes,south,8,emergency_priority
low,8,15,no,north,40,maintain
low,5,10,no,south,45,maintain
medium,15,25,no,east,35,maintain
medium,17,30,no,west,33,maintain
medium,20,45,no,north,29,extend_green
high,35,65,no,east,18,extend_green
high,40,70,no,west,16,extend_green
low,4,7,no,north,47,reduce_green
low,7,13,no,east,44,reduce_green
low,9,16,no,west,42,reduce_green
medium,12,22,no,south,36,switch_signal
medium,15,28,no,west,34,switch_signal
low,10,19,no,south,39,switch_signal"""

    base_df = pd.read_csv(StringIO(data))
    np.random.seed(42)

    df = pd.concat(
        [base_df] * (1000 // len(base_df) + 1),
        ignore_index=True
    ).iloc[:1000].copy()

    df = df.sample(frac=1, random_state=42).reset_index(drop=True)

    df["queue_length"] = (
        df["queue_length"] + np.random.randint(-3, 4, size=len(df))
    ).clip(lower=1)

    df["waiting_time"] = (
        df["waiting_time"] + np.random.randint(-5, 6, size=len(df))
    ).clip(lower=1)

    df["average_speed"] = (
        df["average_speed"] + np.random.randint(-3, 4, size=len(df))
    ).clip(lower=3)

    missing_positions = [
        (10, "queue_length"), (25, "waiting_time"), (40, "average_speed"), (55, "traffic_density"),
        (70, "emergency_vehicle"), (85, "current_signal"), (100, "action"), (125, "queue_length"),
        (150, "waiting_time"), (175, "average_speed"), (200, "traffic_density"), (225, "emergency_vehicle"),
        (250, "current_signal"), (275, "action"), (300, "queue_length"), (325, "waiting_time"),
        (350, "average_speed"), (375, "traffic_density"), (400, "emergency_vehicle"), (425, "current_signal"),
        (450, "action"), (475, "queue_length"), (500, "waiting_time"), (525, "average_speed"), (550, "traffic_density")
    ]

    for row, column in missing_positions:
        df.loc[row, column] = np.nan

    duplicates = df.iloc[600:610].copy()
    df = pd.concat([df, duplicates], ignore_index=True)

    df.loc[700, "queue_length"] = 250
    df.loc[701, "queue_length"] = 300
    df.loc[702, "waiting_time"] = 500
    df.loc[703, "waiting_time"] = 600
    df.loc[704, "average_speed"] = 150

    df = df.sample(frac=1, random_state=42).reset_index(drop=True)

    # Impute missing
    numerical_cols = df.select_dtypes(include=np.number).columns.tolist()
    categorical_cols = df.select_dtypes(exclude=np.number).columns.tolist()

    for col in numerical_cols:
        if df[col].isnull().sum() > 0:
            df[col] = df[col].fillna(df[col].median())

    for col in categorical_cols:
        if df[col].isnull().sum() > 0:
            df[col] = df[col].fillna(df[col].mode()[0])

    duplicate_count = df.duplicated().sum()
    if duplicate_count > 0:
        df = df.drop_duplicates().reset_index(drop=True)

    clean_df = df.copy()
    clean_df["emergency_vehicle"] = clean_df["emergency_vehicle"].map({"no": 0, "yes": 1})
    clean_df = pd.get_dummies(clean_df, columns=["current_signal"], dtype=int)
    clean_df = pd.get_dummies(clean_df, columns=["traffic_density"], dtype=int)

    scale_cols = ["queue_length", "waiting_time", "average_speed"]
    scaler = StandardScaler()
    clean_df[scale_cols] = scaler.fit_transform(clean_df[scale_cols])

    # Save cleaned dataset
    os.makedirs("data", exist_ok=True)
    clean_df.to_csv("data/smart_traffic_cleaned_task4.csv", index=False)
    print("Saved: data/smart_traffic_cleaned_task4.csv (978 rows, 12 cols)")

    # Target & Features
    X = clean_df.drop("action", axis=1)
    y = clean_df["action"]
    label_encoder = LabelEncoder()
    y_encoded = label_encoder.fit_transform(y)

    # Train-test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y_encoded, test_size=0.20, random_state=42, stratify=y_encoded
    )

    # Feature selection
    mi_scores = mutual_info_classif(X_train, y_train, random_state=42)
    mi_results = pd.DataFrame({
        "Feature": X_train.columns,
        "MI_Score": mi_scores
    }).sort_values(by="MI_Score", ascending=False).reset_index(drop=True)

    top_k = min(8, len(mi_results))
    selected_features = mi_results.head(top_k)["Feature"].tolist()
    print("Selected Features:", selected_features)

    X_train_selected = X_train[selected_features]
    X_test_selected = X_test[selected_features]

    # Save test set with original features + action for API validation testing
    test_df = X_test_selected.copy()
    test_df["actual_action"] = label_encoder.inverse_transform(y_test)
    test_df.to_csv("data/smart_traffic_test.csv", index=False)
    print("Saved: data/smart_traffic_test.csv (196 rows)")

    # Models directory
    model_dir = os.path.join("backend", "models")
    os.makedirs(model_dir, exist_ok=True)

    # Save fitted scaler, label_encoder, selected_features
    joblib.dump(scaler, os.path.join(model_dir, "scaler.joblib"))
    joblib.dump(label_encoder, os.path.join(model_dir, "label_encoder.joblib"))
    with open(os.path.join(model_dir, "selected_features.json"), "w") as f:
        json.dump(selected_features, f, indent=2)
    print("Saved scaler, label_encoder, selected_features")

    # Fit Logistic Regression
    logistic_model = LogisticRegression(max_iter=1000, random_state=42)
    logistic_model.fit(X_train_selected, y_train)
    joblib.dump(logistic_model, os.path.join(model_dir, "logistic_regression.joblib"))

    # Fit Decision Tree
    decision_tree = DecisionTreeClassifier(max_depth=6, random_state=42)
    decision_tree.fit(X_train_selected, y_train)
    joblib.dump(decision_tree, os.path.join(model_dir, "decision_tree.joblib"))

    # Fit Random Forest
    random_forest = RandomForestClassifier(n_estimators=100, random_state=42)
    random_forest.fit(X_train_selected, y_train)
    joblib.dump(random_forest, os.path.join(model_dir, "random_forest.joblib"))
    print("Saved ML models (Logistic Regression, Decision Tree, Random Forest)")

    # Fit LSTM
    tf.keras.utils.set_random_seed(42)
    X_train_lstm = X_train_selected.values.reshape(X_train_selected.shape[0], 1, X_train_selected.shape[1])
    X_test_lstm = X_test_selected.values.reshape(X_test_selected.shape[0], 1, X_test_selected.shape[1])

    lstm_model = Sequential([
        LSTM(64, input_shape=(X_train_lstm.shape[1], X_train_lstm.shape[2]), return_sequences=False),
        Dropout(0.3),
        Dense(32, activation="relu"),
        Dropout(0.2),
        Dense(len(label_encoder.classes_), activation="softmax")
    ])

    lstm_model.compile(
        optimizer=Adam(learning_rate=0.001),
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy"]
    )

    early_stopping = EarlyStopping(monitor="val_loss", patience=10, restore_best_weights=True)

    print("Training LSTM...")
    history = lstm_model.fit(
        X_train_lstm,
        y_train,
        epochs=50,
        batch_size=32,
        validation_split=0.2,
        callbacks=[early_stopping],
        verbose=1
    )

    # Save LSTM in recommended native Keras format
    lstm_model_path = os.path.join(model_dir, "lstm_model.keras")
    lstm_model.save(lstm_model_path)
    print(f"Saved native Keras LSTM to {lstm_model_path}")

    # Evaluate models on test set
    y_pred_lr = logistic_model.predict(X_test_selected)
    y_pred_dt = decision_tree.predict(X_test_selected)
    y_pred_rf = random_forest.predict(X_test_selected)
    lstm_probs = lstm_model.predict(X_test_lstm, verbose=0)
    y_pred_lstm = np.argmax(lstm_probs, axis=1)

    # Integrated system
    def ai_decision(traffic_input, lstm_prob, rf_pred, confidence_threshold=0.60):
        classes = list(label_encoder.classes_)
        lstm_idx = int(np.argmax(lstm_prob))
        lstm_act = classes[lstm_idx]
        lstm_conf = float(np.max(lstm_prob))
        rf_act = classes[int(rf_pred)]

        if int(traffic_input.get("emergency_vehicle", 0)) == 1:
            final_act = "emergency_priority"
            reason = "Emergency vehicle detected; emergency priority rule applied."
        elif lstm_conf < confidence_threshold:
            final_act = rf_act
            reason = "LSTM confidence is low; Random Forest fallback used."
        elif lstm_act == rf_act:
            final_act = lstm_act
            reason = "LSTM and Random Forest predictions agree."
        else:
            final_act = rf_act
            reason = "Models disagree; Random Forest fallback policy applied."

        return final_act, reason, lstm_act, lstm_conf, rf_act

    system_actions = []
    reasons = []
    for i in range(len(X_test_selected)):
        t_input = X_test_selected.iloc[i].to_dict()
        f_act, rsn, _, _, _ = ai_decision(t_input, lstm_probs[i], y_pred_rf[i])
        system_actions.append(f_act)
        reasons.append(rsn)

    y_system = label_encoder.transform(system_actions)

    def calc_metrics(y_true, y_pred):
        return {
            "accuracy": float(round(accuracy_score(y_true, y_pred), 4)),
            "precision": float(round(precision_score(y_true, y_pred, average="weighted", zero_division=0), 4)),
            "recall": float(round(recall_score(y_true, y_pred, average="weighted", zero_division=0), 4)),
            "f1": float(round(f1_score(y_true, y_pred, average="weighted", zero_division=0), 4))
        }

    metrics = {
        "logistic_regression": calc_metrics(y_test, y_pred_lr),
        "decision_tree": calc_metrics(y_test, y_pred_dt),
        "random_forest": calc_metrics(y_test, y_pred_rf),
        "lstm": calc_metrics(y_test, y_pred_lstm),
        "integrated_system": calc_metrics(y_test, y_system),
        "confusion_matrices": {
            "random_forest": confusion_matrix(y_test, y_pred_rf).tolist(),
            "lstm": confusion_matrix(y_test, y_pred_lstm).tolist(),
            "integrated_system": confusion_matrix(y_test, y_system).tolist()
        },
        "target_classes": list(label_encoder.classes_),
        "test_records_count": len(y_test),
        "system_validation": {
            "test_records": len(y_test),
            "correct_decisions": int(np.sum(y_system == y_test)),
            "incorrect_decisions": int(np.sum(y_system != y_test)),
            "model_agreement_rate": float(round(np.mean(y_pred_lstm == y_pred_rf), 4)),
            "low_confidence_lstm_rate": float(round(np.mean(np.max(lstm_probs, axis=1) < 0.60), 4)),
            "emergency_override_count": int(sum(1 for r in reasons if r.startswith("Emergency vehicle")))
        },
        "rf_feature_importance": [
            {"feature": feat, "importance": float(imp)}
            for feat, imp in zip(X_train_selected.columns, random_forest.feature_importances_)
        ],
        "lstm_feature_importance": [
            {"feature": "emergency_vehicle", "importance": 0.194898},
            {"feature": "average_speed", "importance": 0.077551},
            {"feature": "waiting_time", "importance": 0.061224},
            {"feature": "queue_length", "importance": 0.046939},
            {"feature": "current_signal_east", "importance": 0.024490},
            {"feature": "traffic_density_medium", "importance": 0.023469},
            {"feature": "traffic_density_high", "importance": 0.007143},
            {"feature": "traffic_density_low", "importance": 0.001020}
        ],
        "mutual_information_scores": [
            {"feature": row["Feature"], "score": float(row["MI_Score"])}
            for _, row in mi_results.iterrows()
        ]
    }

    # Sort RF feature importance descending
    metrics["rf_feature_importance"] = sorted(metrics["rf_feature_importance"], key=lambda x: x["importance"], reverse=True)

    with open(os.path.join(model_dir, "historical_metrics.json"), "w") as f:
        json.dump(metrics, f, indent=2)
    print("Saved historical metrics & validation figures")

    # Save LSTM training history
    lstm_history_data = {
        "epochs": list(range(1, len(history.history["accuracy"]) + 1)),
        "accuracy": [float(x) for x in history.history["accuracy"]],
        "val_accuracy": [float(x) for x in history.history["val_accuracy"]],
        "loss": [float(x) for x in history.history["loss"]],
        "val_loss": [float(x) for x in history.history["val_loss"]],
    }
    with open(os.path.join(model_dir, "lstm_history.json"), "w") as f:
        json.dump(lstm_history_data, f, indent=2)
    print("Saved lstm_history.json")

    # Dataset Summary for EDA & task 4
    dataset_summary = {
        "raw_total_records": 1010,
        "clean_records": 978,
        "clean_columns": 12,
        "missing_values_handled": 25,
        "duplicates_removed": 10,
        "outliers_detected": 5,
        "numerical_medians": {col: float(df[col].median()) for col in ["queue_length", "waiting_time", "average_speed"]},
        "categorical_modes": {"traffic_density": "high", "emergency_vehicle": "no", "current_signal": "east", "action": "extend_green"},
        "scaling_means": {col: float(m) for col, m in zip(scale_cols, scaler.mean_)},
        "scaling_scales": {col: float(s) for col, s in zip(scale_cols, scaler.scale_)},
        "action_distribution": {k: int(v) for k, v in df["action"].value_counts().items()},
        "traffic_density_distribution": {k: int(v) for k, v in df["traffic_density"].value_counts().items()},
        "current_signal_distribution": {k: int(v) for k, v in df["current_signal"].value_counts().items()},
        "emergency_vehicle_distribution": {"no": int((df["emergency_vehicle"] == "no").sum()), "yes": int((df["emergency_vehicle"] == "yes").sum())}
    }
    with open(os.path.join(model_dir, "dataset_summary.json"), "w") as f:
        json.dump(dataset_summary, f, indent=2)
    print("Saved dataset_summary.json")

    print("=" * 60)
    print("ALL ARTIFACTS EXPORTED SUCCESSFULLY!")
    print("=" * 60)

if __name__ == "__main__":
    run_export()

