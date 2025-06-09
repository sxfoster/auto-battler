# Game Design Document (MVP) - Final
*Last Updated: June 7, 2025*

## 1. High-Level Concept

* **Working Title:** Dungeon Delve: Heroes & Hearth
* **Genre:** Party-Based Roguelike Auto-Battler with Town Management.
* **Core Theme:** Classic High Fantasy with a survivalist approach, inspired by the anime *Delicious in Dungeon*.
* **Elevator Pitch:** Players manage a roster of heroes from a central town hub, sending them on expeditions into dangerous, biome-specific dungeons. Before each run, the player drafts a party and their starting abilities. Inside the dungeon, the party faces random encounters resolved through automated, card-based combat. The core gameplay focuses on pre-run strategy and party composition, with long-term progression centered on upgrading the town and unlocking new potential for future runs.

## 2. The Core Gameplay Loop

The gameplay is structured around a run-based loop of deep preparation followed by a perilous expedition.

1.  **The Town Hub:** The player's persistent base of operations. This is where meta-progression occurs. The player manages their full roster of unlocked heroes and spends **Gold** earned from expeditions on permanent upgrades.
2.  **The Pre-Run Phase (Party Setup):** Before each new expedition, the player enters a dedicated setup phase to assemble their party and strategy for that specific run.
3.  **The Dungeon Expedition:** The player's chosen party delves into a dungeon, facing random encounters (battles, events, traps) with the goal of defeating a final boss.
4.  **The Return:** The party returns to the Town Hub after the run is over (either by victory or defeat), bringing back rewards like Gold to be used for the next cycle of preparation.

## 3. The Pre-Run Phase: Party Setup Flow

This section details the step-by-step user flow for the pre-run setup phase.

### 3.1 Class Drafting
The player is presented with a random selection of available hero classes. They have a limited number of "Rerolls" to generate a new selection. The player chooses heroes for their party for this specific run.

### 3.2 Initial Deck Building
For each selected hero, the player must construct a small starting "Battle Deck" (e.g., 2 cards). They draft these cards from a pool of that hero's available base abilities.

### 3.3 Party Summary & Confirmation
A final summary screen displays the selected party, their chosen cards, and average stats. The player can make final edits or confirm their choices. From here, they can either begin the dungeon expedition or cancel and return to the Town Hub.

## 4. The Combat Phase: Battle Mechanics (MVP Ruleset)

This section defines the official rulebook for the `battleSimulator`.

* **Unit Stats (MVP):** Every unit is defined by three core stats:
    * **HP:** Health points. A unit is defeated when this reaches 0.
    * **Energy:** A personal resource pool for playing cards.
    * **Speed:** Determines the turn order for all units in combat.

* **Party Size:** The maximum number of units a player can have in their party is 5.

* **Turn Order:** At the start of each round of combat, all units are sequenced from highest **Speed** to lowest.

* **Resource System:**
    * Each unit has its own **Energy** pool.
    * At the start of its turn, a unit gains **1 Energy**.
    * Energy can be saved across turns to play more expensive cards.

* **Actions & Cards:**
    * All actions are driven by cards. A card's text dictates its Energy cost, target, and full effect (damage, status effects, etc.).
    * The foundational card types are: **Damage**, **Defensive**, and **Control**.

* **Starting Hand:** At the beginning of the first combat encounter, each character draws a set number of cards (e.g., 2) from their assigned Battle Deck to form their starting hand.

* **Victory & Loss Conditions:** The battle ends when all units on one side have been defeated. The last team standing is the winner.

## 5. Keyword and Stat Glossary

This section defines key terms and stats, including those planned for future implementation.
*Note: Items marked with an asterisk (*) are part of the core design vision but their exact mechanics require future design decisions.*

* **Shield:** The primary defensive mechanic. It provides a pool of temporary HP that is depleted before a unit's main HP.
* **Buff:** A positive status effect granted to an allied unit.
* **Sleep:** A control status effect that prevents a unit from taking its turn.
* ***ATK (Attack):** A unit stat intended to influence damage output.
* ***Defense:** A unit stat intended for damage mitigation, likely synonymous with Armor.
* ***Initiative:** A stat that influences turn order. Its relationship to the base `Speed` stat must be defined.

## 6. Future Vision

While the MVP is focused on the core loop, the design will be built to support future expansion into:
* A full town management system with crafting of food, drink, and new cards.
* Deeper survival mechanics that are tracked during a dungeon run.
* A wider variety of non-combat random encounters and story-based events.
