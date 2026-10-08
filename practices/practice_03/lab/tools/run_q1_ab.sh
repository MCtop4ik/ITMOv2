#!/usr/bin/env bash
set -euo pipefail

# Скрипт A/B-прогонов для вопроса Q1
# Вопрос: Как называется функция, которая добавляет подписчика, и что она возвращает при успешной подписке?
# Логи сохраняются в total/ab_runs/A_Q1.json и B_Q1.json

SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
ROOT=$(cd "$SCRIPT_DIR/../../../.." && pwd)
RUN_DIR="$ROOT/practices/practice_03/lab/demo"
LOG_DIR="$ROOT/total/ab_runs"

mkdir -p "$LOG_DIR"
echo "[Q1] RUN_DIR=$RUN_DIR"
echo "[Q1] LOG_DIR=$LOG_DIR"
cd "$RUN_DIR"
echo "[Q1] Starting A/B runs for Q1"

Q="Как называется функция, которая добавляет подписчика, и что она возвращает при успешной подписке?"

run_conf() {
  local CONF="$1"  # A or B
  local TITLE="$2"
  if [ "$CONF" = "A" ]; then
    echo "[Q1][$CONF] Using system_A.txt" && cp system_A.txt repo-system.txt
  else
    echo "[Q1][$CONF] Using system_B.txt" && cp system_B.txt repo-system.txt
  fi
  echo "[Q1][$CONF] Running opencode -> $LOG_DIR/${TITLE}.json"
  opencode run --format json -m ollama/itmo-agent --agent local-guide \
    --title "$TITLE" \
    "$Q" \
    > "$LOG_DIR/${TITLE}.json"
  echo "[Q1][$CONF] Saved: $LOG_DIR/${TITLE}.json"
}

run_conf "A" "A_Q1"
run_conf "B" "B_Q1"
echo "[Q1] Done"
