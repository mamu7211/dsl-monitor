# DSL Monitor

Stündliches Monitoring der DSL-Leitungsparameter via TR-064 API. Web-Dashboard mit Verlaufscharts, Diagnostik-Panel und Leitungsqualitäts-Score. Deploybar als Docker-Container auf einem NAS.

Hourly DSL line monitoring via TR-064 API. Web dashboard with time series charts, diagnostics panel and line quality score. Deployable as a Docker container on a NAS.

![DSL Monitor Dashboard](dashboard.png)

**Dokumentation / Documentation:** [Deutsch](docs/README_de.md) | [English](docs/README_en.md)

## Unterstützte Hardware / Supported Hardware

- **AVM FRITZ!Box** (alle Modelle mit TR-064 / all models with TR-064 support, e.g. 7590, 7590 AX, 7530, 7490)

## Schnellstart / Quick Start

```bash
git clone https://github.com/mamu7211/dsl-monitor.git
cd dsl-monitor
cp .env.example .env    # FRITZ_PASSWORD setzen / set FRITZ_PASSWORD
./run.sh                # http://localhost:8080
```

## Features

- DSL-Monitoring: Sync-Raten, SNR, Dämpfung, FEC/CRC
- Netzwerk: Clients, Traffic, WLAN-Kanal
- Diagnostik: Leitungsqualitäts-Score, DLM-Fortschritt, Alerts
- Zeitnavigation: 2h–60T Bereiche, Drag-to-Zoom
- JSON-Speicherung, Docker/Podman Deployment

## Changelog

Siehe [CHANGELOG.md](CHANGELOG.md)

## Lizenz / License

[MIT](LICENSE)

---

FRITZ!Box is a registered trademark of AVM GmbH. This project is not affiliated with or endorsed by AVM.
