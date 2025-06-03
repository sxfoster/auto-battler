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
Represents an ability, equipment piece or consumable card used in combat or crafting.  See the design document for the full list of fields.

### `EnemyData`
Defines enemy combatants.  Fields include name, description, type, ability list, base stats, loot table and passive traits.

### `CharacterData`
Describes party members controlled by the player, including combat stats, assigned cards and survival meters.

### `ProfessionData`
Tracks crafting profession levels and unlocks.

### `RecipeData`
Represents a specific crafting recipe, mapping input cards to an output card and required profession level.

## Systems

### CombatManager
`scripts/combat/CombatManager.gd` implements a basic turn-based loop.  It manages combatants, builds turn order based on `speed_modifier`, processes card effects and applies survival penalties after battle.

### GameManager
`scripts/main/GameManager.gd` maintains global game state and drives the encounter loop. It stores the party and inventory, tracks dungeon progress and switches scenes between combat, loot and rest phases.

### PreparationManager
`scripts/preparation/PreparationManager.gd` powers the pre-combat setup screen, letting players assign cards, equip gear and pick consumables before entering the dungeon.

### DungeonMapManager
`scripts/main/DungeonMapManager.gd` builds a chain of dungeon nodes. Each node can trigger combat, loot, a random event, a rest opportunity or a trap. The manager handles navigation and displays the appropriate panels.

### PostBattleManager
`scripts/main/PostBattleManager.gd` runs immediately after combat. It applies fatigue, hunger and thirst penalties, distributes loot and experience, then signals which scene to load next.

### RestManager
`scripts/main/RestManager.gd` manages the resting phase between encounters. Players may use consumables, view survival stats or exit the dungeon. The manager emits signals when to continue exploring or to leave.

### EncounterManager
`scripts/main/EncounterManager.gd` is a placeholder for future logic that will coordinate event and enemy encounters on the dungeon map.

### CraftingSystem
`scripts/systems/CraftingSystem.gd` is a stub demonstrating how magical pouch crafting might work.  It selects a recipe based on up to five ingredient cards and emits a `crafted` signal with the result.

Other systems such as `EconomySystem` and `InventorySystem` exist as placeholders for future development.

## Running the Project

1. Install **Godot 4.x**.
2. Open `project.godot` in the Godot editor.
3. Run the `Main.tscn` scene.  Most scenes and scripts are stubs, so expect minimal functionality.

## Contributing

Read `GAME_DESIGN.md` before adding or changing content.  Follow the naming conventions and field definitions described there when creating new resources or scripts.
