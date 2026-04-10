# Changelog

All notable changes to this project will be documented in this file.

## [1.3.0] - 2026-04-10

### Added
- i18n support with German and English translations (78 keys)
- Language toggle via flag icons (DE/GB), auto-detects browser language
- Persisted language selection in localStorage

### Changed
- All UI text translatable via JSON dictionaries (frontend/lang/)
- Backend sends i18n keys instead of hardcoded German labels
- Alert messages use parameterized translation keys

## [1.2.1] - 2026-04-10

### Changed
- Rename "DLM Fortschritt" to "Profilqualität" with glossary entry
- Header title top-aligned, GitHub icon with repo link
- Various UI polish

## [1.2.0] - 2026-04-10

### Added
- FEC/CRC and traffic charts show delta per hour instead of cumulative values
- Configurable poll schedule via POLL_CRON cron expression (replaces POLL_INTERVAL_MINUTES)
- Bilingual documentation (docs/README_de.md, docs/README_en.md)
- CHANGELOG.md and CLAUDE.md

### Changed
- POLL_INTERVAL_MINUTES replaced by POLL_CRON (default: `*/15 * * * *`)
- README in English only, documentation linked with flag icons
- Renamed project from fritzbox-monitor to dsl-monitor

## [1.1.0] - 2026-04-10

### Added
- Diagnostics panel with line quality score (0-100), SNR reserve, DLM progress bar
- Alerts/events panel (resync detection, CRC spikes, rate changes)
- Glossary card with expandable DSL term definitions
- Sub-day time ranges (2h, 6h, 12h) with clock-aligned boundaries
- Synchronized drag-to-zoom across all charts (chartjs-plugin-zoom)
- Network monitoring: active hosts, WLAN clients per band, traffic rates, WLAN channel
- Configurable target rates via TARGET_DOWNSTREAM/TARGET_UPSTREAM env vars
- Auto-refresh dashboard and charts every 60 seconds
- Version display in UI header (from git tags)
- GitHub Actions CI for building container images on version tags
- MIT license

### Changed
- Chart.js min-max decimation instead of server-side aggregation
- Range navigation with prev/next chevrons replaces date pickers
- All status cards consolidated into single header row
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
