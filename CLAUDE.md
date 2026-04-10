# CLAUDE.md

## Project

DSL Monitor - DSL line monitoring for AVM FRITZ!Box routers via TR-064 API.

## Tech Stack

- Backend: Python 3.12, FastAPI, fritzconnection, APScheduler, Pydantic
- Frontend: Vanilla JS, Tailwind CSS (CDN), Chart.js (CDN) - no build step
- Storage: JSON files (daily), no database
- Container: Docker/Podman, python:3.12-slim

## Development

```bash
# Local with Podman
./run.sh                    # builds + runs, Ctrl+C stops

# Manual
podman compose up --build   # or: .venv/bin/uvicorn backend.main:app --port 8080
```

## Build & Deploy

```bash
./build.sh                  # build image + export .tar
./deploy.sh                 # scp .tar to NAS + docker load
```

## Release Process

1. Update `CHANGELOG.md` with changes under a new version header
2. Commit the changelog update
3. Tag: `git tag v<major>.<minor>.<patch>`
4. Push: `git push && git push origin v<major>.<minor>.<patch>`
5. GitHub Actions CI builds and pushes the container image to ghcr.io on tag push

The CHANGELOG.md must be updated before tagging. Every tagged release must have a corresponding changelog entry.

## Code Conventions

- Language: German labels in UI, English in code/comments
- All timestamps stored as UTC in JSON, displayed in local time in frontend
- TR-064 SNR/attenuation values are in tenths of dB - divide by 10
- Cumulative counters (FEC/CRC/traffic) shown as delta/hour in charts
- No build step for frontend - CDN dependencies only
