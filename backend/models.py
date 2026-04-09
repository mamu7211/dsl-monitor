from datetime import datetime

from pydantic import BaseModel


class DSLReading(BaseModel):
    timestamp: datetime
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


class MetricSummary(BaseModel):
    min: float
    max: float
    avg: float
    count: int
