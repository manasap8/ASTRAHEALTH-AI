"""Historical Health Data & Analysis API Routes.

Provides endpoints to:
- Retrieve historical health readings and trends for an astronaut (GET /analytics/{id}/analysis)
- Calculate average, minimum, maximum values and identify trends
- Compare recent readings with previous baseline readings
- Provide structured JSON time-series arrays for frontend charts (GET /analytics/{id}/charts)
- Retrieve historical safety alerts with date-range filtering (GET /analytics/{id}/alerts)
"""
from datetime import datetime
from typing import Optional, Tuple
from fastapi import APIRouter, HTTPException, Query, status

from backend.models.analytics import (
    HistoricalAnalysisResponse,
    ChartDataResponse,
    HistoricalAlertsResponse,
)
from backend.database import (
    get_astronaut_profile,
    get_reading_history,
    get_historical_alerts_filtered,
)
from backend.services.trend_analysis import (
    analyze_historical_trends,
    extract_chart_data,
)

router = APIRouter(prefix="/analytics", tags=["Historical Health Data & Analysis"])


def _validate_date_range(start_time: Optional[str], end_time: Optional[str]) -> Tuple[Optional[str], Optional[str]]:
    """Validate and normalize ISO-8601 date range filters.

    Raises:
        HTTPException 400: If date strings cannot be parsed or start_time > end_time.
    """
    s_dt = None
    e_dt = None

    if start_time:
        try:
            cleaned_start = start_time.replace("Z", "+00:00")
            s_dt = datetime.fromisoformat(cleaned_start)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"Invalid 'start_time' parameter '{start_time}'. "
                    "Expected valid ISO-8601 format (e.g., '2026-11-14T00:00:00Z' or '2026-11-14T12:00:00')."
                ),
            )

    if end_time:
        try:
            cleaned_end = end_time.replace("Z", "+00:00")
            e_dt = datetime.fromisoformat(cleaned_end)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"Invalid 'end_time' parameter '{end_time}'. "
                    "Expected valid ISO-8601 format (e.g., '2026-11-14T23:59:59Z' or '2026-11-14T18:00:00')."
                ),
            )

    if s_dt and e_dt and s_dt > e_dt:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Invalid date range: 'start_time' ({start_time}) cannot be after 'end_time' ({end_time}). "
                "Please verify the chronological order of your filter window."
            ),
        )

    return start_time, end_time


@router.get(
    "/{astronaut_id}/analysis",
    response_model=HistoricalAnalysisResponse,
    summary="Analyze historical vitals, trends, and statistics",
    description=(
        "Retrieves historical readings for a particular astronaut over an optional date range. "
        "Calculates minimum, maximum, and average values for heart rate, SpO2, and body temperature. "
        "Identifies trends (RISING, FALLING, STABLE), detects unusual fluctuations, "
        "and compares recent readings against previous baselines."
    ),
)
async def get_historical_analysis(
    astronaut_id: str,
    start_time: Optional[str] = Query(
        default=None,
        description="Filter readings starting from this timestamp (ISO-8601, e.g. '2026-11-14T00:00:00Z')",
        examples=["2026-11-14T00:00:00Z"],
    ),
    end_time: Optional[str] = Query(
        default=None,
        description="Filter readings up to this timestamp (ISO-8601, e.g. '2026-11-14T23:59:59Z')",
        examples=["2026-11-14T23:59:59Z"],
    ),
    limit: int = Query(default=100, ge=1, le=500, description="Max readings to include in analysis"),
):
    """Perform full statistical, trend, and anomaly analysis on an astronaut's telemetry history."""
    # 1. Validate astronaut exists
    astro = get_astronaut_profile(astronaut_id)
    if not astro:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Astronaut with ID '{astronaut_id}' not found in the mission registry.",
        )

    # 2. Validate date range parameters
    s_iso, e_iso = _validate_date_range(start_time, end_time)

    # 3. Retrieve historical readings from SQLite
    readings = get_reading_history(
        astronaut_id=astronaut_id,
        limit=limit,
        offset=0,
        order="asc",  # Chronological order for trend computation
        start_time=s_iso,
        end_time=e_iso,
    )

    # 4. Run trend and statistical analysis
    analysis = analyze_historical_trends(
        astronaut_id=astro.id,
        astronaut_name=astro.name,
        mission_id=astro.mission_id,
        readings=readings,
        start_time=s_iso,
        end_time=e_iso,
    )

    return analysis


@router.get(
    "/{astronaut_id}/charts",
    response_model=ChartDataResponse,
    summary="Retrieve structured time-series data for frontend charts",
    description=(
        "Returns synchronized coordinate arrays (timestamps, heart rate, SpO2, body temperature, respiratory rate) "
        "specifically formatted for frontend data visualization libraries (Chart.js, Recharts, Plotly)."
    ),
)
async def get_chart_data(
    astronaut_id: str,
    start_time: Optional[str] = Query(default=None, description="Start timestamp (ISO-8601)"),
    end_time: Optional[str] = Query(default=None, description="End timestamp (ISO-8601)"),
    limit: int = Query(default=100, ge=1, le=500, description="Maximum data points for charting"),
):
    """Retrieve structured time-series arrays for plotting graphs and telemetry curves."""
    # 1. Validate astronaut exists
    astro = get_astronaut_profile(astronaut_id)
    if not astro:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Astronaut with ID '{astronaut_id}' not found in the mission registry.",
        )

    # 2. Validate date range
    s_iso, e_iso = _validate_date_range(start_time, end_time)

    # 3. Retrieve readings chronologically
    readings = get_reading_history(
        astronaut_id=astronaut_id,
        limit=limit,
        offset=0,
        order="asc",
        start_time=s_iso,
        end_time=e_iso,
    )

    # 4. Extract chart arrays
    return extract_chart_data(
        astronaut_id=astro.id,
        astronaut_name=astro.name,
        mission_id=astro.mission_id,
        readings=readings,
    )


@router.get(
    "/{astronaut_id}/alerts",
    response_model=HistoricalAlertsResponse,
    summary="Retrieve historical alerts with date-range filtering",
    description=(
        "Retrieves historical safety alerts triggered for a specific astronaut. "
        "Supports filtering by date range (start_time, end_time) and severity level."
    ),
)
async def get_historical_alerts(
    astronaut_id: str,
    start_time: Optional[str] = Query(default=None, description="Start timestamp (ISO-8601)"),
    end_time: Optional[str] = Query(default=None, description="End timestamp (ISO-8601)"),
    severity: Optional[str] = Query(default=None, description="Filter by severity: Normal, Warning, or Critical"),
    limit: int = Query(default=50, ge=1, le=200, description="Max alerts to retrieve"),
):
    """Retrieve historical anomaly and safety alerts recorded for an astronaut."""
    # 1. Validate astronaut exists
    astro = get_astronaut_profile(astronaut_id)
    if not astro:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Astronaut with ID '{astronaut_id}' not found in the mission registry.",
        )

    # 2. Validate date range
    s_iso, e_iso = _validate_date_range(start_time, end_time)

    # 3. Retrieve alerts from SQLite
    alerts = get_historical_alerts_filtered(
        astronaut_id=astronaut_id,
        start_time=s_iso,
        end_time=e_iso,
        severity=severity,
        limit=limit,
    )

    return HistoricalAlertsResponse(
        astronaut_id=astro.id,
        astronaut_name=astro.name,
        total_alerts=len(alerts),
        time_range={"start_time": s_iso, "end_time": e_iso},
        alerts=alerts,
    )
