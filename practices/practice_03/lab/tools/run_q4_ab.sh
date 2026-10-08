#!/usr/bin/env bash
set -euo pipefail

# Скрипт A/B-прогонов для вопроса Q4
# Вопрос: Какая CI-система запускает тесты проекта?
# Логи сохраняются в total/ab_runs/A_Q4.json и B_Q4.json

SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
ROOT=$(cd "$SCRIPT_DIR/../../../.." && pwd)
RUN_DIR="$ROOT/practices/practice_03/lab/demo"
LOG_DIR="$ROOT/total/ab_runs"

mkdir -p "$LOG_DIR"
echo "[Q4] RUN_DIR=$RUN_DIR"
echo "[Q4] LOG_DIR=$LOG_DIR"
cd "$RUN_DIR"
echo "[Q4] Starting A/B runs for Q4"

Q="Какая CI-система запускает тесты проекта?"

run_conf() {
  local CONF="$1"  # A or B
  local TITLE="$2"
  if [ "$CONF" = "A" ]; then
    echo "[Q4][$CONF] Using system_A.txt" && cp system_A.txt repo-system.txt
  else
    echo "[Q4][$CONF] Using system_B.txt" && cp system_B.txt repo-system.txt
  fi
  echo "[Q4][$CONF] Running opencode -> $LOG_DIR/${TITLE}.json"
  opencode run --format json -m ollama/itmo-agent --agent local-guide \
    --title "$TITLE" \
    "$Q" \
    > "$LOG_DIR/${TITLE}.json"
  echo "[Q4][$CONF] Saved: $LOG_DIR/${TITLE}.json"
}

run_conf "A" "A_Q4"
run_conf "B" "B_Q4"
echo "[Q4] Done"
