# Auto Battler

This repository houses the Discord bot used for the auto battler experiments along with various design documents and legacy HTML prototypes. The previous React client and Express server have been removed. A Python rewrite of the bot is underway but the existing Node.js implementation remains for now.

## Repository Layout

- `discord-bot/` – Node.js bot and MySQL schema (legacy implementation).
- `docs/` – design notes and lore.
- `index.html`, `poc2/` – early browser prototypes kept for reference.
- `discord-bot/src/data/items.js` – base item definitions consumed by missions and rewards.

## Setup

1. Install [Node.js](https://nodejs.org/) version 20 or newer. Tests require Node 20+.
2. Copy `.env.example` to `.env` and provide your Discord token, application ID, guild ID and MySQL credentials. These values are required for the Python bot as well. The Node.js utilities additionally use `PVP_CHANNEL_ID` and `WEB_APP_URL`.
3. Install dependencies and start the bot:
   ```bash
   cd discord-bot
   npm install
   node deploy-commands.js
   node index.js
   ```

See [discord-bot/README.md](discord-bot/README.md) for additional details on running tests and migrating the database schema.

## Python Bot

A small Python prototype is also provided. Environment variables match the Node.js version and should be defined in `.env`:

1. Copy `.env.example` to `.env` and supply values for `DISCORD_TOKEN`, `APP_ID`, and `GUILD_ID`.
2. Install dependencies from `requirements.txt`:
   ```bash
   pip install -r requirements.txt
   ```
3. Deploy commands and start the bot:
   ```bash
   python deploy_commands.py
   python bot.py
   ```

## Item Data

Base item properties live in `discord-bot/src/data/items.js`. The mission engine and other services import this file to look up item bonuses when applying rewards or combat modifiers.
