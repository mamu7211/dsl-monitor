#!/bin/bash
set -e

IMAGE="ghcr.io/mamu7211/fritzbox-monitor:latest"
TAR="fritzbox-monitor.tar"

VERSION=$(git describe --tags --always 2>/dev/null || echo "dev")

echo "Building image (${VERSION})..."
podman build --build-arg APP_VERSION="${VERSION}" -t "$IMAGE" .

echo "Exporting to $TAR..."
rm -f "$TAR"
podman save "$IMAGE" -o "$TAR"

echo "Done: $(du -h "$TAR" | cut -f1) → $TAR"
