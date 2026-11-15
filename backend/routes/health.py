"""Health Check Route."""
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter
from pydantic import BaseModel, Field

router = APIRouter(prefix="/health", tags=["System Health"])


class MLModelStatus(BaseModel):
    """ML model load status reported on the health endpoint."""
    ml_models_loaded: bool = Field(..., description="True if at least one ML model is loaded", example=True)
    anomaly_model: str = Field(..., description="LOADED or MISSING", example="LOADED")
    realdata_model: str = Field(..., description="LOADED or MISSING", example="LOADED")
    load_error: Optional[str] = Field(default=None, description="Error message if models failed to load", example=None)


class HealthStatus(BaseModel):
    status: str = Field(default="healthy", example="healthy")
    service: str = Field(default="Astronaut Health Monitor Backend", example="Astronaut Health Monitor Backend")
    version: str = Field(default="1.1.0", example="1.1.0")
    timestamp: str = Field(..., example="2026-11-14T07:45:00+00:00")
    mission: str = Field(default="Artemis VII", example="Artemis VII")
    system_readiness: str = Field(default="NOMINAL", example="NOMINAL")
    ml_status: MLModelStatus = Field(..., description="Real-time ML model status")


@router.get("", response_model=HealthStatus, summary="System Health Status")
async def get_health():
    """Verify backend services, database, and ML anomaly detection models."""
    from backend.services.ml_service import ml_service
    ml_summary = ml_service.status_summary()

    # Determine overall system readiness based on ML model availability
    if ml_summary["ml_models_loaded"]:
        system_readiness = "NOMINAL"
    else:
        system_readiness = "DEGRADED"  # Backend still works but ML is unavailable

    return HealthStatus(
        status="healthy",
        service="Astronaut Health Monitor Backend",
        version="1.1.0",
        timestamp=datetime.now(timezone.utc).isoformat(),
        mission="Artemis VII",
        system_readiness=system_readiness,
        ml_status=MLModelStatus(
            ml_models_loaded=ml_summary["ml_models_loaded"],
            anomaly_model=ml_summary["anomaly_model"],
            realdata_model=ml_summary["realdata_model"],
            load_error=ml_summary.get("load_error"),
        ),
    )
