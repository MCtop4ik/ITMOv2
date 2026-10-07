#!/usr/bin/env python3
"""
Benchmark A/B by calling Ollama /api/chat with a fixed model and question.
Measures wall time and tokens/sec if available from response fields.
Standard library only.
"""
import argparse
import json
import time
from pathlib import Path
from urllib.request import Request, urlopen


def do_call(url: str, model: str, system_text: str, user_text: str, question: str,
            temperature: float, seed: int, num_ctx: int, num_predict: int):
    messages = []
    if system_text:
        messages.append({"role": "system", "content": system_text})
    messages.append({"role": "user", "content": user_text + "\n" + question})
    payload = {
        "model": model,
        "messages": messages,
        "stream": False,
        "think": False,
        "options": {
            "temperature": temperature,
            "seed": seed,
            "num_ctx": num_ctx,
            "num_predict": num_predict,
        },
    }
    req = Request(url, data=json.dumps(payload).encode("utf-8"), headers={"Content-Type": "application/json"})
    started = time.perf_counter()
    with urlopen(req, timeout=300) as resp:
        answer = json.load(resp)
    wall_seconds = time.perf_counter() - started
    # Try to compute tokens/sec (decode)
    eval_count = answer.get("eval_count")
    eval_duration_ns = answer.get("eval_duration")
    if eval_count and eval_duration_ns:
        tokens_per_sec = eval_count / (eval_duration_ns / 1e9)
    else:
        tokens_per_sec = None
    return {
        "wall_seconds": wall_seconds,
        "tokens_per_sec": tokens_per_sec,
        "raw": answer,
    }


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--url", default="http://localhost:11434/api/chat")
    p.add_argument("--model", required=True)
    p.add_argument("--system", required=True)
    p.add_argument("--user_file", required=True)
    p.add_argument("--question", required=True)
    p.add_argument("--temperature", type=float, default=0.2)
    p.add_argument("--seed", type=int, default=42)
    p.add_argument("--num_ctx", type=int, default=4096)
    p.add_argument("--num_predict", type=int, default=256)
    p.add_argument("--warmup", type=int, default=1)
    p.add_argument("--repeats", type=int, default=3)
    args = p.parse_args()

    system_text = Path(args.system).read_text(encoding="utf-8")
    user_text = Path(args.user_file).read_text(encoding="utf-8")

    # Warmup
    for _ in range(args.warmup):
        try:
            do_call(args.url, args.model, system_text, user_text, args.question,
                    args.temperature, args.seed, args.num_ctx, args.num_predict)
        except Exception:
            pass

    results = []
    for i in range(args.repeats):
        r = do_call(args.url, args.model, system_text, user_text, args.question,
                    args.temperature, args.seed, args.num_ctx, args.num_predict)
        results.append(r)
        print(json.dumps({
            "repeat": i + 1,
            "wall_seconds": round(r["wall_seconds"], 3),
            "tokens_per_sec": round(r["tokens_per_sec"], 2) if r["tokens_per_sec"] is not None else None
        }, ensure_ascii=False))


if __name__ == "__main__":
    main()
