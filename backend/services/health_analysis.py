"""Astronaut Health Analysis Service.

Evaluates incoming biometric telemetry vitals against NASA space medicine
thresholds and automatically flags warnings or critical health alerts.

The service now also invokes the ML anomaly detection service so that the
trained sklearn models contribute to the overall health status alongside the
hand-coded threshold rules.  Rule-based alerts are always preserved; the ML
engine can only *escalate* severity — it never suppresses an existing alert.
"""
import uuid
from datetime import datetime, timezone
from typing import List, Tuple, Any, Dict, Optional
from backend.models.astronaut import Alert


def evaluate_vitals(
    astronaut_id: str,
    astronaut_name: str,
    vitals: Any,
) -> Tuple[str, List[Alert], Optional[Dict]]:
    """Analyze vitals telemetry and determine overall health status & any alerts.

    Accepts any vitals object (Vitals or HealthReadingCreate).

    Returns:
        Tuple[str, List[Alert], Optional[Dict]]:
            (overall_status, generated_alerts, ml_prediction)
        where overall_status is 'NOMINAL', 'WARNING', or 'CRITICAL'.
        ml_prediction is the raw result dict from the ML service (or None if
        the ML service is unavailable).
    """
    alerts: List[Alert] = []
    severities: List[str] = ["NOMINAL"]
    now_iso = datetime.now(timezone.utc).isoformat()
    activity = (getattr(vitals, "activity_level", None) or "RESTING").upper()

    def create_alert(severity: str, metric: str, message: str) -> Alert:
        severities.append(severity)
        return Alert(
            id=f"ALT-{uuid.uuid4().hex[:6].upper()}",
            astronaut_id=astronaut_id,
            astronaut_name=astronaut_name,
            alert_type=metric.upper(),
            description=message,
            severity=severity,
            metric=metric,
            message=message,
            timestamp=now_iso,
            resolved=False,
            resolved_at=None,
        )

    # -----------------------------------------------------------------------
    # 1. Heart Rate Analysis (contextualized by activity level)
    # -----------------------------------------------------------------------
    hr = getattr(vitals, "heart_rate", None)
    if hr is not None:
        if activity in ["EXERCISE", "EVA", "HIGH"]:
            if hr >= 185.0:
                alerts.append(create_alert("CRITICAL", "heart_rate", f"Dangerous cardiovascular strain during {activity}: {hr:.1f} bpm! Immediate rest required."))
            elif hr >= 165.0:
                alerts.append(create_alert("WARNING", "heart_rate", f"High cardiovascular exertion during {activity}: {hr:.1f} bpm."))
        else:  # RESTING or MODERATE
            if hr >= 130.0 or hr <= 40.0:
                alerts.append(create_alert("CRITICAL", "heart_rate", f"Critical resting heart rate ({hr:.1f} bpm)! Immediate medical check required."))
            elif hr > 100.0:
                alerts.append(create_alert("WARNING", "heart_rate", f"Resting tachycardia detected: elevated heart rate at {hr:.1f} bpm."))
            elif hr < 50.0:
                alerts.append(create_alert("WARNING", "heart_rate", f"Resting bradycardia detected: low heart rate at {hr:.1f} bpm."))

    # -----------------------------------------------------------------------
    # 2. Blood Oxygen Saturation (SpO2) Analysis
    # -----------------------------------------------------------------------
    spo2 = getattr(vitals, "spo2", None)
    if spo2 is not None:
        if spo2 < 90.0:
            alerts.append(create_alert("CRITICAL", "spo2", f"Severe Hypoxia Alert: SpO2 dropped to {spo2:.1f}%! Check cabin/spacesuit O2 mix."))
        elif spo2 < 95.0:
            alerts.append(create_alert("WARNING", "spo2", f"Sub-nominal oxygen saturation: SpO2 is {spo2:.1f}% (below 95% nominal)."))

    # -----------------------------------------------------------------------
    # 3. Respiratory Rate Analysis
    # -----------------------------------------------------------------------
    rr = getattr(vitals, "respiratory_rate", None)
    if rr is not None:
        if rr >= 30.0 or rr <= 9.0:
            alerts.append(create_alert("CRITICAL", "respiratory_rate", f"Critical respiratory rate ({rr:.1f} breaths/min)! Risk of hyperventilation or respiratory failure."))
        elif rr > (28.0 if activity in ["EXERCISE", "HIGH"] else 22.0):
            alerts.append(create_alert("WARNING", "respiratory_rate", f"Elevated breathing rate detected: {rr:.1f} breaths/min."))
        elif rr < 11.0:
            alerts.append(create_alert("WARNING", "respiratory_rate", f"Bradypnea warning: breathing rate low at {rr:.1f} breaths/min."))

    # -----------------------------------------------------------------------
    # 4. Body Temperature Analysis
    # -----------------------------------------------------------------------
    temp = getattr(vitals, "body_temperature", None)
    if temp is not None:
        if temp >= 38.5 or temp <= 35.0:
            alerts.append(create_alert("CRITICAL", "body_temperature", f"Critical core body temperature: {temp:.1f}°C! Risk of heat stroke or hypothermia."))
        elif temp > 37.5:
            alerts.append(create_alert("WARNING", "body_temperature", f"Hyperthermia warning: core body temperature elevated at {temp:.1f}°C."))
        elif temp < 35.8:
            alerts.append(create_alert("WARNING", "body_temperature", f"Hypothermia warning: core body temperature dropped to {temp:.1f}°C."))

    # -----------------------------------------------------------------------
    # 5. Sleep Hours / Fatigue Risk Analysis
    # -----------------------------------------------------------------------
    sleep = getattr(vitals, "sleep_hours", None)
    if sleep is not None:
        if sleep < 4.0:
            alerts.append(create_alert("CRITICAL", "sleep_hours", f"Severe sleep deprivation ({sleep:.1f} hours). High risk of cognitive error during mission tasks."))
        elif sleep < 6.0:
            alerts.append(create_alert("WARNING", "sleep_hours", f"Sleep deficit detected: Only {sleep:.1f} hours of sleep recorded in the last 24h cycle."))

    # -----------------------------------------------------------------------
    # 6. Radiation Exposure Analysis
    # -----------------------------------------------------------------------
    rad = getattr(vitals, "radiation_exposure", None)
    if rad is not None:
        if rad >= 1.0:
            alerts.append(create_alert("CRITICAL", "radiation_exposure", f"Severe Radiation Alert ({rad:.2f} mSv)! Move to shielded storm shelter module immediately."))
        elif rad >= 0.5:
            alerts.append(create_alert("WARNING", "radiation_exposure", f"Elevated cosmic radiation detected: {rad:.2f} mSv."))

    # -----------------------------------------------------------------------
    # 7. Cabin CO2 Concentration Analysis
    # -----------------------------------------------------------------------
    co2 = getattr(vitals, "cabin_co2_level", None)
    if co2 is not None:
        if co2 >= 1.0:
            alerts.append(create_alert("CRITICAL", "cabin_co2_level", f"Critical Cabin CO2 ({co2:.2f}%)! Life support scrubber malfunction. Risk of acute hypercapnia."))
        elif co2 >= 0.5:
            alerts.append(create_alert("WARNING", "cabin_co2_level", f"Elevated Cabin CO2 detected ({co2:.2f}%). Check cabin ventilation."))

    # -----------------------------------------------------------------------
    # 8. ML Anomaly Detection (augments rule-based analysis above)
    # -----------------------------------------------------------------------
    ml_result: Optional[Dict] = None
    try:
        from backend.services.ml_service import ml_service  # lazy import to avoid circular deps
        ml_result = ml_service.run_anomaly_detection(vitals)

        if ml_result.get("ml_status") == "ANOMALY":
            confidence = ml_result.get("confidence", "MODERATE")
            ml_message = ml_result.get("message", "ML anomaly detected.")

            # Only escalate if rule-based engine hasn't already flagged CRITICAL/WARNING
            current_max = "CRITICAL" if "CRITICAL" in severities else ("WARNING" if "WARNING" in severities else "NOMINAL")

            if current_max == "NOMINAL":
                # Rules said fine, but ML disagrees — raise to WARNING
                alerts.append(create_alert(
                    "WARNING",
                    "ml_anomaly",
                    f"[ML Detection – {confidence} confidence] {ml_message}",
                ))
            elif current_max == "WARNING" and confidence == "HIGH":
                # Both models flagged AND rules already show WARNING → escalate to CRITICAL
                alerts.append(create_alert(
                    "CRITICAL",
                    "ml_anomaly",
                    f"[ML Detection – HIGH confidence] Both models confirm anomaly. {ml_message}",
                ))
            else:
                # Rules already flagged something; just attach an informational WARNING
                alerts.append(create_alert(
                    "WARNING",
                    "ml_anomaly",
                    f"[ML Detection – {confidence} confidence] {ml_message}",
                ))

    except Exception as ml_exc:  # never let ML errors crash the health analysis
        ml_result = {
            "ml_status": "UNAVAILABLE",
            "confidence": "N/A",
            "models_used": [],
            "predictions": {},
            "details": {},
            "message": f"ML service error: {ml_exc}",
        }

    # -----------------------------------------------------------------------
    # Determine overall status
    # -----------------------------------------------------------------------
    if "CRITICAL" in severities:
        overall_status = "CRITICAL"
    elif "WARNING" in severities:
        overall_status = "WARNING"
    else:
        overall_status = "NOMINAL"

    return overall_status, alerts, ml_result
