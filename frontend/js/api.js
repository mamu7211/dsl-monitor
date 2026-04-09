const API = {
    async getStatus() {
        const res = await fetch('/api/status');
        return res.ok ? res.json() : null;
    },

    async getReadings(date) {
        const res = await fetch(`/api/readings/${date}`);
        return res.ok ? res.json() : [];
    },

    async getReadingsRange(from, to) {
        const res = await fetch(`/api/readings?from=${from}&to=${to}`);
        return res.ok ? res.json() : [];
    },

    async collectNow() {
        const res = await fetch('/api/collect', { method: 'POST' });
        return res.ok ? res.json() : null;
    },

    async getSummary(year, month) {
        const res = await fetch(`/api/summary/${year}/${month}`);
        return res.ok ? res.json() : {};
    }
};
