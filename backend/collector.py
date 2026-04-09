import logging
from datetime import datetime, timezone

from fritzconnection import FritzConnection

from backend.config import settings
from backend.models import DSLReading

logger = logging.getLogger(__name__)


def collect_dsl_reading() -> DSLReading:
    fc = FritzConnection(
        address=settings.fritz_ip,
        user=settings.fritz_user,
        password=settings.fritz_password,
    )

    info = fc.call_action("WANDSLInterfaceConfig1", "GetInfo")
    stats = fc.call_action("WANDSLInterfaceConfig1", "GetStatisticsTotal")

    return DSLReading(
        timestamp=datetime.now(timezone.utc),
        status=info.get("NewStatus", "Unknown"),
        uptime=info.get("NewUptime", 0),
        downstream_current=info.get("NewDownstreamCurrRate", 0),
        downstream_max=info.get("NewDownstreamMaxRate", 0),
        upstream_current=info.get("NewUpstreamCurrRate", 0),
        upstream_max=info.get("NewUpstreamMaxRate", 0),
        downstream_snr=info.get("NewDownstreamNoiseMargin", 0) / 10,
        upstream_snr=info.get("NewUpstreamNoiseMargin", 0) / 10,
        downstream_attenuation=info.get("NewDownstreamAttenuation", 0) / 10,
        upstream_attenuation=info.get("NewUpstreamAttenuation", 0) / 10,
        downstream_power=info.get("NewDownstreamPower", 0) / 10,
        upstream_power=info.get("NewUpstreamPower", 0) / 10,
        downstream_fec=stats.get("NewFECErrors", 0),
        upstream_fec=stats.get("NewATUCFECErrors", 0),
        downstream_crc=stats.get("NewCRCErrors", 0),
        upstream_crc=stats.get("NewATUCCRCErrors", 0),
    )
