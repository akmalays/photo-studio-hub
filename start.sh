#!/usr/bin/env bash
set -euo pipefail

echo "Node: $(node -v)"
echo "NPM:  $(npm -v)"

# Install deps (Railway cache will speed this up)
npm ci

# Start API server (Bun runs TS directly)
exec bun server/index.ts

