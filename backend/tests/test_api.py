import pytest
import json
from app import app

@pytest.fixture
def client():
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client

def test_health_endpoint(client):
    rv = client.get("/api/health")
    assert rv.status_code == 200
    data = rv.get_json()
    assert data["status"] == "healthy"
    assert data["artifacts_loaded"] is True

def test_models_status_endpoint(client):
    rv = client.get("/api/models/status")
    assert rv.status_code == 200
    data = rv.get_json()
    assert data["models_ready"] is True
    assert "random_forest" in data["models"]
    assert "lstm" in data["models"]

def test_metrics_endpoint(client):
    rv = client.get("/api/metrics")
    assert rv.status_code == 200
    data = rv.get_json()
    assert "historical_metrics" in data
    assert "target_classes" in data
    assert len(data["target_classes"]) == 5

def test_predict_endpoint_valid(client):
    payload = {
        "queue_length": 45,
        "waiting_time": 80,
        "average_speed": 15,
        "emergency_vehicle": "no",
        "current_signal": "north",
        "traffic_density": "high"
    }
    rv = client.post("/api/predict", json=payload)
    assert rv.status_code == 200
    data = rv.get_json()
    assert "prediction_id" in data
    assert "decision" in data
    assert "final_action" in data["decision"]
    assert data["decision"]["final_action"] in ["emergency_priority", "extend_green", "maintain", "reduce_green", "switch_signal"]

def test_predict_emergency_override(client):
    payload = {
        "queue_length": 5,
        "waiting_time": 10,
        "average_speed": 45,
        "emergency_vehicle": "yes",
        "current_signal": "north",
        "traffic_density": "low"
    }
    rv = client.post("/api/predict", json=payload)
    assert rv.status_code == 200
    data = rv.get_json()
    assert data["decision"]["final_action"] == "emergency_priority"
    assert data["decision"]["rule_triggered"] == "Emergency Priority Override"

def test_predict_invalid_input(client):
    payload = {
        "queue_length": -10,
        "waiting_time": 10,
        "average_speed": 45,
        "emergency_vehicle": "no",
        "current_signal": "north",
        "traffic_density": "low"
    }
    rv = client.post("/api/predict", json=payload)
    assert rv.status_code == 422

def test_history_endpoint(client):
    rv = client.get("/api/history")
    assert rv.status_code == 200
    data = rv.get_json()
    assert "items" in data
    assert isinstance(data["items"], list)
    assert len(data["items"]) >= 1

def test_validate_endpoint_json(client):
    records = [
        {
            "queue_length": 5, "waiting_time": 10, "average_speed": 45,
            "emergency_vehicle": "no", "current_signal": "north", "traffic_density": "low",
            "action": "maintain"
        },
        {
            "queue_length": 50, "waiting_time": 90, "average_speed": 12,
            "emergency_vehicle": "yes", "current_signal": "south", "traffic_density": "high",
            "action": "emergency_priority"
        }
    ]
    rv = client.post("/api/validate", json=records)
    assert rv.status_code == 200
    data = rv.get_json()
    assert data["status"] == "success"
    assert data["summary"]["has_ground_truth"] is True
    assert "evaluation" in data["summary"]

