# Auto Battler

This repository houses the Discord bot used for the auto battler experiments along with various design documents and legacy HTML prototypes. The earlier Node.js implementation and React client have been removed; the bot is now written entirely in Python.

## Repository Layout

- `ironaccord-bot/` – Python Discord bot and data files.
- `docs/` – design notes and lore in Markdown.
- `docs/yaml/` – structured YAML lore used for retrieval.
- `index.html`, `poc2/` – early browser prototypes kept for reference.
- `ironaccord-bot/data/items.py` – base item definitions consumed by missions and rewards.
- `ironaccord-bot/tests/stubs/chromadb/` – lightweight stand‑in for the
  [Chromadb](https://github.com/chroma-core/chroma) client so the test suite can
  run without the heavy dependency installed.

## Setup

1. Install **Python 3.11+**.
2. Copy `.env.example` to `.env` and provide your Discord token, application ID, guild ID and MySQL credentials. You can also override the default Ollama models by setting `OLLAMA_NARRATOR_MODEL` and `OLLAMA_GM_MODEL`.
3. Install dependencies from the consolidated list:
   ```bash
   pip install -r requirements.txt
   ```
4. Build the lore database:
   ```bash
   python ironaccord-bot/ingest.py
   ```
5. Start the bot:
   ```bash
   python -m ironaccord_bot.bot
   ```
   Using `python -m` runs the package as a module so relative imports work.
6. Once the bot is online, use `/start` in your Discord server to play through a one-shot adventure generated from the structured lore data.

## Item Data

Base item properties live in `ironaccord-bot/data/items.py`. The mission engine and other services import this file to look up item bonuses when applying rewards or combat modifiers.

## Running Python Tests

The repository includes pytest suites for both the legacy prototype and the new
Iron Accord bot. After installing the requirements from `requirements.txt` and
the additional packages listed in `dev-requirements.txt`, execute the tests
from the project root:

```bash
pip install -r requirements.txt
pip install -r dev-requirements.txt
pytest
```

The tests under `ironaccord-bot` rely on `discord.py`, `aiomysql` and `httpx`.
Installing `dev-requirements.txt` ensures these packages are available;
otherwise the affected tests will be skipped.
