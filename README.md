# ESL Word Scramble Challenge

Simple, interactive ESL game where students unscramble letters to form a word.

Project files

- `index.html` — Game UI and structure
- `style.css` — Styles for a modern, responsive layout
- `script.js` — Game logic (scramble, check, score, timer)

Run locally

1. Start a static server from the project root. Example (PowerShell):

```powershell
python -m http.server 5500
```

1. Open `http://localhost:5500/` in your browser. For testing a specific variant use `?set=<variant-name>`.

Deploy on GitHub Pages

1. Push the repository to GitHub.

2. In the repository Settings → Pages, set Source to the `main` branch and root (`/`).

3. Save and wait a few minutes. Your site will be available at `https://<your-username>.github.io/<repo-name>/`.

Notes

- The game uses a 60-second timer, scoring (+10 correct, -2 wrong), and optional hints for each word.

- Extend it by adding more words, difficulty levels, sound effects, or categories.

Developer: dataset variants

This project supports multiple vocabulary variants (datasets). Each variant is a JSON file placed in `data/` and can be loaded using a URL query parameter.

Pattern:

```text
http://localhost:5500/?set=<variant-name>
```

Dataset file format (JSON)
Create `data/<variant-name>.json` with this structure:

```json
{
  "name": "Animals",
  "description": "Common animals for beginner ESL learners",
  "words": [
    { "word": "ELEPHANT", "hint": "Large mammal with a trunk." },
    { "word": "GIRAFFE",  "hint": "Very tall animal with a long neck." }
  ]
}
```

Guidelines

- Use uppercase for `word` (the loader will uppercase if not).

- Keep words short where possible; multi-word entries work but may be harder to scramble.

- `hint` should be a short sentence.

- Choose a URL-safe file name (lowercase, hyphens): `data/<variant-name>.json`.

Add a new variant

1. Create `data/<variant-name>.json` following the schema above.

2. Test locally: `http://localhost:5500/?set=<variant-name>`.

3. Commit and push to GitHub.

Bulk and automation

- To manage many datasets, add rows to `data/manifest.csv` and place corresponding files in `data/`.

- A helper script `scripts/csv_to_json.py` is included to convert simple CSVs into the JSON format used by the game.

Troubleshooting

- If a dataset doesn't load, open Developer Tools → Console to inspect fetch errors.

- Common issue: local server not running. Start one with:

```powershell
python -m http.server 5500
```

Files added by the project

- `data/manifest.csv` — catalog of available variants

- `data/airport.json` — example variant (Airport vocabulary)

- `scripts/validate_variants.py` — validator run locally and in CI

- `scripts/csv_to_json.py` — CSV → JSON converter (new)

- `variants.html` — a variants index page that lists sets from `data/manifest.csv` (new)

Want me to help further?

- I can add an admin UI to upload CSV/JSON files and auto-convert them.

- I can add CI steps that auto-update `data/manifest.csv` from a PR description or CSV upload.
