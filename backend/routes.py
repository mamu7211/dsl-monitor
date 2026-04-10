import asyncio
import logging
from datetime import date

from fastapi import APIRouter, HTTPException, Query

from backend.collector import collect_dsl_reading
from backend.diagnostics import compute_diagnostics
from backend.models import DiagnosticsResponse, DSLReading, MetricSummary
from backend.storage import append_reading, get_or_compute_summary, get_readings, get_readings_range

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api")


@router.get("/health")
def health():
    return {"status": "ok"}


@router.get("/status")
def status() -> DSLReading | None:
    today = date.today()
    readings = get_readings(today)
    if readings:
        return readings[-1]
    from datetime import timedelta
    yesterday = today - timedelta(days=1)
    readings = get_readings(yesterday)
    if readings:
        return readings[-1]
    return None


@router.get("/readings/{day}")
def readings_by_date(day: date) -> list[DSLReading]:
    return get_readings(day)


@router.get("/readings")
def readings_range(
    start: date = Query(..., alias="from"),
    end: date = Query(..., alias="to"),
) -> list[DSLReading]:
    if (end - start).days > 180:
        raise HTTPException(400, "Range must not exceed 180 days")
    return get_readings_range(start, end)


@router.get("/diagnostics")
def diagnostics(
    start: date = Query(..., alias="from"),
    end: date = Query(..., alias="to"),
) -> DiagnosticsResponse:
    readings = get_readings_range(start, end)
    return compute_diagnostics(readings)


@router.get("/summary/{year}/{month}")
def monthly_summary(year: int, month: int) -> dict[str, MetricSummary]:
    if not (1 <= month <= 12):
        raise HTTPException(400, "Invalid month")
    return get_or_compute_summary(year, month)


@router.post("/collect")
async def collect_now() -> DSLReading:
    reading = await asyncio.to_thread(collect_dsl_reading)
    append_reading(reading)
    return reading
