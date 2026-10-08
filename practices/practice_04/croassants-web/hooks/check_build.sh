#!/usr/bin/env bash

# hooks/check_build.sh — verify that the project builds successfully
# Runs `npm run build` and checks that dist/index.html exists.

set -euo pipefail

# Resolve project root (parent of this script directory)
ROOT_DIR="$(cd -- "$(dirname "${BASH_SOURCE[0]}")"/.. && pwd)"
cd "$ROOT_DIR"

echo "[check_build] Project root: $ROOT_DIR"

if ! command -v npm >/dev/null 2>&1; then
  echo "[check_build] Error: npm is not installed or not in PATH" >&2
  exit 127
fi

echo "[check_build] npm version: $(npm -v)"
if command -v node >/dev/null 2>&1; then
  echo "[check_build] node version: $(node -v)"
fi

# Install deps only if node_modules is missing
if [ ! -d node_modules ]; then
  echo "[check_build] Installing dependencies..."
  if [ -f package-lock.json ]; then
    npm ci
  else
    npm install
  fi
fi

# Clean previous build output for a fresh check
rm -rf dist

echo "[check_build] Running npm run build..."
if ! npm run build; then
  echo "[check_build] Build failed" >&2
  exit 1
fi

# Verify build artifact exists
if [ ! -f dist/index.html ]; then
  echo "[check_build] Build finished but dist/index.html is missing" >&2
  exit 1
fi

echo "[check_build] Success: build artifacts generated in dist/"
