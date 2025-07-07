# Discord Bot

This folder contains the Node.js bot that powers the Discord integration.

## Prerequisites

1. Copy `.env.example` from the repository root to `.env` and fill in the following values:
   - `DISCORD_TOKEN` – your bot token
   - `APP_ID` and `GUILD_ID` – required when running `deploy-commands.js`
   - `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_DATABASE` – MySQL connection details
2. Install dependencies and register the slash commands:

```bash
cd discord-bot
npm install
node deploy-commands.js
node index.js
```

The bot will log into Discord and connect to the database on start.

## Commands

Only two slash commands are currently available:

- `/ping` – check that the bot is responsive
- `/help` – display an ephemeral list of commands

## Database Schema

The schema defined in `db-schema.sql` creates the following tables:

- `players` – stores Discord IDs, names, class and progression stats
- `missions` – mission definitions and rewards
- `mission_log` – records mission attempts for each player
- `codex_entries` – tracks which lore entries a player has unlocked

Run the SQL file on your MySQL instance to create or update the tables. Existing installations should drop the old tables listed at the top of the file.

## Running Tests

A small Jest test suite lives in `tests/`. Run it with:

```bash
npm test
```
