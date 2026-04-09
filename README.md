# FritzBox DSL Monitor

Stündliches Monitoring der DSL-Leitungsparameter einer FritzBox 7590 (AX) via TR-064 API. Web-Dashboard mit Verlaufscharts für Sync-Raten, SNR-Marge, Dämpfung und Fehlerraten.

## Features

- **Automatische Erfassung** – stündlich via APScheduler, manuelle Messung per Klick
- **4 Verlaufscharts** – Datenraten, Störabstandsmarge, Leitungsdämpfung, FEC/CRC-Fehler
- **Status-Dashboard** – aktuelle Werte auf einen Blick (Sync-Rate, SNR, Dämpfung, Uptime)
- **JSON-Speicherung** – täglich eine Datei, monatliche Aggregation (min/max/avg)
- **Docker/Podman** – ein Container, ein Volume, fertig

## Erfasste Werte (TR-064)

| Metrik | Downstream | Upstream |
|--------|:----------:|:--------:|
| Aktuelle Sync-Rate (kbit/s) | ✓ | ✓ |
| Maximale Sync-Rate (kbit/s) | ✓ | ✓ |
| Störabstandsmarge / SNR (dB) | ✓ | ✓ |
| Leitungsdämpfung (dB) | ✓ | ✓ |
| Sendeleistung (dBm) | ✓ | ✓ |
| FEC-Fehler (korrigiert) | ✓ | ✓ |
| CRC-Fehler (nicht korrigiert) | ✓ | ✓ |

## Schnellstart

```bash
# Repository klonen
git clone <repo-url>
cd fritzbox-monitor

# Konfiguration anlegen
cp .env.example .env
# .env editieren: FRITZ_PASSWORD setzen

# Starten (mit Podman oder Docker)
./run.sh
# oder: podman compose up --build

# Browser öffnen
open http://localhost:8080
```

## Konfiguration (.env)

```env
FRITZ_IP=192.168.178.1      # FritzBox IP-Adresse
FRITZ_USER=                  # Benutzername (leer = Standard-Admin)
FRITZ_PASSWORD=geheim        # FritzBox-Passwort
POLL_INTERVAL_MINUTES=60     # Messintervall in Minuten
```

## API

| Methode | Pfad | Beschreibung |
|---------|------|-------------|
| GET | `/api/status` | Letzter Messwert |
| GET | `/api/readings/2026-04-09` | Alle Messwerte eines Tages |
| GET | `/api/readings?from=...&to=...` | Zeitraum (max. 90 Tage) |
| GET | `/api/summary/2026/4` | Monatszusammenfassung |
| POST | `/api/collect` | Sofort-Messung auslösen |
| GET | `/api/health` | Health-Check |

## Datenablage

```
data/
└── 2026/
    └── 04/
        ├── 2026-04-09.json   # Tageswerte (Array von Messungen)
        └── summary.json      # Monatsaggregation (min/max/avg)
```

## Tech Stack

- **Backend**: Python, FastAPI, fritzconnection, APScheduler
- **Frontend**: Vanilla JS, Tailwind CSS (CDN), Chart.js (CDN)
- **Container**: Docker/Podman Compose
