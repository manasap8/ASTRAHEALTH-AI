"""Health Monitoring & Telemetry API Routes.

Provides endpoints to:
- Ingest live astronaut health telemetry readings (POST)
- Store readings in SQLite with validation and error handling
- Retrieve the latest reading for any astronaut (GET)
- Retrieve historical time-series readings for trend tracking (GET)
"""
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, status

from backend.models.astronaut import (
    HealthReadingCreate,
    HealthReadingResponse,
    HistoricalReadingsResponse,
)
from backend.database import (
    get_astronaut_by_id,
    save_health_reading,
    get_latest_reading_for_astronaut,
    get_latest_readings_all,
    get_reading_history,
    get_reading_count_for_astronaut,
    save_alert,
)
from backend.services.health_analysis import evaluate_vitals

router = APIRouter(prefix="/health-data", tags=["Health Monitoring & Telemetry"])


@router.post(
    "",
    response_model=HealthReadingResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Ingest new astronaut health reading",
    description=(
        "Accepts astronaut health telemetry (heart rate, SpO2, body temperature, etc.), "
        "validates values, evaluates health thresholds, saves the reading to SQLite, "
        "and automatically generates alerts if anomalies are detected."
    ),
)
async def ingest_health_reading(data: HealthReadingCreate):
    """Ingest, validate, analyze, and persist an astronaut's health telemetry reading."""
    # 1. Verify astronaut exists in database
    astro = get_astronaut_by_id(data.astronaut_id)
    if not astro:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=(
                f"Astronaut with ID '{data.astronaut_id}' not found. "
                "Please verify the astronaut ID or register them first via POST /astronauts."
            ),
        )

    # 2. Analyze incoming telemetry: rule-based thresholds + ML anomaly detection
    overall_status, alerts, ml_result = evaluate_vitals(astro.id, astro.name, data)

    # 3. Save any generated alerts to SQLite
    for alert in alerts:
        save_alert(alert)

    # 4. Save reading to SQLite database (including ML prediction) and update astronaut status
    reading_dict = data.model_dump()
    saved_reading = save_health_reading(
        reading_data=reading_dict,
        health_status=overall_status,
        alerts_generated=len(alerts),
        ml_prediction=ml_result,
    )

    return saved_reading


@router.get(
    "/latest",
    response_model=List[HealthReadingResponse],
    summary="Get latest health readings for all crew members",
    description="Returns the most recent biometric reading recorded for each astronaut in the mission manifest.",
)
async def get_all_latest_readings():
    """Retrieve the latest health telemetry reading for every astronaut."""
    readings = get_latest_readings_all()
    return readings


@router.get(
    "/{astronaut_id}/latest",
    response_model=HealthReadingResponse,
    summary="Get latest reading for specific astronaut",
    description="Returns the most recent biometric reading for a given astronaut ID.",
)
async def get_latest_reading(astronaut_id: str):
    """Retrieve the latest telemetry reading for an astronaut."""
    # Verify astronaut exists
    astro = get_astronaut_by_id(astronaut_id)
    if not astro:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Astronaut '{astronaut_id}' not found in the mission registry.",
        )

    reading = get_latest_reading_for_astronaut(astronaut_id)
    if not reading:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No telemetry readings recorded yet for astronaut '{astronaut_id}'.",
        )
    return reading


@router.get(
    "/{astronaut_id}/history",
    response_model=HistoricalReadingsResponse,
    summary="Get historical health readings for specific astronaut",
    description=(
        "Retrieves historical time-series readings for an astronaut from SQLite. "
        "Supports date-range filtering ('start_time' and 'end_time'), "
        "pagination via 'limit' and 'offset', and sorting via 'order' (desc/asc)."
    ),
)
async def get_astronaut_history(
    astronaut_id: str,
    limit: int = Query(default=20, ge=1, le=100, description="Max number of readings to return (1-100)"),
    offset: int = Query(default=0, ge=0, description="Number of readings to skip for pagination"),
    order: str = Query(default="desc", pattern="^(asc|desc|ASC|DESC)$", description="Order by timestamp: 'desc' (newest first) or 'asc' (oldest first)"),
    start_time: Optional[str] = Query(default=None, description="Filter readings starting from timestamp (ISO-8601)"),
    end_time: Optional[str] = Query(default=None, description="Filter readings up to timestamp (ISO-8601)"),
):
    """Retrieve historical time-series health readings for trend tracking and graphs."""
    # Verify astronaut exists
    astro = get_astronaut_by_id(astronaut_id)
    if not astro:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Astronaut '{astronaut_id}' not found in the mission registry.",
        )

    # Validate date range if provided
    if start_time and end_time and start_time > end_time:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid date range: 'start_time' ({start_time}) cannot be after 'end_time' ({end_time}).",
        )

    readings = get_reading_history(
        astronaut_id=astronaut_id,
        limit=limit,
        offset=offset,
        order=order,
        start_time=start_time,
        end_time=end_time,
    )
    total_count = get_reading_count_for_astronaut(astronaut_id)

    return HistoricalReadingsResponse(
        astronaut_id=astro.id,
        astronaut_name=astro.name,
        mission=astro.mission,
        total_records=total_count,
        readings=readings,
    )
