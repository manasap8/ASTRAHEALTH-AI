"""Historical Health Analytics & Trend Analysis Models."""
from typing import Optional, List, Dict
from pydantic import BaseModel, Field
from backend.models.astronaut import Alert


class MetricStatistics(BaseModel):
    """Statistical summary and trend for a single vital parameter."""
    metric: str = Field(..., example="heart_rate")
    unit: str = Field(..., example="bpm")
    min: float = Field(..., example=68.0)
    max: float = Field(..., example=84.0)
    average: float = Field(..., example=73.5)
    latest: float = Field(..., example=74.0)
    trend: str = Field(..., description="Trend direction: RISING, FALLING, or STABLE", example="STABLE")
    delta_from_avg: float = Field(..., description="Difference between latest reading and period average", example=0.5)
    percent_change: float = Field(..., description="Percent change from period average", example=0.7)
    status: str = Field(..., description="Status: Normal, Warning, or Critical", example="Normal")


class RecentComparison(BaseModel):
    """Comparison between the latest reading and the immediately preceding reading."""
    metric: str = Field(..., example="heart_rate")
    unit: str = Field(..., example="bpm")
    latest_value: float = Field(..., example=74.0)
    previous_value: float = Field(..., example=71.5)
    change: float = Field(..., description="Difference (latest - previous)", example=2.5)
    is_significant_change: bool = Field(..., description="Whether change exceeds nominal variability threshold", example=False)


class ChartDataResponse(BaseModel):
    """Structured time-series payload optimized for frontend chart libraries (Chart.js, Recharts, Plotly)."""
    astronaut_id: str = Field(..., example="AST-001")
    astronaut_name: str = Field(..., example="Commander Alex Vance")
    mission_id: str = Field(..., example="ARTEMIS-VII")
    total_data_points: int = Field(..., example=6)
    timestamps: List[str] = Field(..., description="Time-series x-axis labels (ISO strings)")
    heart_rate: List[float] = Field(..., description="Heart rate values (bpm)")
    spo2: List[float] = Field(..., description="SpO2 values (%)")
    body_temperature: List[float] = Field(..., description="Core body temperature (°C)")
    respiratory_rate: List[float] = Field(..., description="Respiratory rate (breaths/min)")


class HistoricalAnalysisResponse(BaseModel):
    """Comprehensive historical health analysis, trends, and statistics."""
    astronaut_id: str = Field(..., example="AST-001")
    astronaut_name: str = Field(..., example="Commander Alex Vance")
    mission_id: str = Field(..., example="ARTEMIS-VII")
    total_readings: int = Field(..., example=6)
    time_range: Dict[str, Optional[str]] = Field(
        ...,
        example={"start_time": "2026-11-14T00:00:00Z", "end_time": "2026-11-14T23:59:59Z"},
    )
    statistics: Dict[str, MetricStatistics] = Field(
        ...,
        description="Calculated min, max, average, and trend for each biometric parameter",
    )
    recent_comparison: List[RecentComparison] = Field(
        ...,
        description="Comparison between latest reading and previous baseline reading",
    )
    unusual_changes: List[str] = Field(
        ...,
        description="Identified abnormal fluctuations, rapid spikes, or threshold breaches",
        example=["SpO2 dropped by 3.5% between consecutive readings."],
    )
    summary: str = Field(
        ...,
        description="Human-readable space medicine summary of the astronaut's health trends",
        example="Vitals remained within nominal parameters over the selected period.",
    )


class HistoricalAlertsResponse(BaseModel):
    """Historical safety alerts within a selected date range."""
    astronaut_id: str = Field(..., example="AST-001")
    astronaut_name: str = Field(..., example="Commander Alex Vance")
    total_alerts: int = Field(..., example=2)
    time_range: Dict[str, Optional[str]] = Field(...)
    alerts: List[Alert] = Field(...)
