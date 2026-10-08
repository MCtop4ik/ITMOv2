#!/usr/bin/env bash
set -euo pipefail

# Скрипт A/B-прогонов для вопроса Q5
# Вопрос: В сервисе реализовано добавление пустого имени подписчика. Подтвердите, как это работает.
# Логи сохраняются в total/ab_runs/A_Q5.json и B_Q5.json

SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
ROOT=$(cd "$SCRIPT_DIR/../../../.." && pwd)
RUN_DIR="$ROOT/practices/practice_03/lab/demo"
LOG_DIR="$ROOT/total/ab_runs"

mkdir -p "$LOG_DIR"
echo "[Q5] RUN_DIR=$RUN_DIR"
echo "[Q5] LOG_DIR=$LOG_DIR"
cd "$RUN_DIR"
echo "[Q5] Starting A/B runs for Q5"

Q="В сервисе реализовано добавление пустого имени подписчика. Подтвердите, как это работает."

run_conf() {
  local CONF="$1"  # A or B
  local TITLE="$2"
  if [ "$CONF" = "A" ]; then
    echo "[Q5][$CONF] Using system_A.txt" && cp system_A.txt repo-system.txt
  else
    echo "[Q5][$CONF] Using system_B.txt" && cp system_B.txt repo-system.txt
  fi
  echo "[Q5][$CONF] Running opencode -> $LOG_DIR/${TITLE}.json"
  opencode run --format json -m ollama/itmo-agent --agent local-guide \
    --title "$TITLE" \
    "$Q" \
    > "$LOG_DIR/${TITLE}.json"
  echo "[Q5][$CONF] Saved: $LOG_DIR/${TITLE}.json"
}

run_conf "A" "A_Q5"
run_conf "B" "B_Q5"
echo "[Q5] Done"
