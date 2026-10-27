"""
SQLite Database Layer for Prediction History.
Persists predictions, inputs, model outputs, timestamps, and decision reasoning.
"""

import os
import sqlite3
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), "prediction_history.db")

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS predictions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            prediction_id TEXT UNIQUE NOT NULL,
            timestamp TEXT NOT NULL,
            queue_length REAL NOT NULL,
            waiting_time REAL NOT NULL,
            average_speed REAL NOT NULL,
            emergency_vehicle INTEGER NOT NULL,
            current_signal TEXT NOT NULL,
            traffic_density TEXT NOT NULL,
            lstm_prediction TEXT NOT NULL,
            lstm_confidence REAL NOT NULL,
            rf_prediction TEXT NOT NULL,
            model_agreement INTEGER NOT NULL,
            final_action TEXT NOT NULL,
            reason TEXT NOT NULL,
            rule_triggered TEXT NOT NULL
        )
    """)
    conn.commit()
    conn.close()

def insert_prediction(data):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO predictions (
            prediction_id, timestamp, queue_length, waiting_time, average_speed,
            emergency_vehicle, current_signal, traffic_density,
            lstm_prediction, lstm_confidence, rf_prediction, model_agreement,
            final_action, reason, rule_triggered
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        data["prediction_id"],
        data.get("timestamp", datetime.utcnow().isoformat() + "Z"),
        float(data["queue_length"]),
        float(data["waiting_time"]),
        float(data["average_speed"]),
        int(data["emergency_vehicle"]),
        str(data["current_signal"]),
        str(data["traffic_density"]),
        str(data["lstm_prediction"]),
        float(data["lstm_confidence"]),
        str(data["rf_prediction"]),
        1 if data.get("model_agreement") else 0,
        str(data["final_action"]),
        str(data["reason"]),
        str(data["rule_triggered"])
    ))
    conn.commit()
    inserted_id = cursor.lastrowid
    conn.close()
    return inserted_id

def get_predictions(limit=100, offset=0):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT * FROM predictions
        ORDER BY id DESC
        LIMIT ? OFFSET ?
    """, (limit, offset))
    rows = cursor.fetchall()
    total_count = cursor.execute("SELECT COUNT(*) FROM predictions").fetchone()[0]
    conn.close()

    items = [dict(row) for row in rows]
    return {
        "items": items,
        "total": total_count,
        "limit": limit,
        "offset": offset
    }

def clear_predictions():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM predictions")
    conn.commit()
    conn.close()

