function toISODate(d) {
    return d.toISOString().split('T')[0];
}

function daysAgo(n) {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d;
}

async function loadRange(preset) {
    let from, to;
    const today = toISODate(new Date());

    switch (preset) {
        case 'today':
            from = to = today;
            break;
        case '7d':
            from = toISODate(daysAgo(6));
            to = today;
            break;
        case '30d':
            from = toISODate(daysAgo(29));
            to = today;
            break;
    }

    document.getElementById('date-from').value = from;
    document.getElementById('date-to').value = to;
    await fetchAndRender(from, to);
}

async function loadCustomRange() {
    const from = document.getElementById('date-from').value;
    const to = document.getElementById('date-to').value;
    if (from && to) {
        await fetchAndRender(from, to);
    }
}

async function fetchAndRender(from, to) {
    const readings = from === to
        ? await API.getReadings(from)
        : await API.getReadingsRange(from, to);
    updateCharts(readings);
}

async function collectNow() {
    const reading = await API.collectNow();
    if (reading) {
        updateDashboard(reading);
        await loadRange('today');
    }
}

async function refreshStatus() {
    const reading = await API.getStatus();
    updateDashboard(reading);
}

// Init
document.addEventListener('DOMContentLoaded', async () => {
    initCharts();
    await refreshStatus();
    await loadRange('today');
    setInterval(refreshStatus, 5 * 60 * 1000);
});
