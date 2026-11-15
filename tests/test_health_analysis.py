from backend.models.astronaut import Vitals
from backend.services.health_analysis import evaluate_vitals


def test_elevated_blood_pressure_triggers_warning():
    vitals = Vitals(
        heart_rate=90.0,
        blood_pressure_systolic=145,
        blood_pressure_diastolic=95,
        oxygen_saturation=98.0,
        temperature=37.0,
        radiation_exposure=0.15,
    )

    status, alerts = evaluate_vitals("AST-001", "Test Astronaut", vitals)

    assert status == "WARNING"
    assert any(alert.metric in {"blood_pressure_systolic", "blood_pressure_diastolic"} for alert in alerts)
