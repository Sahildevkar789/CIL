import pytest
import numpy as np
from preprocessor import Preprocessor

@pytest.fixture
def preprocessor():
    p = Preprocessor()
    assert p.is_ready(), "Preprocessor should be ready after artifact export"
    return p

def test_valid_input_transformation(preprocessor):
    raw = {
        "queue_length": 25,
        "waiting_time": 40,
        "average_speed": 28,
        "emergency_vehicle": "no",
        "current_signal": "north",
        "traffic_density": "medium"
    }
    validated = preprocessor.validate_input(raw)
    assert validated["emergency_vehicle"] == 0
    assert validated["current_signal"] == "north"

    X_df, X_3d, full_feat = preprocessor.transform(validated)
    assert X_df.shape == (1, 8)
    assert X_3d.shape == (1, 1, 8)
    assert len(preprocessor.selected_features) == 8
    assert preprocessor.selected_features[0] == "waiting_time"
    assert preprocessor.selected_features[1] == "queue_length"

def test_emergency_vehicle_variations(preprocessor):
    for val in ["yes", "YES", True, "1", 1]:
        res = preprocessor.validate_input({
            "queue_length": 10, "waiting_time": 10, "average_speed": 40,
            "emergency_vehicle": val, "current_signal": "south", "traffic_density": "low"
        })
        assert res["emergency_vehicle"] == 1

    for val in ["no", "NO", False, "0", 0]:
        res = preprocessor.validate_input({
            "queue_length": 10, "waiting_time": 10, "average_speed": 40,
            "emergency_vehicle": val, "current_signal": "south", "traffic_density": "low"
        })
        assert res["emergency_vehicle"] == 0

def test_out_of_range_inputs(preprocessor):
    with pytest.raises(ValueError):
        preprocessor.validate_input({
            "queue_length": -5, "waiting_time": 10, "average_speed": 40,
            "emergency_vehicle": "no", "current_signal": "south", "traffic_density": "low"
        })

    with pytest.raises(ValueError):
        preprocessor.validate_input({
            "queue_length": 10, "waiting_time": 10, "average_speed": 40,
            "emergency_vehicle": "no", "current_signal": "invalid_dir", "traffic_density": "low"
        })
