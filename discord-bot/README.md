# Discord Bot

This folder contains the Node.js bot that powers the Discord integration.

## Prerequisites

1. Install [Node.js](https://nodejs.org/) version 20 or newer. A version manager like `nvm` works well.
2. Copy `.env.example` from the repository root to `.env` and fill in the following values:
   - `DISCORD_TOKEN` – your bot token
   - `APP_ID` and `GUILD_ID` – required when running `deploy-commands.js`
   - `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_DATABASE` – MySQL connection details
3. Install dependencies and register the slash commands:

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
- `user_stats` – each player's six core stats stored as (`player_id`, `stat`, `value`)
- `user_flags` – arbitrary flags keyed by player

`codex_entries` and `user_flags` are new in this version. The inventory tables now include a `durability` column. Re-run `db-schema.sql` on your MySQL server to create the table and columns or apply the included `ALTER` statements if you are migrating from an older install. Existing installations should drop the old tables listed at the top of the file.

### Migrating Existing Databases

If you already have the previous schema deployed, run the following SQL after upgrading:

```sql
-- create the new table
CREATE TABLE user_stats (
  player_id INT NOT NULL,
  stat VARCHAR(10) NOT NULL,
  value INT DEFAULT 1,
  PRIMARY KEY (player_id, stat),
  FOREIGN KEY (player_id) REFERENCES players(id)
);

-- seed existing players with default stats
INSERT INTO user_stats (player_id, stat, value)
SELECT id, 'MGT', 1 FROM players
UNION ALL SELECT id, 'AGI', 1 FROM players
UNION ALL SELECT id, 'FOR', 1 FROM players
UNION ALL SELECT id, 'INTU', 1 FROM players
UNION ALL SELECT id, 'RES', 1 FROM players
UNION ALL SELECT id, 'ING', 1 FROM players;
```

Then add the durability columns and create the `user_flags` table:

```sql
ALTER TABLE user_weapons ADD COLUMN durability INT DEFAULT 100;
ALTER TABLE user_armors ADD COLUMN durability INT DEFAULT 100;
ALTER TABLE user_ability_cards ADD COLUMN durability INT DEFAULT 100;

CREATE TABLE user_flags (
  player_id INT NOT NULL,
  flag VARCHAR(255) NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (player_id, flag),
  FOREIGN KEY (player_id) REFERENCES players(id)
);
```

## Running Tests

A small Jest test suite lives in `tests/`. Node 20 or newer is required. Run it with:

```bash
npm test
```
