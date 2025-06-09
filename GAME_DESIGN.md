# Game Design Document (MVP) - Final
*Last Updated: June 9, 2025*

## 1. High-Level Concept

* **Working Title:** Dungeon Delve: Heroes & Hearth
* **Genre:** Party-Based Roguelike Auto-Battler with Town Management.
* **Core Theme:** Classic High Fantasy with a survivalist approach, inspired by the anime *Delicious in Dungeon*.
* **Elevator Pitch:** Players manage a roster of heroes from a central town hub, sending them on expeditions into dangerous dungeons. Before each run, the player drafts a party and their starting abilities. The core gameplay focuses on pre-run strategy and party composition, with combat resolved through an automated, card-based system.

## 2. Core Gameplay Loop

The gameplay is structured around a precise loop of preparation, confirmation, and execution.

1.  **From the Town Hub, the player clicks "Enter Dungeon"** to begin preparations for a new run.
2.  **The player enters the Party Setup phase,** where they draft their classes and build each hero's starting "Battle Deck."
3.  Upon completion, the player clicks **"Save Party."** This saves the party configuration as the "Active Expedition Party" and returns the player to the Town Hub.
4.  The Town Hub now displays the saved party. The player can either enter the dungeon or test their new setup.
5.  When ready, the player clicks **"Enter Dungeon" again** to officially begin the expedition with the saved party.
6.  After the run ends (victory or defeat), the player returns to the Town Hub with any earned rewards (e.g., Gold) to begin the loop again.

## 3. Key Screens & UI Functions

### 3.1 The Town Hub
The central screen for meta-progression and initiating actions.
* **Enter Dungeon Button:** If no party is saved, this initiates the Party Setup flow. If a party *is* saved, this begins the dungeon expedition.
* **Test Battle Button:** Initiates a single, non-dungeon combat encounter using the currently saved party against a predefined test enemy group.
* **Other Buttons (Party, Shop, etc.):** Provide access to the game's persistent meta-progression systems.

### 3.2 The Party Setup Flow
A multi-step, pre-run preparation phase.
* **Class Drafting:** The player selects up to 5 heroes for the run from a random selection. Limited "Rerolls" are available.
* **Initial Deck Building:** For each hero, the player must construct a small starting "Battle Deck" (e.g., 2 cards). They draft these cards from a pool of the hero's available base abilities.
* **Party Summary:** A final confirmation screen where the player can review their choices before clicking "Save Party."

## 4. Core Combat Mechanics (MVP Ruleset)

* **Unit Stats (MVP):** `HP`, `Energy`, `Speed`.
* **Party Size:** Maximum of 5 heroes per party.
* **Turn Order:** Determined by each unit's `Speed` stat, from highest to lowest.
* **Resource System:** Each unit has a personal `Energy` pool, gains 1 Energy on its turn, and can save it.
* **Actions & Cards:** Actions are driven by cards with varying `Energy` costs. Card types include `Damage`, `Defensive`, and `Control`.
* **Starting Hand:** At the start of the first combat, each hero draws a set number of cards (e.g., 2) from their Battle Deck.
* **Victory Conditions:** A battle ends when all units on one side are defeated.
* **Tactical Positioning (MVP):** For the prototype, unit positioning on the pre-battle grid is for visual layout only and has no effect on targeting or mechanics. Any unit can target any other unit by default.

## 5. Keyword and Stat Glossary
*Note: Items marked with an asterisk (*) are part of the core design vision but are not yet implemented in the MVP.*

* **Shield:** Grants temporary HP that is depleted before main HP.
* **Buff / Debuff:** Positive or negative status effects.
* **Sleep:** A control effect that prevents a unit from acting.
* ***ATK (Attack):** A unit stat intended to influence damage output.
* ***Defense:** A unit stat for damage mitigation.
* ***Initiative:** A stat that influences turn order.

## 6. Future Vision
* A full town management and crafting system.
* Deeper survival mechanics during dungeon runs.
* A wider variety of non-combat random encounters.
