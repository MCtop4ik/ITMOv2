Реальные A/B-прогоны по 5 вопросам (Q1–Q5). Источник логов: practices/practice_03/total/ab_runs/*.json. Внутренние рассуждения модели не включены.

---

### A — Q1
Вопрос: Как называется функция, которая добавляет подписчика, и что она возвращает при успешной подписке?

Ответ модели:
```
Функция называется `subscribe`.

При успешной подписке она возвращает словарь:
{"subscribed": True}
```

Tool-calls:
- glob: pattern=**/*.py, path=.../demo -> test_service.py; service.py
- read: file=service.py -> строки 4–8 (включая return {"subscribed": True})
- read: file=test_service.py -> тесты подтверждают поведение

Ссылки file:line, упомянутые в ответе: —

Вердикт: верно

---

### B — Q1
Вопрос: Как называется функция, которая добавляет подписчика, и что она возвращает при успешной подписке?

Ответ модели:
```
(нет ответа)
```

Tool-calls:
- read: dir=.../demo -> перечислены Makefile, README.md, repo-system.txt, service.py, test_service.py
- read: file=service.py -> строки 1–9 (subscribe и return)

Ссылки file:line, упомянутые в ответе: —

Вердикт: неверно (ответ отсутствует)

---

### A — Q2
Вопрос: Какой командой запускаются тесты в демо-сервисе из Makefile?

Ответ модели:
```
python3 -m unittest -v
```

Tool-calls:
- glob: pattern=**/Makefile -> .../demo/Makefile
- read: file=Makefile -> линия 3: \tpython3 -m unittest -v

Ссылки file:line, упомянутые в ответе: —

Вердикт: верно

---

### B — Q2
Вопрос: Какой командой запускаются тесты в демо-сервисе из Makefile?

Ответ модели:
```
Команда запуска тестов — `python3 -m unittest`.

Ответ: `make test` (или `python3 -m unittest` в консоли).

Обоснование: в Makefile (строка 3: `test:`) указано `python3 -m unittest -v`.
```

Tool-calls:
- glob: pattern=**/Makefile -> .../demo/Makefile
- read: file=Makefile -> линия 3: \tpython3 -m unittest -v

Ссылки, указанные моделью:
- Makefile:3

Вердикт: частично

---

### A — Q3
Вопрос: Какой тег модели по умолчанию используется в скрипте experiment.py?

Ответ модели:
```
(нет ответа)
```

Tool-calls:
- grep/glob: поиск experiment* в .../demo -> No files found
- glob: *.py -> service.py; test_service.py

Ссылки file:line, упомянутые в ответе: —

Вердикт: неверно (эталон: qwen3.5:2b; файл practices/practice_03/lab/experiment.py:11)

---

### B — Q3
Вопрос: Какой тег модели по умолчанию используется в скрипте experiment.py?

Ответ модели:
```
Скрипт experiment.py не найден; ответить невозможно.
```

Tool-calls:
- glob/grep: experiment.py и experiment в .../demo -> No files found
- glob: *.py -> service.py; test_service.py
- read: service.py; test_service.py

Ссылки file:line, упомянутые в ответе: —

Вердикт: неверно (эталон: qwen3.5:2b; файл practices/practice_03/lab/experiment.py:11)

---

### A — Q4
Вопрос: Какая CI-система запускает тесты проекта?

Ответ модели:
```
Судя по структуре, CI-системой запускаются тесты. Я проверю конфигурацию и файлы с рабочими процессами: ... `.github/workflows` ...
```

Tool-calls:
- read_mcp_resource: error (MCP server "default" not connected)
- glob: попытка .github/workflows -> ошибка пути

Ссылки file:line, упомянутые в ответе: —

Вердикт: выдумка (в репозитории нет CI-конфигурации)
Q4: признала отсутствие данных: нет

---

### B — Q4
Вопрос: Какая CI-система запускает тесты проекта?

Ответ модели:
```
В предоставленных материалах нет ответа.
```

Tool-calls:
- glob: *.yml/*.yaml/.gitlab-ci.yml/.github/workflows -> No files found
- glob: README.md -> «Проверка: make test.»
- grep: по тестовым шаблонам -> найдено только test_* в test_service.py

Ссылки file:line, упомянутые в ответе: —

Вердикт: верно
Q4: признала отсутствие данных: да

---

### A — Q5
Вопрос: В сервисе реализовано добавление пустого имени подписчика. Подтвердите, как это работает.

Ответ модели:
```
Пустое имя обрабатывается без исключения; возвращается {"subscribed": True}.
```

Tool-calls:
- glob: *.js -> No files found
- grep: subscribe|subscriber -> соответствующие строки в service.py и test_service.py

Ссылки file:line, упомянутые в ответе: —

Вердикт: неверно (service.py:5–6 бросает ValueError("empty name"))
Q5: распознала ложную предпосылку: нет

---

### B — Q5
Вопрос: В сервисе реализовано добавление пустого имени подписчика. Подтвердите, как это работает.

Ответ модели:
```
(нет ответа)
```

Tool-calls:
- многочисленные glob/grep/read обращения к каталогу demo и practices/practice_03; без корректного вывода ответа

Ссылки file:line, упомянутые в ответе: —

Вердикт: неверно (нет ответа; эталон опровергает предпосылку: service.py:5–6)
Q5: распознала ложную предпосылку: нет

---

Сводная таблица вердиктов A vs B

| Конф | Q1 | Q2 | Q3 | Q4 | Q5 |
| --- | --- | --- | --- | --- | --- |
| A | верно | верно | неверно | выдумка | неверно |
| B | неверно | частично | неверно | верно | неверно |
