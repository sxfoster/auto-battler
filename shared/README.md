# Shared

Common models and utilities consumed by both the React client and the Phaser
game.

This package contains no build step or executable scripts.

It defines the core data structures (models) and reusable logic (systems) that are fundamental to the game's mechanics and ensure consistency between the client and game packages.

### Core Data Models

This package includes detailed definitions for various game entities. Key models, as outlined in `GAME_DESIGN.md`, include:

-   **Card Models**:
    *   `AbilityCard`: Defines attributes for cards used in combat (e.g., `name`, `description`, `energyCost`, `cooldown`, `effects`, `roleTag`, `classRestriction`).
    *   `EquipmentCard`: For items that grant passive bonuses or enable abilities.
    *   `IngredientCard`: Used in the crafting system.
    *   `FoodDrinkCard`: For consumables that restore Hunger/Thirst and may provide buffs.
    *   `ElixirCard`: Crafted potions with temporary passive effects.
    *   `UtilityCard`: Tools like traps, repair kits, etc.
    *   Attributes like `rarity` (Common, Uncommon, Rare, Legendary) and upgrade paths are also defined.

-   **Character Models**:
    *   Defines player character attributes: `health`, `energy`, `speedModifier`, `hunger`, `thirst`, `fatigue`, `level`, `role`, `class`.
    *   Includes inventory for equipped cards.

-   **Enemy Models**:
    *   Defines enemy attributes: `name`, `type`, `health`, `speedModifier`, `abilities` (which are instances of `AbilityCard`), `resistances`, `weaknesses`.
    *   Includes `EnemyAIProfile` with fields like `enableComboAwareness`, `comboWindowTurns`, `preferredComboTags` for advanced AI.

-   **Profession & Recipe Models**:
    *   `Profession`: Tracks player progress in `Cooking`, `Smithing`, `Alchemy` (e.g., `level`, `experience`, `unlockedRecipes`).
    *   `Recipe`: Defines crafting combinations (e.g., required `IngredientCards`, resulting card, profession requirement).

-   **Dungeon & Economy Models**:
    *   `DungeonFloor`: Structure for a single floor, including biome type, layout, and dynamic events.
    *   `MarketListing`: For items on the Town Marketplace, Black Market, Guild Exchange, or Auction House.
    *   `PlayerBalance`: Tracks `Gold` and `GuildCredits`.

### Shared Systems

The `systems` directory provides helper modules and logic used by both the React client and Phaser game:

-   **Crafting System (`systems/crafting.js` or similar)**:
    *   Manages the "Magical Pouch" logic: validating card combinations and determining crafting results.
    *   Handles profession-based recipe discovery and success rates.

-   **Market System (`systems/market.js`)**:
    *   Manages interactions with the four market types: Town Marketplace, Black Market, Guild Exchange, and Auction House.
    *   Handles listing creation, bidding, purchasing, and currency management (`Gold`, `GuildCredits`).

-   **Biome & Event System (`systems/biome.js`, `systems/events.js`)**:
    *   Provides data and logic for Biome Synergy Bonuses (e.g., applying poison duration increase in Fungal Depths).
    *   Manages Floor-Wide Dynamic Events (e.g., activating "Mana Freeze" in Frozen Bastion).

-   **Combat Logic Helpers (`systems/combat.js`)**:
    *   May include utility functions for damage calculation, status effect application, or AI behavior trees if not fully encapsulated within Phaser scenes.
    *   Provides access to combo-aware AI logic defined in `EnemyAIProfile`.

-   **Card System Utilities (`systems/cards.js`)**:
    *   Helpers for validating card usage (e.g., role/class restrictions, penalties for incorrect usage).
    *   Functions for card scaling and upgrades.

By centralizing these models and systems, the `shared` package ensures that both the client-side UI and the game-side simulation operate on a consistent and accurate representation of the game world and its rules.
