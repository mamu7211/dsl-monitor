// State
let rangeSize = parseFloat(localStorage.getItem('rangeSize') || '1');
let endDate = new Date();

function toISODate(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

function addHours(d, h) {
    return new Date(d.getTime() + h * 3600000);
}

function now() {
    return new Date();
}

function todayMidnight() {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
}

function formatDateTime(d) {
    return d.toLocaleString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
}

function formatDate(d) {
    return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' });
}

function rangeHours() {
    return rangeSize * 24;
}

function getStartDate() {
    return addHours(endDate, -rangeHours());
}

function updateRangeLabel() {
    const start = getStartDate();
    const label = document.getElementById('range-label');
    if (rangeSize < 1) {
        label.textContent = `${formatDateTime(start)} – ${formatDateTime(endDate)}`;
    } else if (rangeSize <= 1) {
        label.textContent = formatDate(endDate);
    } else {
        label.textContent = `${formatDate(start)} – ${formatDate(endDate)}`;
    }

    // Disable forward if at now
    const isNow = endDate.getTime() >= now().getTime() - 60000;
    document.getElementById('btn-forward').disabled = isNow;
    document.getElementById('btn-forward').classList.toggle('opacity-30', isNow);

    // Highlight active range button
    document.querySelectorAll('.range-btn').forEach(btn => {
        const active = parseFloat(btn.dataset.range) === rangeSize;
        btn.className = `range-btn px-1.5 py-0.5 rounded text-xs ${active ? 'bg-blue-600 text-white' : 'bg-slate-700 hover:bg-slate-600'}`;
    });
}

async function loadData() {
    const start = getStartDate();
    const from = toISODate(start);
    const to = toISODate(endDate);

    currentRangeDays = rangeSize;

    let readings;
    if (from === to) {
        readings = await API.getReadings(from);
    } else {
        readings = await API.getReadingsRange(from, to);
    }

    // For sub-day ranges, filter client-side by timestamp
    if (rangeSize < 1) {
        const startMs = start.getTime();
        const endMs = endDate.getTime();
        readings = readings.filter(r => {
            const t = new Date(r.timestamp).getTime();
            return t >= startMs && t <= endMs;
        });
    }

    updateCharts(readings);
    updateRangeLabel();
}

function setRange(days) {
    rangeSize = days;
    localStorage.setItem('rangeSize', days);
    endDate = rangeSize < 1 ? now() : todayMidnight();
    loadData();
}

function navBack() {
    endDate = addHours(endDate, -rangeHours());
    loadData();
}

function navForward() {
    const next = addHours(endDate, rangeHours());
    const n = rangeSize < 1 ? now() : todayMidnight();
    endDate = next > n ? n : next;
    loadData();
}

function navToday() {
    endDate = rangeSize < 1 ? now() : todayMidnight();
    loadData();
}

async function collectNow() {
    const reading = await API.collectNow();
    if (reading) {
        updateDashboard(reading);
        navToday();
    }
}

async function refreshStatus() {
    const reading = await API.getStatus();
    updateDashboard(reading);
}

// Init
document.addEventListener('DOMContentLoaded', async () => {
    initCharts();
    // Set initial endDate based on stored range
    endDate = rangeSize < 1 ? now() : todayMidnight();
    await refreshStatus();
    await loadData();
    setInterval(refreshStatus, 5 * 60 * 1000);
});
