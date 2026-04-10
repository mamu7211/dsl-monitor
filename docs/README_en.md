# DSL Monitor - Documentation

[Deutsche Version](README_de.md)

## Collected Metrics (TR-064)

### DSL

| Metric | Downstream | Upstream |
|--------|:----------:|:--------:|
| Current sync rate (kbit/s) | ✓ | ✓ |
| Maximum sync rate (kbit/s) | ✓ | ✓ |
| Signal-to-noise ratio / SNR (dB) | ✓ | ✓ |
| Line attenuation (dB) | ✓ | ✓ |
| Transmit power (dBm) | ✓ | ✓ |
| FEC errors (corrected) | ✓ | ✓ |
| CRC errors (uncorrected) | ✓ | ✓ |

### Network

| Metric | Description |
|--------|------------|
| Active hosts | Currently connected LAN/WLAN devices |
| WLAN clients | Per band: 2.4 GHz, 5 GHz, guest |
| Traffic rate | Current send/receive rate (bytes/s) |
| Total traffic | Cumulative sent/received (64-bit) |
| WAN status | Connection status, external IP |
| DNS servers | Primary + secondary |
| WLAN info | SSID + channel per band |

## Configuration (.env)

```env
FRITZ_IP=192.168.178.1      # FritzBox IP address
FRITZ_USER=                  # Username (empty = default admin)
FRITZ_PASSWORD=secret        # FritzBox password
POLL_CRON=*/15 * * * *       # Cron expression for poll interval (default: every 15 min)
TARGET_DOWNSTREAM=50000      # Contracted download rate in kbit/s (for DLM progress)
TARGET_UPSTREAM=25000        # Contracted upload rate in kbit/s
```

### Poll Interval & Storage

| Interval | Readings/Day | ~per Day | ~per Month | ~per Year |
|----------|:------------:|:--------:|:----------:|:---------:|
| 1 min    | 1,440        | 720 KB   | 21 MB      | 256 MB    |
| 5 min    | 288          | 144 KB   | 4.2 MB     | 51 MB     |
| 15 min   | 96           | 48 KB    | 1.4 MB     | 17 MB     |
| 60 min   | 24           | 12 KB    | 360 KB     | 4.3 MB    |

DSL values change slowly (DLM adjustments every few hours/days). **15-60 minutes** is recommended for production. Short intervals (1-5 min) are useful for testing or troubleshooting after a resync.

## API

| Method | Path | Description |
|--------|------|------------|
| GET | `/api/status` | Latest reading |
| GET | `/api/readings/2026-04-09` | All readings for a given day |
| GET | `/api/readings?from=...&to=...` | Date range (max 180 days) |
| GET | `/api/diagnostics?from=...&to=...` | Diagnostics (quality score, alerts, error rates) |
| GET | `/api/summary/2026/4` | Monthly summary |
| POST | `/api/collect` | Trigger immediate measurement |
| GET | `/api/health` | Health check + version |

## Data Storage

```
data/
└── 2026/
    └── 04/
        ├── 2026-04-09.json   # Daily readings (array of measurements)
        └── summary.json      # Monthly aggregation (min/max/avg)
```

Data older than 180 days is automatically deleted (daily at 03:00). Monthly summaries are preserved.

## Tech Stack

- **Backend**: Python 3.12, FastAPI, fritzconnection, APScheduler, Pydantic
- **Frontend**: Vanilla JS, Tailwind CSS (CDN), Chart.js (CDN) - no build step
- **Container**: Docker/Podman Compose, `python:3.12-slim` base image
- **Data source**: FritzBox TR-064 API (SOAP/UPnP)
- **CI**: GitHub Actions - builds container image on version tags

## Dockerfile

Single-stage build based on `python:3.12-slim`. No multi-stage needed since there is no frontend build step.

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

### Local (Development)

```bash
./run.sh                          # Podman: build + up, Ctrl+C stops
# or
podman compose up --build         # manual
```

### NAS (Production)

**Option A: Manual via tar**

```bash
./build.sh                        # Build image + export as .tar
./deploy.sh                       # scp .tar to NAS + docker load
```

**Option B: Via Container Registry**

```bash
git tag v1.2.0 && git push origin v1.2.0   # CI builds image
# On the NAS:
docker pull ghcr.io/mamu7211/dsl-monitor:v1.2.0
docker compose up -d
```

### NAS docker-compose Example

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
    # Optional: Traefik reverse proxy
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

## Background

- **TR-064**: SOAP-based protocol of the FritzBox. `fritzconnection` abstracts the calls. SNR/attenuation values are reported in tenths of dB (e.g. 350 = 35.0 dB).
- **FEC vs CRC**: FEC = corrected errors (normal), CRC = uncorrectable errors (critical). Rising CRC rate indicates line problems.
- **DLM (Dynamic Line Management)**: Provider-side line profile management. After a reset, the line starts conservatively (high SNR margin, lower rate) and is gradually increased over days/weeks.
- **Diagnostics**: The line quality score (0-100) is based on SNR reserve (40%), CRC error rate (30%) and connection stability (30%).
