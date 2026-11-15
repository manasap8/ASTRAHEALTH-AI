"""Astronaut and Biometric Vitals Data Models.

Uses Pydantic for validation, serializing, and self-documenting Swagger UI.
"""
from enum import Enum
from typing import Any, Dict, Optional, List
from pydantic import BaseModel, Field


class AlertSeverity(str, Enum):
    """Alert severity levels."""
    NORMAL = "Normal"
    WARNING = "Warning"
    CRITICAL = "Critical"


class Vitals(BaseModel):
    """Real-time biometric vital signs telemetry."""
    heart_rate: float = Field(
        ..., ge=20.0, le=250.0, description="Heart rate in beats per minute (bpm)", example=72.0
    )
    spo2: float = Field(
        ..., ge=50.0, le=100.0, description="Blood oxygen saturation SpO2 (%)", example=98.5
    )
    respiratory_rate: float = Field(
        ..., ge=5.0, le=60.0, description="Respiratory rate in breaths per minute", example=16.0
    )
    body_temperature: float = Field(
        ..., ge=30.0, le=45.0, description="Body temperature in Celsius (°C)", example=36.7
    )
    sleep_hours: float = Field(
        ..., ge=0.0, le=24.0, description="Sleep duration in hours (last 24h sleep cycle)", example=7.5
    )
    activity_level: str = Field(
        default="RESTING",
        description="Current activity level: RESTING, MODERATE, HIGH, EVA, or EXERCISE",
        example="RESTING",
    )

    # Optional supplementary metrics for spaceflight telemetry
    blood_pressure_systolic: Optional[int] = Field(default=120, ge=60, le=220, description="Systolic blood pressure (mmHg)", example=120)
    blood_pressure_diastolic: Optional[int] = Field(default=80, ge=40, le=140, description="Diastolic blood pressure (mmHg)", example=80)
    radiation_exposure: Optional[float] = Field(default=0.15, ge=0.0, description="Radiation level in mSv", example=0.15)
    cabin_co2_level: Optional[float] = Field(default=0.04, ge=0.0, le=5.0, description="Cabin CO2 percentage (%)", example=0.04)


# --------------------------------------------------------------------------
# Astronaut Profile Models
# --------------------------------------------------------------------------

class AstronautBase(BaseModel):
    """Base fields for astronaut profiles."""
    name: str = Field(
        ...,
        min_length=2,
        max_length=100,
        description="Astronaut's full name",
        example="Commander Alex Vance",
    )
    mission_id: str = Field(
        ...,
        min_length=2,
        max_length=50,
        description="Designated mission ID (e.g. ARTEMIS-VII)",
        example="ARTEMIS-VII",
    )
    age: int = Field(
        ...,
        ge=18,
        le=80,
        description="Age of astronaut (18-80)",
        example=38,
    )
    role: str = Field(
        ...,
        min_length=2,
        max_length=100,
        description="Role or assignment aboard the spacecraft",
        example="Mission Commander & Pilot",
    )
    nationality: Optional[str] = Field(
        default="NASA / USA",
        max_length=100,
        description="Country or space agency affiliation",
        example="NASA / USA",
    )
    blood_type: Optional[str] = Field(
        default="O+",
        description="Blood type for medical emergencies",
        example="O+",
    )
    status: Optional[str] = Field(
        default="Normal",
        description="Overall mission and health status",
        example="Normal",
    )


class AstronautCreate(AstronautBase):
    """Schema for registering a new astronaut."""
    id: Optional[str] = Field(
        default=None,
        description="Optional unique astronaut ID (e.g., AST-004). If omitted, an ID is auto-generated.",
        example="AST-004",
    )
    # Compatibility alias
    mission: Optional[str] = Field(default=None, description="Optional alias for mission_id")


class AstronautUpdate(BaseModel):
    """Schema for updating an existing astronaut's profile."""
    name: Optional[str] = Field(default=None, min_length=2, max_length=100, example="Commander Alex Vance")
    mission_id: Optional[str] = Field(default=None, min_length=2, max_length=50, example="ARTEMIS-VII")
    age: Optional[int] = Field(default=None, ge=18, le=80, example=39)
    role: Optional[str] = Field(default=None, min_length=2, max_length=100, example="Commander & Lead Pilot")
    nationality: Optional[str] = Field(default=None, max_length=100, example="NASA / USA")
    blood_type: Optional[str] = Field(default=None, example="O+")
    status: Optional[str] = Field(default=None, description="Health/mission status", example="Normal")


class AstronautProfile(AstronautBase):
    """Comprehensive astronaut profile including connected health vitals & metrics."""
    id: str = Field(..., description="Unique astronaut identifier", example="AST-001")
    mission: str = Field(..., description="Mission designation (compatibility alias)", example="ARTEMIS-VII")
    status: str = Field(default="Normal", description="Overall health status: Normal, Warning, or Critical", example="Normal")
    created_at: str = Field(..., description="Profile registration timestamp", example="2026-11-14T09:00:00+00:00")
    updated_at: str = Field(..., description="Last profile update timestamp", example="2026-11-14T09:00:00+00:00")
    vitals: Optional[Vitals] = Field(default=None, description="Most recent vital signs telemetry")
    total_readings: int = Field(default=0, description="Total health readings recorded for this astronaut", example=12)
    active_alerts: int = Field(default=0, description="Number of unresolved active alerts", example=0)


# Backward-compatibility alias
Astronaut = AstronautProfile


class AstronautDeleteResponse(BaseModel):
    """Response returned upon deleting an astronaut profile."""
    success: bool = Field(default=True, example=True)
    message: str = Field(..., example="Astronaut profile 'AST-004' and connected records were successfully deleted.")
    deleted_id: str = Field(..., example="AST-004")


# --------------------------------------------------------------------------
# Alerts & Threshold Models
# --------------------------------------------------------------------------

class Alert(BaseModel):
    """Health anomaly alert triggered by health analysis service."""
    id: str = Field(..., description="Unique alert ID (e.g., ALT-001)", example="ALT-001")
    astronaut_id: str = Field(..., description="Astronaut identifier", example="AST-001")
    astronaut_name: str = Field(..., description="Astronaut full name", example="Commander Alex Vance")
    alert_type: str = Field(
        ...,
        description="Anomaly type: HEART_RATE, SPO2, BODY_TEMPERATURE, RESPIRATORY_RATE, SLEEP, CABIN_CO2, RADIATION",
        example="HEART_RATE",
    )
    description: str = Field(..., description="Detailed description of the abnormal condition", example="Critical tachycardia detected: 142.0 bpm")
    severity: str = Field(..., description="Alert severity: Normal, Warning, or Critical", example="Critical")
    timestamp: str = Field(..., description="UTC ISO 8601 timestamp", example="2026-11-14T09:15:00+00:00")
    resolved: bool = Field(default=False, description="Whether alert has been marked as resolved", example=False)
    resolved_at: Optional[str] = Field(default=None, description="Timestamp when alert was resolved", example=None)

    # Backward compatibility aliases
    metric: Optional[str] = Field(default=None, description="Legacy alias for alert_type")
    message: Optional[str] = Field(default=None, description="Legacy alias for description")


class AlertResolveResponse(BaseModel):
    """Response when marking an alert as resolved."""
    success: bool = Field(default=True, example=True)
    message: str = Field(..., example="Alert 'ALT-001' successfully marked as resolved.")
    alert: Alert


class ThresholdItem(BaseModel):
    """Configurable boundaries for a metric."""
    min_crit: Optional[float] = Field(default=None, example=40.0)
    min_warn: Optional[float] = Field(default=None, example=50.0)
    max_warn: Optional[float] = Field(default=None, example=100.0)
    max_crit: Optional[float] = Field(default=None, example=130.0)
    unit: str = Field(..., example="bpm")


class ThresholdConfig(BaseModel):
    """System-wide configurable safety thresholds."""
    heart_rate_resting: ThresholdItem = Field(
        default=ThresholdItem(min_crit=40.0, min_warn=50.0, max_warn=100.0, max_crit=130.0, unit="bpm")
    )
    heart_rate_active: ThresholdItem = Field(
        default=ThresholdItem(max_warn=165.0, max_crit=185.0, unit="bpm")
    )
    spo2: ThresholdItem = Field(
        default=ThresholdItem(min_crit=90.0, min_warn=95.0, unit="%")
    )
    body_temperature: ThresholdItem = Field(
        default=ThresholdItem(min_crit=35.0, min_warn=35.8, max_warn=37.5, max_crit=38.5, unit="°C")
    )
    respiratory_rate: ThresholdItem = Field(
        default=ThresholdItem(min_crit=9.0, min_warn=11.0, max_warn=22.0, max_crit=30.0, unit="breaths/min")
    )
    sleep_hours: ThresholdItem = Field(
        default=ThresholdItem(min_crit=4.0, min_warn=6.0, unit="hours")
    )
    cabin_co2_level: ThresholdItem = Field(
        default=ThresholdItem(max_warn=0.50, max_crit=1.00, unit="%")
    )
    radiation_exposure: ThresholdItem = Field(
        default=ThresholdItem(max_warn=0.50, max_crit=1.00, unit="mSv")
    )


# --------------------------------------------------------------------------
# Health Telemetry Models
# --------------------------------------------------------------------------

class HealthReadingCreate(BaseModel):
    """Schema for ingesting incoming astronaut health telemetry readings."""
    astronaut_id: str = Field(
        ...,
        description="Unique astronaut identifier (e.g. AST-001)",
        example="AST-001",
    )
    heart_rate: float = Field(
        ...,
        ge=20.0,
        le=250.0,
        description="Heart rate in beats per minute (bpm)",
        example=75.0,
    )
    spo2: float = Field(
        ...,
        ge=50.0,
        le=100.0,
        description="Blood oxygen saturation (%)",
        example=98.5,
    )
    body_temperature: float = Field(
        ...,
        ge=30.0,
        le=45.0,
        description="Core body temperature in Celsius (°C)",
        example=36.8,
    )
    timestamp: Optional[str] = Field(
        default=None,
        description="UTC ISO 8601 timestamp (auto-generated if omitted)",
        example="2026-11-14T09:00:00Z",
    )
    respiratory_rate: Optional[float] = Field(
        default=16.0,
        ge=5.0,
        le=60.0,
        description="Respiratory rate in breaths/min",
        example=16.0,
    )
    sleep_hours: Optional[float] = Field(
        default=7.5,
        ge=0.0,
        le=24.0,
        description="Sleep duration in hours during last cycle",
        example=7.5,
    )
    activity_level: Optional[str] = Field(
        default="RESTING",
        description="Current activity: RESTING, MODERATE, HIGH, EVA, or EXERCISE",
        example="RESTING",
    )
    blood_pressure_systolic: Optional[int] = Field(
        default=120,
        ge=60,
        le=220,
        description="Systolic blood pressure (mmHg)",
        example=120,
    )
    blood_pressure_diastolic: Optional[int] = Field(
        default=80,
        ge=40,
        le=140,
        description="Diastolic blood pressure (mmHg)",
        example=80,
    )
    radiation_exposure: Optional[float] = Field(
        default=0.15,
        ge=0.0,
        description="Radiation level in mSv",
        example=0.15,
    )
    cabin_co2_level: Optional[float] = Field(
        default=0.04,
        ge=0.0,
        le=5.0,
        description="Cabin CO2 concentration (%)",
        example=0.04,
    )


class HealthReadingResponse(BaseModel):
    """Schema for stored health reading records."""
    id: int = Field(..., description="Unique reading ID in database", example=1)
    astronaut_id: str = Field(..., example="AST-001")
    timestamp: str = Field(..., example="2026-11-14T09:00:00+00:00")
    heart_rate: float = Field(..., example=75.0)
    spo2: float = Field(..., example=98.5)
    body_temperature: float = Field(..., example=36.8)
    respiratory_rate: float = Field(..., example=16.0)
    sleep_hours: float = Field(..., example=7.5)
    activity_level: str = Field(..., example="RESTING")
    blood_pressure_systolic: Optional[int] = Field(default=120, example=120)
    blood_pressure_diastolic: Optional[int] = Field(default=80, example=80)
    radiation_exposure: Optional[float] = Field(default=0.15, example=0.15)
    cabin_co2_level: Optional[float] = Field(default=0.04, example=0.04)
    health_status: str = Field(default="Normal", description="Evaluated health status: Normal, Warning, or Critical", example="Normal")
    alerts_generated: int = Field(default=0, description="Number of new health alerts generated by this reading", example=0)
    ml_prediction: Optional[Dict[str, Any]] = Field(
        default=None,
        description="ML anomaly detection result. Contains ml_status ('NORMAL'|'ANOMALY'|'UNAVAILABLE'), confidence, models_used, and predictions.",
        example={"ml_status": "NORMAL", "confidence": "HIGH", "models_used": ["astrahealth_anomaly_model", "astrahealth_realdata_model"], "predictions": {"anomaly_model": 1, "realdata_model": 1}, "message": "All ML models predict normal biometric readings."},
    )


class HistoricalReadingsResponse(BaseModel):
    """Schema for historical telemetry retrieval."""
    astronaut_id: str = Field(..., example="AST-001")
    astronaut_name: str = Field(..., example="Commander Alex Vance")
    mission: str = Field(..., example="ARTEMIS-VII")
    total_records: int = Field(..., example=10)
    readings: List[HealthReadingResponse]
