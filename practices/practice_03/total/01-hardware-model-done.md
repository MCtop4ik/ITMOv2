Характеристики стенда и выбор локальной модели

Раздел 1. Железо — версии — команды — вывод

1) OS и ядро

Команда:
```
uname -a && lsb_release -a || cat /etc/os-release
```
Вывод:
```
Linux senya 6.12.107+deb13-amd64 #1 SMP PREEMPT_DYNAMIC Debian 6.12.107-1 (2026-08-29) x86_64 GNU/Linux
Distributor ID:	Debian
Description:	Debian GNU/Linux 13 (trixie)
Release:	13
Codename:	trixie
```

2) CPU

Команда:
```
lscpu
```
Вывод (фрагмент):
```
Architecture:                            x86_64
CPU(s):                                  12
Model name:                              12th Gen Intel(R) Core(TM) i5-12450H
Thread(s) per core:                      2
Core(s) per socket:                      8
CPU max MHz:                             4400,0000
```

3) GPU

Команда:
```
lspci | rg -i 'vga|3d|display' || lspci
```
Вывод (фрагмент):
```
00:02.0 VGA compatible controller: Intel Corporation Alder Lake-P GT1 [UHD Graphics] (rev 0c)
```

Дополнительно (GLX):
Команда:
```
glxinfo -B
```
Вывод (фрагмент):
```
Vendor: Intel (0x8086)
Device: Mesa Intel(R) Graphics (ADL GT2) (0x46a3)
Video memory: 7861MB
Unified memory: yes
```
Примечание: интегрированная графика, unified memory; nvidia-smi отсутствует.

4) RAM

Команда:
```
free -h
```
Вывод:
```
               total        used        free      shared  buff/cache   available
Mem:            15Gi       9,5Gi       3,4Gi       1,8Gi       4,5Gi       5,8Gi
Swap:          4,0Gi       3,0Gi       1,0Gi
```

5) Диск

Команда:
```
df -h /
```
Вывод:
```
Filesystem      Size  Used Avail Use% Mounted on
/dev/nvme0n1p7  187G  176G  1,5G 100% /
```

6) Рантаймы и OpenCode

OpenCode:
Команда:
```
opencode --version
```
Вывод:
```
1.18.35
```

Python:
Команда:
```
python3 --version
```
Вывод:
```
Python 3.13.5
```

Ollama:
Команда:
```
ollama --version && ollama list
```
Вывод:
```
ollama version is 0.34.4
NAME                 ID              SIZE      MODIFIED    
itmo-agent:latest    db69124abd12    2.7 GB    12 days ago    
itmo-local:latest    d277c827c99c    2.7 GB    12 days ago    
qwen3.5:2b           324d162be6ca    2.7 GB    12 days ago    
gemma3:1b            8648f39daa8f    815 MB    13 days ago    
```

Порт Ollama:
Команда:
```
ss -lnt | grep 11434 || true
```
Вывод (фрагмент):
```
LISTEN 0      4096       127.0.0.1:11434      0.0.0.0:*   
```

Docker:
Команда:
```
docker --version
```
Вывод:
```
Docker version 29.8.0, build 88096ef
```

Раздел 2. Кандидаты локальных моделей

Исходя из CPU-only (Intel UHD, unified memory) и ограниченного свободного диска (≈1.5 GB сейчас), выбираем компактные модели, уже установленные локально:

| Имя | Параметры | Квантизация | Контекст | Размер (диск) |
| --- | --- | --- | --- | --- |
| qwen3.5:2b | ~2.3B | Q8_0 | 262k (профильный num_ctx 65k/4k в alias) | ~2.7 GB |
| itmo-agent:latest (alias qwen3.5:2b) | ~2.3B | Q8_0 | 65k (demo/opencode.json лимит 64k) | ~2.7 GB |
| gemma3:1b | ~1.0B | Q4_K_M | 32k | ~0.8 GB |

Примечания к характеристикам:
- qwen3.5:2b — Apache 2.0; показывает quantization: Q8_0; контекст 262 144, обычно ограничиваем до 4k–65k под CPU.
- itmo-agent — локальный alias c параметрами temperature=0.2 и num_ctx=65 536 в профиле; подходит для экспериментов в лабе.
- gemma3:1b — компактнейшая из доступных, Q4_K_M, контекст 32k; лицензия — Gemma Terms of Use.

Раздел 3. Выбор основной модели и обоснование

Выбор: itmo-agent:latest (alias qwen3.5:2b, Q8_0).

Обоснование:
- Влезает в оперативную память CPU-конфигурации с unified memory: модель ~2.7 GB на диске, инференс на CPU возможен; VRAM как отдельный ресурс отсутствует, используется системная RAM.
- Скорость приемлема для учебных сценариев с коротким контекстом (demo/README.md + вопрос), при num_ctx ≤ 4096–65536; Q8_0 обеспечивает стабильность и качество лучше, чем более агрессивные квантизации.
- Лицензия Apache 2.0 — совместима с учебным использованием и последующей публикацией отчётов.
- Модель и alias уже установлены локально (ollama list), что критично при дефиците дискового пространства.

Альтернатива: gemma3:1b (Q4_K_M) — при необходимости ускорения или экономии ресурсов; контекст 32k, меньший размер, но и более ограниченные способности.

Раздел 4. Фиксация ID и квантизации для воспроизводимости

- Основная модель: itmo-agent:latest
  - ID: db69124abd12
  - Архитектура/параметры: qwen35 ~2.3B
  - Квантизация: Q8_0
  - Контекст (рекомендуемый для CPU): 4096–65536 (demo профиль: 65536)

- Резервная модель: qwen3.5:2b
  - ID: 324d162be6ca
  - Квантизация: Q8_0

- Лёгкая модель: gemma3:1b
  - ID: 8648f39daa8f
  - Квантизация: Q4_K_M

Точный запуск локального сервера (endpoint, порт)

- Сервер Ollama уже слушает на 127.0.0.1:11434.
- Команда запуска (если требуется вручную):
```
OLLAMA_NO_CLOUD=1 ollama serve
```
Endpoint: http://localhost:11434

Примечание: в рамках лаборатории конфигурация клиента OpenCode указывает baseURL `http://localhost:11434/v1` (lab/demo/opencode.json). Для эксперимента `experiment.py` обращается к `http://localhost:11434/api/chat`.
