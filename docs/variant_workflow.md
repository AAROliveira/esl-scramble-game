# Variant workflow (quick reference)

This short guide helps the Academic & Pedagogical team prepare and deliver vocabulary variants.

1. Prepare files

- Create `data/<slug>.json` (preferred) or `data/<slug>.csv` (UTF-8). Use slug form: `lowercase-with-hyphens`.

- Required fields per entry: `word`, `hint`.

1. Convert CSV to JSON (if needed)

```powershell
python scripts/csv_to_json.py path/to/input.csv data/<slug>.json --name "Display Name" --description "Short desc"
```

1. Local validation (run before PR)

```powershell
C:/Projetos/ESL_Unscramble_Game/.venv/Scripts/python.exe -u scripts/validate_variants.py
```

1. Preview variants

- Add/update `data/manifest.csv` with one row per variant (slug,name,description,file,...)

- Open `variants.html` in your browser (served from project root) to preview available sets.

1. Submit

- Small batches: create a branch, add `data/` files and `manifest.csv`, open a PR and request review.

- Large batches: upload a ZIP with `data/` + `manifest.csv` to shared drive and notify the import team.

Notes

- The CI will reject files that fail parsing, have fewer than 5 words, or contain duplicate words within the same file.

- If you want images/audio shown in the UI, include `audio`/`image` columns with publicly accessible HTTPS URLs.

Contact

- Reply to the original coordination message (or assign the repo PR to me) to request automated conversion/import and a validation report.
