import json
import os
import tempfile
from datetime import date, datetime, timedelta
from pathlib import Path

from backend.config import settings
from backend.models import DSLReading, MetricSummary


def _daily_path(d: date) -> Path:
    return Path(settings.data_dir) / f"{d.year}" / f"{d.month:02d}" / f"{d.isoformat()}.json"


def _summary_path(year: int, month: int) -> Path:
    return Path(settings.data_dir) / f"{year}" / f"{month:02d}" / "summary.json"


def append_reading(reading: DSLReading) -> None:
    path = _daily_path(reading.timestamp.date())
    path.parent.mkdir(parents=True, exist_ok=True)

    readings = []
    if path.exists():
        with open(path) as f:
            readings = json.load(f)

    readings.append(reading.model_dump(mode="json"))

    fd, tmp = tempfile.mkstemp(dir=path.parent, suffix=".tmp")
    try:
        with os.fdopen(fd, "w") as f:
            json.dump(readings, f, indent=2)
        os.rename(tmp, path)
    except Exception:
        os.unlink(tmp)
        raise


def get_readings(d: date) -> list[DSLReading]:
    path = _daily_path(d)
    if not path.exists():
        return []
    with open(path) as f:
        return [DSLReading.model_validate(r) for r in json.load(f)]


def get_readings_range(start: date, end: date) -> list[DSLReading]:
    readings = []
    current = start
    while current <= end:
        readings.extend(get_readings(current))
        current += timedelta(days=1)
    return readings


def compute_monthly_summary(year: int, month: int) -> dict[str, MetricSummary]:
    start = date(year, month, 1)
    if month == 12:
        end = date(year + 1, 1, 1) - timedelta(days=1)
    else:
        end = date(year, month + 1, 1) - timedelta(days=1)

    readings = get_readings_range(start, end)
    if not readings:
        return {}

    numeric_fields = [
        "downstream_current", "downstream_max", "upstream_current", "upstream_max",
        "downstream_snr", "upstream_snr", "downstream_attenuation", "upstream_attenuation",
        "downstream_power", "upstream_power", "downstream_fec", "upstream_fec",
        "downstream_crc", "upstream_crc",
    ]

    summary = {}
    for field in numeric_fields:
        values = [getattr(r, field) for r in readings]
        summary[field] = MetricSummary(
            min=min(values),
            max=max(values),
            avg=sum(values) / len(values),
            count=len(values),
        )
    return summary


def get_or_compute_summary(year: int, month: int) -> dict[str, MetricSummary]:
    path = _summary_path(year, month)
    today = date.today()
    is_past_month = (year < today.year) or (year == today.year and month < today.month)

    if path.exists() and is_past_month:
        with open(path) as f:
            data = json.load(f)
        return {k: MetricSummary.model_validate(v) for k, v in data.items()}

    summary = compute_monthly_summary(year, month)
    if summary and is_past_month:
        path.parent.mkdir(parents=True, exist_ok=True)
        with open(path, "w") as f:
            json.dump({k: v.model_dump() for k, v in summary.items()}, f, indent=2)

    return summary
