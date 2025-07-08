# Auto Battler

This repository houses the Discord bot used for the auto battler experiments along with various design documents and legacy HTML prototypes. The previous React client and Express server have been removed.

## Repository Layout

- `discord-bot/` – Node.js bot and MySQL schema.
- `docs/` – design notes and lore.
- `index.html`, `poc2/` – early browser prototypes kept for reference.
- `discord-bot/src/data/items.js` – base item definitions used by the bot.

## Setup

1. Install [Node.js](https://nodejs.org/) version 20 or newer. Tests require Node 20+.
2. Copy `.env.example` to `.env` and provide your Discord token and database credentials.
3. Install dependencies and start the bot:
   ```bash
   cd discord-bot
   npm install
   node deploy-commands.js
   node index.js
   ```

See [discord-bot/README.md](discord-bot/README.md) for additional details on running tests and migrating the database schema.
