# Client

This package contains the React user interface for the game, built with React and Vite. It's responsible for rendering all menus, character management screens, and the main game interface that embeds the Phaser canvas.

Key components include:
- **`App.js`**: The main application component that sets up routing and global state.
- **`GameView.js`**: A crucial component that initializes and embeds the Phaser game instance. It serves as the bridge between the React UI and the Phaser game engine.
- **`DungeonMap.js`**: Renders the interactive grid-based dungeon map. Players click on rooms in this component to navigate the dungeon.
- **`CombatOverlay.js`**: Displays when a battle starts, showing character statuses, enemy information, and combat logs. It overlays the `GameView` where the actual Phaser battle scene is running.
- **Various UI components**: For displaying player inventory, party selection, crafting menus, and interacting with different game systems.
- **`PartySetup` screens**: Allow rerolling available classes and drafting a
  starting deck of cards for each character. Draftable cards are displayed in
  a responsive grid layout that adjusts to mobile and desktop viewports.
- **`TownView` and `MarketScreen`**: Provide an interface to interact with the
  in-game markets before delving back into the dungeon.

The UI communicates with the Phaser game primarily through `localStorage` for game state like party composition and dungeon progress, as described in the main repository README.

See [GAME_DESIGN.md](../GAME_DESIGN.md) for a broader overview of the
gameplay systems this UI interacts with.

## Scripts

- `npm start` – start the Vite dev server.
- `npm run build` – create a production build in `dist/`.
- `npm run lint` – run ESLint over the source files.

These scripts assume **Node.js 20** or later is installed.

## Contributing

For contribution guidelines see the repository [README](../README.md) and the main [CONTRIBUTING.md](../CONTRIBUTING.md) file.

