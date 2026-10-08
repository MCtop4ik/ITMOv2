import json
import os
from typing import Any, Dict, Optional

from mcp.server.fastmcp import FastMCP

mcp = FastMCP("simple-server")

@mcp.tool()
def add(a: int, b: int) -> int:
    """Сложить два числа."""
    return a + b


@mcp.tool()
def validate_json(file_path: str) -> Dict[str, Any]:
    """
    Проверить валидность JSON-файла.

    Возвращает структуру с ключами:
    - ok: bool — валиден ли JSON
    - path: str — абсолютный путь к файлу (или переданный путь, если абсолютный определить не удалось)
    - type: str — тип корневой структуры (dict/list/...) при успешном разборе
    - size: Optional[int] — размер корневой структуры (len), если применимо
    - top_level_keys: Optional[list[str]] — ключи верхнего уровня, если корень — объект
    - error: Optional[str] — сообщение об ошибке при невалидном JSON или проблемах с файлом
    """
    result: Dict[str, Any] = {"ok": False, "path": file_path}

    # Нормализуем путь, но не падаем при нестандартных типах
    try:
        abs_path = os.path.abspath(file_path)
    except Exception:
        abs_path = file_path  # оставим как есть, сообщим об ошибке ниже

    result["path"] = abs_path

    # Проверяем существование файла
    if not isinstance(file_path, str):
        result["error"] = "file_path должен быть строкой"
        return result

    if not os.path.isfile(abs_path):
        result["error"] = "Файл не найден"
        return result

    try:
        with open(abs_path, "r", encoding="utf-8") as f:
            data = json.load(f)
    except json.JSONDecodeError as e:
        result["error"] = f"JSONDecodeError: {e.msg} (line {e.lineno}, column {e.colno})"
        return result
    except Exception as e:
        result["error"] = f"{type(e).__name__}: {e}"
        return result

    # Успешный разбор
    result["ok"] = True
    result["type"] = type(data).__name__
    try:
        result["size"] = len(data)  # len может не поддерживаться
    except Exception:
        result["size"] = None

    if isinstance(data, dict):
        # показываем только часть ключей, чтобы не раздувать ответ
        keys = list(data.keys())
        result["top_level_keys"] = keys[:50]
    else:
        result["top_level_keys"] = None

    return result

if __name__ == "__main__":
    mcp.run()
