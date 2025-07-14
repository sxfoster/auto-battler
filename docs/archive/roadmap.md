# Project Roadmap: Auto Battler Discord Bot
To evolve the project into a feature-rich Discord bot experience by implementing the following 10 key features.

## Core Gameplay Mechanics
1.  **Character Creation and Customization:** Allow users to create unique heroes with customizable stats, abilities, and appearances.
2.  **Quest System:** Implement a dynamic quest system with varying difficulty levels and rewards.
3.  **Combat System:** Develop a turn-based or real-time combat system for PvE and PvP encounters.
4.  **Inventory Management:** Enable players to collect, manage, and equip items and gear.
5.  **Leveling and Progression:** Introduce a robust leveling system with skill trees and unlockable content.

## Social and Community Features
6.  **Guilds and Parties:** Allow players to form guilds and parties for collaborative gameplay.
7.  **Leaderboards and Rankings:** Implement leaderboards to foster competition and recognize achievements.
8.  **Trading System:** Enable secure item trading between players.

## Monetization and Engagement
9.  **In-Game Store:** Introduce a store for cosmetic items or convenience features (optional).
10. **Events and Challenges:** Host regular events and challenges to keep players engaged.

## 1. Advanced Character Progression System
A robust progression system beyond simple hero acquisition to keep players engaged.

### Leveling and Experience (XP)
**Implementation Plan:**
-   **Database:** Propose adding `xp` and `level` columns to a new `user_heroes` table in `ironaccord_bot/db-schema.sql`. This table would link users (`discord_id`) to `allPossibleHeroes` (`id`) and store instance-specific data.
-   **Game Engine:** Modify `backend/game/engine.js` to calculate and return the XP awarded at the end of a battle based on the outcome.
-   **Discord Bot:** Update the `InteractionCreate` handler in `ironaccord_bot/index.js`. After a battle completes, update the user's XP in the database and notify them if they've leveled up.

### Skill Trees
**Implementation Plan:**
-   **Data Structure:** Propose a new object, `allHeroSkillTrees`, in `backend/game/data.js` to define unique skills for each hero class.
-   **Discord Command:** Suggest a new command, `/skills [hero]`, in the `ironaccord_bot/commands/` directory that allows a player to view their hero's skill tree and spend skill points.

### Prestige/Evolution
**Implementation Plan:**
-   **System Design:** Reference the existing evolution logic in `auto-battler-react/src/store.js` (`checkForAndApplyEvolutions`) as a successful model.
-   **Implementation:** Propose a `/prestige` command that, when a hero is max level, resets their level and applies permanent base stat boosts in the database.

## 2. Turn-Based Combat System
The core combat is already implemented but can be expanded for a Discord environment.

### PvE (Player vs. Environment)
**Implementation Plan:**
-   **Game Modes:** Reference `docs/game_modes_gdd.md` and suggest that the existing `GameEngine` can be used by creating AI opponents from the `allPossibleHeroes` data marked with a 'monster' archetype (a proposed addition to `data.js`).
-   **Discord Command:** Propose a `/pve [difficulty]` command.

### Party System
**Implementation Plan:**
-   **Session Management:** Suggest expanding `ironaccord_bot/sessionManager.js` to handle multiple users in a single draft/battle session.
-   **Database:** Modify the `games` table in `db-schema.sql` to allow for multiple player IDs (e.g., `player1_id`, `player2_id`, etc.).

### Detailed Combat Logs
**Implementation Plan:**
    -   **Existing Feature:** Note that `BattleScene.jsx` in `auto-battler-react/src/scenes` and the `GameEngine` in the backend already produce detailed battle logs.
-   **Discord Display:** The task is to format this log output within a Discord embed, potentially using pagination for long fights. Reference the simple embed builder in `ironaccord_bot/src/utils/embedBuilder.js`.

## 3. In-Game Economy and Currency
A currency system will motivate players. Reference `docs/progression_economy_gdd.md`.

### Soft and Hard Currency
**Implementation Plan:**
-   **Database:** Add `soft_currency` and `hard_currency` columns to the `users` table in `db-schema.sql`.
-   **Discord Commands:** Propose a `/balance` command to check currency and a `/shop` command to spend it.

### Player-Driven Marketplace
**Implementation Plan:**
-   **Database:** Propose new tables: `market_listings` and `inventory`.
-   **Discord Commands:** Suggest `/market sell [item] [price]` and `/market buy [listing_id]` commands. This will require significant new logic for handling listings.

## 4. Guilds and Social Features
**Summary:** Enable players to form guilds, promoting teamwork and community.
**Sub-Features & Implementation Plan:**
-   **Guild Creation and Management:**
    -   **Database:** New tables `guilds` (id, name, leader_id) and `guild_members` (guild_id, user_id, rank).
    -   **Discord Commands:** `/guild create [name]`, `/guild invite [user]`, `/guild kick [user]`, `/guild promote [user]`.
-   **Guild Wars:**
    -   **System Design:** Develop a system for guilds to declare war, perhaps involving set times for battles or a ladder system.
    -   **Game Engine:** Adapt `engine.js` to handle guild-vs-guild team compositions.

## 5. Quest and Achievement System
**Summary:** Introduce quests and achievements to guide players and reward their accomplishments.
**Sub-Features & Implementation Plan:**
-   **Daily/Weekly Quests:**
    -   **Data Structure:** Define quest types (e.g., 'win_x_battles', 'collect_y_heroes') in `backend/game/data.js`.
    -   **Discord Bot:** A system in `ironaccord_bot/index.js` to assign daily/weekly quests and track progress, storing status in a new `user_quests` table.
-   **Achievement Tiers:**
    -   **Database:** A new `achievements` table (id, name, description, criteria) and `user_achievements` (user_id, achievement_id, progress).
    -   **Discord Command:** `/achievements` to view completed and in-progress achievements.

## 6. Live Events and Tournaments
**Summary:** Host time-limited events and tournaments with unique rules and rewards.
**Sub-Features & Implementation Plan:**
-   **Event System:**
    -   **Session Management:** Extend `ironaccord_bot/sessionManager.js` to manage event-specific states (e.g., tournament brackets, special event currency).
    -   **Discord Commands:** `/event join [event_name]`, `/tournament register`.
-   **Special Game Modes:**
    -   **Game Engine:** Allow `backend/game/engine.js` to accept modifiers or rule variations for event battles. Reference `docs/game_modes_gdd.md`.

## 7. Hero Customization and Cosmetics
**Summary:** Allow players to personalize their heroes with cosmetic items.
**Sub-Features & Implementation Plan:**
-   **Skins/Variant Art:**
    -   **Asset Storage:** Store alternative hero art in `ironaccord_bot/assets/heroes/[hero_name]/skins/`.
    -   **Database:** A `user_hero_cosmetics` table to track unlocked skins for each hero instance.
    -   **Discord Command:** `/equip_skin [hero] [skin_name]`.
-   **Titles and Badges:**
    -   **Data Structure:** Define available titles/badges in `backend/game/data.js`.
    -   **Discord Bot:** Display titles/badges on player profiles or alongside hero names in embeds.

## 8. Crafting and Item System
**Summary:** Implement a system for players to craft items and equip them on heroes. (Ref: `docs/items_gdd.md`)
**Sub-Features & Implementation Plan:**
-   **Crafting Recipes:**
    -   **Data Structure:** Define recipes in `backend/game/data.js` (e.g., materials needed, item_created).
    -   **Database:** `inventory` table (from Feature 3) to store crafting materials.
    -   **Discord Command:** `/craft [item_name]`.
-   **Equipment Slots:**
    -   **Database:** Extend `user_heroes` table or create `hero_equipment` table to store equipped items (e.g., weapon, armor, accessory slots).
    -   **Game Engine:** `engine.js` needs to factor in equipped item stats during combat.

## 9. Minigames and Side Activities
**Summary:** Introduce engaging minigames for players to earn rewards or pass the time.
**Sub-Features & Implementation Plan:**
-   **Example Minigame (e.g., Gacha/Card Pack Opening):**
    -   **Existing Logic:** Reference `ironaccord_bot/commands/openpack.js` for the gacha mechanism.
    -   **Expansion:** Could be expanded with different pack types or probabilities defined in `backend/game/data.js`.
-   **Other Minigames:**
    -   **System Design:** Propose simple text-based or RNG games initially, managed within new commands in `ironaccord_bot/commands/`.

## 10. Story Mode and Lore Integration
**Summary:** Develop a narrative campaign or integrate lore elements to enrich the game world.
**Sub-Features & Implementation Plan:**
-   **Narrative Encounters:**
    -   **Data Structure:** Store story dialogues and encounter definitions in a new `story_chapters.json` or similar in `backend/game/data/`.
    -   **Discord Bot:** A command like `/story play` that guides users through narrative segments, possibly interspersed with PvE battles (using existing engine).
-   **Lore Codex:**
    -   **Database:** A `lore_entries` table (id, title, content, discovery_condition).
    -   **Discord Command:** `/codex` or `/lore [entry_name]` to read unlocked lore.

---

This roadmap outlines the long-term vision for the Hero-Game Discord Bot, aiming to create a comprehensive and engaging experience for players. Each feature builds upon the existing framework, progressively adding depth and replayability. Future development will focus on implementing these features, iterating based on community feedback, and ensuring a stable and enjoyable bot.

## Related Documents
-   [Game Design Document (GDD)](./gdd.md)
-   [Technical Overview](./technical_overview.md)
-   [Progression and Economy GDD](./progression_economy_gdd.md)
-   [Game Modes GDD](./game_modes_gdd.md)
-   [Items GDD](./items_gdd.md)
