#!/usr/bin/env bash
set -euo pipefail

# Скрипт A/B-прогонов для вопроса Q2
# Вопрос: Какой командой запускаются тесты в демо-сервисе из Makefile?
# Логи сохраняются в total/ab_runs/A_Q2.json и B_Q2.json

SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
ROOT=$(cd "$SCRIPT_DIR/../../../.." && pwd)
RUN_DIR="$ROOT/practices/practice_03/lab/demo"
LOG_DIR="$ROOT/total/ab_runs"

mkdir -p "$LOG_DIR"
echo "[Q2] RUN_DIR=$RUN_DIR"
echo "[Q2] LOG_DIR=$LOG_DIR"
cd "$RUN_DIR"
echo "[Q2] Starting A/B runs for Q2"

Q="Какой командой запускаются тесты в демо-сервисе из Makefile?"

run_conf() {
  local CONF="$1"  # A or B
  local TITLE="$2"
  if [ "$CONF" = "A" ]; then
    echo "[Q2][$CONF] Using system_A.txt" && cp system_A.txt repo-system.txt
  else
    echo "[Q2][$CONF] Using system_B.txt" && cp system_B.txt repo-system.txt
  fi
  echo "[Q2][$CONF] Running opencode -> $LOG_DIR/${TITLE}.json"
  opencode run --format json -m ollama/itmo-agent --agent local-guide \
    --title "$TITLE" \
    "$Q" \
    > "$LOG_DIR/${TITLE}.json"
  echo "[Q2][$CONF] Saved: $LOG_DIR/${TITLE}.json"
}

run_conf "A" "A_Q2"
run_conf "B" "B_Q2"
echo "[Q2] Done"
