"""Trend and Statistical Analysis Service for Astronaut Health Telemetry.

Calculates:
- Min, Max, Average, and Trend Directions (RISING, FALLING, STABLE)
- Recent vs Previous Reading Delta Comparisons
- Anomaly and Sudden Fluctuation Detection
- Space Medicine Trend Summaries
"""
from typing import List, Dict, Tuple, Optional, Any
from backend.models.astronaut import HealthReadingResponse
from backend.models.analytics import (
    MetricStatistics,
    RecentComparison,
    HistoricalAnalysisResponse,
    ChartDataResponse,
)


def analyze_historical_trends(
    astronaut_id: str,
    astronaut_name: str,
    mission_id: str,
    readings: List[HealthReadingResponse],
    start_time: Optional[str] = None,
    end_time: Optional[str] = None,
) -> HistoricalAnalysisResponse:
    """Analyze time-series health readings and calculate metrics, trends, and comparisons."""
    time_range = {"start_time": start_time, "end_time": end_time}

    # Handle empty readings case gracefully
    if not readings:
        return HistoricalAnalysisResponse(
            astronaut_id=astronaut_id,
            astronaut_name=astronaut_name,
            mission_id=mission_id,
            total_readings=0,
            time_range=time_range,
            statistics={},
            recent_comparison=[],
            unusual_changes=["No health telemetry readings recorded within the selected time window."],
            summary=f"No telemetry data available for {astronaut_name} in the selected period.",
        )

    # Ensure readings are sorted chronologically (oldest to newest) for accurate trend math
    sorted_readings = sorted(readings, key=lambda r: (r.timestamp, r.id))

    # Metric configs: (field_name, unit, significant_delta_threshold, trend_threshold)
    metric_configs = [
        ("heart_rate", "bpm", 12.0, 4.0),
        ("spo2", "%", 2.0, 1.2),
        ("body_temperature", "°C", 0.6, 0.3),
        ("respiratory_rate", "breaths/min", 4.0, 2.5),
    ]

    stats_dict: Dict[str, MetricStatistics] = {}
    unusual_changes: List[str] = []

    for metric_name, unit, sig_thresh, trend_thresh in metric_configs:
        values = [getattr(r, metric_name) for r in sorted_readings if getattr(r, metric_name, None) is not None]
        if not values:
            continue

        min_val = round(min(values), 2)
        max_val = round(max(values), 2)
        avg_val = round(sum(values) / len(values), 2)
        latest_val = round(values[-1], 2)
        delta_from_avg = round(latest_val - avg_val, 2)
        pct_change = round(((latest_val - avg_val) / avg_val) * 100, 1) if avg_val != 0 else 0.0

        # Calculate trend direction
        trend_dir = _calculate_trend(values, trend_thresh)

        # Determine metric status
        status_val = _determine_metric_status(metric_name, latest_val)

        stats_dict[metric_name] = MetricStatistics(
            metric=metric_name,
            unit=unit,
            min=min_val,
            max=max_val,
            average=avg_val,
            latest=latest_val,
            trend=trend_dir,
            delta_from_avg=delta_from_avg,
            percent_change=pct_change,
            status=status_val,
        )

        # Check for rapid intra-period fluctuations
        if (max_val - min_val) >= sig_thresh:
            unusual_changes.append(
                f"Significant variance detected in {metric_name.replace('_', ' ')}: "
                f"swung between {min_val} and {max_val} {unit}."
            )

    # Recent vs Previous Reading Comparison
    comparisons: List[RecentComparison] = []
    if len(sorted_readings) >= 2:
        curr = sorted_readings[-1]
        prev = sorted_readings[-2]
        for metric_name, unit, sig_thresh, _ in metric_configs:
            c_val = getattr(curr, metric_name, None)
            p_val = getattr(prev, metric_name, None)
            if c_val is not None and p_val is not None:
                diff = round(c_val - p_val, 2)
                is_sig = abs(diff) >= sig_thresh
                comparisons.append(
                    RecentComparison(
                        metric=metric_name,
                        unit=unit,
                        latest_value=round(c_val, 2),
                        previous_value=round(p_val, 2),
                        change=diff,
                        is_significant_change=is_sig,
                    )
                )
                if is_sig:
                    dir_str = "increased" if diff > 0 else "decreased"
                    unusual_changes.append(
                        f"Rapid shift in {metric_name.replace('_', ' ')}: {dir_str} by {abs(diff)} {unit} "
                        f"between the last two consecutive readings."
                    )
    elif len(sorted_readings) == 1:
        curr = sorted_readings[0]
        for metric_name, unit, _, _ in metric_configs:
            c_val = getattr(curr, metric_name, None)
            if c_val is not None:
                comparisons.append(
                    RecentComparison(
                        metric=metric_name,
                        unit=unit,
                        latest_value=round(c_val, 2),
                        previous_value=round(c_val, 2),
                        change=0.0,
                        is_significant_change=False,
                    )
                )

    # Check for threshold breaches in the latest reading
    latest_r = sorted_readings[-1]
    if latest_r.health_status in ["Warning", "Critical"]:
        unusual_changes.append(
            f"Latest telemetry status is '{latest_r.health_status}' (recorded at {latest_r.timestamp})."
        )

    # Generate space medicine summary
    summary = _generate_medical_summary(astronaut_name, len(sorted_readings), stats_dict, unusual_changes)

    return HistoricalAnalysisResponse(
        astronaut_id=astronaut_id,
        astronaut_name=astronaut_name,
        mission_id=mission_id,
        total_readings=len(sorted_readings),
        time_range=time_range,
        statistics=stats_dict,
        recent_comparison=comparisons,
        unusual_changes=unusual_changes if unusual_changes else ["All biometric telemetry remained stable and nominal."],
        summary=summary,
    )


def extract_chart_data(
    astronaut_id: str,
    astronaut_name: str,
    mission_id: str,
    readings: List[HealthReadingResponse],
) -> ChartDataResponse:
    """Transform readings into structured arrays formatted for frontend chart visualization."""
    sorted_readings = sorted(readings, key=lambda r: (r.timestamp, r.id))

    timestamps: List[str] = []
    hr_list: List[float] = []
    spo2_list: List[float] = []
    temp_list: List[float] = []
    rr_list: List[float] = []

    for r in sorted_readings:
        timestamps.append(r.timestamp)
        hr_list.append(round(r.heart_rate, 2))
        spo2_list.append(round(r.spo2, 2))
        temp_list.append(round(r.body_temperature, 2))
        rr_list.append(round(r.respiratory_rate, 2))

    return ChartDataResponse(
        astronaut_id=astronaut_id,
        astronaut_name=astronaut_name,
        mission_id=mission_id,
        total_data_points=len(sorted_readings),
        timestamps=timestamps,
        heart_rate=hr_list,
        spo2=spo2_list,
        body_temperature=temp_list,
        respiratory_rate=rr_list,
    )


def _calculate_trend(values: List[float], threshold: float) -> str:
    """Calculate trend direction (RISING, FALLING, or STABLE) using split-half window delta."""
    if len(values) < 2:
        return "STABLE"

    mid = len(values) // 2
    first_half = values[:mid] if mid > 0 else [values[0]]
    second_half = values[mid:] if mid > 0 else [values[-1]]

    avg_first = sum(first_half) / len(first_half)
    avg_second = sum(second_half) / len(second_half)
    diff = avg_second - avg_first

    if diff >= threshold:
        return "RISING"
    elif diff <= -threshold:
        return "FALLING"
    return "STABLE"


def _determine_metric_status(metric: str, value: float) -> str:
    """Determine nominal, warning, or critical status for a given metric."""
    if metric == "heart_rate":
        if value >= 130.0 or value <= 40.0:
            return "Critical"
        if value > 100.0 or value < 50.0:
            return "Warning"
    elif metric == "spo2":
        if value < 90.0:
            return "Critical"
        if value < 95.0:
            return "Warning"
    elif metric == "body_temperature":
        if value >= 38.5 or value <= 35.0:
            return "Critical"
        if value > 37.5 or value < 35.8:
            return "Warning"
    elif metric == "respiratory_rate":
        if value >= 30.0 or value <= 9.0:
            return "Critical"
        if value > 22.0 or value < 11.0:
            return "Warning"
    return "Normal"


def _generate_medical_summary(
    name: str,
    count: int,
    stats: Dict[str, MetricStatistics],
    unusual: List[str],
) -> str:
    """Generate concise space medicine prose summarizing the trends."""
    hr = stats.get("heart_rate")
    spo2 = stats.get("spo2")
    temp = stats.get("body_temperature")

    parts = [f"Analysis of {count} historical reading(s) for {name}:"]

    if hr and spo2 and temp:
        parts.append(
            f"Heart rate averaged {hr.average} bpm ({hr.trend}), SpO2 averaged {spo2.average}% ({spo2.trend}), "
            f"and core temperature averaged {temp.average}°C ({temp.trend})."
        )

    if not unusual:
        parts.append("All vital signs remained strictly within nominal flight parameters.")
    else:
        parts.append(f"Noted {len(unusual)} observation(s) requiring attention or flight surgeon monitoring.")

    return " ".join(parts)
