# Auto Battler

This repository houses the Discord bot used for the auto battler experiments along with various design documents and legacy HTML prototypes. The previous React client and Express server have been removed. A Python rewrite of the bot is underway but the existing Node.js implementation remains for now.

## Repository Layout

- `ironaccord-bot/` – Python Discord bot and data files.
- `docs/` – design notes and lore.
- `index.html`, `poc2/` – early browser prototypes kept for reference.
- `ironaccord-bot/data/items.py` – base item definitions consumed by missions and rewards.

## Setup

1. Install [Node.js](https://nodejs.org/) version 20 or newer. Tests require Node 20+.
2. Copy `.env.example` to `.env` and provide your Discord token, application ID, guild ID and MySQL credentials. These values are required for the Python bot as well. The Node.js utilities additionally use `PVP_CHANNEL_ID` and `WEB_APP_URL`.
3. Install dependencies and start the bot:
   ```bash
   cd ironaccord-bot
   npm install
   node deploy-commands.js
   node index.js
   ```

See [ironaccord-bot/README.md](ironaccord-bot/README.md) for additional details on running tests and migrating the database schema.

## Python Bot

A small Python prototype is also provided. Environment variables match the Node.js version and should be defined in `.env`:

1. Copy `.env.example` to `.env` and supply values for `DISCORD_TOKEN`, `APP_ID`, and `GUILD_ID`.
2. Install dependencies and start the bot:
   ```bash
   cd ironaccord-bot
   pip install -r requirements.txt
   ```
3. Install dependencies for the Iron Accord bot:
   ```bash
   pip install -r ironaccord-bot/requirements.txt
   ```
4. Deploy commands and start the bot:
   ```bash
  python deploy_commands.py
  python bot.py
  ```
5. Once the bot is online, use `/start` in your Discord server to begin character creation.

## Item Data

Base item properties live in `ironaccord-bot/data/items.py`. The mission engine and other services import this file to look up item bonuses when applying rewards or combat modifiers.

## Running Python Tests

The repository includes pytest suites for both the legacy prototype and the new
Iron Accord bot. After installing the requirements from `requirements.txt` and
`ironaccord-bot/requirements.txt`, execute the tests from the project root:

```bash
pip install -r requirements.txt
pip install -r ironaccord-bot/requirements.txt
pytest
```

The optional dependencies `discord.py` and `aiomysql` are needed for some tests
under `ironaccord-bot`. Tests that rely on these packages will be skipped if
they are not installed.
