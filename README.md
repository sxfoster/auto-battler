# Auto Battler Prototypes

This repository contains a series of HTML and JavaScript prototypes for a card based auto‑battler.  The main implementation lives in the `hero-game` folder, while the root directory holds several earlier proof‑of‑concept files.

For details on the current prototype and its user interface, see [hero-game/README.md](hero-game/README.md).

## Repository Layout

- `hero-game/` – Modern prototype with modular JavaScript, scenes and battle logic.
- `index.html`, `poc.html`, `poc2`, `poc3.html` – Stand‑alone prototypes kept for reference.
- `docs/` – Game design documents and technical notes.
- `backend/` – Basic Express server used for local development.

## Running the Game

The `hero-game` prototype uses ES module imports and must be served from a local web server.  Any simple static server will work.  From the repository root run:

```bash
# Using Python
python3 -m http.server 8000
```

Then open `http://localhost:8000/hero-game/` in your browser.

If you prefer Node.js you can run:

```bash
npx http-server -p 8000
```

Any other static file server will work as long as it serves the repository root.

## Running the Backend

The `backend` directory contains a simple Express server. Start it with:

```bash
npm install
npm start
```

By default it runs on `http://localhost:3000` and prints `Server is running!` to the console.

## Documentation

The `docs` directory hosts the game design document, technical overview and other reference material.  See [docs/README.md](docs/README.md) for a full listing.  Developers should read [docs/technical_overview.md](docs/technical_overview.md) for a code walkthrough and [docs/event_schema.md](docs/event_schema.md) for the battle log message format.

