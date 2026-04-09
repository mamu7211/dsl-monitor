import logging
from contextlib import asynccontextmanager

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.triggers.interval import IntervalTrigger
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from backend.collector import collect_dsl_reading
from backend.config import settings
from backend.routes import router
from backend.storage import append_reading, cleanup_old_data

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

scheduler = AsyncIOScheduler()


def scheduled_collect():
    try:
        reading = collect_dsl_reading()
        append_reading(reading)
        logger.info(
            "Collected: %s down=%d up=%d snr=%.1f/%.1f dB",
            reading.status,
            reading.downstream_current,
            reading.upstream_current,
            reading.downstream_snr,
            reading.upstream_snr,
        )
    except Exception:
        logger.exception("Collection failed")


@asynccontextmanager
async def lifespan(app: FastAPI):
    scheduler.add_job(
        scheduled_collect,
        trigger=IntervalTrigger(minutes=settings.poll_interval_minutes),
        id="dsl_collector",
        name="DSL Data Collector",
    )
    scheduler.add_job(
        cleanup_old_data,
        trigger=CronTrigger(hour=3, minute=0),
        id="data_cleanup",
        name="Delete data older than 6 months",
    )
    scheduler.start()
    logger.info("Scheduler started (interval=%d min)", settings.poll_interval_minutes)

    # Initial collection on startup
    import asyncio
    try:
        await asyncio.to_thread(scheduled_collect)
    except Exception:
        logger.exception("Initial collection failed")

    yield

    scheduler.shutdown()
    logger.info("Scheduler stopped")


app = FastAPI(title="FritzBox DSL Monitor", lifespan=lifespan)
app.include_router(router)
app.mount("/", StaticFiles(directory="frontend", html=True), name="frontend")
