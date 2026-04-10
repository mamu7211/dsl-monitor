import logging
from contextlib import asynccontextmanager

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
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
    parts = settings.poll_cron.split()
    scheduler.add_job(
        scheduled_collect,
        trigger=CronTrigger(
            minute=parts[0], hour=parts[1], day=parts[2], month=parts[3], day_of_week=parts[4],
        ),
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
    logger.info("Scheduler started (cron=%s)", settings.poll_cron)

    # Initial collection on startup
    import asyncio
    try:
        await asyncio.to_thread(scheduled_collect)
    except Exception:
        logger.exception("Initial collection failed")

    yield

    scheduler.shutdown()
    logger.info("Scheduler stopped")


app = FastAPI(title="DSL Monitor", lifespan=lifespan)
app.include_router(router)
app.mount("/", StaticFiles(directory="frontend", html=True), name="frontend")
