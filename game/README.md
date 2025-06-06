# Game

This package hosts the Phaser 3 scenes that power the dungeon and battles. It
also uses Vite for local development and bundling.

The scenes can run on their own for isolated testing or be embedded within the React client for the full game experience. It reads initial data like `partyData` from `localStorage`, which is prepared by the React client.

Key scenes include:

-   **`DungeonScene`**: This scene is responsible for:
    *   Procedurally generating the layout of dungeon floors based on selected biomes.
    *   Managing player navigation on the grid-based map, revealing rooms (handling fog-of-war).
    *   Initializing various types of nodes as per `GAME_DESIGN.md`: combat encounters, loot points, random events, rest spots, and traps.
    *   Loading and applying biome-specific synergy bonuses (e.g., "Fungal Depths: Poison effects last +1 turn") and floor-wide dynamic events (e.g., "Spore Bloom: +15% miss chance for 3 turns") that affect gameplay.
    *   Triggering the `BattleScene` when a combat encounter node is entered.
    *   Saving dungeon progress (explored rooms, current player location, party status) back to `localStorage` periodically or after key events.

-   **`BattleScene`**: This scene manages the auto-battler combat mechanics:
    *   Loading the player's party and the enemy group for the current encounter.
    *   Implementing the core combat loop: characters act automatically based on their AI, speed (`SpeedModifier`), and assigned cards.
    *   Executing card effects: All cards consume Energy and may have cooldowns. This includes attacks, buffs, heals, debuffs, and utility actions.
    *   Managing turn order based on each unit’s `SpeedModifier`.
    *   Applying combat logic, including damage calculation, status effect application, and checking for victory or defeat conditions.
    *   Implementing combo-aware AI for enemies, allowing them to sequence actions intelligently if this feature is enabled for them.
    *   After combat, it communicates results (loot, stat changes like +1 Fatigue, +1 Hunger, +1 Thirst for all party members) which are then typically saved by `DungeonScene` or a shared utility to `localStorage`.
    *   Displaying combat animations and visual feedback for actions taken.

## Scripts

- `npm start` – launch the dev server on <http://localhost:8080>.
- `npm run build` – create a production build.
