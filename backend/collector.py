import logging
from datetime import datetime, timezone

from fritzconnection import FritzConnection

from backend.config import settings
from backend.models import DSLReading

logger = logging.getLogger(__name__)


def _safe_call(fc, service, action, **kwargs):
    try:
        return fc.call_action(service, action, **kwargs)
    except Exception as e:
        logger.warning("Failed to call %s.%s: %s", service, action, e)
        return {}


def collect_dsl_reading() -> DSLReading:
    fc = FritzConnection(
        address=settings.fritz_ip,
        user=settings.fritz_user,
        password=settings.fritz_password,
    )

    # DSL
    info = fc.call_action("WANDSLInterfaceConfig1", "GetInfo")
    stats = fc.call_action("WANDSLInterfaceConfig1", "GetStatisticsTotal")

    # Network clients - count only active hosts
    hosts_total = _safe_call(fc, "Hosts1", "GetHostNumberOfEntries")
    active_count = 0
    for i in range(hosts_total.get("NewHostNumberOfEntries", 0)):
        host = _safe_call(fc, "Hosts1", "GetGenericHostEntry", NewIndex=i)
        if host.get("NewActive", False):
            active_count += 1
    wlan1 = _safe_call(fc, "WLANConfiguration1", "GetTotalAssociations")
    wlan2 = _safe_call(fc, "WLANConfiguration2", "GetTotalAssociations")
    wlan3 = _safe_call(fc, "WLANConfiguration3", "GetTotalAssociations")

    # Traffic
    addon = _safe_call(fc, "WANCommonIFC1", "GetAddonInfos")

    # WAN
    wan_status = _safe_call(fc, "WANPPPConnection1", "GetStatusInfo")
    wan_ip = _safe_call(fc, "WANPPPConnection1", "GetExternalIPAddress")

    # WLAN info
    wlan1_info = _safe_call(fc, "WLANConfiguration1", "GetInfo")
    wlan2_info = _safe_call(fc, "WLANConfiguration2", "GetInfo")

    return DSLReading(
        timestamp=datetime.now(timezone.utc),
        status=info.get("NewStatus", "Unknown"),
        uptime=wan_status.get("NewUptime", 0),
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
        # Network
        hosts_total=active_count,
        wlan_clients_24ghz=wlan1.get("NewTotalAssociations", 0),
        wlan_clients_5ghz=wlan2.get("NewTotalAssociations", 0),
        wlan_clients_guest=wlan3.get("NewTotalAssociations", 0),
        # Traffic
        bytes_send_rate=addon.get("NewByteSendRate", 0),
        bytes_receive_rate=addon.get("NewByteReceiveRate", 0),
        total_bytes_sent=addon.get("NewX_AVM_DE_TotalBytesSent64", 0),
        total_bytes_received=addon.get("NewX_AVM_DE_TotalBytesReceived64", 0),
        # WAN
        wan_status=wan_status.get("NewConnectionStatus", ""),
        external_ip=wan_ip.get("NewExternalIPAddress", ""),
        dns_server_1=addon.get("NewDNSServer1", ""),
        dns_server_2=addon.get("NewDNSServer2", ""),
        # WLAN Info
        wlan_ssid_24ghz=wlan1_info.get("NewSSID", ""),
        wlan_channel_24ghz=wlan1_info.get("NewChannel", 0),
        wlan_ssid_5ghz=wlan2_info.get("NewSSID", ""),
        wlan_channel_5ghz=wlan2_info.get("NewChannel", 0),
    )
