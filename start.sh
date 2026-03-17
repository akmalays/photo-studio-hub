#!/usr/bin/env bash
set -euo pipefail

echo "Node: $(node -v)"
echo "NPM:  $(npm -v)"

# Install deps (Railway cache will speed this up)
npm ci

# Build API server
npm run build:api

# Start API server
exec npm run start:api

