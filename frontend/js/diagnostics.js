function scoreColor(score) {
    if (score >= 80) return '#22c55e';
    if (score >= 60) return '#f59e0b';
    if (score >= 40) return '#f97316';
    return '#ef4444';
}

function severityIcon(severity) {
    if (severity === 'critical') return '<span class="text-red-400">&#9679;</span>';
    if (severity === 'warning') return '<span class="text-yellow-400">&#9679;</span>';
    return '<span class="text-blue-400">&#9679;</span>';
}

function formatAlertTime(ts) {
    const d = new Date(ts);
    return d.toLocaleString('de-DE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

function updateDiagnostics(diag) {
    if (!diag) return;

    const score = diag.line_quality_score;
    const color = scoreColor(score);
    const arc = document.getElementById('diag-score-arc');
    arc.setAttribute('stroke-dasharray', `${score} ${100 - score}`);
    arc.setAttribute('stroke', color);
    document.getElementById('diag-score').textContent = score;

    // Translate quality label
    const labelMap = {
        'Ausgezeichnet': 'quality_excellent',
        'Gut': 'quality_good',
        'Mäßig': 'quality_fair',
        'Schlecht': 'quality_poor',
        'Keine Daten': 'quality_nodata',
    };
    const labelKey = labelMap[diag.line_quality_label] || 'quality_nodata';
    document.getElementById('diag-label').textContent = t(labelKey, diag.line_quality_label);
    document.getElementById('diag-label').style.color = color;

    const snrDown = document.getElementById('diag-snr-down');
    snrDown.textContent = `${diag.snr_reserve_down.toFixed(1)} dB`;
    snrDown.style.color = diag.snr_reserve_down > 6 ? '#22c55e' : diag.snr_reserve_down > 3 ? '#f59e0b' : '#ef4444';

    const snrUp = document.getElementById('diag-snr-up');
    snrUp.textContent = `${diag.snr_reserve_up.toFixed(1)} dB`;
    snrUp.style.color = diag.snr_reserve_up > 6 ? '#22c55e' : diag.snr_reserve_up > 3 ? '#f59e0b' : '#ef4444';

    document.getElementById('diag-rate').textContent = `${(diag.current_downstream / 1000).toFixed(1)} Mbit/s`;
    document.getElementById('diag-target').textContent = `${(diag.target_downstream / 1000).toFixed(0)} Mbit/s ${t('contracted_suffix')}`;

    const fecEl = document.getElementById('diag-fec');
    fecEl.textContent = diag.avg_fec_per_hour.toFixed(1);
    fecEl.style.color = diag.avg_fec_per_hour < 100 ? '#22c55e' : '#f59e0b';

    const crcEl = document.getElementById('diag-crc');
    crcEl.textContent = diag.avg_crc_per_hour.toFixed(1);
    crcEl.style.color = diag.avg_crc_per_hour === 0 ? '#22c55e' : diag.avg_crc_per_hour < 10 ? '#f59e0b' : '#ef4444';

    document.getElementById('diag-resyncs').textContent = diag.resync_count;
    document.getElementById('diag-last-resync').textContent = diag.last_resync
        ? formatAlertTime(diag.last_resync)
        : t('none');

    const pct = Math.min(100, Math.round(diag.current_downstream / diag.target_downstream * 100));
    document.getElementById('diag-progress-pct').textContent = `${pct}%`;
    document.getElementById('diag-progress-bar').style.width = `${pct}%`;
    document.getElementById('diag-progress-bar').className =
        `h-2 rounded-full transition-all ${pct >= 90 ? 'bg-green-500' : pct >= 70 ? 'bg-blue-500' : 'bg-yellow-500'}`;

    const alertsList = document.getElementById('alerts-list');
    if (diag.alerts.length === 0) {
        alertsList.innerHTML = `<div class="text-slate-500">${t('no_events')}</div>`;
    } else {
        alertsList.innerHTML = diag.alerts.map(a =>
            `<div class="flex gap-2 py-1 border-b border-slate-700/50">
                ${severityIcon(a.severity)}
                <span class="text-slate-400 flex-shrink-0">${formatAlertTime(a.timestamp)}</span>
                <span class="text-slate-200">${a.message}</span>
            </div>`
        ).join('');
    }
}
