# Changelog

All notable changes to this project will be documented in this file.

## [1.1.0] - 2026-04-10

### Added
- Diagnostics panel with line quality score (0-100), SNR reserve, DLM progress bar
- Alerts/events panel (resync detection, CRC spikes, rate changes)
- Glossary card with expandable DSL term definitions
- Sub-day time ranges (2h, 6h, 12h) with clock-aligned boundaries
- Synchronized drag-to-zoom across all charts (chartjs-plugin-zoom)
- Network monitoring: active hosts, WLAN clients per band, traffic rates, WLAN channel
- Configurable target rates via TARGET_DOWNSTREAM/TARGET_UPSTREAM env vars
- Configurable poll schedule via POLL_CRON (cron expression, default: every 15 min)
- Auto-refresh dashboard and charts every 60 seconds
- Version display in UI header (from git tags)
- GitHub Actions CI for building container images on version tags
- MIT license

### Changed
- FEC/CRC and traffic charts show delta per hour instead of cumulative values
- Chart.js min-max decimation instead of server-side aggregation
- Range navigation with prev/next chevrons replaces date pickers
- All status cards consolidated into single header row
- Renamed from "FritzBox DSL Monitor" to "DSL Monitor"
- Count only active hosts instead of all registered devices
- Uptime from WANPPPConnection (actual WAN uptime) instead of DSL info

### Fixed
- Timezone bug in date formatting causing empty charts
- Charts filling full card height (maintainAspectRatio: false)

## [1.0.0] - 2026-04-10

### Added
- Initial release
- DSL monitoring via TR-064 API (sync rates, SNR, attenuation, FEC/CRC, power)
- 8 time series charts (rates, SNR, attenuation, errors, clients, traffic rate, traffic total, WLAN channel)
- Status dashboard with current values
- JSON file storage (daily files, monthly aggregation)
- Data retention (auto-delete after 180 days)
- Docker/Podman deployment with docker-compose
- FastAPI backend with APScheduler
- Vanilla JS frontend with Tailwind CSS and Chart.js (CDN, no build step)
