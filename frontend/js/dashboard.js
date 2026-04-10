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

function statusColor(ok) {
    return ok ? 'text-green-400' : 'text-red-400';
}

function updateDashboard(reading) {
    if (!reading) return;

    const statusEl = document.getElementById('card-status');
    const dslOk = reading.status === 'Up';
    statusEl.textContent = `DSL: ${dslOk ? 'Up' : reading.status}`;
    statusEl.className = `text-sm font-bold ${statusColor(dslOk)}`;

    const wanEl = document.getElementById('card-wan-status');
    const wanOk = reading.wan_status === 'Connected';
    wanEl.textContent = `WAN: ${wanOk ? 'Up' : reading.wan_status || '--'}`;
    wanEl.className = `text-sm font-bold ${statusColor(wanOk)}`;

    document.getElementById('card-uptime').textContent = formatUptime(reading.uptime);

    const downEl = document.getElementById('card-down');
    downEl.textContent = `${(reading.downstream_current / 1000).toFixed(1)} Mbit/s`;
    downEl.className = 'text-lg font-bold text-green-400';
    document.getElementById('card-down-max').textContent = `Max: ${(reading.downstream_max / 1000).toFixed(1)}`;

    const upEl = document.getElementById('card-up');
    upEl.textContent = `${(reading.upstream_current / 1000).toFixed(1)} Mbit/s`;
    upEl.className = 'text-lg font-bold text-green-400';
    document.getElementById('card-up-max').textContent = `Max: ${(reading.upstream_max / 1000).toFixed(1)}`;

    document.getElementById('card-snr-down').textContent = `↓ ${reading.downstream_snr.toFixed(1)} dB`;
    document.getElementById('card-snr-up').textContent = `↑ ${reading.upstream_snr.toFixed(1)} dB`;

    document.getElementById('card-att-down').textContent = `↓ ${reading.downstream_attenuation.toFixed(1)} dB`;
    document.getElementById('card-att-up').textContent = `↑ ${reading.upstream_attenuation.toFixed(1)} dB`;

    document.getElementById('card-external-ip').textContent = reading.external_ip || '--';

    const dns1 = reading.dns_server_1 || '';
    const dns2 = reading.dns_server_2 || '';
    document.getElementById('card-dns').textContent = dns2 ? `${dns1}\n${dns2}` : dns1 || '--';
    document.getElementById('card-dns').style.whiteSpace = 'pre-line';

    const wlanParts = [];
    if (reading.wlan_ssid_24ghz) wlanParts.push(`2.4G: Ch ${reading.wlan_channel_24ghz}`);
    if (reading.wlan_ssid_5ghz) wlanParts.push(`5G: Ch ${reading.wlan_channel_5ghz}`);
    document.getElementById('card-wlan-info').textContent = wlanParts.join('\n') || '--';
    document.getElementById('card-wlan-info').style.whiteSpace = 'pre-line';

    const ts = new Date(reading.timestamp);
    document.getElementById('last-update').textContent = `${t('last_update')}: ${ts.toLocaleString('de-DE')}`;
}
