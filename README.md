# Auto Battler

This repository houses the Discord bot used for the auto battler experiments along with various design documents and legacy HTML prototypes. The previous React client and Express server have been removed.

## Repository Layout

- `discord-bot/` – Node.js bot and MySQL schema.
- `docs/` – design notes and lore.
- `index.html`, `poc2/` – early browser prototypes kept for reference.

## Setup

Copy `.env.example` to `.env` and provide your Discord token and database credentials. See [discord-bot/README.md](discord-bot/README.md) for details on running the bot and migrating the database schema.
