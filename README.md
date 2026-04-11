# DSL Monitor

Hourly DSL line monitoring via TR-064 API. Web dashboard with time series charts, diagnostics panel and line quality score. Deployable as a Docker container on a NAS.

> ⚠️ **Personal project, vibe-coded.** This is primarily a tool I built for my own FritzBox to track line quality after a DLM reset. It works for me, but expect bugs and rough edges. Showstoppers and security issues get priority — small visual glitches or code quality concerns may or may not be addressed. See [Discussions](https://github.com/mamu7211/dsl-monitor/discussions) for feedback.

![DSL Monitor Dashboard](dashboard.png)

## Documentation

- :de: [Deutsch](docs/README_de.md)
- :gb: [English](docs/README_en.md)

## Supported Hardware

- **AVM FRITZ!Box** (all models with TR-064 support, e.g. 7590, 7590 AX, 7530, 7490)

## Quick Start

```bash
git clone https://github.com/mamu7211/dsl-monitor.git
cd dsl-monitor
cp .env.example .env    
# edit .env and set credentials
./run.sh                # http://localhost:8080
```

## Features

- DSL monitoring: sync rates, SNR, attenuation, FEC/CRC
- Network: clients, traffic, WLAN channel
- Diagnostics: line quality score, DLM progress, alerts
- Time navigation: 2h–60d ranges, drag-to-zoom
- JSON storage, Docker/Podman deployment

## Changelog

See [CHANGELOG.md](CHANGELOG.md)

## License

[MIT](LICENSE)

---

FRITZ!Box is a registered trademark of AVM GmbH. This project is not affiliated with or endorsed by AVM.
