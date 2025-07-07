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

Once running you can view saved battle replays by navigating to
`http://localhost:5173/replay?id=<battleId>`. The React `ReplayViewer`
will fetch the battle log from `/api/replay.php` and animate each turn.

## Running the Backend

The `backend` directory contains a simple Express server. Start it with:

```bash
npm install
npm start
```

By default it runs on `http://localhost:3000` and prints `Server is running!` to the console.

### Running Tests

Install dependencies in the `backend` directory before executing the Jest suite:

```bash
cd backend
npm install
npm test
```

`npm test` invokes Jest. The tests will fail to run if the dependencies have not been installed.


## Documentation

Documentation for the previous prototypes has been moved to
[docs/archive](docs/archive/). New design notes will live in
[docs/README.md](docs/README.md) and the work-in-progress
[docs/gdd.md](docs/gdd.md).


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

The bot includes a simple `/inventory` command for viewing your backpack. Once the ability card system is implemented it will also support `/inventory set` to choose which ability card is active.  The design for this charge-based system is documented in [docs/archive/ability_card_charge_gdd.md](docs/archive/ability_card_charge_gdd.md).

## Deployment

Follow these steps to host the app on your GoDaddy server:

1. **Build the frontend**
   ```bash
   cd auto-battler-react
   npm install
   npm run build
   ```
   Upload the resulting `dist/` folder to your hosting space.

2. **Start the backend**
   ```bash
   cd backend
   npm install
   npm start
   ```
   Use a tool such as `pm2` if you want the server to run continuously.

3. **Environment variables**
   Copy `.env.example` to `.env` and set `WEB_APP_URL` to your production domain.
   The replay buttons in `/challenge` and `/adventure` will point to this URL.


## PHP Backend Setup

We host our replay API on GoDaddy shared hosting under `public_html/api/`.

- **Replay Endpoint**  
  `GET http://game.strahde.com/api/replay.php?id={id}`  
  Returns stored JSON battle_log or `{"error":"Not found"}`.

- **Health Check**  
  `GET http://game.strahde.com/api/health.php` → `{"status":"OK"}`.

- **CORS**  
  Both endpoints allow origin `http://game.strahde.com`.
