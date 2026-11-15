"""Astronaut Profiles Management API Routes.

Provides complete CRUD operations:
- Register new astronaut profiles with duplicate ID prevention (POST)
- Retrieve all astronaut profiles with connected telemetry stats (GET)
- Retrieve a single astronaut profile by ID (GET)
- Update an astronaut profile (PUT)
- Delete an astronaut profile and cleanup connected records (DELETE)
- Ingest live telemetry vitals (POST)
"""
from typing import List
from fastapi import APIRouter, HTTPException, status

from backend.models.astronaut import (
    AstronautProfile,
    AstronautCreate,
    AstronautUpdate,
    AstronautDeleteResponse,
    Vitals,
)
from backend.database import (
    create_astronaut_profile,
    get_all_astronaut_profiles,
    get_astronaut_profile,
    update_astronaut_profile,
    delete_astronaut_profile,
    save_alert,
    save_health_reading,
)
from backend.services.health_analysis import evaluate_vitals

router = APIRouter(prefix="/astronauts", tags=["Astronaut Profiles"])


@router.post(
    "",
    response_model=AstronautProfile,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new astronaut",
    description=(
        "Registers a new astronaut profile. Validates incoming information "
        "(name, age, mission ID, role, nationality, blood type). "
        "Guarantees unique astronaut IDs (returns 409 Conflict if ID already exists). "
        "If ID is omitted, a unique ID (e.g. AST-004) is generated automatically."
    ),
)
async def register_astronaut(data: AstronautCreate):
    """Create and persist a new astronaut profile."""
    try:
        profile = create_astronaut_profile(data)
        return profile
    except ValueError as e:
        if "DUPLICATE_ID" in str(e):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=str(e).replace("DUPLICATE_ID: ", ""),
            )
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get(
    "",
    response_model=List[AstronautProfile],
    summary="Retrieve all astronaut profiles",
    description=(
        "Retrieves all registered astronaut crew profiles, connected with their "
        "latest vital signs telemetry, total readings on record, and active alerts count."
    ),
)
async def list_astronauts():
    """Retrieve full crew registry with live connected telemetry summaries."""
    return get_all_astronaut_profiles()


@router.get(
    "/{astronaut_id}",
    response_model=AstronautProfile,
    summary="Retrieve astronaut profile by ID",
    description=(
        "Retrieves a specific astronaut's profile information by ID, connected "
        "with their latest biometric telemetry, total readings count, and active alerts."
    ),
)
async def get_astronaut(astronaut_id: str):
    """Retrieve specific astronaut profile by ID."""
    astro = get_astronaut_profile(astronaut_id)
    if not astro:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Astronaut with ID '{astronaut_id}' not found in the mission registry.",
        )
    return astro


@router.put(
    "/{astronaut_id}",
    response_model=AstronautProfile,
    summary="Update astronaut profile",
    description="Updates information (name, role, age, mission ID, nationality, blood type, status) for an existing astronaut.",
)
async def update_astronaut(astronaut_id: str, data: AstronautUpdate):
    """Update profile details for an existing astronaut."""
    updated = update_astronaut_profile(astronaut_id, data)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Cannot update: Astronaut with ID '{astronaut_id}' does not exist.",
        )
    return updated


@router.delete(
    "/{astronaut_id}",
    response_model=AstronautDeleteResponse,
    summary="Delete astronaut profile",
    description=(
        "Deletes an astronaut profile from the database and safely cleans up "
        "all connected health telemetry readings and alerts."
    ),
)
async def delete_astronaut(astronaut_id: str):
    """Delete an astronaut profile and associated records."""
    deleted = delete_astronaut_profile(astronaut_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Cannot delete: Astronaut with ID '{astronaut_id}' not found.",
        )
    return AstronautDeleteResponse(
        success=True,
        message=f"Astronaut profile '{astronaut_id}' and all connected health records were successfully deleted.",
        deleted_id=astronaut_id,
    )


# --------------------------------------------------------------------------
# Biometric Telemetry Ingestion (Preserved for backwards compatibility)
# --------------------------------------------------------------------------

@router.post(
    "/{astronaut_id}/vitals",
    response_model=AstronautProfile,
    summary="Stream biometric vitals telemetry",
    description=(
        "Ingests live vital signs telemetry, evaluates space medicine thresholds, "
        "generates alerts for anomalies, saves reading to SQLite, and returns updated profile."
    ),
)
async def ingest_vitals(astronaut_id: str, vitals: Vitals):
    """Ingest live vitals telemetry for an astronaut."""
    astro = get_astronaut_profile(astronaut_id)
    if not astro:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Astronaut with ID '{astronaut_id}' not found.",
        )

    # Evaluate health vitals: rule-based thresholds + ML anomaly detection
    overall_status, alerts, ml_result = evaluate_vitals(astro.id, astro.name, vitals)

    # Save any generated alerts to SQLite
    for alert in alerts:
        save_alert(alert)

    # Save reading to SQLite database (with ML prediction)
    reading_dict = vitals.model_dump()
    reading_dict["astronaut_id"] = astro.id
    save_health_reading(
        reading_data=reading_dict,
        health_status=overall_status,
        alerts_generated=len(alerts),
        ml_prediction=ml_result,
    )

    # Return updated astronaut profile
    return get_astronaut_profile(astronaut_id)
