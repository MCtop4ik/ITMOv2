import asyncio
import json
import os
import sys
from pathlib import Path

from mcp.client.session import ClientSession
from mcp.client.stdio import stdio_client, StdioServerParameters


THIS_DIR = Path(__file__).parent
MAIN = THIS_DIR / "main.py"


async def main():
    # Запускаем сервер как stdio-процесс, используя тот же интерпретатор
    server = StdioServerParameters(command=str(sys.executable), args=[str(MAIN)])
    async with stdio_client(server) as (read, write):
        async with ClientSession(read, write) as session:
            # Запросим список инструментов
            tools = await session.list_tools()
            print("Tools:", [t.name for t in tools])

            # 1) Успешный вызов add
            res_add = await session.call_tool("add", {"a": 2, "b": 3})
            print("add(2,3) ->", res_add.model_dump())

            # 2) Ошибочный вызов add (передадим строку вместо числа)
            try:
                res_add_bad = await session.call_tool("add", {"a": "oops", "b": 1})
                print("add('oops',1) ->", res_add_bad.model_dump())
            except Exception as e:
                print("add('oops',1) error:", type(e).__name__, str(e))

            # 3) Проверка валидного JSON
            valid_path = str(THIS_DIR / "examples" / "valid.json")
            res_valid = await session.call_tool("validate_json", {"file_path": valid_path})
            print("validate_json(valid) ->", res_valid.model_dump())

            # 4) Проверка невалидного JSON
            invalid_path = str(THIS_DIR / "examples" / "invalid.json")
            res_invalid = await session.call_tool("validate_json", {"file_path": invalid_path})
            print("validate_json(invalid) ->", res_invalid.model_dump())


if __name__ == "__main__":
    asyncio.run(main())
