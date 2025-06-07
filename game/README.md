# Game

This package hosts the Phaser 3 scenes that power the core gameplay loop, including dungeon exploration and turn-based combat. It utilizes Vite for local development and bundling.

The game is structured into several key Phaser scenes:

- **`DungeonScene.js`**: Manages the procedural generation of dungeon floors, player movement on the map, fog-of-war effects, and interactions with map nodes (e.g., initiating combat, finding loot, triggering events). It reads initial party data from `localStorage`.
- **`BattleScene.js`**: Handles the auto-battler combat logic. It takes the player's party and encountered enemies, then executes turns based on character speed, available energy, and assigned abilities. On load the first party member automatically targets an enemy and performs a basic attack. This scene is typically rendered within the `CombatOverlay` in the React client. It also reports battle outcomes.
- **`TownScene.js`**: A simple hub where players can access markets before
  returning to the dungeon.
- **`DecisionScene.js`**: Appears after clearing a floor and lets the player
  advance deeper or retreat back to town.

These scenes can run independently for development purposes or be embedded and controlled by the React client via the `GameView` component. The `game` package relies on the `shared` package for data models (characters, cards) and core system logic (AI, combat rules).

For a full description of the underlying systems see
[../GAME_DESIGN.md](../GAME_DESIGN.md).

## Scripts

- `npm start` – launch the dev server on <http://localhost:8080>.
- `npm run build` – create a production build.

The commands above assume **Node.js 20** or newer is available.

## Contributing

For contribution guidelines see the repository [README](../README.md) and the main [CONTRIBUTING.md](../CONTRIBUTING.md) file.
