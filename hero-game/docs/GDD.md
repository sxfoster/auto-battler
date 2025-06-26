# Game Design Document: hero-game (JavaScript Prototype)

## 1. Overview / Introduction
*   **Project Title:** Hero Game Prototype
*   **Core Concept:** A client-side, session-based auto-battler where the player drafts a team of two heroes, along with their abilities, weapons, and armor, and then engages in a series of automated battles against randomly generated enemy teams. The player progresses through a tournament, upgrading their team between battles.
*   **Original Goals/Vision (deduced from `docs/technical_overview.md` and its functionality):**
    *   To create a playable prototype of an auto-battler with a drafting phase and automated combat.
    *   To test core gameplay mechanics like hero stats, abilities, items, status effects, and a tournament progression loop.
    *   Entirely client-side for ease of development and iteration.

## 2. Core Gameplay Mechanics

*   **Drafting Phase (`PackScene`, `RevealScene`, `DraftScene` in `js/main.js`):**
    *   Players draft a team of two heroes.
    *   For each hero, they draft:
        1.  A Hero card (defines base stats, class).
        2.  An Ability card (active skill used in combat, specific to hero's class).
        3.  A Weapon card (provides stat bonuses and sometimes passive effects).
        4.  An Armor card (provides stat bonuses and sometimes passive effects).
    *   Packs are generated with card rarity influenced by the player's current number of tournament wins (more wins = better chance at rarer cards).
*   **Combat System (`js/scenes/BattleScene.js`):**
    *   **Team Composition:** 2v2 battles.
    *   **Automated & Turn-Based:** Combat resolves automatically once started.
    *   **Turn Order:** Determined by each combatant's `speed` stat (higher speed acts first). Status effects like `Slow` can modify speed.
    *   **Actions:**
        *   On a combatant's turn, they gain 1 Energy (up to a cap of 10).
        *   If they have an equipped ability (`abilityData`) and enough energy, they will use the ability. Some abilities are followed by a basic attack.
        *   Otherwise, they perform a basic attack.
    *   **Targeting:** Combatants primarily target the first available enemy in the opponent's lineup (typically the front-most active unit).
    *   **Damage Calculation:**
        *   Basic Attack Damage: `attacker.attack - target.block` (minimum 1).
        *   Ability Damage: Often defined by the ability's effect string (e.g., "Deal X damage"), or defaults to attacker's attack.
        *   Critical Hits: 10% chance for 1.5x damage.
        *   Stat Bonuses: Weapon and Armor stat bonuses are factored into a combatant's effective stats at the start of the battle.
    *   **Status Effects:** Implemented with descriptions and visual indicators. Includes: Stun, Poison, Bleed, Burn, Slow, Confuse, Root, Shock, Vulnerable, Defense Down, Attack Up, Fortify.
    *   **Summoning:** Certain abilities can summon minions (defined in `js/data.js`) which join the battle.
    *   **Note on Specific GDD Ability Triggers:** The `docs/gdd.md` ("Auto-Battle Scene" section) describes specific conditional logic for some passive hero abilities (e.g., Warrior's Fortify) and weapon effects (e.g., Iron Sword's Cleave). This highly specific conditional logic is **not explicitly observed** in `BattleScene.js`'s main turn execution, which primarily focuses on the active equipped ability. This suggests a simplification in the prototype or that these passives are intended to be represented by the stat bonuses or the nature of the active ability chosen.
*   **Tournament Loop (`js/main.js`):**
    *   Players fight successive battles.
    *   Wins and losses are tracked.
    *   The tournament ends if the player achieves 10 wins or accumulates 2 losses.
*   **Upgrade Phase (`js/scenes/UpgradeScene.js`):**
    *   After each battle (if the tournament is not over), the player enters an upgrade phase.
    *   They are presented with a "bonus pack" of cards (quality influenced by the previous battle's outcome and total wins).
    *   Players can choose one card to replace an existing hero, weapon, armor, or ability on one of their champions.
    *   **Hero Evolution:** At certain win thresholds (1, 2, 5 wins), if the player won the last battle, their heroes may automatically evolve to the next rarity tier within their class (e.g., Common Recruit to Uncommon Soldier).
    *   **Shards & Reroll Tokens:** A simple inventory system tracks `shards` (gained from not picking cards in upgrade phase) and `rerollTokens` (gained from winning, allows rerolling upgrade pack).

## 3. Game Flow / Progression

1.  **Initial Draft (Hero 1):**
    *   Open Hero Pack -> Reveal -> Draft Hero.
    *   Open Ability Pack (class-specific) -> Reveal -> Draft Ability.
    *   Open Weapon Pack -> Reveal -> Draft Weapon.
    *   Open Armor Pack -> Reveal -> Draft Armor.
    *   Recap Champion 1.
2.  **Second Draft (Hero 2):** Same sequence as Hero 1.
3.  **Recap Champion 2.**
4.  **Start Tournament Battle.**
5.  **Battle Scene:** Combat resolves.
6.  **Post-Battle:**
    *   If tournament ends (10 wins / 2 losses): Show end screen.
    *   Else:
        *   Check for hero evolution if player won.
        *   Proceed to Upgrade Scene.
7.  **Upgrade Scene:** Player picks one card from a bonus pack to upgrade their team or takes shards. Can use a reroll token.
8.  **Loop back to Step 4 (Start Next Battle).**

## 4. User Interface (UI) / User Experience (UX)

*   **Visual Style:** Simple HTML and CSS.
*   **Card Display:** `CardRenderer.js` handles creating visual representations of cards (compact for battle, detailed for draft/recap).
*   **Battle Interface (`BattleScene.js`):**
    *   Player team on one side, enemy on the other.
    *   Health bars and energy display for each combatant.
    *   Battle log panel showing turn-by-turn actions, filterable by event type.
    *   Status effect icons displayed on cards with tooltips.
    *   Ability announcer for major actions.
    *   Visual effects for attacks, damage, status applications (e.g., "muzzle-flash", "physical-hit", "combat-text-popup").
*   **Scene Transitions:** Basic transitions between game phases (pack opening, drafting, battle, recap, upgrade).

## 5. Technical Implementation Details

*   **Platform:** Client-side JavaScript, HTML, CSS. Runs in a web browser.
*   **Structure:** ES modules. `js/main.js` is the main coordinator.
    *   `js/data.js`: Contains static arrays for `allPossibleHeroes`, `allPossibleMinions`, `allPossibleWeapons`, `allPossibleAbilities`, `allPossibleArmors`. Data is very similar to `auto-battler-react/src/data/data.js`.
    *   `js/scenes/`: Separate modules for each game state (Pack, Draft, Battle, etc.).
    *   `js/ui/`: UI helper modules like `CardRenderer.js`.
    *   `js/systems/`: Contains `EffectProcessor.js` (though its direct usage wasn't deeply explored in this pass, `BattleScene.js` handles most status logic directly).
*   **State Management:** A global `gameState` object in `js/main.js`.
*   **No Backend:** All logic and data are handled client-side. No persistent storage beyond the current session.

## 6. What Was Tried / Prototypes
*   This entire `hero-game/` project is a functional prototype demonstrating a complete game loop.
*   It explores drafting, automated combat with abilities and status effects, and a simple meta-progression (tournament with upgrades and evolution).
*   The fixed turn order described in an early GDD section was likely an even earlier concept, as the current `BattleScene.js` uses a speed-based turn queue.

## 7. Lessons Learned (Deduced)
*   **Rapid Prototyping:** Client-side JS allows for quick iteration of game mechanics without backend complexities.
*   **Core Loop Validation:** The prototype successfully validates a draft-battle-upgrade loop.
*   **Complexity Management:** Even in a client-side prototype, managing state (`gameState` in `main.js`) and the interactions between numerous scenes and game systems requires careful organization.
*   **Data Consistency:** While self-contained, the data structures in `js/data.js` show an early version of what's used in the more complex `auto-battler-react` and `backend` projects.

## 8. Connections to Other Projects
*   **Foundation for `auto-battler-react` and `backend`:** `hero-game/` likely served as an initial proof-of-concept. Many of its data structures (heroes, items, abilities) and core mechanics (energy, status effects) are mirrored or expanded upon in the other projects.
*   **Distinct Battle Logic Details:** While sharing concepts, the specific implementation of turn order and ability triggers in `hero-game/js/BattleScene.js` differs in some details from `auto-battler-react/src/hooks/useBattleLogic.js` and `backend/game/engine.js`.

## 9. Future Ideas / Potential Improvements (from `docs/technical_overview.md`)
*   Introduce a backend for persistent storage or matchmaking.
*   Break large modules into smaller units.
*   Add tests for combat logic.
*   Consider using a framework (React, Vue) for more complex UI if expanding this specific codebase (though `auto-battler-react` already does this).
*   Implement the more specific conditional ability/weapon triggers detailed in `docs/gdd.md` if desired for more tactical depth.

This GDD for `hero-game/` is now created.
I will now proceed to the Proof of Concept files: `poc.html`, `poc2`, and `poc3.html`.
