# Shared

This package is crucial as it contains common data models, core game logic, and utility functions utilized by both the **client** (React UI) and **game** (Phaser 3) packages. This ensures consistency and avoids code duplication across the monorepo.

This package does not have its own build step or executable scripts; it's primarily a library of modules.

All modules target **Node.js 20** and are documented with JSDoc comments.

## Key Directories

-   **`models/`**: Contains definitions for all primary data structures used in the game. This includes schemas for:
    -   `Character.js`: Player characters, their stats, roles, and classes.
    -   `Card.js`: All types of cards (Ability, Equipment, Ingredient, etc.), their effects, costs, and restrictions.
    -   `Enemy.js`: Enemy definitions, stats, and abilities.
    -   `Dungeon.js`: Structure for dungeons, floors, and map nodes.
    -   `Recipe.js`: Crafting recipes and their requirements.
    -   And other relevant game entities.
-   **`systems/`**: Provides modules that implement core game mechanics and logic. These systems are used by the Phaser game for its internal operations and can also be used by the React client for displaying information or validating actions.
-   **`utils/`**: Contains general utility functions (e.g., random number generation, string manipulation) that can be helpful across different parts of the application.

## Systems

The `systems` directory provides helper modules for various game mechanics.

### Key Systems

-   **Crafting (`crafting.js`)**: Manages the Magical Pouch system, allowing players to combine ingredient cards to discover and create new items or upgrade existing ones.
-   **Market (`market.js`)**: Handles all economic transactions, including player balances for Gold and Guild Credits, and interactions with different market types (Town, Black Market, Guild Exchange, Auction House).
-   **Biome (`biome.js`)**: Implements biome-specific synergy bonuses that affect enemies within particular dungeon environments.
-   **Floor Events (`floorEvents.js`)**: Manages dynamic, floor-wide events that can alter combat flow and add variety to dungeon runs.
-   **Enemy AI (`enemyAI.js`)**: Provides modular logic for enemy decision making.
    It tracks card synergies, evaluates actions based on health, and exposes a
    debugging hook for monitoring AI choices.
-   **Post Battle (`postBattle.js`)**: Handles the resolution of combat, including awarding loot, and applying fatigue, hunger, and thirst to party members.
-   **Progression (`progression.js`)**: Governs character leveling, unlocking card rarities, and profession skill advancement.
-   **Room Events (`roomEvents.js`)**: Logic for various non-combat encounters or discoveries that can occur when navigating dungeon map nodes.

Class and enemy definitions used by these systems are cataloged in the
[`docs`](../docs) directory under
[`ClassCodex.md`](../docs/ClassCodex.md) and
[`EnemyCodex.md`](../docs/EnemyCodex.md).

For a high level explanation of these systems see
[../GAME_DESIGN.md](../GAME_DESIGN.md).

Developers should refer to JSDoc comments within these modules for detailed API information.

## Contributing

For contribution guidelines see the repository [README](../README.md) and the main [CONTRIBUTING.md](../CONTRIBUTING.md) file.

