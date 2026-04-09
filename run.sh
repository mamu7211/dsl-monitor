#!/bin/bash
set -e

cleanup() {
    echo ""
    echo "Stopping containers..."
    podman compose down
}

trap cleanup EXIT INT TERM

podman compose up --build
