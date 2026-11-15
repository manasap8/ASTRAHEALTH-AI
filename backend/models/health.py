"""Health Telemetry and Prediction Data Models.

Defines schemas for:
- Live biometric vitals telemetry
- Health reading ingestion and responses
- Machine learning risk prediction inputs and outputs
"""
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


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
    health_status: str = Field(default="Normal", description="Evaluated health status", example="Normal")
    alerts_generated: int = Field(default=0, description="Number of new health alerts generated by this reading", example=0)


class HistoricalReadingsResponse(BaseModel):
    """Schema for historical telemetry retrieval."""
    astronaut_id: str = Field(..., example="AST-001")
    astronaut_name: str = Field(..., example="Commander Alex Vance")
    mission: str = Field(..., example="ARTEMIS-VII")
    total_records: int = Field(..., example=10)
    readings: List[HealthReadingResponse]


# --------------------------------------------------------------------------
# Machine Learning Prediction Schemas
# --------------------------------------------------------------------------

class PredictionInput(BaseModel):
    """Feature vector schema for ML health risk assessment."""
    astronaut_id: Optional[str] = Field(
        default=None,
        description="Optional astronaut ID to associate prediction with",
        example="AST-001",
    )
    heart_rate: float = Field(..., ge=20.0, le=250.0, description="Heart rate in bpm", example=76.0)
    spo2: float = Field(..., ge=50.0, le=100.0, description="Oxygen saturation in %", example=98.5)
    body_temperature: float = Field(..., ge=30.0, le=45.0, description="Body temperature in °C", example=36.8)
    respiratory_rate: Optional[float] = Field(default=16.0, ge=5.0, le=60.0, example=16.0)
    sleep_hours: Optional[float] = Field(default=7.5, ge=0.0, le=24.0, example=7.5)
    activity_level: Optional[str] = Field(default="RESTING", example="RESTING")
    radiation_exposure: Optional[float] = Field(default=0.15, ge=0.0, example=0.15)
    cabin_co2_level: Optional[float] = Field(default=0.04, ge=0.0, le=5.0, example=0.04)


class HealthRiskPrediction(BaseModel):
    """Response schema for machine learning health risk evaluation."""
    model_status: str = Field(
        ...,
        description="Current state of the ML model: 'READY' or 'MODEL_PENDING'",
        example="MODEL_PENDING",
    )
    model_loaded: bool = Field(
        ...,
        description="Whether a trained model weight file is loaded on disk",
        example=False,
    )
    model_name: str = Field(default="AstronautHealthRiskPredictor", example="AstronautHealthRiskPredictor")
    model_version: str = Field(default="v1.0.0-placeholder", example="v1.0.0-placeholder")
    risk_level: Optional[str] = Field(
        default=None,
        description="Predicted health risk category (Low, Moderate, High, Critical)",
        example="Low",
    )
    risk_score: Optional[float] = Field(
        default=None,
        description="Confidence or anomaly score (0.0 - 1.0)",
        example=0.12,
    )
    input_features: Dict[str, Any] = Field(..., description="Echo of input features evaluated")
    contributing_factors: List[str] = Field(default=[], description="Biometric features triggering highest risk weighting")
    recommendation: str = Field(..., description="Actionable recommendation for flight surgeon / crew")
    timestamp: str = Field(..., description="Prediction timestamp (UTC ISO 8601)")
