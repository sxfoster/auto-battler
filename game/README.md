# Game

This package hosts the Phaser 3 scenes that power the core gameplay loop, including dungeon exploration and turn-based combat. It utilizes Vite for local development and bundling.

The game is structured into several key Phaser scenes:
- **`PreloaderScene.js`**: Responsible for loading all game assets (images, spritesheets, audio, etc.) before the main game scenes start.
- **`DungeonScene.js`**: Manages the procedural generation of dungeon floors, player movement on the map, fog-of-war effects, and interactions with map nodes (e.g., initiating combat, finding loot, triggering events). It reads initial party data from `localStorage`.
- **`BattleScene.js`**: Handles the auto-battler combat logic. It takes the player's party and encountered enemies, then executes turns based on character speed and assigned abilities. This scene is typically rendered within the `CombatOverlay` in the React client. It also reports battle outcomes.
- **`UIScene.js`**: (If applicable, or integrated into other scenes) Manages in-game UI elements that are part of the Phaser canvas, such as health bars, turn indicators, or temporary combat messages.

These scenes can run independently for development purposes or be embedded and controlled by the React client via the `GameView` component. The `game` package relies on the `shared` package for data models (characters, cards) and core system logic (AI, combat rules).

## Scripts

- `npm start` – launch the dev server on <http://localhost:8080>.
- `npm run build` – create a production build.

## Contributing

For contribution guidelines see the repository [README](../README.md) and the main [CONTRIBUTING.md](../CONTRIBUTING.md) file.

