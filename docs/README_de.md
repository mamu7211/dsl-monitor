# DSL Monitor - Dokumentation

[English version](README_en.md)

## Erfasste Werte (TR-064)

### DSL

| Metrik | Downstream | Upstream |
|--------|:----------:|:--------:|
| Aktuelle Sync-Rate (kbit/s) | ✓ | ✓ |
| Maximale Sync-Rate (kbit/s) | ✓ | ✓ |
| Störabstandsmarge / SNR (dB) | ✓ | ✓ |
| Leitungsdämpfung (dB) | ✓ | ✓ |
| Sendeleistung (dBm) | ✓ | ✓ |
| FEC-Fehler (korrigiert) | ✓ | ✓ |
| CRC-Fehler (nicht korrigiert) | ✓ | ✓ |

### Netzwerk

| Metrik | Beschreibung |
|--------|-------------|
| Aktive Hosts | Aktuell verbundene LAN/WLAN-Geräte |
| WLAN-Clients | Pro Band: 2.4 GHz, 5 GHz, Gast |
| Traffic-Rate | Aktuelle Sende-/Empfangsrate (Bytes/s) |
| Traffic gesamt | Kumuliert gesendet/empfangen (64-bit) |
| WAN-Status | Verbindungsstatus, externe IP |
| DNS-Server | Primär + Sekundär |
| WLAN-Info | SSID + Kanal pro Band |

## Konfiguration (.env)

```env
FRITZ_IP=192.168.178.1      # FritzBox IP-Adresse
FRITZ_USER=                  # Benutzername (leer = Standard-Admin)
FRITZ_PASSWORD=geheim        # FritzBox-Passwort
POLL_CRON=*/15 * * * *       # Cron-Ausdruck für Messintervall (default: alle 15 Min)
TARGET_DOWNSTREAM=50000      # Gebuchte Download-Rate in kbit/s (für DLM-Fortschritt)
TARGET_UPSTREAM=25000        # Gebuchte Upload-Rate in kbit/s
```

### Messintervall & Speicherverbrauch

| Intervall | Messungen/Tag | ~pro Tag | ~pro Monat | ~pro Jahr |
|-----------|:------------:|:--------:|:----------:|:---------:|
| 1 min     | 1.440        | 720 KB   | 21 MB      | 256 MB    |
| 5 min     | 288          | 144 KB   | 4,2 MB     | 51 MB     |
| 15 min    | 96           | 48 KB    | 1,4 MB     | 17 MB     |
| 60 min    | 24           | 12 KB    | 360 KB     | 4,3 MB    |

DSL-Werte ändern sich langsam (DLM-Anpassungen alle paar Stunden/Tage). Für Dauerbetrieb sind **15-60 Minuten** empfohlen. Kurze Intervalle (1-5 min) eignen sich gut zum Testen oder zur Fehlersuche nach einem Resync.

## API

| Methode | Pfad | Beschreibung |
|---------|------|-------------|
| GET | `/api/status` | Letzter Messwert |
| GET | `/api/readings/2026-04-09` | Alle Messwerte eines Tages |
| GET | `/api/readings?from=...&to=...` | Zeitraum (max. 180 Tage) |
| GET | `/api/diagnostics?from=...&to=...` | Diagnose (Qualitäts-Score, Alerts, Fehlerraten) |
| GET | `/api/summary/2026/4` | Monatszusammenfassung |
| POST | `/api/collect` | Sofort-Messung auslösen |
| GET | `/api/health` | Health-Check + Version |

## Datenablage

```
data/
└── 2026/
    └── 04/
        ├── 2026-04-09.json   # Tageswerte (Array von Messungen)
        └── summary.json      # Monatsaggregation (min/max/avg)
```

Daten älter als 180 Tage werden automatisch gelöscht (täglich um 03:00). Monatliche Zusammenfassungen bleiben erhalten.

## Tech Stack

- **Backend**: Python 3.12, FastAPI, fritzconnection, APScheduler, Pydantic
- **Frontend**: Vanilla JS, Tailwind CSS (CDN), Chart.js (CDN) - kein Build-Step
- **Container**: Docker/Podman Compose, `python:3.12-slim` Base-Image
- **Datenquelle**: FritzBox TR-064 API (SOAP/UPnP)
- **CI**: GitHub Actions - baut Container-Image bei Version-Tags

## Dockerfile

Single-Stage Build auf Basis von `python:3.12-slim`. Kein Multi-Stage nötig da kein Frontend-Build-Step.

```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
ARG APP_VERSION=dev
ENV APP_VERSION=${APP_VERSION}
COPY backend/ backend/
COPY frontend/ frontend/
EXPOSE 8080
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8080"]
```

## Deployment

### Lokal (Entwicklung)

```bash
./run.sh                          # Podman: build + up, Ctrl+C stoppt
# oder
podman compose up --build         # manuell
```

### NAS (Produktion)

**Option A: Manuell via tar**

```bash
./build.sh                        # Image bauen + als .tar exportieren
./deploy.sh                       # .tar per scp aufs NAS + docker load
```

**Option B: Via Container Registry**

```bash
git tag v1.2.0 && git push origin v1.2.0   # CI baut Image
# Auf dem NAS:
docker pull ghcr.io/mamu7211/dsl-monitor:v1.2.0
docker compose up -d
```

### NAS docker-compose Beispiel

```yaml
services:
  dsl-monitor:
    image: ghcr.io/mamu7211/dsl-monitor:latest
    ports:
      - "8080:8080"
    volumes:
      - ./data:/app/data
    environment:
      - FRITZ_IP=${FRITZ_IP:-192.168.178.1}
      - FRITZ_USER=${FRITZ_USER}
      - FRITZ_PASSWORD=${FRITZ_PASSWORD}
      - POLL_CRON=${POLL_CRON:-*/15 * * * *}
      - TARGET_DOWNSTREAM=${TARGET_DOWNSTREAM:-50000}
      - TARGET_UPSTREAM=${TARGET_UPSTREAM:-25000}
      - TZ=Europe/Berlin
    restart: unless-stopped
    # Optional: Traefik Reverse-Proxy
    # networks:
    #   - proxy
    # labels:
    #   - traefik.enable=true
    #   - traefik.http.routers.dsl-monitor.rule=Host(`dsl.example.lan`)
    #   - traefik.http.routers.dsl-monitor.entrypoints=websecure
    #   - traefik.http.routers.dsl-monitor.tls=true
    #   - traefik.http.services.dsl-monitor.loadbalancer.server.port=8080
# networks:
#   proxy:
#     external: true
```

## Hintergrund

- **TR-064**: SOAP-basiertes Protokoll der FritzBox. `fritzconnection` abstrahiert die Aufrufe. SNR/Attenuation-Werte kommen als Zehntel-dB (z.B. 350 = 35.0 dB).
- **FEC vs CRC**: FEC = korrigierte Fehler (normal), CRC = nicht korrigierbare Fehler (kritisch). Steigende CRC-Rate deutet auf Leitungsprobleme.
- **DLM (Dynamic Line Management)**: Provider-seitige Steuerung des Leitungsprofils. Nach einem Reset startet die Leitung konservativ (hoher SNR-Puffer, niedrigere Rate) und wird über Tage/Wochen aggressiver hochgefahren.
- **Diagnostik**: Der Leitungsqualitäts-Score (0-100) basiert auf SNR-Reserve (40%), CRC-Fehlerrate (30%) und Verbindungsstabilität (30%).
