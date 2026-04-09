function formatUptime(seconds) {
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const parts = [];
    if (d > 0) parts.push(`${d}d`);
    if (h > 0) parts.push(`${h}h`);
    parts.push(`${m}m`);
    return parts.join(' ');
}

function snrColor(db) {
    if (db >= 10) return 'text-green-400';
    if (db >= 6) return 'text-yellow-400';
    return 'text-red-400';
}

function updateDashboard(reading) {
    if (!reading) return;

    const statusEl = document.getElementById('card-status');
    statusEl.textContent = reading.status === 'Up' ? 'Verbunden' : reading.status;
    statusEl.className = `text-xl font-bold mt-1 ${reading.status === 'Up' ? 'text-green-400' : 'text-red-400'}`;

    document.getElementById('card-uptime').textContent = formatUptime(reading.uptime);
    document.getElementById('card-down').textContent = `${(reading.downstream_current / 1000).toFixed(1)} Mbit/s`;
    document.getElementById('card-down-max').textContent = `Max: ${(reading.downstream_max / 1000).toFixed(1)} Mbit/s`;
    document.getElementById('card-up').textContent = `${(reading.upstream_current / 1000).toFixed(1)} Mbit/s`;
    document.getElementById('card-up-max').textContent = `Max: ${(reading.upstream_max / 1000).toFixed(1)} Mbit/s`;

    const snrDown = document.getElementById('card-snr-down');
    snrDown.textContent = `${reading.downstream_snr.toFixed(1)} dB`;
    snrDown.className = `text-xl font-bold mt-1 ${snrColor(reading.downstream_snr)}`;

    const snrUp = document.getElementById('card-snr-up');
    snrUp.textContent = `${reading.upstream_snr.toFixed(1)} dB`;
    snrUp.className = `text-xl font-bold mt-1 ${snrColor(reading.upstream_snr)}`;

    document.getElementById('card-att-down').textContent = `${reading.downstream_attenuation.toFixed(1)} dB`;
    document.getElementById('card-att-up').textContent = `${reading.upstream_attenuation.toFixed(1)} dB`;

    const ts = new Date(reading.timestamp);
    document.getElementById('last-update').textContent = `Letztes Update: ${ts.toLocaleString('de-DE')}`;
}
