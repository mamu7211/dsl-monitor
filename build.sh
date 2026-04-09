#!/bin/bash
set -e

IMAGE="ghcr.io/mamu7211/fritzbox-monitor:latest"
TAR="fritzbox-monitor.tar"

echo "Building image..."
podman build -t "$IMAGE" .

echo "Exporting to $TAR..."
rm -f "$TAR"
podman save "$IMAGE" -o "$TAR"

echo "Done: $(du -h "$TAR" | cut -f1) → $TAR"
