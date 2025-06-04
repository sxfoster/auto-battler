# 🧭 Survival Dungeon CCG Auto-Battler

A tactical survival dungeon crawler with collectible card game (CCG) mechanics and auto-battler combat, built in Godot.  
Players guide a party of adventurers through procedural dungeon biomes, surviving by managing hunger, thirst, fatigue, and tactical card resources.

Navigation now runs through a simple dungeon map. Nodes may lead to combat, loot, random events, rest points, or traps. The `DungeonMapManager` script handles node generation and scene transitions.

---

## 🚀 Getting Started

### Requirements
- [Godot Engine 4.x](https://godotengine.org/download)
- Git

### Cloning the Project

```bash
git clone https://github.com/sxfoster/auto-battler.git
cd auto-battler
```

The Godot project files are located within the `auto-battler` directory of this repository.

### Running

1. Open `project.godot` with **Godot 4.x**.
2. Run the `Main.tscn` scene. Most scenes are placeholders so game functionality is limited.

For AI Contributors
Before generating, editing, or refactoring any code, always read and reference GAME_DESIGN.md.

Align all code, class/data structures, and naming conventions with the systems described in GAME_DESIGN.md.

If a data model, mechanic, or term is unclear, check GAME_DESIGN.md first before proceeding.

Use the latest core data field lists for resource and script generation.

If adding or updating content (e.g., new card, enemy, or mechanic), ensure it matches the structure and intent in the design document.

When generating documentation, docstrings, or comments, base them on the terminology and intent described in GAME_DESIGN.md.

### Documentation

Additional developer notes are available in [docs/TECHNICAL_OVERVIEW.md](docs/TECHNICAL_OVERVIEW.md). The full game design outline is in [GAME_DESIGN.md](GAME_DESIGN.md).

This repository is a prototype for demonstration purposes. Many scenes and scripts are incomplete and subject to change.

## Formatting

All GDScript files must be formatted using [gdformat](https://github.com/Scony/godot-gdscript-toolkit). A GitHub Actions workflow automatically checks formatting on pushes and pull requests. Run `gdformat .` before committing changes to avoid CI failures.

