# Web Game Monorepo

This monorepo hosts a small web based game split into three workspaces:

- **client** – a React UI powered by Vite for menus and interface elements.
  See [client/README.md](client/README.md) for available scripts.
- **game** – Phaser&nbsp;3 scenes for the dungeon and battle logic.
  See [game/README.md](game/README.md) for available scripts.
- **shared** – common models and utilities used by both stacks.
  See [shared/README.md](shared/README.md).

## Requirements

This project has been tested with **Node.js >=18**. We recommend using
[nvm](https://github.com/nvm-sh/nvm) to manage Node.js versions:

```bash
nvm install 18
nvm use 18
```

Each package contains minimal build and start scripts. Run `npm install` in the
root and then `npm start` inside either the `client` or `game` folder to launch
their development servers.

## Development Setup

1. Install dependencies in the project root:
   ```bash
   npm install
   ```
2. Start the React UI:
   ```bash
   cd client && npm start
   ```
3. Start the Phaser game in a separate terminal:
   ```bash
   cd game && npm start
   ```
4. Visit `http://localhost:3000` for the client and `http://localhost:8080` for the game.

## Data Flow Between React and Phaser

When a party has been finalized in the React UI, clicking **Start Game** will
serialize the party using the shared TypeScript interfaces and store it under the
`partyData` key in `localStorage`. The Phaser game reads this value on load and
displays the chosen characters and their decks inside the battle scene.


## License

This project is licensed under the [MIT License](LICENSE).

## Game Design Document

For a deeper look at gameplay mechanics and planned features, see the
[GAME_DESIGN.md](GAME_DESIGN.md) document.