# PRACTICE-REPORT

Документ собран из двух частей: OneSetup.md (эксперимент temperature/seed) и LocalModel.md (локальная модель и OpenCode). Ниже — консолидированная версия.

## One Setup — эксперимент temperature и seed

Цель: сравнить ответы и скорость при temperature=0.8 (hot) и 0.2 (cool) для seed 42, 43, 44. Для скорости считаем медиану из трёх прогретых повторов, холодный старт фиксируем отдельно. TTFT не измеряется.

Метод:
- Скрипт `experiment.py` (mode=system) обращается к локальному Ollama qwen3.5:2b.
- Метрики из JSON: `wall_seconds`, `load_seconds`, `total_seconds`, `decode_tokens_per_second`.
- Имена файлов уникальны, чтобы не перезаписывать результаты.

Итоги по скорости (медиана decode_tokens_per_second):
- temp 0.8: seed 42 → 18.52 т/с; seed 43 → 17.45 т/с; seed 44 → 15.50 т/с
- temp 0.2: seed 42 → 14.22 т/с; seed 43 → 15.21 т/с; seed 44 → 15.69 т/с

Холодный старт: различия объясняются длиной ответа (eval_count). Для 0.8/seed 44 ответ ~88 токенов → total ~5.45 с; прочие ~0.61–0.76 с.

Факты и ошибки: все 6 ответов корректны по системе; высокая temperature не обязана давать ошибку, низкая не гарантирует правильность — в этой задаче обе дали правильные ответы.

## Локальная модель в OpenCode — LocalModel

Профиль Ollama:
- `Modelfile.agent`: num_ctx 65536, temperature 0.2.
- `ollama show itmo-agent`: qwen35 2.3B, Q8_0; parameters: num_ctx=65536, temperature=0.2; capabilities: tools, thinking.
- `ollama ps`: PROCESSOR=CPU, CONTEXT=65536.
- Проверочный запуск `ollama run itmo-agent "Ответь: READY"` выполнен; поток reasoning зафиксирован (таймаут по времени).

OpenCode конфигурация:
- `demo/opencode.json`: провайдер Ollama (baseURL http://localhost:11434/v1), модель `ollama/itmo-agent`, агент `local-guide` (read-only: read/glob/grep).
- Инструкции `demo/repo-system.txt`.

Проверка инструмента read:
- Команда: `opencode run --dir demo --agent local-guide --model ollama/itmo-agent --format json "Прочитай README.md инструментом read. Назови команду тестирования со ссылкой на файл" > results/read-check.jsonl`
- В `results/read-check.jsonl` зафиксированы tool_use: glob→read; `read` прочитал `demo/README.md`. Ответ: команда тестирования `make test` (README.md:6).
- Внешние подключения отключены: baseURL=localhost; запись артефактов выполнял рабочий агент Build.

Верификация тестов:
- `make test` в demo/ — OK (3 теста пройдены).

Приложения: см. исходные разделы LocalModel.md и OneSetup.md; файлы в `practice-report/` и артефакты в `results/`.
