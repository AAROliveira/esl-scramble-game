#!/usr/bin/env python3
"""Convert a simple CSV of words into the JSON variant format.

Usage:
  python scripts/csv_to_json.py input.csv output.json --name "Set Name" --description "Optional description"

CSV must contain headers: word, hint (case-insensitive). Extra columns are ignored.
"""
import argparse
import csv
import json
from pathlib import Path


def convert(infile: Path, outfile: Path, name: str, description: str):
    txt = infile.read_text(encoding="utf-8")
    reader = csv.DictReader(txt.splitlines())
    headers = [h.strip().lower() for h in (reader.fieldnames or [])]
    if "word" not in headers or "hint" not in headers:
        raise SystemExit("CSV must have headers 'word' and 'hint'")
    words = []
    for i, r in enumerate(reader, 1):
        word = str(r.get("word") or "").strip()
        hint = str(r.get("hint") or "").strip()
        if not word:
            print(f"Skipping empty word at row {i}")
            continue
        words.append({"word": word.upper(), "hint": hint})
    if not words:
        raise SystemExit("No valid rows found in CSV")
    obj = {
        "name": name or outfile.stem,
        "description": description or "",
        "words": words,
    }
    outfile.write_text(json.dumps(obj, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Wrote {len(words)} words to {outfile}")


def main():
    p = argparse.ArgumentParser()
    p.add_argument("input", help="Input CSV file")
    p.add_argument("output", help="Output JSON file")
    p.add_argument("--name", default=None, help="Display name for the variant")
    p.add_argument("--description", default="", help="Optional description")
    args = p.parse_args()
    infile = Path(args.input)
    outfile = Path(args.output)
    if not infile.exists():
        raise SystemExit(f"Input file not found: {infile}")
    convert(infile, outfile, args.name, args.description)


if __name__ == "__main__":
    main()
