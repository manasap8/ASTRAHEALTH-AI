"""Alert and Threshold Data Models."""
from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field


class AlertSeverity(str, Enum):
    NORMAL = "NORMAL"
    WARNING = "WARNING"
    CRITICAL = "CRITICAL"


class Alert(BaseModel):
    """Health or environmental safety alert."""
    id: str = Field(..., example="ALT-94A1F2")
    astronaut_id: str = Field(..., example="AST-001")
    astronaut_name: str = Field(..., example="Commander Alex Vance")
    severity: AlertSeverity = Field(..., example=AlertSeverity.WARNING)
    metric: str = Field(..., description="The telemetry metric that triggered the alert", example="cabin_co2_level")
    value: float = Field(..., description="Observed value", example=0.85)
    threshold_breached: str = Field(..., description="Description of the breached limit", example="> 0.50%")
    message: str = Field(..., example="Elevated Cabin CO2 detected (0.85%). Risk of headache and lethargy.")
    timestamp: str = Field(..., description="UTC ISO 8601 timestamp")
    acknowledged: bool = Field(default=False, description="Whether mission control has acknowledged the alert")


class ThresholdRange(BaseModel):
    """Configurable warning and critical bounds for a specific metric."""
    min_crit: Optional[float] = None
    min_warn: Optional[float] = None
    max_warn: Optional[float] = None
    max_crit: Optional[float] = None
    unit: str


class ThresholdConfig(BaseModel):
    """System-wide configurable safety thresholds."""
    heart_rate_resting: ThresholdRange = Field(
        default=ThresholdRange(min_crit=40.0, min_warn=50.0, max_warn=100.0, max_crit=130.0, unit="bpm")
    )
    heart_rate_active: ThresholdRange = Field(
        default=ThresholdRange(max_warn=165.0, max_crit=185.0, unit="bpm")
    )
    spo2: ThresholdRange = Field(
        default=ThresholdRange(min_crit=90.0, min_warn=95.0, unit="%")
    )
    body_temperature: ThresholdRange = Field(
        default=ThresholdRange(min_crit=35.0, min_warn=35.8, max_warn=37.5, max_crit=38.5, unit="°C")
    )
    bp_systolic: ThresholdRange = Field(
        default=ThresholdRange(max_warn=135.0, max_crit=160.0, unit="mmHg")
    )
    bp_diastolic: ThresholdRange = Field(
        default=ThresholdRange(max_warn=90.0, max_crit=100.0, unit="mmHg")
    )
    radiation_exposure: ThresholdRange = Field(
        default=ThresholdRange(max_warn=0.50, max_crit=1.00, unit="mSv")
    )
    cabin_co2_level: ThresholdRange = Field(
        default=ThresholdRange(max_warn=0.50, max_crit=1.00, unit="%")
    )
    respiratory_rate: ThresholdRange = Field(
        default=ThresholdRange(min_crit=9.0, min_warn=11.0, max_warn=22.0, max_crit=30.0, unit="breaths/min")
    )
    sleep_hours: ThresholdRange = Field(
        default=ThresholdRange(min_crit=4.0, min_warn=6.0, unit="hours")
    )
