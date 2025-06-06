# Web Game Monorepo

This monorepo hosts a small web based game split into three workspaces:

- **client** – a React UI powered by Vite for menus and interface elements.
  See [client/README.md](client/README.md) for available scripts.
- **game** – Phaser 3 scenes for the dungeon and battle logic.
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

## Building and Linting

To create a production bundle of the React client run:

```bash
cd client && npm run build
```

You can also lint the client source with:

```bash
cd client && npm run lint
```

The Phaser game package supports building as well:

```bash
cd game && npm run build
```


## Encounter Flow and Data

The game progresses through a defined encounter flow:

1.  **Card Assignment Phase (React UI)**: The player equips ability, equipment, and other cards to each character in their party within the React-based interface.
2.  **Enter Dungeon (React UI to Phaser)**: Clicking "Start Game" in the React UI stores the `partyData` (including assigned cards and character stats) and any existing dungeon progress in `localStorage`.
3.  **Navigate Map (Phaser)**: The Phaser game instance reads `localStorage` to initialize the dungeon. Players navigate a procedurally generated map, node by node. Nodes can trigger:
    *   Combat encounters
    *   Loot discovery
    *   Random events
    *   Rest spots
    *   Traps
4.  **Combat Phase (Phaser)**: When a combat node is entered, an auto-battle sequence begins. Character actions are determined by their assigned cards, AI logic, speed, and in-game context.
5.  **Post-Battle (Phaser to React UI/localStorage)**: After combat resolution (victory or defeat), characters gain loot. Fatigue, Hunger, and Thirst stats are updated. This updated game state is saved back to `localStorage`.
6.  **Rest (Phaser/React UI)**: Players can use Food/Drink cards to recover character stats or apply temporary buffs. This can occur on designated rest spot nodes in Phaser or potentially managed via the React UI between dungeon runs.
7.  **Continue or Exit (Phaser/React UI)**: Players can choose to advance to deeper dungeon floors (Phaser) or exit the current dungeon run, returning to the main React UI.

The React client primarily handles party setup, card management, and overall game state display, while Phaser manages the interactive dungeon exploration, combat mechanics, and immediate post-battle updates. `localStorage` acts as the bridge for transferring critical game data between these two components.


## License

This project is licensed under the [MIT License](LICENSE).

## Game Design Document

For a deeper look at gameplay mechanics and planned features, see the
[GAME_DESIGN.md](GAME_DESIGN.md) document.

## Economy and Markets

The shared package now includes basic utilities to model the in‑game economy.
Two currencies are tracked:

- **Gold** for common purchases.
- **Guild Credits** for guild and high tier items.

Four market types are supported: Town, Black, Guild Exchange and Auction House.
Helper functions in `shared/systems/market.js` manage listings, player balances
and bidding logic.
