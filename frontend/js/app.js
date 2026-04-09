// State
let rangeSize = parseInt(localStorage.getItem('rangeSize') || '1');
let endDate = new Date();
endDate.setHours(0, 0, 0, 0);

function toISODate(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

function addDays(d, n) {
    const r = new Date(d);
    r.setDate(r.getDate() + n);
    return r;
}

function today() {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
}

function formatDate(d) {
    return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' });
}

function getStartDate() {
    return rangeSize <= 1 ? endDate : addDays(endDate, -(rangeSize - 1));
}

function updateRangeLabel() {
    const start = getStartDate();
    const label = document.getElementById('range-label');
    if (rangeSize <= 1) {
        label.textContent = formatDate(endDate);
    } else {
        label.textContent = `${formatDate(start)} – ${formatDate(endDate)}`;
    }

    // Disable forward if at today
    const isToday = toISODate(endDate) === toISODate(today());
    document.getElementById('btn-forward').disabled = isToday;
    document.getElementById('btn-forward').classList.toggle('opacity-30', isToday);

    // Highlight active range button
    document.querySelectorAll('.range-btn').forEach(btn => {
        const active = parseInt(btn.dataset.range) === rangeSize;
        btn.className = `range-btn px-2 py-1 rounded text-xs ${active ? 'bg-blue-600 text-white' : 'bg-slate-700 hover:bg-slate-600'}`;
    });
}

async function loadData() {
    const start = getStartDate();
    const from = toISODate(start);
    const to = toISODate(endDate);

    currentRangeDays = rangeSize;

    const readings = from === to
        ? await API.getReadings(from)
        : await API.getReadingsRange(from, to);
    updateCharts(readings);
    updateRangeLabel();
}

function setRange(days) {
    rangeSize = days;
    localStorage.setItem('rangeSize', days);
    endDate = today();
    loadData();
}

function navBack() {
    endDate = addDays(endDate, -rangeSize);
    loadData();
}

function navForward() {
    const next = addDays(endDate, rangeSize);
    const t = today();
    endDate = next > t ? t : next;
    loadData();
}

function navToday() {
    endDate = today();
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
    await refreshStatus();
    await loadData();
    setInterval(refreshStatus, 5 * 60 * 1000);
});
