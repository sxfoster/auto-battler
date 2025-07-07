# Auto Battler Prototypes

This repository collects several prototypes for a card‑based auto‑battler alongside the Discord bot that now drives the project.  The older browser experiments remain for reference.

## Repository Layout

- `discord-bot/` – Node.js bot and MySQL schema.
- `docs/` – Game design documents and technical notes.
- `auto-battler-react/` – Archived React prototype.
- `index.html`, `poc2` – Stand‑alone HTML demos kept for reference.



## Documentation

Documentation for the previous prototypes has been moved to
[docs/archive](docs/archive/). New design notes will live in
[docs/README.md](docs/README.md) and the work-in-progress
[docs/gdd.md](docs/gdd.md).


## Running the Bot

The `discord-bot/` folder contains the production bot. To get started:

1. Copy `.env.example` to `.env` and populate these values:
   - `DISCORD_TOKEN` – your bot token
   - `APP_ID` and `GUILD_ID` – required when deploying commands
   - `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_DATABASE` – MySQL credentials
   - `PVP_CHANNEL_ID` – channel ID used for challenge announcements
2. Import `discord-bot/db-schema.sql` into your MySQL database.
3. Install dependencies and start the bot:

   ```bash
   cd discord-bot
   npm install
   node deploy-commands.js
   node index.js
   ```

See [discord-bot/README.md](discord-bot/README.md) for command details and testing instructions.


## PHP Backend Setup

We host our replay API on GoDaddy shared hosting under `public_html/api/`.

- **Replay Endpoint**  
  `GET http://game.strahde.com/api/replay.php?id={id}`  
  Returns stored JSON battle_log or `{"error":"Not found"}`.

- **Health Check**  
  `GET http://game.strahde.com/api/health.php` → `{"status":"OK"}`.

- **CORS**  
  Both endpoints allow origin `http://game.strahde.com`.
