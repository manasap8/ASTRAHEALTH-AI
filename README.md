# 🚀 Astronaut Health Monitoring System - Backend

> **NASA Space Apps Challenge 2026**  
> A real-time telemetry and health monitoring backend built with **Python**, **FastAPI**, and persistent **SQLite** database storage to monitor astronaut vitals, track historical time-series trends, detect medical anomalies, and serve analytics for frontend dashboards.

---

## 📁 Project Architecture

```text
astronaut-health-monitor/
│
├── backend/
│   ├── main.py                  # FastAPI entry point, SQLite lifecycle & CORS
│   ├── database.py              # SQLite database manager (astronaut_health.db)
│   ├── astronaut_health.db      # Persistent SQLite database file
│   │
│   ├── models/                  # Pydantic data schemas & validation
│   │   ├── __init__.py
│   │   ├── astronaut.py         # Astronaut profiles, Vitals, HealthReading & Alerts
│   │   └── analytics.py         # Historical statistics, trends & chart data schemas
│   │
│   ├── routes/                  # API endpoints
│   │   ├── __init__.py
│   │   ├── health.py            # System health check (/health)
│   │   ├── astronauts.py        # Astronaut Profile CRUD management (/astronauts)
│   │   ├── health_data.py       # Live telemetry ingestion & history (/health-data)
│   │   ├── alerts.py            # Safety alerts & anomaly monitoring (/alerts)
│   │   └── analytics.py         # Historical trends, stats & chart arrays (/analytics)
│   │
│   ├── services/                # Space medicine analysis engines
│   │   ├── __init__.py
│   │   ├── health_analysis.py   # Anomaly detection & vital threshold evaluator
│   │   └── trend_analysis.py    # Min/max/avg math, trend directions & chart transformer
│   │
│   └── requirements.txt         # Dependencies (fastapi, uvicorn, pydantic)
│
├── run.bat                      # One-click Windows runner (double-click to run!)
├── run.ps1                      # PowerShell runner script
└── README.md                    # Project documentation & testing guide
```

---

## ⚡ Quick Start

### Start Development Server
Double-click `run.bat` or run in PowerShell:

```powershell
cd D:\Astronaut_health_monitor
.\.venv\Scripts\python.exe -m uvicorn backend.main:app --reload --port 8000
```

---

## 📡 Complete API Endpoints

### 📊 Historical Analytics & Trends (`/analytics`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/analytics/{astronaut_id}/analysis` | **Full historical analysis:** calculates min, max, average, trend directions (RISING/FALLING/STABLE), and compares recent vs prior readings |
| `GET` | `/analytics/{astronaut_id}/charts` | **Structured chart arrays:** synchronized coordinate lists for frontend charts (Chart.js, Recharts, Plotly) |
| `GET` | `/analytics/{astronaut_id}/alerts` | Historical alerts with date-range & severity filtering |

### 🩺 Health Monitoring & Telemetry (`/health-data`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/health-data` | Ingest new reading (validates & saves to SQLite, runs analysis) |
| `GET` | `/health-data/latest` | Retrieve latest readings for **all** crew members |
| `GET` | `/health-data/{astronaut_id}/latest` | Retrieve latest reading for a **specific** astronaut |
| `GET` | `/health-data/{astronaut_id}/history` | Historical time-series readings with date-range filtering & pagination |

### 👨‍🚀 Astronaut Profiles (`/astronauts`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/astronauts` | **Register astronaut** (with duplicate ID prevention) |
| `GET` | `/astronauts` | List all astronaut profiles with connected telemetry stats |
| `GET` | `/astronauts/{id}` | Get astronaut profile with connected vitals & reading count |
| `PUT` | `/astronauts/{id}` | Update astronaut profile |
| `DELETE` | `/astronauts/{id}` | Delete astronaut profile and clean up associated records |

---

## 🧪 Testing with Swagger UI (Step-by-Step Guide)

Open your browser to: **[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)**

### 1. Test Historical Analysis (`GET /analytics/{id}/analysis`)
1. In Swagger UI, expand **`GET /analytics/{astronaut_id}/analysis`**.
2. Click **"Try it out"**.
3. Set `astronaut_id` to `AST-001`.
4. *(Optional)* Set `start_time` to `2026-11-14T00:00:00Z` and `end_time` to `2026-11-14T23:59:59Z`.
5. Click **"Execute"**.
6. **Expected Response:** `200 OK` with:
   * Min, max, and average for `heart_rate`, `spo2`, `body_temperature`, `respiratory_rate`.
   * Trend indicator: `"trend": "STABLE"`, `"RISING"`, or `"FALLING"`.
   * Recent comparison delta against baseline.
   * Space medicine clinical summary text.

### 2. Test Frontend Chart Data (`GET /analytics/{id}/charts`)
1. Expand **`GET /analytics/{astronaut_id}/charts`**.
2. Click **"Try it out"**, set `astronaut_id` to `AST-001`, and click **"Execute"**.
3. **Expected Response:** `200 OK` returning synchronized arrays (`timestamps`, `heart_rate`, `spo2`, `body_temperature`, `respiratory_rate`) ready to be plugged into any frontend chart component.

### 3. Test Historical Alerts with Date Range (`GET /analytics/{id}/alerts`)
1. Expand **`GET /analytics/{astronaut_id}/alerts`**.
2. Click **"Try it out"**, set `astronaut_id` to `AST-002`, and click **"Execute"**.
3. **Expected Response:** `200 OK` with the list of safety alerts logged for Dr. Elena Rostova.

### 4. Test Error Handling
* **Invalid Date Range (`start_time > end_time`):**
  Pass `start_time=2026-11-15T00:00:00Z` and `end_time=2026-11-14T00:00:00Z`.  
  **Result:** `400 Bad Request` with detail `"Invalid date range: 'start_time' cannot be after 'end_time'."`
* **Non-existent Astronaut:**
  Pass `astronaut_id=AST-999`.  
  **Result:** `404 Not Found` with detail `"Astronaut with ID 'AST-999' not found in the mission registry."`
