"""Astronaut Health Monitoring System - Backend Main Application."""
from contextlib import asynccontextmanager
from fastapi import FastAPI, Response, status
from fastapi.middleware.cors import CORSMiddleware

from backend.database import init_db
from backend.routes.health import router as health_router
from backend.routes.astronauts import router as astronauts_router
from backend.routes.health_data import router as health_data_router
from backend.routes.alerts import router as alerts_router
from backend.routes.analytics import router as analytics_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager: initializes SQLite database and pre-loads ML models."""
    # 1. Initialize SQLite database tables and seed data
    init_db()

    # 2. Pre-load ML anomaly detection models into memory at startup
    #    so the first incoming request doesn't pay the loading cost.
    from backend.services.ml_service import ml_service
    ml_service.load_models()

    yield
    # (cleanup on shutdown can go here if needed)


# Initialize FastAPI application
app = FastAPI(
    title="Astronaut Health Monitoring System API",
    description=(
        "NASA Space Apps Challenge: Real-time telemetry, vital signs monitoring, "
        "and automated anomaly detection for astronauts during spaceflight missions. "
        "Combines rule-based NASA space medicine thresholds with trained ML anomaly "
        "detection models for comprehensive health analysis."
    ),
    version="1.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include route modules
app.include_router(health_router)
app.include_router(astronauts_router)
app.include_router(health_data_router)
app.include_router(alerts_router)
app.include_router(analytics_router)


@app.get("/favicon.ico", include_in_schema=False)
async def favicon():
    """Silence browser favicon requests."""
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@app.get("/", tags=["Root"])
async def root():
    """Welcome endpoint with quick links to interactive documentation and endpoints."""
    from backend.services.ml_service import ml_service
    ml_status = ml_service.status_summary()
    return {
        "project": "Astronaut Health Monitoring System",
        "challenge": "NASA Space Apps Challenge",
        "status": "online",
        "version": "1.1.0",
        "database": "SQLite",
        "ml_anomaly_detection": ml_status,
        "documentation": "/docs",
        "endpoints": {
            "health": "/health",
            "astronauts": "/astronauts",
            "health_data": "/health-data",
            "alerts": "/alerts",
            "analytics": "/analytics",
        },
    }
