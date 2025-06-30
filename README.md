# Auto Battler Prototypes

This repository contains a series of HTML and JavaScript prototypes for a card based auto‑battler.  The most complete browser implementation now lives in the `auto-battler-react/` folder, while the root directory holds several earlier proof‑of‑concept files.

For details on the current prototype and its user interface, see [auto-battler-react/README.md](auto-battler-react/README.md).

## Repository Layout

- `auto-battler-react/` – React-based prototype with modular scenes and battle logic.
- `index.html`, `poc2` – Stand‑alone HTML prototypes kept for reference.
- `docs/` – Game design documents and technical notes.
- `backend/` – Basic Express server used for local development.

## Running the Game

The React prototype is built with Vite. From the repository root run:

```bash
cd auto-battler-react
npm install
npm run dev
```

This starts the Vite development server (usually on `http://localhost:5173`).

## Running the Backend

The `backend` directory contains a simple Express server. Start it with:

```bash
npm install
npm start
```

By default it runs on `http://localhost:3000` and prints `Server is running!` to the console.

## Documentation

The `docs` directory hosts the game design document, technical overview and other reference material.  See [docs/README.md](docs/README.md) for a full listing.  Developers should read [docs/technical_overview.md](docs/technical_overview.md) for a code walkthrough and [docs/event_schema.md](docs/event_schema.md) for the battle log message format.


## Discord Bot

The Discord bot resides in the `discord-bot/` directory and requires a `.env` file for secrets.
Copy the `.env.example` file in the repository root to `.env` and populate the following variables:

- `DISCORD_TOKEN` – your bot token.
- `APP_ID` and `GUILD_ID` – used when deploying slash commands.
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_DATABASE` – credentials for the MySQL database. `DB_HOST` must be the remote host address provided by GoDaddy.
- `PVP_CHANNEL_ID` – Discord channel ID used for challenge announcements.

Install the dependencies and start the bot:

```bash
cd discord-bot
npm install
node index.js
```

When configured correctly the bot logs a `Database connection successful` message on start.

### Inventory Commands & Charge System

The bot includes a simple `/inventory` command for viewing your backpack. Once the ability card system is implemented it will also support `/inventory set` to choose which ability card is active.  The design for this charge-based system is documented in [docs/ability_card_charge_gdd.md](docs/ability_card_charge_gdd.md).

