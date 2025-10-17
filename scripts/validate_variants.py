#!/usr/bin/env python3
"""Validate dataset files in data/ (JSON or CSV).

Checks performed:
- JSON files parse and contain `words` array with objects having `word` and `hint`.
- CSV files parse and contain required headers `word` and `hint`.
- Each variant has at least 5 words.
- No duplicate words (case-insensitive) within a file.
"""
import csv
import json
import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"


def validate_json(path: Path):
    try:
        obj = json.loads(path.read_text(encoding="utf-8"))
    except Exception as e:
        return False, f"JSON parse error: {e}"
    if "words" not in obj or not isinstance(obj["words"], list):
        return False, 'Missing "words" array'
    words = obj["words"]
    if len(words) < 5:
        return False, f"Word count too small: {len(words)}"
    seen = set()
    for i, w in enumerate(words, 1):
        if not isinstance(w, dict):
            return False, f"Entry {i} is not an object"
        if "word" not in w or "hint" not in w:
            return False, f"Entry {i} missing required field (word/hint)"
        word_text = str(w["word"]).strip().upper()
        if not word_text:
            return False, f"Entry {i} has empty word"
        if word_text in seen:
            return False, f"Duplicate word detected: {word_text}"
        seen.add(word_text)
    return True, f"OK ({len(words)} words)"


def validate_csv(path: Path):
    try:
        txt = path.read_text(encoding="utf-8")
    except Exception as e:
        return False, f"CSV read error: {e}"
    try:
        reader = csv.DictReader(txt.splitlines())
    except Exception as e:
        return False, f"CSV parse error: {e}"
    headers = [h.strip().lower() for h in reader.fieldnames or []]
    if "word" not in headers or "hint" not in headers:
        return False, f"Missing required headers (word,hint). Found: {headers}"
    rows = list(reader)
    if len(rows) < 5:
        return False, f"Word count too small: {len(rows)}"
    seen = set()
    for i, r in enumerate(rows, 1):
        word_text = str(r.get("word") or "").strip().upper()
        hint = str(r.get("hint") or "").strip()
        if not word_text or not hint:
            return False, f"Row {i} missing word or hint"
        if word_text in seen:
            return False, f"Duplicate word detected: {word_text}"
        seen.add(word_text)
    return True, f"OK ({len(rows)} words)"


def main():
    if not DATA_DIR.exists():
        print("No data/ directory found", file=sys.stderr)
        sys.exit(2)
    files = sorted(DATA_DIR.glob("*"))
    any_fail = False
    for f in files:
        if f.name.lower() == "manifest.csv":
            continue
        if f.suffix.lower() in (".json", ".csv"):
            if f.suffix.lower() == ".json":
                ok, msg = validate_json(f)
            else:
                ok, msg = validate_csv(f)
            status = "PASS" if ok else "FAIL"
            print(f"{f.name}: {status} - {msg}")
            if not ok:
                any_fail = True
        else:
            print(f"{f.name}: SKIP (unsupported extension)")
    if any_fail:
        sys.exit(1)
    print("All datasets validated")


if __name__ == "__main__":
    main()
