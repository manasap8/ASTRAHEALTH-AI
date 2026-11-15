"""SQLite Database layer for Astronaut Health Monitor.

Provides persistent storage for:
- Astronaut Profiles (Full CRUD)
- Real-time and Historical Biometric Telemetry Readings
- Health and Mission Safety Alerts
"""
import json
import os
import sqlite3
import re
from contextlib import contextmanager
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Dict, Any
from backend.models.astronaut import (
    AstronautProfile,
    AstronautCreate,
    AstronautUpdate,
    Vitals,
    Alert,
    HealthReadingResponse,
)

# SQLite database file located in the backend directory
DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "astronaut_health.db")


@contextmanager
def get_db():
    """Context manager for SQLite database connections.

    Ensures proper connection opening, commit on success, rollback on error,
    and automatic closing.
    """
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row  # Access columns by name: row["heart_rate"]
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def init_db():
    """Initialize database tables, run schema migrations, and seed initial mission data if empty."""
    with get_db() as conn:
        cursor = conn.cursor()

        # 1. Astronauts profile table
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS astronauts (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                mission_id TEXT NOT NULL,
                mission TEXT NOT NULL,
                age INTEGER NOT NULL,
                role TEXT NOT NULL,
                nationality TEXT DEFAULT 'NASA / USA',
                blood_type TEXT DEFAULT 'O+',
                status TEXT DEFAULT 'Normal',
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
            """
        )

        # Migrate existing table if columns are missing
        cursor.execute("PRAGMA table_info(astronauts)")
        existing_cols = {col["name"] for col in cursor.fetchall()}
        if "mission_id" not in existing_cols:
            cursor.execute("ALTER TABLE astronauts ADD COLUMN mission_id TEXT DEFAULT 'ARTEMIS-VII'")
        if "nationality" not in existing_cols:
            cursor.execute("ALTER TABLE astronauts ADD COLUMN nationality TEXT DEFAULT 'NASA / USA'")
        if "blood_type" not in existing_cols:
            cursor.execute("ALTER TABLE astronauts ADD COLUMN blood_type TEXT DEFAULT 'O+'")
        if "updated_at" not in existing_cols:
            cursor.execute("ALTER TABLE astronauts ADD COLUMN updated_at TEXT DEFAULT ''")

        # 2. Health telemetry readings table
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS health_readings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                astronaut_id TEXT NOT NULL,
                timestamp TEXT NOT NULL,
                heart_rate REAL NOT NULL,
                spo2 REAL NOT NULL,
                body_temperature REAL NOT NULL,
                respiratory_rate REAL DEFAULT 16.0,
                sleep_hours REAL DEFAULT 7.5,
                activity_level TEXT DEFAULT 'RESTING',
                blood_pressure_systolic INTEGER DEFAULT 120,
                blood_pressure_diastolic INTEGER DEFAULT 80,
                radiation_exposure REAL DEFAULT 0.15,
                cabin_co2_level REAL DEFAULT 0.04,
                health_status TEXT DEFAULT 'Normal',
                alerts_generated INTEGER DEFAULT 0,
                ml_prediction TEXT DEFAULT NULL,
                FOREIGN KEY (astronaut_id) REFERENCES astronauts (id)
            )
            """
        )

        # Migrate existing health_readings table if ml_prediction column is missing
        cursor.execute("PRAGMA table_info(health_readings)")
        existing_reading_cols = {col["name"] for col in cursor.fetchall()}
        if "ml_prediction" not in existing_reading_cols:
            cursor.execute("ALTER TABLE health_readings ADD COLUMN ml_prediction TEXT DEFAULT NULL")

        # Index for fast historical telemetry lookup by astronaut and time
        cursor.execute(
            """
            CREATE INDEX IF NOT EXISTS idx_readings_astro_time 
            ON health_readings (astronaut_id, timestamp DESC)
            """
        )

        # 3. Health and safety alerts table
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS alerts (
                id TEXT PRIMARY KEY,
                astronaut_id TEXT NOT NULL,
                astronaut_name TEXT NOT NULL,
                alert_type TEXT NOT NULL,
                description TEXT NOT NULL,
                severity TEXT NOT NULL,
                timestamp TEXT NOT NULL,
                resolved INTEGER DEFAULT 0,
                resolved_at TEXT DEFAULT NULL,
                metric TEXT,
                message TEXT,
                acknowledged INTEGER DEFAULT 0,
                FOREIGN KEY (astronaut_id) REFERENCES astronauts (id)
            )
            """
        )

        # Migrate alerts columns if needed
        cursor.execute("PRAGMA table_info(alerts)")
        existing_alert_cols = {col["name"] for col in cursor.fetchall()}
        if "alert_type" not in existing_alert_cols:
            cursor.execute("ALTER TABLE alerts ADD COLUMN alert_type TEXT DEFAULT 'HEART_RATE'")
        if "description" not in existing_alert_cols:
            cursor.execute("ALTER TABLE alerts ADD COLUMN description TEXT DEFAULT ''")
        if "resolved" not in existing_alert_cols:
            cursor.execute("ALTER TABLE alerts ADD COLUMN resolved INTEGER DEFAULT 0")
        if "resolved_at" not in existing_alert_cols:
            cursor.execute("ALTER TABLE alerts ADD COLUMN resolved_at TEXT DEFAULT NULL")

        # Check if seed data is needed
        cursor.execute("SELECT COUNT(*) as count FROM astronauts")
        count = cursor.fetchone()["count"]

        if count == 0:
            _seed_initial_data(cursor)


def _seed_initial_data(cursor: sqlite3.Cursor):
    """Seed initial crew members, historical telemetry, and baseline alerts."""
    now = datetime.now(timezone.utc)
    now_iso = now.isoformat()

    # Seed Astronauts with complete profiles
    crew = [
        (
            "AST-001",
            "Commander Alex Vance",
            "ARTEMIS-VII",
            "ARTEMIS-VII",
            38,
            "Mission Commander & Pilot",
            "NASA / USA",
            "O-Negative",
            "Normal",
            now_iso,
            now_iso,
        ),
        (
            "AST-002",
            "Dr. Elena Rostova",
            "ARTEMIS-VII",
            "ARTEMIS-VII",
            34,
            "Flight Engineer & Medical Officer",
            "ESA / Germany",
            "A-Positive",
            "Warning",
            now_iso,
            now_iso,
        ),
        (
            "AST-003",
            "Marcus Chen",
            "ARTEMIS-VII",
            "ARTEMIS-VII",
            41,
            "Payload & EVA Specialist",
            "CSA / Canada",
            "B-Positive",
            "Normal",
            now_iso,
            now_iso,
        ),
    ]
    cursor.executemany(
        """
        INSERT INTO astronauts (
            id, name, mission_id, mission, age, role, nationality, blood_type, status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        crew,
    )

    # Seed Historical Readings for AST-001 (last 5 hours)
    for i in range(5, -1, -1):
        t_iso = (now - timedelta(hours=i)).isoformat()
        cursor.execute(
            """
            INSERT INTO health_readings (
                astronaut_id, timestamp, heart_rate, spo2, body_temperature,
                respiratory_rate, sleep_hours, activity_level,
                blood_pressure_systolic, blood_pressure_diastolic, radiation_exposure,
                cabin_co2_level, health_status, alerts_generated
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            ("AST-001", t_iso, 70.0 + (i % 3) * 2.0, 98.5, 36.7, 15.0, 7.8, "RESTING", 118, 78, 0.15, 0.04, "Normal", 0),
        )

    # Seed Readings for AST-002 (Dr. Elena Rostova - warning state)
    for i in range(5, -1, -1):
        t_iso = (now - timedelta(hours=i)).isoformat()
        is_latest = (i == 0)
        hr = 108.0 if is_latest else 92.0
        spo2 = 94.5 if is_latest else 96.0
        status = "Warning" if is_latest else "Normal"
        alerts_cnt = 1 if is_latest else 0
        cursor.execute(
            """
            INSERT INTO health_readings (
                astronaut_id, timestamp, heart_rate, spo2, body_temperature,
                respiratory_rate, sleep_hours, activity_level,
                blood_pressure_systolic, blood_pressure_diastolic, radiation_exposure,
                cabin_co2_level, health_status, alerts_generated
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            ("AST-002", t_iso, hr, spo2, 37.6, 23.0, 4.5, "EVA", 135, 88, 0.35, 0.06, status, alerts_cnt),
        )

    # Seed Readings for AST-003
    for i in range(4, -1, -1):
        t_iso = (now - timedelta(hours=i)).isoformat()
        cursor.execute(
            """
            INSERT INTO health_readings (
                astronaut_id, timestamp, heart_rate, spo2, body_temperature,
                respiratory_rate, sleep_hours, activity_level,
                blood_pressure_systolic, blood_pressure_diastolic, radiation_exposure,
                cabin_co2_level, health_status, alerts_generated
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            ("AST-003", t_iso, 65.0, 99.0, 36.5, 14.0, 8.0, "RESTING", 115, 76, 0.18, 0.04, "Normal", 0),
        )

    # Seed baseline alert
    cursor.execute(
        """
        INSERT INTO alerts (
            id, astronaut_id, astronaut_name, alert_type, description, severity,
            timestamp, resolved, resolved_at, metric, message, acknowledged
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            "ALT-001",
            "AST-002",
            "Dr. Elena Rostova",
            "SPO2",
            "Sub-nominal oxygen saturation detected: 94.5% during EVA preparation.",
            "Warning",
            now_iso,
            0,
            None,
            "spo2",
            "Sub-nominal oxygen saturation detected: 94.5% during EVA preparation.",
            0,
        ),
    )


# --------------------------------------------------------------------------
# Astronaut Profile CRUD Operations
# --------------------------------------------------------------------------

def check_astronaut_exists(astronaut_id: str) -> bool:
    """Check if an astronaut ID already exists in the database."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT 1 FROM astronauts WHERE id = ?", (astronaut_id,))
        return cursor.fetchone() is not None


def generate_next_astronaut_id() -> str:
    """Generate the next unique astronaut ID in sequence (e.g. AST-004)."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM astronauts WHERE id LIKE 'AST-%'")
        rows = cursor.fetchall()

    max_num = 0
    for r in rows:
        match = re.search(r"AST-(\d+)", r["id"])
        if match:
            num = int(match.group(1))
            if num > max_num:
                max_num = num

    return f"AST-{max_num + 1:03d}"


def create_astronaut_profile(data: AstronautCreate) -> AstronautProfile:
    """Register a new astronaut profile. Prevents duplicate astronaut IDs."""
    # Determine ID
    astronaut_id = (data.id or "").strip()
    if not astronaut_id:
        astronaut_id = generate_next_astronaut_id()
    else:
        # Check for duplication
        if check_astronaut_exists(astronaut_id):
            raise ValueError(f"DUPLICATE_ID: Astronaut with ID '{astronaut_id}' already exists.")

    mission_id = data.mission_id or data.mission or "ARTEMIS-VII"
    now_iso = datetime.now(timezone.utc).isoformat()

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO astronauts (
                id, name, mission_id, mission, age, role, nationality, blood_type, status, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                astronaut_id,
                data.name,
                mission_id,
                mission_id,
                data.age,
                data.role,
                getattr(data, "nationality", None) or "NASA / USA",
                getattr(data, "blood_type", None) or "O+",
                getattr(data, "status", None) or "Normal",
                now_iso,
                now_iso,
            ),
        )

    return get_astronaut_profile(astronaut_id)


def get_all_astronaut_profiles() -> List[AstronautProfile]:
    """Retrieve all astronaut profiles connected with their latest vitals and alert stats."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM astronauts ORDER BY id ASC")
        rows = cursor.fetchall()
        return [_row_to_astronaut_profile(r, conn) for r in rows]


def get_astronaut_profile(astronaut_id: str) -> Optional[AstronautProfile]:
    """Retrieve a single astronaut profile with connected telemetry and alert stats."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM astronauts WHERE id = ?", (astronaut_id,))
        row = cursor.fetchone()
        if not row:
            return None
        return _row_to_astronaut_profile(row, conn)


def update_astronaut_profile(astronaut_id: str, data: AstronautUpdate) -> Optional[AstronautProfile]:
    """Update profile information for an existing astronaut."""
    if not check_astronaut_exists(astronaut_id):
        return None

    update_fields = []
    params = []

    if data.name is not None:
        update_fields.append("name = ?")
        params.append(data.name)
    if data.mission_id is not None:
        update_fields.append("mission_id = ?")
        params.append(data.mission_id)
        update_fields.append("mission = ?")
        params.append(data.mission_id)
    if data.age is not None:
        update_fields.append("age = ?")
        params.append(data.age)
    if data.role is not None:
        update_fields.append("role = ?")
        params.append(data.role)
    if data.nationality is not None:
        update_fields.append("nationality = ?")
        params.append(data.nationality)
    if data.blood_type is not None:
        update_fields.append("blood_type = ?")
        params.append(data.blood_type)
    if data.status is not None:
        update_fields.append("status = ?")
        params.append(data.status)

    now_iso = datetime.now(timezone.utc).isoformat()
    update_fields.append("updated_at = ?")
    params.append(now_iso)

    params.append(astronaut_id)

    with get_db() as conn:
        cursor = conn.cursor()
        query = f"UPDATE astronauts SET {', '.join(update_fields)} WHERE id = ?"
        cursor.execute(query, tuple(params))

    return get_astronaut_profile(astronaut_id)


def delete_astronaut_profile(astronaut_id: str) -> bool:
    """Delete an astronaut profile and safely clean up connected health readings and alerts."""
    if not check_astronaut_exists(astronaut_id):
        return False

    with get_db() as conn:
        cursor = conn.cursor()
        # Clean up connected health telemetry and alerts
        cursor.execute("DELETE FROM health_readings WHERE astronaut_id = ?", (astronaut_id,))
        cursor.execute("DELETE FROM alerts WHERE astronaut_id = ?", (astronaut_id,))
        cursor.execute("DELETE FROM astronauts WHERE id = ?", (astronaut_id,))

    return True


def _row_to_astronaut_profile(row: sqlite3.Row, conn: sqlite3.Connection) -> AstronautProfile:
    """Convert an astronaut SQLite row into an AstronautProfile with connected health stats."""
    cursor = conn.cursor()
    astro_id = row["id"]

    # 1. Fetch latest vital signs reading
    cursor.execute(
        """
        SELECT * FROM health_readings 
        WHERE astronaut_id = ? 
        ORDER BY timestamp DESC, id DESC 
        LIMIT 1
        """,
        (astro_id,),
    )
    r = cursor.fetchone()
    vitals = None
    if r:
        vitals = Vitals(
            heart_rate=r["heart_rate"],
            spo2=r["spo2"],
            respiratory_rate=r["respiratory_rate"],
            body_temperature=r["body_temperature"],
            sleep_hours=r["sleep_hours"],
            activity_level=r["activity_level"],
            blood_pressure_systolic=r["blood_pressure_systolic"],
            blood_pressure_diastolic=r["blood_pressure_diastolic"],
            radiation_exposure=r["radiation_exposure"],
            cabin_co2_level=r["cabin_co2_level"],
        )

    # 2. Total health readings count
    cursor.execute("SELECT COUNT(*) as count FROM health_readings WHERE astronaut_id = ?", (astro_id,))
    total_readings = cursor.fetchone()["count"]

    # 3. Active (unresolved) alerts count
    cursor.execute("SELECT COUNT(*) as count FROM alerts WHERE astronaut_id = ? AND resolved = 0", (astro_id,))
    active_alerts = cursor.fetchone()["count"]

    # Safe column access for backwards compatibility
    keys = row.keys()
    mission_id = row["mission_id"] if "mission_id" in keys else row["mission"]
    nationality = row["nationality"] if "nationality" in keys else "NASA / USA"
    blood_type = row["blood_type"] if "blood_type" in keys else "O+"
    updated_at = row["updated_at"] if "updated_at" in keys and row["updated_at"] else row["created_at"]

    return AstronautProfile(
        id=row["id"],
        name=row["name"],
        mission_id=mission_id,
        mission=row["mission"],
        age=row["age"],
        role=row["role"],
        nationality=nationality,
        blood_type=blood_type,
        status=row["status"],
        created_at=row["created_at"],
        updated_at=updated_at,
        vitals=vitals,
        total_readings=total_readings,
        active_alerts=active_alerts,
    )


# --------------------------------------------------------------------------
# Backwards-Compatibility Aliases
# --------------------------------------------------------------------------
get_all_astronauts = get_all_astronaut_profiles
get_astronaut_by_id = get_astronaut_profile


def save_astronaut(astronaut: Any) -> AstronautProfile:
    """Save or update astronaut profile."""
    if hasattr(astronaut, "id") and check_astronaut_exists(astronaut.id):
        data = AstronautUpdate(
            name=getattr(astronaut, "name", None),
            age=getattr(astronaut, "age", None),
            role=getattr(astronaut, "role", None),
            mission_id=getattr(astronaut, "mission_id", None) or getattr(astronaut, "mission", None),
            status=getattr(astronaut, "status", None),
        )
        return update_astronaut_profile(astronaut.id, data)
    else:
        create_data = AstronautCreate(
            id=getattr(astronaut, "id", None),
            name=getattr(astronaut, "name", ""),
            mission_id=getattr(astronaut, "mission_id", None) or getattr(astronaut, "mission", "ARTEMIS-VII"),
            age=getattr(astronaut, "age", 35),
            role=getattr(astronaut, "role", "Specialist"),
            status=getattr(astronaut, "status", "Normal"),
        )
        return create_astronaut_profile(create_data)


# --------------------------------------------------------------------------
# Health Telemetry SQLite Helpers
# --------------------------------------------------------------------------

def save_health_reading(
    reading_data: Dict[str, Any],
    health_status: str,
    alerts_generated: int = 0,
    ml_prediction: Optional[Dict[str, Any]] = None,
) -> HealthReadingResponse:
    """Store a new biometric health reading in the SQLite database and update astronaut status."""
    timestamp = reading_data.get("timestamp") or datetime.now(timezone.utc).isoformat()
    astro_id = reading_data["astronaut_id"]

    with get_db() as conn:
        cursor = conn.cursor()

        # Serialize ml_prediction dict to JSON string for SQLite TEXT column
        ml_json = json.dumps(ml_prediction) if ml_prediction else None

        # Insert reading
        cursor.execute(
            """
            INSERT INTO health_readings (
                astronaut_id, timestamp, heart_rate, spo2, body_temperature,
                respiratory_rate, sleep_hours, activity_level,
                blood_pressure_systolic, blood_pressure_diastolic,
                radiation_exposure, cabin_co2_level, health_status, alerts_generated,
                ml_prediction
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                astro_id,
                timestamp,
                float(reading_data["heart_rate"]),
                float(reading_data["spo2"]),
                float(reading_data["body_temperature"]),
                float(reading_data.get("respiratory_rate") or 16.0),
                float(reading_data.get("sleep_hours") or 7.5),
                str(reading_data.get("activity_level") or "RESTING"),
                int(reading_data.get("blood_pressure_systolic") or 120),
                int(reading_data.get("blood_pressure_diastolic") or 80),
                float(reading_data.get("radiation_exposure") or 0.15),
                float(reading_data.get("cabin_co2_level") or 0.04),
                health_status,
                alerts_generated,
                ml_json,
            ),
        )
        reading_id = cursor.lastrowid

        # Update astronaut overall status in astronauts table
        cursor.execute(
            "UPDATE astronauts SET status = ? WHERE id = ?",
            (health_status, astro_id),
        )

        # Retrieve inserted row
        cursor.execute("SELECT * FROM health_readings WHERE id = ?", (reading_id,))
        row = cursor.fetchone()
        return _row_to_health_reading(row)


def get_latest_reading_for_astronaut(astronaut_id: str) -> Optional[HealthReadingResponse]:
    """Retrieve the most recent health telemetry reading for a specific astronaut."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT * FROM health_readings
            WHERE astronaut_id = ?
            ORDER BY timestamp DESC, id DESC
            LIMIT 1
            """,
            (astronaut_id,),
        )
        row = cursor.fetchone()
        if not row:
            return None
        return _row_to_health_reading(row)


def get_latest_readings_all() -> List[HealthReadingResponse]:
    """Retrieve the latest reading for each astronaut in the mission."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT hr.*
            FROM health_readings hr
            INNER JOIN (
                SELECT astronaut_id, MAX(id) as max_id
                FROM health_readings
                GROUP BY astronaut_id
            ) latest ON hr.id = latest.max_id
            ORDER BY hr.astronaut_id ASC
            """
        )
        rows = cursor.fetchall()
        return [_row_to_health_reading(r) for r in rows]


def get_reading_history(
    astronaut_id: str,
    limit: int = 50,
    offset: int = 0,
    order: str = "desc",
    start_time: Optional[str] = None,
    end_time: Optional[str] = None,
) -> List[HealthReadingResponse]:
    """Retrieve historical health readings for an astronaut from SQLite with optional date-range filtering."""
    order_dir = "ASC" if order.lower() == "asc" else "DESC"
    clauses = ["astronaut_id = ?"]
    params: List[Any] = [astronaut_id]

    if start_time:
        clauses.append("timestamp >= ?")
        params.append(start_time)
    if end_time:
        clauses.append("timestamp <= ?")
        params.append(end_time)

    where_sql = " AND ".join(clauses)
    query = f"""
        SELECT * FROM health_readings
        WHERE {where_sql}
        ORDER BY timestamp {order_dir}, id {order_dir}
        LIMIT ? OFFSET ?
    """
    params.extend([limit, offset])

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(query, tuple(params))
        rows = cursor.fetchall()
        return [_row_to_health_reading(r) for r in rows]


def get_historical_alerts_filtered(
    astronaut_id: str,
    start_time: Optional[str] = None,
    end_time: Optional[str] = None,
    severity: Optional[str] = None,
    limit: int = 100,
) -> List[Alert]:
    """Retrieve historical safety alerts for an astronaut with date-range and severity filtering."""
    clauses = ["astronaut_id = ?"]
    params: List[Any] = [astronaut_id]

    if start_time:
        clauses.append("timestamp >= ?")
        params.append(start_time)
    if end_time:
        clauses.append("timestamp <= ?")
        params.append(end_time)
    if severity:
        clauses.append("LOWER(severity) = ?")
        params.append(severity.lower())

    where_sql = " AND ".join(clauses)
    query = f"SELECT * FROM alerts WHERE {where_sql} ORDER BY timestamp DESC LIMIT ?"
    params.append(limit)

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(query, tuple(params))
        rows = cursor.fetchall()
        return [_row_to_alert(r) for r in rows]


def get_reading_count_for_astronaut(astronaut_id: str) -> int:
    """Get total count of stored health readings for an astronaut."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT COUNT(*) as count FROM health_readings WHERE astronaut_id = ?",
            (astronaut_id,),
        )
        return cursor.fetchone()["count"]


def _row_to_health_reading(r: sqlite3.Row) -> HealthReadingResponse:
    """Helper converting SQLite row into HealthReadingResponse."""
    keys = r.keys()
    ml_pred = None
    if "ml_prediction" in keys and r["ml_prediction"]:
        try:
            ml_pred = json.loads(r["ml_prediction"])
        except (json.JSONDecodeError, TypeError):
            ml_pred = None

    return HealthReadingResponse(
        id=r["id"],
        astronaut_id=r["astronaut_id"],
        timestamp=r["timestamp"],
        heart_rate=r["heart_rate"],
        spo2=r["spo2"],
        body_temperature=r["body_temperature"],
        respiratory_rate=r["respiratory_rate"],
        sleep_hours=r["sleep_hours"],
        activity_level=r["activity_level"],
        blood_pressure_systolic=r["blood_pressure_systolic"],
        blood_pressure_diastolic=r["blood_pressure_diastolic"],
        radiation_exposure=r["radiation_exposure"],
        cabin_co2_level=r["cabin_co2_level"],
        health_status=r["health_status"],
        alerts_generated=r["alerts_generated"],
        ml_prediction=ml_pred,
    )


# --------------------------------------------------------------------------
# Alerts SQLite Helpers
# --------------------------------------------------------------------------

def save_alert(alert: Alert) -> Alert:
    """Save an alert record into SQLite."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT OR REPLACE INTO alerts (
                id, astronaut_id, astronaut_name, alert_type, description, severity,
                timestamp, resolved, resolved_at, metric, message, acknowledged
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                alert.id,
                alert.astronaut_id,
                alert.astronaut_name,
                getattr(alert, "alert_type", "HEART_RATE") or getattr(alert, "metric", "HEART_RATE"),
                getattr(alert, "description", "") or getattr(alert, "message", ""),
                alert.severity,
                alert.timestamp,
                1 if getattr(alert, "resolved", False) else 0,
                getattr(alert, "resolved_at", None),
                getattr(alert, "metric", None) or getattr(alert, "alert_type", None),
                getattr(alert, "message", None) or getattr(alert, "description", None),
                0,
            ),
        )
    return alert


def get_all_alerts(
    limit: int = 100,
    severity: Optional[str] = None,
    resolved: Optional[bool] = None,
) -> List[Alert]:
    """Retrieve alerts ordered newest first with optional severity and resolution filtering."""
    clauses = []
    params: List[Any] = []

    if severity:
        clauses.append("LOWER(severity) = ?")
        params.append(severity.lower())
    if resolved is not None:
        clauses.append("resolved = ?")
        params.append(1 if resolved else 0)

    where_sql = f"WHERE {' AND '.join(clauses)}" if clauses else ""
    query = f"SELECT * FROM alerts {where_sql} ORDER BY timestamp DESC LIMIT ?"
    params.append(limit)

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(query, tuple(params))
        rows = cursor.fetchall()
        return [_row_to_alert(r) for r in rows]


def get_alerts_by_astronaut_id(
    astronaut_id: str,
    resolved: Optional[bool] = None,
) -> List[Alert]:
    """Retrieve alerts for a specific astronaut with optional resolution filtering."""
    clauses = ["astronaut_id = ?"]
    params: List[Any] = [astronaut_id]

    if resolved is not None:
        clauses.append("resolved = ?")
        params.append(1 if resolved else 0)

    where_sql = " AND ".join(clauses)
    query = f"SELECT * FROM alerts WHERE {where_sql} ORDER BY timestamp DESC"

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(query, tuple(params))
        rows = cursor.fetchall()
        return [_row_to_alert(r) for r in rows]


def resolve_alert(alert_id: str) -> Optional[Alert]:
    """Mark an alert as resolved in SQLite."""
    now_iso = datetime.now(timezone.utc).isoformat()
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM alerts WHERE id = ?", (alert_id,))
        if not cursor.fetchone():
            return None
        cursor.execute(
            "UPDATE alerts SET resolved = 1, resolved_at = ? WHERE id = ?",
            (now_iso, alert_id),
        )
        cursor.execute("SELECT * FROM alerts WHERE id = ?", (alert_id,))
        return _row_to_alert(cursor.fetchone())


def _row_to_alert(r: sqlite3.Row) -> Alert:
    """Convert SQLite row to Alert model."""
    keys = r.keys()
    alert_type = r["alert_type"] if "alert_type" in keys and r["alert_type"] else (r["metric"] if "metric" in keys else "ANOMALY")
    description = r["description"] if "description" in keys and r["description"] else (r["message"] if "message" in keys else "")
    resolved = bool(r["resolved"]) if "resolved" in keys else False
    resolved_at = r["resolved_at"] if "resolved_at" in keys else None

    return Alert(
        id=r["id"],
        astronaut_id=r["astronaut_id"],
        astronaut_name=r["astronaut_name"],
        alert_type=alert_type,
        description=description,
        severity=r["severity"],
        timestamp=r["timestamp"],
        resolved=resolved,
        resolved_at=resolved_at,
        metric=alert_type,
        message=description,
    )
