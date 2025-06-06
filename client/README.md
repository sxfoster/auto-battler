# Client

This package contains the React user interface for the game. Vite provides
the development server and build tooling.

The client is responsible for rendering the main game interface, managing player interactions outside of direct gameplay (e.g., party setup, inventory management), and embedding the Phaser-based game canvas.

Key components include:

-   **`GameView` Component**: This is the primary React component responsible for hosting and interacting with the Phaser game instance. It handles:
    *   Loading and initializing the Phaser game.
    *   Passing necessary data (like `partyData` from `localStorage`) to Phaser.
    *   Displaying game-related UI elements that overlay or surround the Phaser canvas, such as character status readouts or event notifications.
    *   Managing the overall layout where the game canvas is displayed.

-   **`DungeonMap` Component**: While the core map logic and rendering are handled by Phaser, the React client might include components that:
    *   Display a high-level overview or minimap.
    *   Provide controls for interacting with map elements if not directly handled in Phaser (though `GAME_DESIGN.md` implies Phaser handles navigation).
    *   Show information about the current room or upcoming nodes based on data received from Phaser.
    *   The `GAME_DESIGN.md` specifies: "Navigate Map – Nodes may present combat, loot, random events, rest spots or traps". The `DungeonMap` in React could be used to display information related to these nodes.

-   **Combat Overlay**: When a combat encounter is initiated in Phaser, a combat overlay is displayed. This overlay is managed by Phaser but the React client might:
    *   Display pre-combat information (e.g., enemy types, player party).
    *   Show post-combat results (loot, experience gained, status changes) once Phaser signals the end of combat.
    *   The actual auto-battle happens within the Phaser canvas, but the React UI frames this experience, potentially showing whose turn it is, health bars, and status effects if these are not rendered directly in Phaser. The `GAME_DESIGN.md` states: "Combat is resolved in turns, ordered by each unit’s `SpeedModifier`." and "Characters act automatically in combat based on AI, speed, and context."

The client also handles:
- Initial party selection and card assignment before a dungeon run begins.
- Displaying character information, inventory, and crafting interfaces.
- Interaction with market systems (Town Marketplace, Black Market, Guild Exchange, Auction House).

## Scripts

- `npm start` – start the Vite dev server.
- `npm run build` – create a production build in `dist/`.
- `npm run lint` – run ESLint over the source files.
