from backend.config import settings
from backend.models import AlertEvent, DiagnosticsResponse, DSLReading, ErrorRatePerHour, QualityPoint

SNR_MINIMUM = 6.0


def compute_diagnostics(readings: list[DSLReading]) -> DiagnosticsResponse:
    if not readings:
        return _empty_response()

    last = readings[-1]
    snr_reserve_down = last.downstream_snr - SNR_MINIMUM
    snr_reserve_up = last.upstream_snr - SNR_MINIMUM

    alerts: list[AlertEvent] = []
    error_rates: list[ErrorRatePerHour] = []
    quality_history: list[QualityPoint] = []
    resync_count = 0
    last_resync = None

    # Initial quality point from first reading (SNR only, no error/stability data yet)
    first_snr_score = min(max(readings[0].downstream_snr - SNR_MINIMUM, 0) / 10.0, 1.0) * 40
    quality_history.append(QualityPoint(
        timestamp=readings[0].timestamp,
        score=int(min(100, first_snr_score + 60)),
    ))

    for i in range(1, len(readings)):
        prev, curr = readings[i - 1], readings[i]
        dt = (curr.timestamp - prev.timestamp).total_seconds()
        if dt <= 0:
            continue

        # Resync detection: uptime dropped
        if curr.uptime < prev.uptime:
            resync_count += 1
            last_resync = curr.timestamp
            prev_uptime_h = prev.uptime // 3600
            prev_uptime_m = (prev.uptime % 3600) // 60
            alerts.append(AlertEvent(
                timestamp=curr.timestamp,
                type="resync",
                severity="warning",
                message="resync_msg",
                params=[f"{prev_uptime_h}h {prev_uptime_m}m"],
            ))

        # Rate change detection
        if curr.downstream_current != prev.downstream_current:
            diff = curr.downstream_current - prev.downstream_current
            direction = "+" if diff > 0 else ""
            alerts.append(AlertEvent(
                timestamp=curr.timestamp,
                type="rate_change",
                severity="info" if diff > 0 else "warning",
                message="rate_change_msg",
                params=[f"{direction}{diff}", str(curr.downstream_current)],
            ))

        # Error rates (only if no resync, counters reset on resync)
        if curr.uptime >= prev.uptime:
            fec_delta = curr.downstream_fec - prev.downstream_fec
            crc_delta = curr.downstream_crc - prev.downstream_crc
            if fec_delta >= 0 and crc_delta >= 0:
                hours = dt / 3600
                fec_h = fec_delta / hours if hours > 0 else 0
                crc_h = crc_delta / hours if hours > 0 else 0
                error_rates.append(ErrorRatePerHour(
                    timestamp=curr.timestamp,
                    fec_per_hour=round(fec_h, 1),
                    crc_per_hour=round(crc_h, 1),
                ))

                # CRC spike alert
                if crc_h > 10:
                    alerts.append(AlertEvent(
                        timestamp=curr.timestamp,
                        type="crc_spike",
                        severity="critical" if crc_h > 50 else "warning",
                        message="crc_spike_msg",
                        params=[f"{crc_h:.0f}"],
                    ))

        # SNR low alert
        if curr.downstream_snr < 7:
            alerts.append(AlertEvent(
                timestamp=curr.timestamp,
                type="snr_low",
                severity="critical" if curr.downstream_snr < SNR_MINIMUM else "warning",
                message="snr_low_msg",
                params=[f"{curr.downstream_snr:.1f}"],
            ))

        # Quality score for this point (rolling: uses error_rates so far + resync_count so far)
        snr_reserve_curr = max(curr.downstream_snr - SNR_MINIMUM, 0)
        snr_pt = min(snr_reserve_curr / 10.0, 1.0) * 40
        # Use last 10 error rates for CRC component (rolling window)
        recent = error_rates[-10:] if error_rates else []
        recent_crc = sum(e.crc_per_hour for e in recent) / len(recent) if recent else 0
        crc_pt = max(0, 30 - recent_crc * 10)
        stab_pt = max(0, 30 - resync_count * 10)
        score_pt = max(0, min(100, int(snr_pt + crc_pt + stab_pt)))
        quality_history.append(QualityPoint(timestamp=curr.timestamp, score=score_pt))

    # Averages
    avg_fec = sum(e.fec_per_hour for e in error_rates) / len(error_rates) if error_rates else 0
    avg_crc = sum(e.crc_per_hour for e in error_rates) / len(error_rates) if error_rates else 0

    # Line quality score
    snr_score = min(snr_reserve_down / 10.0, 1.0) * 40
    crc_score = max(0, 30 - avg_crc * 10)
    stability_score = max(0, 30 - resync_count * 10)
    total_score = int(snr_score + crc_score + stability_score)
    total_score = max(0, min(100, total_score))

    if total_score >= 80:
        label = "quality_excellent"
    elif total_score >= 60:
        label = "quality_good"
    elif total_score >= 40:
        label = "quality_fair"
    else:
        label = "quality_poor"

    # Sort alerts newest first, cap at 50
    alerts.sort(key=lambda a: a.timestamp, reverse=True)
    alerts = alerts[:50]

    return DiagnosticsResponse(
        snr_reserve_down=round(snr_reserve_down, 1),
        snr_reserve_up=round(snr_reserve_up, 1),
        snr_minimum=SNR_MINIMUM,
        current_downstream=last.downstream_current,
        current_upstream=last.upstream_current,
        target_downstream=settings.target_downstream,
        target_upstream=settings.target_upstream,
        error_rates=error_rates,
        avg_fec_per_hour=round(avg_fec, 1),
        avg_crc_per_hour=round(avg_crc, 1),
        resync_count=resync_count,
        last_resync=last_resync,
        line_quality_score=total_score,
        line_quality_label=label,
        quality_history=quality_history,
        alerts=alerts,
    )


def _empty_response() -> DiagnosticsResponse:
    return DiagnosticsResponse(
        snr_reserve_down=0, snr_reserve_up=0, snr_minimum=SNR_MINIMUM,
        current_downstream=0, current_upstream=0,
        target_downstream=settings.target_downstream, target_upstream=settings.target_upstream,
        error_rates=[], avg_fec_per_hour=0, avg_crc_per_hour=0,
        resync_count=0, last_resync=None,
        line_quality_score=0, line_quality_label="quality_nodata",
        quality_history=[],
        alerts=[],
    )
