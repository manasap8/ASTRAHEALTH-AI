"""ML Anomaly Detection Service for Astronaut Health Monitor.

Loads the two trained sklearn Pipeline models from disk at application startup
(singleton pattern — loaded once, reused for every request) and exposes a
single public function ``run_anomaly_detection()`` that the health analysis
service calls for every incoming vitals reading.

Models:
  astrahealth_anomaly_model.pkl
      Trained on a synthetic/augmented dataset.
      Features: heart_rate, spo2, respiratory_rate, body_temperature,
                sleep_hours, activity_level (encoded as int)
      Output:  1 = normal, -1 = anomaly  (sklearn outlier-detector convention)

  astrahealth_realdata_model.pkl
      Trained on real biometric time-series data.
      Features: HR, RESP, SpO2
      Output:  1 = normal, -1 = anomaly

Both models use a StandardScaler → outlier detector (Isolation Forest or
similar) pipeline.  The service combines the two predictions with a simple
majority / severity-escalation rule so that either model flagging an anomaly
causes the final verdict to be ``ANOMALY``.

Design goals:
  * Never crash the backend — if loading or prediction fails the service
    returns UNAVAILABLE and the rule-based threshold engine continues alone.
  * Thread-safe singleton: models are loaded once during ``load_models()``.
  * Zero global state leakage — all model state lives inside ``_MLService``.
"""

from __future__ import annotations

import logging
import os
from pathlib import Path
from typing import Any, Dict, Optional

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

_ML_DIR = Path(__file__).resolve().parent.parent / "ml_models"

_ANOMALY_MODEL_PATH = _ML_DIR / "astrahealth_anomaly_model.pkl"
_REALDATA_MODEL_PATH = _ML_DIR / "astrahealth_realdata_model.pkl"

# Mapping for activity_level string → int for the anomaly model
_ACTIVITY_ENCODING: Dict[str, int] = {
    "RESTING": 0,
    "MODERATE": 1,
    "HIGH": 2,
    "EXERCISE": 2,
    "EVA": 3,
}


# ---------------------------------------------------------------------------
# ML Service singleton
# ---------------------------------------------------------------------------

class _MLService:
    """Singleton wrapper around the two trained anomaly-detection models."""

    def __init__(self) -> None:
        self._anomaly_model: Optional[Any] = None
        self._realdata_model: Optional[Any] = None
        self._loaded: bool = False
        self._load_error: Optional[str] = None

    # ------------------------------------------------------------------
    # Startup
    # ------------------------------------------------------------------

    def load_models(self) -> None:
        """Load both pkl models from disk.  Called once during app startup.

        Silently degrades (logs a warning) if a file is missing or corrupt so
        the backend continues to operate using rule-based analysis only.
        """
        try:
            import joblib  # noqa: PLC0415 — intentional lazy import

            # --- anomaly model ---
            if _ANOMALY_MODEL_PATH.exists():
                self._anomaly_model = joblib.load(_ANOMALY_MODEL_PATH)
                logger.info(
                    "ML anomaly model loaded: %s  pipeline=%s",
                    _ANOMALY_MODEL_PATH.name,
                    [s[0] for s in self._anomaly_model.steps],
                )
            else:
                logger.warning("ML anomaly model NOT found at: %s", _ANOMALY_MODEL_PATH)

            # --- real-data model ---
            if _REALDATA_MODEL_PATH.exists():
                self._realdata_model = joblib.load(_REALDATA_MODEL_PATH)
                logger.info(
                    "ML real-data model loaded: %s  pipeline=%s",
                    _REALDATA_MODEL_PATH.name,
                    [s[0] for s in self._realdata_model.steps],
                )
            else:
                logger.warning("ML real-data model NOT found at: %s", _REALDATA_MODEL_PATH)

            self._loaded = True
            logger.info(
                "ML service ready. anomaly_model=%s  realdata_model=%s",
                "OK" if self._anomaly_model else "MISSING",
                "OK" if self._realdata_model else "MISSING",
            )

        except Exception as exc:  # pragma: no cover
            self._load_error = str(exc)
            logger.error("Failed to load ML models: %s", exc, exc_info=True)

    # ------------------------------------------------------------------
    # Status helpers (exposed on /health endpoint)
    # ------------------------------------------------------------------

    @property
    def models_loaded(self) -> bool:
        """True if at least one model loaded successfully."""
        return self._anomaly_model is not None or self._realdata_model is not None

    @property
    def anomaly_model_loaded(self) -> bool:
        return self._anomaly_model is not None

    @property
    def realdata_model_loaded(self) -> bool:
        return self._realdata_model is not None

    def status_summary(self) -> Dict[str, Any]:
        """Return a dict suitable for embedding in the /health response."""
        return {
            "ml_models_loaded": self.models_loaded,
            "anomaly_model": "LOADED" if self.anomaly_model_loaded else "MISSING",
            "realdata_model": "LOADED" if self.realdata_model_loaded else "MISSING",
            "load_error": self._load_error,
        }

    # ------------------------------------------------------------------
    # Core prediction
    # ------------------------------------------------------------------

    def run_anomaly_detection(self, vitals: Any) -> Dict[str, Any]:
        """Run ML anomaly detection against the provided vitals object.

        Args:
            vitals: Any object with the biometric attributes (HealthReadingCreate
                    or Vitals).  Missing fields fall back to safe defaults.

        Returns:
            A dict with keys:
              ml_status    : "ANOMALY" | "NORMAL" | "UNAVAILABLE"
              confidence   : human-readable confidence label
              models_used  : list of model names that produced predictions
              predictions  : dict of per-model raw sklearn output (+1 or -1)
              details      : dict of features used per model
              message      : one-line human-readable verdict
        """
        if not self.models_loaded:
            return {
                "ml_status": "UNAVAILABLE",
                "confidence": "N/A",
                "models_used": [],
                "predictions": {},
                "details": {},
                "message": "ML models not loaded — using rule-based analysis only.",
            }

        try:
            import pandas as pd  # noqa: PLC0415

            predictions: Dict[str, int] = {}
            models_used: list[str] = []
            features_used: Dict[str, Dict] = {}

            # --- Model 1: anomaly model (6 features) ---
            if self._anomaly_model is not None:
                activity_raw = (getattr(vitals, "activity_level", None) or "RESTING").upper()
                activity_enc = _ACTIVITY_ENCODING.get(activity_raw, 0)

                feat1 = {
                    "heart_rate": float(getattr(vitals, "heart_rate", 72.0) or 72.0),
                    "spo2": float(getattr(vitals, "spo2", 98.0) or 98.0),
                    "respiratory_rate": float(getattr(vitals, "respiratory_rate", 15.0) or 15.0),
                    "body_temperature": float(getattr(vitals, "body_temperature", 36.8) or 36.8),
                    "sleep_hours": float(getattr(vitals, "sleep_hours", 7.0) or 7.0),
                    "activity_level": activity_enc,
                }
                df1 = pd.DataFrame([feat1])
                pred1 = int(self._anomaly_model.predict(df1)[0])
                predictions["anomaly_model"] = pred1
                models_used.append("astrahealth_anomaly_model")
                features_used["anomaly_model"] = feat1

            # --- Model 2: real-data model (3 features: HR, RESP, SpO2) ---
            if self._realdata_model is not None:
                feat2 = {
                    "HR": float(getattr(vitals, "heart_rate", 72.0) or 72.0),
                    "RESP": float(getattr(vitals, "respiratory_rate", 15.0) or 15.0),
                    "SpO2": float(getattr(vitals, "spo2", 98.0) or 98.0),
                }
                df2 = pd.DataFrame([feat2])
                pred2 = int(self._realdata_model.predict(df2)[0])
                predictions["realdata_model"] = pred2
                models_used.append("astrahealth_realdata_model")
                features_used["realdata_model"] = feat2

            # --- Combine predictions ---
            # sklearn outlier detectors: -1 = outlier/anomaly, +1 = normal
            anomaly_votes = sum(1 for v in predictions.values() if v == -1)
            normal_votes = sum(1 for v in predictions.values() if v == 1)
            total_models = len(predictions)

            if anomaly_votes > 0:
                ml_status = "ANOMALY"
                if anomaly_votes == total_models:
                    confidence = "HIGH"
                    message = (
                        f"Both ML models flagged an anomaly in the biometric readings. "
                        f"Scores: {predictions}."
                    )
                else:
                    confidence = "MODERATE"
                    message = (
                        f"One ML model flagged an anomaly (votes: {anomaly_votes}/{total_models}). "
                        f"Scores: {predictions}."
                    )
            else:
                ml_status = "NORMAL"
                confidence = "HIGH" if total_models == 2 else "MODERATE"
                message = (
                    f"All ML models predict normal biometric readings "
                    f"(votes: {normal_votes}/{total_models})."
                )

            return {
                "ml_status": ml_status,
                "confidence": confidence,
                "models_used": models_used,
                "predictions": predictions,
                "details": features_used,
                "message": message,
            }

        except Exception as exc:  # pragma: no cover
            logger.error("ML anomaly detection error: %s", exc, exc_info=True)
            return {
                "ml_status": "UNAVAILABLE",
                "confidence": "N/A",
                "models_used": [],
                "predictions": {},
                "details": {},
                "message": f"ML prediction error: {exc}",
            }


# ---------------------------------------------------------------------------
# Public singleton instance — imported everywhere else in the backend
# ---------------------------------------------------------------------------

ml_service = _MLService()
