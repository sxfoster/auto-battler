# Web Game Monorepo

This monorepo hosts a small web based game split into three workspaces:

## Workspace Overview

- **client** – a React UI powered by Vite for menus and interface elements.
  See [client/README.md](client/README.md) for available scripts.
- **game** – Phaser 3 scenes for the dungeon and battle logic.
  See [game/README.md](game/README.md) for available scripts.
- **shared** – common models and utilities used by both stacks.
  See [shared/README.md](shared/README.md) for module details.

For an in-depth look at the gameplay vision and mechanics consult the
[GAME_DESIGN.md](GAME_DESIGN.md) document.

## Requirements

This project has been tested with **Node.js >=20**. We recommend using
[nvm](https://github.com/nvm-sh/nvm) to manage Node.js versions:

```bash
nvm install 20
nvm use 20
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

## Advanced Enemy AI

Battles use an AI system that can track card synergies and execute combo
chains. Enemies remember recently played starter cards and will prioritize
playing matching finishers within the combo window. When no finisher is
available the AI will attempt to start a preferred combo. Targeting also adapts
to focus the lowest health party member for a more dynamic challenge.
The AI now scores available actions based on unit health and ability effects,
allowing enemies to choose healing or defensive options when injured. A debug
listener can be registered via `setAIDebugListener` to inspect each decision
during development.

## Testing

Run the shared unit tests with Node's built-in test runner:

```bash
npm test
```

This executes `*.test.js` files across the workspaces, such as the helpers in
`shared/systems`.

## API Reference

The core game logic, including systems for crafting, combat, economy, and more, resides in the `shared/systems` directory. Developers should refer to the JSDoc comments within the source code of these modules for detailed API information and usage examples.

## Data Flow Between React and Phaser

When a party has been finalized in the React UI, clicking **Start Game**
stores the party under the `partyData` key in `localStorage`. Basic dungeon
progress is also saved for the session. The Phaser scenes read these values on
load to render the map and launch battles using the chosen characters.

## Interactive Dungeon Map

A grid-based map lets you explore each floor by clicking adjacent rooms. Entering
an enemy room briefly displays an "encounter" banner before the battle overlay
opens. After victory or defeat, you return to the map with your explored rooms
intact.

## Party Setup and Card Drafting

The React client includes a revamped party setup flow. Players can reroll
available classes and then draft a starting deck of ability cards for each
character before entering the dungeon. Only **two** of these cards are
drawn at the start of a battle, so choose wisely. These features live under the
`PartySetup` route and make early game decisions more dynamic.

## Codex Reference

Lists of all playable classes and enemy archetypes are maintained under the
[`docs`](docs) directory. See
[`docs/ClassCodex.md`](docs/ClassCodex.md) and
[`docs/EnemyCodex.md`](docs/EnemyCodex.md) for the currently implemented
Level&nbsp;1 cards.

## Data Integrity Rules

All playable classes are referenced by a lowercase id using hyphens (e.g. `runestone-sentinel`). When assigning classes to characters store this `id`, never the display name. Each class must have at least two draftable cards with matching restrictions. The test suite validates these constraints.


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
and bidding logic. Crafting recipes include a currency cost which is deducted
when a craft succeeds. Loot generation now awards Gold and occasionally Guild
Credits that can be applied to a player's balances via `awardCurrency`.

## Visual Feedback

Phaser scenes and React UI components now display quick animations
to highlight player actions. Card plays show floating text over the
active combatant, crafting attempts trigger success or failure
notifications, and moving through the dungeon surfaces loot and
combat results with animated toasts. These effects make it easier to
follow the flow of battle and other game events.

## Contributing

Bug reports and pull requests are welcome. If you plan to make a major
change, please open an issue first to discuss what you would like to
modify.

For more detailed contribution guidelines, please see [CONTRIBUTING.md](CONTRIBUTING.md).
