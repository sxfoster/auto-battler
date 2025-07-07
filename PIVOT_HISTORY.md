# Project Pivot History

This living document summarizes the major design decisions and direction changes for the auto‑battler prototypes.  Dates use the commit timestamps from the repository.

## Original Concept (June 3 2025)
- **Godot Auto‑Battler.** The project began as a Godot engine experiment.  Resource scripts were created for heroes, professions, cards and enemies.  Manager scripts (`GameManager`, `CombatManager`, `PreparationManager`, etc.) coordinated the dungeon crawl loop.
- **Goal.** Build a survival dungeon CCG with automated battles and crafting.  Early commits added sample resources and UI scenes.

## Web Prototypes (June 12 2025)
- **HTML Proof of Concept.** A single `index.html` file was added to sketch a browser-based draft and battle system.
- **React Attempt.** A Vite + React scaffold (`auto-battler-react/`) briefly replaced the HTML version but was reverted the same day due to complexity.
- **Modular JS Game.** The `hero-game/` directory introduced a standalone JavaScript prototype with ES modules, multiple scenes and data-driven cards.  This became the primary playable demo.

## Backend and Bot (June 21 2025)
- **Express Server.** A minimal Node.js backend (`backend/`) was added to host game logic.
- **Discord Bot.** The first Discord bot version provided a `/ping` command.  Subsequent updates added dynamic command loading, MySQL integration and battle engine hooks.

## Growing Feature Set (Summer 2025)
- **Full Draft Flow.** Hero, weapon, ability and armor drafting was implemented along with battle scenes, recap and upgrade phases.
- **Battle Log System.** Combat events produce JSON messages as defined in `docs/event_schema.md` for animated playback.
- **Upgrade & Evolution.** Post‑battle mini‑drafts allow equipping new gear.  Champions can evolve, showing banners and updated stats.
- **Marketplace and Packs.** Booster pack logic, a marketplace, inventory management and gacha card rewards were built into the Discord bot.
- **PvE & PvP Modes.** Dungeon encounters and PvP battles were introduced, with leaderboard tracking and summoning mechanics.

## The Iron Accord Pivot (July 2025)
- **Genre Shift.** The project has fundamentally pivoted from a "Pack Draft Auto-Battler" to a text-based, narrative-driven **Survival TTRPG**.
- **New World:** The generic fantasy setting was replaced by the post-apocalyptic world of **Iron Accord**, pitting a steampunk faction against a cyberpunk one. The core design is detailed in the new `gdd.md` and lore documents.
- **Mechanics Overhaul:**
    - A **classless system** based on stats, skills, and gear was introduced.
    - Core gameplay now revolves around **survival mechanics** (hunger, thirst, gear durability).
    - The "Unseen Fate System" was implemented, abstracting dice rolls into **narrative outcome tiers** to enhance immersion.
- **New Onboarding:** The tutorial and starter pack concepts have been replaced by an immediate first-mission experience to teach mechanics organically.

## Recent Changes (Fall 2025)
- **UI Simplifications.** Several marketplace and town menu features were trimmed or refactored for clarity.
- **Logging & Diagnostics.** Extensive logging was added to the bot for DM attempts, card generation and user actions.
- **Discord.js Updates.** Interaction handling was updated to use `InteractionResponseFlags` and new ephemeral reply patterns.

## Lessons Learned
- Start small and keep features modular.  The React pivot was rolled back because the simpler ES module approach was easier to iterate.
- Centralize data definitions (`backend/game/data.js`) to avoid divergence between front‑end and bot.
- Design battle events as structured JSON so different UIs (browser or Discord embeds) can share the same simulator.
- Keep documentation in `docs/` up to date.  The technical overview and event schema are valuable references when refactoring.

## Looking Ahead
Future updates should continue documenting new pivots here.  Potential directions include:
- Converging the web and Discord versions onto a single shared game engine.
- Expanding the database schema to support persistent heroes, quests and economy.
- Reintroducing a modern front‑end framework once the core mechanics stabilize.


## December 2025 Cleanup
- Removed leftover team management and defense table logic from the Discord bot. PvP defense rosters and multi‑champion selection were unused and complicated the command handler.
- Simplified champion management APIs so each user only fields a single champion.
