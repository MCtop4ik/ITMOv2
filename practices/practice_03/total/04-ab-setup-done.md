A/B-сравнение: меняется ровно один фактор — system prompt

System prompt A (нейтральный)

"Ты помощник. Отвечай кратко и по существу."

System prompt B (усиленный)

"Ты помощник по учебному репозиторию. Для каждого факта указывай файл и строку (file:line). Если данных нет в прочитанных файлах, ответь: 'В предоставленных материалах нет ответа'. Проверяй предпосылки вопросов и явно указывай, если они неверны. Используй только предоставленный контекст. Формат: короткий ответ, затем основание с file:line."

Одинаковые условия для обоих прогонов

- Модель: ollama/itmo-agent (tag: itmo-agent:latest)
- Квантизация: Q8_0
- Контекст num_ctx: 4096
- Лимит ответа num_predict: 256
- Температура: 0.2
- Seed: 42
- Режим рассуждения: think=false (reasoning отключён)
- Входной вопрос: прочитать файл practices/practice_03/lab/demo/README.md и назвать команду проверки (она содержится в файле). Текст вопроса одинаков для A и B.
- Endpoint: http://localhost:11434/api/chat

Подтверждение изменения ровно одного фактора

- Единственное различие между двумя прогонами — текст system prompt (A vs B). Все остальные параметры (модель, квантизация, контекст, лимит, температура, seed, режим рассуждения, входной вопрос и контекст) идентичны.

Команды запуска (A и B)

Примечание: команды формируют идентичный JSON-пакет к API Ollama, отличающийся только текстом system. Для надёжной экранировки содержимого файла используется jq.

Экспорт общих параметров:

```
MODEL_TAG=itmo-agent:latest
TEMP=0.2
SEED=42
CTX=4096
PRED=256
USER_FILE=practices/practice_03/lab/demo/README.md
QUESTION="Назови команду проверки из файла. Укажи file:line."
USER_JSON=$(jq -Rs . < "$USER_FILE")
```

Прогон A (system prompt A):

```
SYS_A="Ты помощник. Отвечай кратко и по существу."
curl -sS -X POST http://localhost:11434/api/chat \
  -H 'Content-Type: application/json' \
  -d "$(jq -n \
    --arg model "$MODEL_TAG" \
    --arg sys "$SYS_A" \
    --arg user "$USER_JSON" \
    --arg q "$QUESTION" \
    --argjson temp $TEMP \
    --argjson seed $SEED \
    --argjson ctx $CTX \
    --argjson pred $PRED \
    '{model:$model,
      messages:[
        {role:"system",content:$sys},
        {role:"user",content:($user + "\n" + $q)}
      ],
      stream:false,
      think:false,
      options:{temperature:$temp, seed:$seed, num_ctx:$ctx, num_predict:$pred}
    }')"
```

Прогон B (system prompt B):

```
SYS_B="Ты помощник по учебному репозиторию. Для каждого факта указывай файл и строку (file:line). Если данных нет в прочитанных файлах, ответь: 'В предоставленных материалах нет ответа'. Проверяй предпосылки вопросов и явно указывай, если они неверны. Используй только предоставленный контекст. Формат: короткий ответ, затем основание с file:line."
curl -sS -X POST http://localhost:11434/api/chat \
  -H 'Content-Type: application/json' \
  -d "$(jq -n \
    --arg model "$MODEL_TAG" \
    --arg sys "$SYS_B" \
    --arg user "$USER_JSON" \
    --arg q "$QUESTION" \
    --argjson temp $TEMP \
    --argjson seed $SEED \
    --argjson ctx $CTX \
    --argjson pred $PRED \
    '{model:$model,
      messages:[
        {role:"system",content:$sys},
        {role:"user",content:($user + "\n" + $q)}
      ],
      stream:false,
      think:false,
      options:{temperature:$temp, seed:$seed, num_ctx:$ctx, num_predict:$pred}
    }')"
```

Замечания

- Оба запроса отправляются на один и тот же endpoint и используют одинаковые численные параметры и одинаковый пользовательский контент, отличаясь только текстом system prompt.
- Если jq отсутствует, допускается предварительно установить его или заменить на эквивалентную команду экранирования содержимого файла.
