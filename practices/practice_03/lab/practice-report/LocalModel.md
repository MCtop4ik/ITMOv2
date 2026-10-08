# Локальная модель в OpenCode: отчёт

Что сделано

1. Подготовка локального профиля Ollama
- Создала профиль `itmo-agent` на базе `Modelfile.agent` (num_ctx 65536, temperature 0.2).
- Проверила параметры профиля командой `ollama show itmo-agent`.
- Выполнила проверочный запуск без дополнительного SYSTEM: `ollama run itmo-agent "Ответь: READY"`.
- Зафиксировала ресурсы из `ollama ps`: запуск на CPU, CONTEXT 65536.

2. Конфигурация OpenCode для учебного проекта
- Настроила `demo/opencode.json` с провайдером Ollama (локальный endpoint `http://localhost:11434/v1`).
- Агент `local-guide` сконфигурирован как read-only (allow: read, glob, grep; deny: *), инструкции — `demo/repo-system.txt`.

3. Проверка инструмента read и ответа помощника
- Запустила отдельную сессию OpenCode из каталога `lab/`:
  `opencode run --dir demo --agent local-guide --model ollama/itmo-agent --format json \
   "Прочитай README.md инструментом read. Назови команду тестирования со ссылкой на файл" \
   > results/read-check.jsonl`
- Подтвердила по логам `results/read-check.jsonl` фактический вызов инструментов:
  - `glob` нашёл `demo/README.md`;
  - `read` прочитал файл; содержимое совпадает с репозиторием.
- Ответ агента соответствует файлу: команда тестирования — `make test` (README.md: строка 6).

4. Глобальные настройки и ограничения
- Провайдер — локальный Ollama; внешние подключения отключены (baseURL на localhost).
- Права `local-guide` не запрещают запись рабочему агенту Build; результаты сохранены в `results/`.

5. Верификация тестов
- Запустила `make test` в `demo/`; все три теста прошли успешно.

Артефакты
- Конфигурации: `demo/opencode.json`, `demo/repo-system.txt`.
- Логи: `results/read-check.jsonl` (события `glob`, `read`).
- Код и тесты: `demo/README.md`, `demo/service.py`, `demo/test_service.py`.
- Ресурсы модели: выводы `ollama show itmo-agent`, `ollama ps` (CPU-only, CONTEXT 65536).
