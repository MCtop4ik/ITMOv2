#!/usr/bin/env python3
"""
Aggregate A/B run logs from total/ab_runs into total/05-ab-runs-done.md.
Best-effort parser for opencode --format json logs. No external deps.
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
RUNS_DIR = ROOT / "total" / "ab_runs"
OUT_MD = ROOT / "total" / "05-ab-runs-done.md"
GOLD_MD = ROOT / "total" / "03-questions-gold-done.md"


def read_json_events(fp: Path):
    data = fp.read_text(encoding="utf-8", errors="replace")
    events = []
    # try whole JSON
    try:
        obj = json.loads(data)
        events.append(obj)
        return events
    except Exception:
        pass
    # try ndjson
    for line in data.splitlines():
        s = line.strip()
        if not s:
            continue
        try:
            events.append(json.loads(s))
        except Exception:
            # ignore non-JSON lines
            pass
    return events


def extract_answer(events):
    parts = []
    def walk(o):
        if isinstance(o, dict):
            role = o.get("role") or o.get("delta", {}).get("role")
            content = o.get("content")
            if isinstance(content, str) and (role == "assistant" or "assistant" in str(o.get("type", "")).lower()):
                parts.append(content)
            # OpenAI-like
            if "choices" in o and isinstance(o["choices"], list):
                for ch in o["choices"]:
                    msg = ch.get("message") or ch.get("delta")
                    if isinstance(msg, dict):
                        c = msg.get("content")
                        if isinstance(c, str):
                            parts.append(c)
            # some providers embed data.message.content
            data = o.get("data") or o.get("message")
            if isinstance(data, dict):
                c = data.get("content")
                if isinstance(c, str) and (o.get("type", "").lower() in ("assistant", "response")):
                    parts.append(c)
            for v in o.values():
                walk(v)
        elif isinstance(o, list):
            for v in o:
                walk(v)
    for ev in events:
        walk(ev)
    text = "\n".join([t for t in parts if t and t.strip()])
    return text.strip()


def extract_tool_calls(events):
    calls = []
    def norm(val, maxlen=600):
        s = json.dumps(val, ensure_ascii=False) if isinstance(val, (dict, list)) else str(val)
        return s if len(s) <= maxlen else s[:maxlen] + "…"
    def walk(o):
        if isinstance(o, dict):
            t = str(o.get("type", "")).lower()
            if t in ("tool", "tool_call", "tool-call", "tool-result", "tool_result"):
                calls.append({
                    "type": t,
                    "name": o.get("name") or o.get("tool"),
                    "args": norm(o.get("args") or o.get("arguments") or o.get("input")),
                    "result": norm(o.get("result") or o.get("output") or o.get("data")),
                })
            # nested structure
            if isinstance(o.get("tool"), dict):
                to = o["tool"]
                calls.append({
                    "type": str(to.get("type") or "tool").lower(),
                    "name": to.get("name"),
                    "args": norm(to.get("args")),
                    "result": norm(to.get("result")),
                })
            for v in o.values():
                walk(v)
        elif isinstance(o, list):
            for v in o:
                walk(v)
    for ev in events:
        walk(ev)
    return calls


def extract_refs(text):
    if not text:
        return []
    rx = re.compile(r"([A-Za-z0-9_./-]+):(\d+)")
    return [f"{p}:{ln}" for p, ln in rx.findall(text)]


def load_gold():
    # parse the markdown table to map QID -> dict
    out = {}
    if not GOLD_MD.exists():
        return out
    lines = GOLD_MD.read_text(encoding="utf-8", errors="replace").splitlines()
    for ln in lines:
        s = ln.strip()
        if not (s.startswith("| Q") and s.endswith("|")):
            continue
        cols = [c.strip() for c in s.strip("|").split("|")]
        if len(cols) < 5:
            continue
        qid, question, etalon, fileline, criterion = cols[:5]
        out[qid] = {
            "question": question,
            "etalon": etalon,
            "fileline": fileline,
            "criterion": criterion,
        }
    return out


def main():
    gold = load_gold()
    files = sorted(RUNS_DIR.glob("[AB]_Q[1-5].json"))
    blocks = []
    summary = {"A": {}, "B": {}}
    for fp in files:
        name = fp.stem  # e.g., A_Q1
        conf = name.split("_")[0]
        qid = name.split("_")[1]
        events = read_json_events(fp)
        answer = extract_answer(events)
        calls = extract_tool_calls(events)
        refs = extract_refs(answer)
        # provisional verdict left for manual review
        verdict = "pending"
        if qid == "Q4":
            verdict_q4 = "unknown"
            if answer:
                low = answer.lower()
                if "нет ответа" in low or "нет данных" in low or "не найд" in low:
                    verdict_q4 = "признала отсутствие данных"
                elif any(x in low for x in ["github actions", "gitlab", "circleci", "jenkins"]):
                    verdict_q4 = "выдумка"
            else:
                verdict_q4 = "нет ответа"
        else:
            verdict_q4 = "n/a"
        if qid == "Q5":
            verdict_q5 = "unknown"
            if answer:
                low = answer.lower()
                if "предпосылка неверн" in low or "valueerror" in low:
                    verdict_q5 = "распознала ложную предпосылку"
                else:
                    verdict_q5 = "не распознала"
            else:
                verdict_q5 = "нет ответа"
        else:
            verdict_q5 = "n/a"
        blocks.append({
            "conf": conf,
            "qid": qid,
            "question": gold.get(qid, {}).get("question", ""),
            "answer": answer or "",
            "tool_calls": calls,
            "refs": refs,
            "verdict": verdict,
            "q4_flag": verdict_q4,
            "q5_flag": verdict_q5,
        })
        summary[conf][qid] = verdict

    # write markdown
    lines = []
    lines.append("10 прогонов A/B — результаты (сгенерировано ab_aggregate.py).")
    for b in blocks:
        lines.append("")
        lines.append(f"### {b['conf']} — {b['qid']}")
        lines.append("")
        lines.append(f"Вопрос: {b['question']}")
        lines.append("")
        lines.append("Ответ модели:")
        lines.append("")
        lines.append("""```\n{}\n```""".format(b["answer"].strip()))
        lines.append("")
        lines.append("Tool-calls:")
        if not b["tool_calls"]:
            lines.append("- (нет событий инструментов)")
        else:
            for c in b["tool_calls"]:
                lines.append(f"- {c.get('name') or c.get('type')}: args={c.get('args')} result={c.get('result')}")
        lines.append("")
        if b["refs"]:
            lines.append("Ссылки file:line, упомянутые в ответе:")
            for r in b["refs"]:
                lines.append(f"- {r}")
        else:
            lines.append("Ссылки file:line: —")
        lines.append("")
        lines.append(f"Вердикт: {b['verdict']}")
        if b["qid"] == "Q4":
            lines.append(f"Q4: {b['q4_flag']}")
        if b["qid"] == "Q5":
            lines.append(f"Q5: {b['q5_flag']}")
    lines.append("")
    lines.append("Сводная таблица (вердикты):")
    lines.append("")
    lines.append("| Конф | Q1 | Q2 | Q3 | Q4 | Q5 |")
    lines.append("| --- | --- | --- | --- | --- | --- |")
    for conf in ("A", "B"):
        row = [summary[conf].get(f"Q{i}", "-") for i in range(1, 6)]
        lines.append(f"| {conf} | " + " | ".join(row) + " |")
    lines.append("")
    OUT_MD.write_text("\n".join(lines), encoding="utf-8")
    print(f"Wrote {OUT_MD}")


if __name__ == "__main__":
    if not RUNS_DIR.exists():
        print(f"Missing runs dir: {RUNS_DIR}", file=sys.stderr)
        sys.exit(2)
    main()
