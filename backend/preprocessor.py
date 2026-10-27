"""
Preprocessing Pipeline for Smart Traffic Management System.
Uses exact fitted scaler and encoding rules from Tasks 4 and 5.
"""

import os
import json
import joblib
import numpy as np
import pandas as pd

MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")

class Preprocessor:
    def __init__(self, model_dir=MODEL_DIR):
        self.model_dir = model_dir
        self.scaler = None
        self.label_encoder = None
        self.selected_features = None
        self.dataset_summary = None
        self.load_artifacts()

    def load_artifacts(self):
        scaler_path = os.path.join(self.model_dir, "scaler.joblib")
        le_path = os.path.join(self.model_dir, "label_encoder.joblib")
        feat_path = os.path.join(self.model_dir, "selected_features.json")
        summary_path = os.path.join(self.model_dir, "dataset_summary.json")

        if os.path.exists(scaler_path):
            self.scaler = joblib.load(scaler_path)
        if os.path.exists(le_path):
            self.label_encoder = joblib.load(le_path)
        if os.path.exists(feat_path):
            with open(feat_path, "r") as f:
                self.selected_features = json.load(f)
        if os.path.exists(summary_path):
            with open(summary_path, "r") as f:
                self.dataset_summary = json.load(f)

    def is_ready(self):
        return (
            self.scaler is not None
            and self.label_encoder is not None
            and self.selected_features is not None
        )

    def validate_input(self, raw):
        """
        Validates raw input dictionary.
        Returns cleaned values dict or raises ValueError.
        """
        required_fields = [
            "queue_length",
            "waiting_time",
            "average_speed",
            "emergency_vehicle",
            "current_signal",
            "traffic_density",
        ]
        for field in required_fields:
            if field not in raw or raw[field] is None or raw[field] == "":
                raise ValueError(f"Missing required field: '{field}'")

        # Parse numericals
        try:
            queue_length = float(raw["queue_length"])
            if queue_length < 0 or queue_length > 500:
                raise ValueError(f"queue_length out of valid range [0, 500]: {queue_length}")
        except (TypeError, ValueError) as e:
            raise ValueError(f"Invalid queue_length: {e}")

        try:
            waiting_time = float(raw["waiting_time"])
            if waiting_time < 0 or waiting_time > 1000:
                raise ValueError(f"waiting_time out of valid range [0, 1000]: {waiting_time}")
        except (TypeError, ValueError) as e:
            raise ValueError(f"Invalid waiting_time: {e}")

        try:
            average_speed = float(raw["average_speed"])
            if average_speed < 0 or average_speed > 200:
                raise ValueError(f"average_speed out of valid range [0, 200]: {average_speed}")
        except (TypeError, ValueError) as e:
            raise ValueError(f"Invalid average_speed: {e}")

        # Parse emergency_vehicle
        ev_val = raw["emergency_vehicle"]
        if isinstance(ev_val, bool):
            emergency_vehicle = 1 if ev_val else 0
        elif str(ev_val).strip().lower() in ["yes", "1", "true", "y"]:
            emergency_vehicle = 1
        elif str(ev_val).strip().lower() in ["no", "0", "false", "n"]:
            emergency_vehicle = 0
        else:
            raise ValueError(f"Invalid emergency_vehicle value: '{ev_val}'. Expected yes/no.")

        # Parse current_signal
        current_signal = str(raw["current_signal"]).strip().lower()
        valid_signals = ["north", "south", "east", "west"]
        if current_signal not in valid_signals:
            raise ValueError(f"Invalid current_signal: '{current_signal}'. Must be one of {valid_signals}")

        # Parse traffic_density
        traffic_density = str(raw["traffic_density"]).strip().lower()
        valid_densities = ["low", "medium", "high"]
        if traffic_density not in valid_densities:
            raise ValueError(f"Invalid traffic_density: '{traffic_density}'. Must be one of {valid_densities}")

        return {
            "queue_length": queue_length,
            "waiting_time": waiting_time,
            "average_speed": average_speed,
            "emergency_vehicle": emergency_vehicle,
            "current_signal": current_signal,
            "traffic_density": traffic_density,
        }

    def transform(self, validated_dict):
        """
        Converts validated raw input into model-ready features.
        Returns:
            X_2d: np.ndarray shape (1, 8) for Scikit-Learn models
            X_3d: np.ndarray shape (1, 1, 8) for LSTM model
            feature_dict: dict of feature values in selected order
        """
        if not self.is_ready():
            raise RuntimeError("Preprocessor artifacts not loaded. Run export_artifacts.py first.")

        # 1. Scale numerical features using fitted StandardScaler
        scale_input = pd.DataFrame([{
            "queue_length": validated_dict["queue_length"],
            "waiting_time": validated_dict["waiting_time"],
            "average_speed": validated_dict["average_speed"],
        }])
        scaled_vals = self.scaler.transform(scale_input)[0]
        scaled_queue, scaled_wait, scaled_speed = scaled_vals[0], scaled_vals[1], scaled_vals[2]

        # 2. One-hot encode current_signal
        # Columns from notebook: current_signal_east, current_signal_north, current_signal_south, current_signal_west
        sig = validated_dict["current_signal"]
        cs_east = 1 if sig == "east" else 0
        cs_north = 1 if sig == "north" else 0
        cs_south = 1 if sig == "south" else 0
        cs_west = 1 if sig == "west" else 0

        # 3. One-hot encode traffic_density
        # Columns from notebook: traffic_density_high, traffic_density_low, traffic_density_medium
        den = validated_dict["traffic_density"]
        td_high = 1 if den == "high" else 0
        td_low = 1 if den == "low" else 0
        td_medium = 1 if den == "medium" else 0

        ev = validated_dict["emergency_vehicle"]

        # 4. Map to all transformed columns
        full_features = {
            "queue_length": scaled_queue,
            "waiting_time": scaled_wait,
            "average_speed": scaled_speed,
            "emergency_vehicle": ev,
            "current_signal_east": cs_east,
            "current_signal_north": cs_north,
            "current_signal_south": cs_south,
            "current_signal_west": cs_west,
            "traffic_density_high": td_high,
            "traffic_density_low": td_low,
            "traffic_density_medium": td_medium,
        }

        # 5. Extract top 8 selected features in the EXACT order:
        # ['waiting_time', 'queue_length', 'average_speed', 'traffic_density_low',
        #  'emergency_vehicle', 'traffic_density_high', 'current_signal_east', 'traffic_density_medium']
        row_vals = [full_features[col] for col in self.selected_features]
        X_df = pd.DataFrame([row_vals], columns=self.selected_features, dtype=np.float32)
        X_2d = np.array([row_vals], dtype=np.float32)
        X_3d = X_2d.reshape(1, 1, len(self.selected_features))

        return X_df, X_3d, full_features
