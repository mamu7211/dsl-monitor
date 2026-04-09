from datetime import datetime

from pydantic import BaseModel


class DSLReading(BaseModel):
    timestamp: datetime
    # DSL
    status: str
    uptime: int  # seconds
    downstream_current: int  # kbit/s
    downstream_max: int
    upstream_current: int
    upstream_max: int
    downstream_snr: float  # dB
    upstream_snr: float
    downstream_attenuation: float  # dB
    upstream_attenuation: float
    downstream_power: float  # dBm
    upstream_power: float
    downstream_fec: int
    upstream_fec: int
    downstream_crc: int
    upstream_crc: int
    # Network
    hosts_total: int = 0
    wlan_clients_24ghz: int = 0
    wlan_clients_5ghz: int = 0
    wlan_clients_guest: int = 0
    # Traffic
    bytes_send_rate: int = 0  # bytes/s
    bytes_receive_rate: int = 0
    total_bytes_sent: int = 0
    total_bytes_received: int = 0
    # WAN
    wan_status: str = ""
    external_ip: str = ""
    dns_server_1: str = ""
    dns_server_2: str = ""
    # WLAN Info
    wlan_ssid_24ghz: str = ""
    wlan_channel_24ghz: int = 0
    wlan_ssid_5ghz: str = ""
    wlan_channel_5ghz: int = 0


class MetricSummary(BaseModel):
    min: float
    max: float
    avg: float
    count: int
