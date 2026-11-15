"""Health and Safety Alerts Routes.

Provides endpoints to:
- Retrieve all safety alerts with optional severity and resolution filtering (GET)
- Retrieve alerts for a specific astronaut (GET)
- Mark an alert as resolved by mission control (PATCH)
"""
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, status

from backend.models.astronaut import Alert, AlertResolveResponse
from backend.database import (
    get_all_alerts,
    get_alerts_by_astronaut_id,
    resolve_alert,
    check_astronaut_exists,
)

router = APIRouter(prefix="/alerts", tags=["Alerts & Safety Monitoring"])


@router.get(
    "",
    response_model=List[Alert],
    summary="List all safety alerts",
    description="Retrieve all health alerts across crew members with optional filtering by severity (Normal, Warning, Critical) or resolution state.",
)
async def list_alerts(
    severity: Optional[str] = Query(default=None, description="Filter by severity level: Normal, Warning, or Critical"),
    resolved: Optional[bool] = Query(default=None, description="Filter by resolution status (true = resolved, false = active/unresolved)"),
    limit: int = Query(default=50, ge=1, le=200, description="Maximum number of alerts to return"),
):
    """Retrieve filtered alerts ordered newest first."""
    return get_all_alerts(limit=limit, severity=severity, resolved=resolved)


@router.get(
    "/astronaut/{astronaut_id}",
    response_model=List[Alert],
    summary="List alerts for a specific astronaut",
    description="Retrieve alerts recorded for an individual astronaut, optionally filtered by active/resolved status.",
)
async def list_astronaut_alerts(
    astronaut_id: str,
    resolved: Optional[bool] = Query(default=None, description="Filter by resolution status (true/false)"),
):
    """Retrieve all alerts for a given astronaut."""
    if not check_astronaut_exists(astronaut_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Astronaut with ID '{astronaut_id}' not found in the mission registry.",
        )
    return get_alerts_by_astronaut_id(astronaut_id=astronaut_id, resolved=resolved)


@router.patch(
    "/{alert_id}/resolve",
    response_model=AlertResolveResponse,
    summary="Mark an alert as resolved",
    description="Updates the status of an active health alert to resolved with a timestamp.",
)
async def mark_alert_resolved(alert_id: str):
    """Acknowledge and mark an anomaly alert as resolved."""
    updated_alert = resolve_alert(alert_id)
    if not updated_alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Alert with ID '{alert_id}' not found.",
        )
    return AlertResolveResponse(
        success=True,
        message=f"Alert '{alert_id}' has been successfully resolved.",
        alert=updated_alert,
    )
