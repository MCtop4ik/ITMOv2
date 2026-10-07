Параметры окружения и проекта

| Параметр | Значение |
| --- | --- |
| Корень репозитория | /home/senya/Desktop/Projects/ITMOv2 |
| VCS | git (repo detected) |
| Языки | Python (stdlib), Makefile, Markdown |
| Система сборки | GNU Make |
| make test (корень) | Есть: цель test вызывает step1/step2/step3 (Makefile:6–15) |
| Python | Python 3.13.5 |
| OS | Debian GNU/Linux 13 (trixie), kernel 6.12.107 x86_64 |
| CPU | Intel 12th Gen Core i5-12450H, 12 CPU (lscpu) |
| GPU | Intel UHD Graphics (integrated); nvidia-smi: not found |
| OpenCode | 1.18.35 |
| Docker | 29.8.0 |
| Ollama | 0.34.4; порт 127.0.0.1:11434 LISTEN |
| llama.cpp | not installed (binary not found) |
| LM Studio | not installed (macOS app path not present) |
| vLLM | not detected (pipx empty; no import checked) |
| Свободное место | /: 1.5G свободно из 187G (Use 100%) |
| Память | 15Gi total; 5.8Gi available; Swap 4G (1G free) |
| Слушающие порты (релевантно) | 127.0.0.1:11434 (Ollama); 127.0.0.1:12434; 172.17.0.1:12434 |

Ключевые исходные файлы и точки входа

- Makefile (корень): цели install/test и шаги step1–step3, оркестрируют практики. Путь: Makefile (стр. 1–15).
- practices/practice_03/Makefile: делегирует в lab/ (стр. 1–7).
- practices/practice_03/lab/Makefile: install (проверка Python 3.10+), test запускает demo/tests (стр. 1–6).
- practices/practice_03/lab/experiment.py: скрипт A/B-запуска локальной модели через Ollama; точка входа main() (стр. 8–15, 43–44). Вопрос к модели формируется из demo/README.md и system.txt.
- practices/practice_03/lab/system.txt: system prompt для варианта B.
- practices/practice_03/lab/demo/service.py: учебный сервис (функция subscribe) (стр. 4–8).
- practices/practice_03/lab/demo/test_service.py: юнит-тесты; точка входа unittest.main() (стр. 23–24). Запуском служит python3 -m unittest -v (через demo/Makefile).
- practices/practice_03/lab/demo/opencode.json: профиль тестируемого ассистента (локальный провайдер Ollama, агент local-guide read-only).
- opencode.json (корень): провайдер VseLLM для основной сессии Build.

Доступные локальные рантаймы

- Ollama 0.34.4 — установлен и слушает на 127.0.0.1:11434; which: /usr/local/bin/ollama; конфигурации и скрипты ссылаются на http://localhost:11434 (lab/demo/opencode.json; lab/experiment.py).
- llama.cpp — не найден (команда отсутствует).
- LM Studio — не найден (CLI/приложение отсутствует в системе Linux).
- vLLM — не обнаружен (pipx пуст; явных пакетов/служб нет).
- Аппаратная поддержка — CPU-only (интегрированный Intel UHD; драйверы NVIDIA/AMD отсутствуют). В VRAM нет данных; ожидать инференс на CPU.

Кандидаты-вопросы по коду (с файлами и строками)

1. experiment.py:21 — требуется system.txt для режима system. Мы используем lab/system.txt; нужно ли альтернативное содержимое для A/B и где хранить второй вариант?
2. experiment.py:23–24 — поле think=False и параметры options не стандартны для всех моделей Ollama. Совместимы ли они с выбранным тегом модели и нужны ли правки num_ctx/num_predict под доступную память?
3. lab/demo/opencode.json:3–4,13–18 — модель itmo-agent (локальная). Какой фактический тег в Ollama должен использоваться/быть установлен, и загружены ли веса под этот alias?
4. lab/demo/README.md:6 и demo/Makefile:3 — запуск тестов через python3 -m unittest -v. Нужны ли дополнительные интеграционные тесты/CLI, или достаточно текущих unit-тестов для проверки сервиса?
5. demo/service.py:5–8 и demo/test_service.py:17–20 — поведение при дубликатах регистрозависимо. Должны ли имена нормализоваться (например, lower()) и нужно ли это тестировать?
6. lab/Makefile:3 — проверяется только версия Python. Нужен ли venv/изоляция для будущих зависимостей, или практики 1–2 гарантированно stdlib-only?
7. experiment.py:33–37 — расчёт decode_tokens_per_second опирается на eval_duration/ eval_count. Не все ответы Ollama возвращают эти поля. Нужен ли fallback/логирование при их отсутствии?

Открытые вопросы

1. Какой модельный тег использовать для A/B: оставить qwen3.5:2b (experiment.py по умолчанию) или использовать локальный alias itmo-agent из lab/demo/opencode.json? Если itmo-agent, подтверждаете, что веса установлены?
2. Приоритет режима: baseline vs system — какие два системных сообщения сравниваем? Текущее lab/system.txt — вариант B; вариант A — пустой system? Нужна точная формулировка.
3. При почти полном диске (1.5G свободно) — допустимо ли освобождать место для загрузки/кеша модели, или ограничиваемся уже установленными тегами?
4. Критерии_acceptance для A/B: метрики времени (wall/load/total), точность ответа, длина? Как фиксировать «лучший» вариант — текстом или по числам?
5. Допуск к интернету во время экспериментов: полностью офлайн или можно подтянуть веса/зависимости при первой попытке?
6. Нужны ли дополнительные проверки make step1/step2/step3 сейчас, или ограничиваемся разведкой и последующим запуском по вашей команде?

Примечания

- Репозиторий ориентирован на практики 1–2 и лабораторную часть 3; кодовая база минималистична, зависимости отсутствуют (requirements.txt комментирует отсутствие зависимостей).
- Порт 11434 активен — Ollama сервер уже запущен; дополнительно виден порт 12434 (локально и на docker bridge), необходимо убедиться, чтобы не было второго экземпляра Ollama.
