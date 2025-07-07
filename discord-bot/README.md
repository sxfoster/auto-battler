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

Three slash commands are available:

- `/ping` – check that the bot is responsive
- `/help` – display an ephemeral list of commands
- `/character create` – start a new character profile

Running the command launches a short setup sequence:
1. **Choose your faction** – pick either **Iron Accord** or **Neon Dharma**.
2. **Select a bonus stat** – all six stats start at `1`; choose one to raise to `2`.
After confirming your choices the bot stores the character in the database and you can begin playing.

## Database Schema

The schema defined in `db-schema.sql` creates the following tables:

- `players` – stores Discord IDs, names, class and progression stats
- `missions` – mission definitions and rewards
- `mission_log` – records mission attempts for each player
- `codex_entries` – tracks which lore entries a player has unlocked
- `user_stats` – six core stats for each player with default values

`codex_entries` is new in this version. Re-run `db-schema.sql` on your MySQL server to create the table or apply the included `ALTER` statements if you are migrating from an older install. Existing installations should drop the old tables listed at the top of the file.

### Migrating Existing Databases

If you already have the previous schema deployed, run the following SQL after upgrading:

```sql
-- create the new table
CREATE TABLE user_stats (
  player_id INT PRIMARY KEY,
  might INT DEFAULT 1,
  agility INT DEFAULT 1,
  fortitude INT DEFAULT 1,
  intuition INT DEFAULT 1,
  resolve INT DEFAULT 1,
  ingenuity INT DEFAULT 1,
  FOREIGN KEY (player_id) REFERENCES players(id)
);

-- seed existing players with default stats
INSERT INTO user_stats (player_id)
SELECT id FROM players;
```

## Running Tests

A small Jest test suite lives in `tests/`. Run it with:

```bash
npm test
```
