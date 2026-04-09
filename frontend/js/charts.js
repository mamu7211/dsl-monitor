const chartDefaults = {
    responsive: true,
    interaction: { mode: 'index', intersect: false },
    scales: {
        x: {
            type: 'time',
            time: { tooltipFormat: 'dd.MM.yyyy HH:mm' },
            ticks: { color: '#94a3b8' },
            grid: { color: '#334155' },
        },
        y: {
            beginAtZero: true,
            ticks: { color: '#94a3b8' },
            grid: { color: '#334155' },
        }
    },
    plugins: {
        legend: { labels: { color: '#e2e8f0', usePointStyle: true, pointStyle: 'line' } },
        tooltip: { usePointStyle: true, pointStyle: 'line' }
    }
};

let ratesChart, snrChart, attenuationChart, errorsChart;

function initCharts() {
    ratesChart = new Chart(document.getElementById('chart-rates'), {
        type: 'line',
        data: { datasets: [] },
        options: { ...chartDefaults }
    });

    snrChart = new Chart(document.getElementById('chart-snr'), {
        type: 'line',
        data: { datasets: [] },
        options: { ...chartDefaults }
    });

    attenuationChart = new Chart(document.getElementById('chart-attenuation'), {
        type: 'line',
        data: { datasets: [] },
        options: { ...chartDefaults }
    });

    errorsChart = new Chart(document.getElementById('chart-errors'), {
        type: 'line',
        data: { datasets: [] },
        options: { ...chartDefaults }
    });
}

function updateCharts(readings) {
    const timestamps = readings.map(r => new Date(r.timestamp));

    ratesChart.data = {
        labels: timestamps,
        datasets: [
            { label: 'Download aktuell', data: readings.map(r => r.downstream_current), borderColor: '#3b82f6', borderWidth: 2, pointRadius: 2, tension: 0.3 },
            { label: 'Download max', data: readings.map(r => r.downstream_max), borderColor: '#3b82f6', borderWidth: 1, borderDash: [5, 5], pointRadius: 0, tension: 0.3 },
            { label: 'Upload aktuell', data: readings.map(r => r.upstream_current), borderColor: '#22c55e', borderWidth: 2, pointRadius: 2, tension: 0.3 },
            { label: 'Upload max', data: readings.map(r => r.upstream_max), borderColor: '#22c55e', borderWidth: 1, borderDash: [5, 5], pointRadius: 0, tension: 0.3 },
        ]
    };
    ratesChart.update();

    snrChart.data = {
        labels: timestamps,
        datasets: [
            { label: 'SNR Downstream', data: readings.map(r => r.downstream_snr), borderColor: '#f59e0b', borderWidth: 2, pointRadius: 2, tension: 0.3 },
            { label: 'SNR Upstream', data: readings.map(r => r.upstream_snr), borderColor: '#ef4444', borderWidth: 2, pointRadius: 2, tension: 0.3 },
        ]
    };
    snrChart.update();

    attenuationChart.data = {
        labels: timestamps,
        datasets: [
            { label: 'Dämpfung Downstream', data: readings.map(r => r.downstream_attenuation), borderColor: '#14b8a6', borderWidth: 2, pointRadius: 3, tension: 0.3 },
            { label: 'Dämpfung Upstream', data: readings.map(r => r.upstream_attenuation), borderColor: '#f97316', borderWidth: 2, pointRadius: 3, tension: 0.3 },
        ]
    };
    attenuationChart.update();

    errorsChart.data = {
        labels: timestamps,
        datasets: [
            { label: 'FEC Down', data: readings.map(r => r.downstream_fec), borderColor: '#8b5cf6', borderWidth: 2, pointRadius: 2, tension: 0.3 },
            { label: 'CRC Down', data: readings.map(r => r.downstream_crc), borderColor: '#ec4899', borderWidth: 2, pointRadius: 2, tension: 0.3 },
            { label: 'FEC Up', data: readings.map(r => r.upstream_fec), borderColor: '#8b5cf6', borderWidth: 1, borderDash: [5, 5], pointRadius: 0, tension: 0.3 },
            { label: 'CRC Up', data: readings.map(r => r.upstream_crc), borderColor: '#ec4899', borderWidth: 1, borderDash: [5, 5], pointRadius: 0, tension: 0.3 },
        ]
    };
    errorsChart.update();
}
