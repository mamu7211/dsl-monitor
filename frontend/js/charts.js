let currentRangeDays = 1;

function getTimeScaleConfig(rangeDays) {
    const base = {
        type: 'time',
        ticks: { color: '#94a3b8', maxRotation: 0, autoSkipPadding: 20 },
        grid: { color: '#334155' },
    };

    if (rangeDays <= 1) {
        return { ...base, time: { unit: 'hour', stepSize: 3, displayFormats: { hour: 'HH:mm' }, tooltipFormat: 'dd.MM.yyyy HH:mm' },
            min: new Date(new Date().setHours(0,0,0,0)).toISOString(),
            max: new Date(new Date().setHours(23,59,59,999)).toISOString(),
        };
    } else if (rangeDays <= 7) {
        return { ...base, time: { unit: 'day', displayFormats: { day: 'EEE dd.MM.' }, tooltipFormat: 'EEE dd.MM.yyyy HH:mm' } };
    } else if (rangeDays <= 30) {
        return { ...base, time: { unit: 'day', displayFormats: { day: 'dd.MM.' }, tooltipFormat: 'dd.MM.yyyy HH:mm' } };
    } else if (rangeDays <= 90) {
        return { ...base, time: { unit: 'week', displayFormats: { week: 'dd.MM.' }, tooltipFormat: 'dd.MM.yyyy' } };
    } else {
        return { ...base, time: { unit: 'month', displayFormats: { month: 'MMM yyyy' }, tooltipFormat: 'dd.MM.yyyy' } };
    }
}

function makeChartOptions(overrides) {
    const defaults = {
        responsive: true,
        parsing: false,
        elements: { point: { radius: 0, hitRadius: 6, hoverRadius: 4 } },
        interaction: { mode: 'nearest', axis: 'x', intersect: false },
        scales: {
            x: getTimeScaleConfig(1),
            y: {
                beginAtZero: true,
                ticks: { color: '#94a3b8' },
                grid: { color: '#334155' },
            }
        },
        plugins: {
            legend: { labels: { color: '#e2e8f0', usePointStyle: true, pointStyle: 'line' } },
            tooltip: { usePointStyle: true, pointStyle: 'line' },
            decimation: { enabled: true, algorithm: 'min-max' },
            zoom: {
                zoom: {
                    drag: {
                        enabled: true,
                        backgroundColor: 'rgba(59, 130, 246, 0.15)',
                        borderColor: 'rgba(59, 130, 246, 0.5)',
                        borderWidth: 1,
                    },
                    mode: 'x',
                    onZoomComplete: syncZoom,
                },
                pan: {
                    enabled: true,
                    mode: 'x',
                    modifierKey: 'shift',
                },
            },
        }
    };
    if (overrides) {
        return { ...defaults, ...overrides, scales: { ...defaults.scales, ...overrides.scales }, plugins: { ...defaults.plugins, ...overrides.plugins } };
    }
    return defaults;
}

let ratesChart, snrChart, attenuationChart, errorsChart, clientsChart, trafficRateChart, trafficTotalChart, channelChart;

function getAllCharts() {
    return [ratesChart, snrChart, attenuationChart, errorsChart, clientsChart, trafficRateChart, trafficTotalChart, channelChart];
}

let _syncing = false;
function syncZoom({chart}) {
    if (_syncing) return;
    _syncing = true;
    const {min, max} = chart.scales.x;
    getAllCharts().forEach(c => {
        if (c !== chart) {
            c.options.scales.x.min = min;
            c.options.scales.x.max = max;
            c.update('none');
        }
    });
    _syncing = false;
}

function resetZoom() {
    getAllCharts().forEach(c => {
        c.resetZoom();
    });
}

function initCharts() {
    const opts = makeChartOptions();

    ratesChart = new Chart(document.getElementById('chart-rates'), { type: 'line', data: { datasets: [] }, options: opts });
    snrChart = new Chart(document.getElementById('chart-snr'), { type: 'line', data: { datasets: [] }, options: makeChartOptions() });
    attenuationChart = new Chart(document.getElementById('chart-attenuation'), { type: 'line', data: { datasets: [] }, options: makeChartOptions() });
    errorsChart = new Chart(document.getElementById('chart-errors'), { type: 'line', data: { datasets: [] }, options: makeChartOptions() });
    clientsChart = new Chart(document.getElementById('chart-clients'), { type: 'line', data: { datasets: [] }, options: makeChartOptions() });
    trafficRateChart = new Chart(document.getElementById('chart-traffic-rate'), { type: 'line', data: { datasets: [] }, options: makeChartOptions() });
    trafficTotalChart = new Chart(document.getElementById('chart-traffic-total'), { type: 'line', data: { datasets: [] }, options: makeChartOptions() });
    channelChart = new Chart(document.getElementById('chart-channel'), {
        type: 'line', data: { datasets: [] },
        options: makeChartOptions({ scales: { y: { beginAtZero: false, ticks: { color: '#94a3b8' }, grid: { color: '#334155' } } } })
    });
}

// Helper to create {x, y} data points
function xy(readings, yFn) {
    return readings.map(r => ({ x: new Date(r.timestamp).getTime(), y: yFn(r) }));
}

function updateTimeScale(chart) {
    const xConfig = getTimeScaleConfig(currentRangeDays);
    chart.options.scales.x = xConfig;
}

function updateCharts(readings) {
    getAllCharts().forEach(c => updateTimeScale(c));

    ratesChart.data = {
        datasets: [
            { label: 'Download aktuell', data: xy(readings, r => r.downstream_current), borderColor: '#3b82f6', borderWidth: 2 },
            { label: 'Download max', data: xy(readings, r => r.downstream_max), borderColor: '#3b82f6', borderWidth: 1, borderDash: [5, 5] },
            { label: 'Upload aktuell', data: xy(readings, r => r.upstream_current), borderColor: '#22c55e', borderWidth: 2 },
            { label: 'Upload max', data: xy(readings, r => r.upstream_max), borderColor: '#22c55e', borderWidth: 1, borderDash: [5, 5] },
        ]
    };
    ratesChart.update();

    snrChart.data = {
        datasets: [
            { label: 'SNR Downstream', data: xy(readings, r => r.downstream_snr), borderColor: '#f59e0b', borderWidth: 2 },
            { label: 'SNR Upstream', data: xy(readings, r => r.upstream_snr), borderColor: '#ef4444', borderWidth: 2 },
        ]
    };
    snrChart.update();

    attenuationChart.data = {
        datasets: [
            { label: 'Dämpfung Downstream', data: xy(readings, r => r.downstream_attenuation), borderColor: '#14b8a6', borderWidth: 2 },
            { label: 'Dämpfung Upstream', data: xy(readings, r => r.upstream_attenuation), borderColor: '#f97316', borderWidth: 2 },
        ]
    };
    attenuationChart.update();

    errorsChart.data = {
        datasets: [
            { label: 'FEC Down', data: xy(readings, r => r.downstream_fec), borderColor: '#8b5cf6', borderWidth: 2 },
            { label: 'CRC Down', data: xy(readings, r => r.downstream_crc), borderColor: '#ec4899', borderWidth: 2 },
            { label: 'FEC Up', data: xy(readings, r => r.upstream_fec), borderColor: '#8b5cf6', borderWidth: 1, borderDash: [5, 5] },
            { label: 'CRC Up', data: xy(readings, r => r.upstream_crc), borderColor: '#ec4899', borderWidth: 1, borderDash: [5, 5] },
        ]
    };
    errorsChart.update();

    clientsChart.data = {
        datasets: [
            { label: 'LAN/WLAN Gesamt', data: xy(readings, r => r.hosts_total), borderColor: '#3b82f6', borderWidth: 2 },
            { label: 'WLAN 2.4 GHz', data: xy(readings, r => r.wlan_clients_24ghz), borderColor: '#22c55e', borderWidth: 2 },
            { label: 'WLAN 5 GHz', data: xy(readings, r => r.wlan_clients_5ghz), borderColor: '#f59e0b', borderWidth: 2 },
            { label: 'WLAN Gast', data: xy(readings, r => r.wlan_clients_guest), borderColor: '#ef4444', borderWidth: 2 },
        ]
    };
    clientsChart.update();

    trafficRateChart.data = {
        datasets: [
            { label: 'Senden', data: xy(readings, r => +(r.bytes_send_rate / 1024).toFixed(1)), borderColor: '#22c55e', borderWidth: 2 },
            { label: 'Empfangen', data: xy(readings, r => +(r.bytes_receive_rate / 1024).toFixed(1)), borderColor: '#3b82f6', borderWidth: 2 },
        ]
    };
    trafficRateChart.update();

    trafficTotalChart.data = {
        datasets: [
            { label: 'Gesendet', data: xy(readings, r => +(r.total_bytes_sent / 1048576).toFixed(1)), borderColor: '#22c55e', borderWidth: 2 },
            { label: 'Empfangen', data: xy(readings, r => +(r.total_bytes_received / 1048576).toFixed(1)), borderColor: '#3b82f6', borderWidth: 2 },
        ]
    };
    trafficTotalChart.update();

    channelChart.data = {
        datasets: [
            { label: '2.4 GHz Kanal', data: xy(readings, r => r.wlan_channel_24ghz), borderColor: '#22c55e', borderWidth: 2, stepped: true },
            { label: '5 GHz Kanal', data: xy(readings, r => r.wlan_channel_5ghz), borderColor: '#3b82f6', borderWidth: 2, stepped: true },
        ]
    };
    channelChart.update();
}
