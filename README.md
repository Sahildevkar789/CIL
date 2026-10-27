# SMARTFLOW AI — Smart Traffic Management System

> **CELBC710 College Project | Tasks 4–10**
> A professional local GUI dashboard built around a trained ML/DL traffic management system.

---

## 🚦 Project Overview

SMARTFLOW AI is a full-stack local dashboard for a Smart Traffic Management System that:
- Predicts traffic signal actions using **Random Forest** (~88.27%) and **LSTM** (~80.10%) models
- Implements a **4-rule AI decision engine** (Task 9) combining both models
- Provides full **model explainability**, **feature importance**, and **responsible AI** analysis
- Logs every prediction to a local **SQLite history** database

### Traffic Signal Classes
`emergency_priority` · `extend_green` · `maintain` · `reduce_green` · `switch_signal`

---

## 🗂️ Project Structure

```
cil/
├── Smart_Traffic_Management_Task4_(1).ipynb  ← Original notebook (DO NOT MODIFY)
├── backend/
│   ├── app.py                  ← Flask REST API (7 endpoints)
│   ├── preprocessor.py         ← Exact notebook preprocessing pipeline
│   ├── decision_engine.py      ← Task 9 four-rule AI engine
│   ├── database.py             ← SQLite prediction history
│   ├── export_artifacts.py     ← Generates all model artifacts
│   ├── models/                 ← Saved model artifacts (generated)
│   └── tests/                  ← 15 pytest unit tests
├── frontend/
│   └── src/
│       ├── pages/              ← 10 dashboard pages
│       └── components/         ← Reusable UI components
├── data/                       ← Dataset CSV files
├── run_backend.ps1             ← Start Flask server
├── run_frontend.ps1            ← Start Vite dev server
├── run_all.ps1                 ← Start both servers
└── run_tests.ps1               ← Run all 15 pytest tests
```

---

## ⚡ Quick Start (Windows)

### Prerequisites
- **Python 3.11+** — Install from [python.org](https://python.org)
- **Node.js 20+** — Install from [nodejs.org](https://nodejs.org)
- **Git** — Install from [git-scm.com](https://git-scm.com)

### 1. Clone the Repository
```powershell
git clone https://github.com/Sahildevkar789/smartflow-ai.git
cd smartflow-ai
```

### 2. Install Python Dependencies
```powershell
pip install -r requirements.txt
```

### 3. Generate Model Artifacts
> This replicates the notebook's exact training pipeline (seed=42). Run once.
```powershell
cd backend
python export_artifacts.py
cd ..
```

### 4. Install Frontend Dependencies
```powershell
cd frontend
npm install
cd ..
```

### 5. Run the App
```powershell
# Option A: Both servers at once (opens two windows)
powershell -ExecutionPolicy Bypass -File .\run_all.ps1

# Option B: Separately
powershell -ExecutionPolicy Bypass -File .\run_backend.ps1   # Terminal 1
powershell -ExecutionPolicy Bypass -File .\run_frontend.ps1  # Terminal 2
```

Open **http://localhost:3000** in your browser.

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server health + artifact status |
| GET | `/api/models/status` | All 4 model load status |
| POST | `/api/predict` | Run prediction (RF + LSTM + decision engine) |
| GET | `/api/metrics` | Historical notebook metrics |
| GET | `/api/history` | Prediction history from SQLite |
| POST | `/api/validate` | Evaluate labeled CSV (Task 10) |

### Example Prediction Request
```json
POST /api/predict
{
  "queue_length": 25,
  "waiting_time": 80,
  "emergency_vehicle": 0,
  "average_speed": 15,
  "current_signal": "north",
  "traffic_density": "high"
}
```

---

## 🧪 Running Tests
```powershell
powershell -ExecutionPolicy Bypass -File .\run_tests.ps1
```
**15 tests** covering preprocessing, decision rules, and all API endpoints.

---

## 📊 Dashboard Pages

| Page | Task | Description |
|------|------|-------------|
| Overview | All | KPI cards, model accuracy, architecture pipeline |
| Traffic Prediction | 9 | Live RF + LSTM prediction with AI decision |
| Dataset Summary | 4 | Cleaning, encoding, scaling, distributions |
| Model Comparison | 6 | LR vs DT vs RF metrics and confusion matrices |
| LSTM Results | 7 | Architecture, training curves, evaluation |
| Explainability | 8 | Feature importance, permutation importance |
| Decision Engine | 9 | 4-rule sandbox, interactive demo |
| Task 10 Validation | 10 | Held-out evaluation, CSV upload, responsible AI |
| Prediction History | – | SQLite log with search and filter |
| About | – | Project info, tech stack, integrity guarantees |

---

## 🤖 AI Decision Engine Rules (Task 9)

1. **Emergency Override** — If `emergency_vehicle=1`, always return `emergency_priority`
2. **Low Confidence Fallback** — If LSTM confidence < 60%, use RF prediction
3. **Model Agreement** — If RF and LSTM agree, use that prediction
4. **Conflict Fallback** — If models disagree, use RF (higher accuracy)

---

## 📋 Tech Stack

| Layer | Technology |
|-------|-----------|
| ML Models | scikit-learn, TensorFlow/Keras |
| Backend | Python 3.11, Flask, SQLite |
| Frontend | React 18, Vite, TypeScript |
| Styling | Tailwind CSS, Lucide Icons |
| Charts | Recharts |
| Testing | pytest |

---

## ⚠️ Important Notes

- **Original notebook is never modified** — `Smart_Traffic_Management_Task4_(1).ipynb` is read-only
- **No fabricated models** — all artifacts are generated with exact seed=42 from the notebook
- **Advisory system only** — does not directly control physical traffic lights
- **Historical metrics** are clearly labeled as such, not presented as live results
- Model artifacts (`.joblib`, `.keras`) are excluded from git — regenerate with `export_artifacts.py`

---

## 📄 License
Academic project for CELBC710. Not for production use.

