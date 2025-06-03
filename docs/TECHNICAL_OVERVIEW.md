# Technical Overview

This document summarizes the current structure of the **Survival Dungeon CCG Auto-Battler** project.  It is intended for developers working with the Godot project and complements the [GAME_DESIGN.md](../GAME_DESIGN.md) document.

## Project Layout

```
auto-battler/
├─ data/        # Resource files defining cards and enemies
├─ scenes/      # Godot scene files for gameplay screens (placeholders)
├─ scripts/     # GDScript sources
│  ├─ combat/   # Combat manager and AI stubs
│  ├─ data/     # Resource classes (CardData, EnemyData, etc.)
│  ├─ main/        # Game, encounter and map managers
│  ├─ preparation/ # Pre-combat party setup logic
│  ├─ systems/     # Crafting, inventory and economy systems
│  ├─ ui/       # UI controllers
│  └─ utilities/# Generic helpers and save/load utilities
└─ ui/          # Scene fragments for UI panels
```

The top level of the repository also contains `Main.tscn` and `project.godot` so the project can be opened directly in Godot 4.

## Key Resource Classes

### `CardData`
Represents an ability, equipment piece or consumable card used in combat or crafting. Key fields include `energy_cost`, `synergy_tags`, `is_combo_starter`, and `is_combo_finisher`. It utilizes the `CardType` and `Rarity` enums. See the design document for the full list of fields.

### `EnemyData`
Defines enemy combatants. Fields include name, description, type (using the `EnemyType` enum), ability list, base stats, loot table and passive traits.

### `CharacterData`
Describes party members controlled by the player, including combat stats (utilizing the `Role` enum), assigned cards and survival meters.

### `ProfessionData`
Tracks crafting profession levels and unlocks. Key fields include `max_level`, `current_level`, `known_recipes`, `exclusive_cards`, and `crafted_by_tag`.

### `RecipeData`
Represents a specific crafting recipe, mapping input cards to an output card and required profession level. It also includes `synergy_tags` and a `discovered` status.

## Systems

### CombatManager
`scripts/combat/CombatManager.gd` implements a basic turn-based loop. It manages combatants (including an inner `Combatant` class), builds turn order based on `speed_modifier`, processes card effects (currently basic), handles combat log/loot/XP, and emits signals like `combat_victory` and `combat_defeat`.

### GameManager
`scripts/main/GameManager.gd` is the central coordinator for game flow. It uses signals to manage interactions between different managers (e.g., `CombatManager`, `DungeonMapManager`) and scenes. It is responsible for global game state, including party composition, inventory, and dungeon progression. It also handles scene transitions and save/load functionality.

### PreparationManager
`scripts/preparation/PreparationManager.gd` powers the pre-combat setup screen, letting players assign cards, equip gear, manage consumables, and view profession data before entering the dungeon. It manages data related to the party, available cards/gear, consumables, and professions.

### DungeonMapManager
`scripts/main/DungeonMapManager.gd` builds a chain of dungeon nodes. Each node can trigger combat, loot, a random event, a rest opportunity or a trap. The manager handles navigation and can either emit signals for `GameManager` to handle full scene transitions or manage simpler interactions via its own internal popups/panels.

### PostBattleManager
`scripts/main/PostBattleManager.gd` runs immediately after combat. It applies fatigue, hunger and thirst penalties, distributes loot and experience, and can display a `PostBattleSummary.tscn`. It then signals which scene to load next.

### RestManager
`scripts/main/RestManager.gd` manages the resting phase between encounters. Players may use consumables, view survival stats or exit the dungeon. The manager emits signals when to continue exploring or to leave.

### EncounterManager
`scripts/main/EncounterManager.gd` is currently a placeholder and does not yet implement significant logic for coordinating events or enemy encounters.

### CraftingSystem
`scripts/systems/CraftingSystem.gd` handles item creation. It takes `ProfessionData` and a list of ingredient cards, then uses `RecipeData` to find a matching recipe. The system accounts for synergies between ingredients, grants profession XP upon successful crafting, and can produce either actual `CardData` objects or scrap materials.

Other systems such as `EconomySystem` (`scripts/systems/EconomySystem.gd`) and `InventorySystem` (`scripts/systems/InventorySystem.gd`) exist as placeholders for future development.

### AIController.gd
Note: `scripts/combat/AIController.gd` (listed in the Project Layout) is currently an empty script/placeholder and does not yet implement the advanced AI features discussed in the `GAME_DESIGN.md` document.

## Running the Project

1. Install **Godot 4.x**.
2. Open `project.godot` in the Godot editor.
3. Run the `Main.tscn` scene.  Most scenes and scripts are stubs, so expect minimal functionality.

## Contributing

Read `GAME_DESIGN.md` before adding or changing content.  Follow the naming conventions and field definitions described there when creating new resources or scripts.
