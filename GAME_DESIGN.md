# 🧭 Survival Dungeon CCG Auto-Battler — Game Design Document (GDD)

This living document describes the intended gameplay systems and data flow for
the project. Refer to the codex files in [`docs/`](docs) for detailed lists of
playable classes and enemy archetypes.

## Table of Contents

- [Game Concept](#game-concept)
- [Combat System](#combat-system)
- [Card System](#card-system)
- [Crafting System](#crafting-system)
- [Economy](#economy)
- [Classes & Roles](#classes--roles)
- [Enemy Design: Fungal Depths](#enemy-design-fungal-depths)
- [Encounter Flow](#encounter-flow)
- [Core Data Models](#core-data-models)
- [Biome Synergy Bonuses](#biome-synergy-bonuses)
- [Floor-Wide Dynamic Events](#floor-wide-dynamic-events)
- [Combo-Aware Enemy AI](#combo-aware-enemy-ai)
- [Party Setup & Drafting](#party-setup--drafting)
- [Implementation Notes](#implementation-notes)

## 🎯 Game Concept

A **tactical survival dungeon crawler** built on **collectible card game (CCG)** mechanics and **auto-battler combat**.  
Players control a party of **1–5 characters**, assigning **up to 4 ability cards per character**, and guide them through procedurally generated **biome-themed dungeons** while managing **survival constraints**: Hunger, Thirst, and Fatigue.

- Every mechanic, item, action, or ability is implemented via **cards**.
- Players earn, craft, trade, and upgrade cards using a **player-driven economy** with a global **auction house**.
- Dungeons focus on **strategy, endurance, and preparation**, rather than reflex-based gameplay.

---

## ⚔️ Combat System

### 🔁 Core Combat Loop

- Players assign up to **4 ability cards** per character pre-combat.
- At the start of each battle, a character draws **two** of those cards to form their initial hand.
- Characters act **automatically** in combat based on AI, speed, and context.
- Combat is resolved in **turns**, ordered by each unit’s `SpeedModifier`.

### Combat Flow Diagram

```
+-------------------------+
|      START OF TURN      |
+-------------------------+
           |
           v
+-------------------------+
| Determine Unit Order    | (Based on SpeedModifier)
+-------------------------+
           |
           v
+-------------------------+
|   Unit's Action Phase   |
| (Execute Assigned Card) |
+-------------------------+
           |
           v
+-------------------------+
| Card Effects Applied    |
| (Damage, Heal, Buffs,   |
|  Debuffs, Status Effects)|
+-------------------------+
           |
           v
+-------------------------+
| Check for Combat End    |
| (All enemies defeated / |
|  All party members down)|
+-------------------------+
           |
           v
+-------------------------+
|   END OF TURN / LOOP    |
+-------------------------+

Status Effects: Applied during 'Card Effects Applied' phase.
              Can tick at start/end of unit's turn or on specific triggers.
```

### 🎴 Card Execution

- All cards consume **Energy** and may have **cooldowns**.
- Characters regenerate a small amount of Energy at the start of their turn.
- After each battle, all party members gain:
  - **+1 Fatigue**
  - **+1 Hunger**
  - **+1 Thirst**

---

## 📦 Card System

### 🧱 Card Categories

- **Ability Cards** — Used in auto-battles; cover attacks, buffs, heals, debuffs, and utility.
- **Equipment Cards** — Grant passive bonuses or enable specific card usage.
- **Ingredient Cards** — Collected from exploration/monsters, used in crafting.
- **Food/Drink Cards** — Restores Hunger/Thirst and may grant temporary buffs.
- **Elixir Cards** — Crafted potions with temporary dungeon-only passives.
- **Utility Cards** — Tools like traps, repair kits, campfires, etc.

### ⚖️ Role & Class Restrictions

- Each **Ability Card** has a `roleTag` and optional `classRestriction`.
- Cards used **outside the correct role** suffer a **-75% penalty** to effectiveness.
- Cards used by the **correct class** may unlock bonus effects or synergies.

### 🧪 Card Rarity & Scaling

- Rarities: **Common → Uncommon → Rare → Legendary** (Note: 'Rare' and 'Legendary' not yet observed in `cards.js` or `recipes.js` examples, only 'Common' and 'Uncommon'.)
- Higher rarities unlock at **character levels** (Lv 1–3: Common, Lv 10: Legendary). [Mechanism for level-based rarity unlocking not detailed in provided system files]
- Cards are upgradeable via **crafting fusion** (e.g., `flame_sword` from `iron_sword` in `recipes.js`) or dungeon achievements.

---

## 🛠️ Crafting System

### 🎓 Crafting Professions

- **Cooking** — Creates Food & Drink Cards (restores stats, grants buffs)
- **Smithing** — Upgrades base equipment (e.g., sword → flame sword)
- **Alchemy** — Creates Elixirs and Utility Cards

Each profession has a **level 1–10 progression system** (`crafting.js` supports levels up to 10) with rewards such as:

- Higher crafting success rate [Assumed, not explicitly coded in `crafting.js` success logic]
- Discovery of secret recipes (`crafting.js` handles `newRecipeDiscovered`)
- Access to **exclusive** profession-only cards [Mechanism for profession-exclusive cards not detailed in `crafting.js`]
- “**Crafted by [Player]**” tags on Auction House listings [Not observed in core system files]

### 🔮 Magical Pouch System

- Players drag up to **5 cards** into the pouch.
- No external crafting tools required.
- If a valid recipe is not matched, the craft attempt can fail (returns `success: false, result: null` as per `crafting.js`).
- Recipes are:
  - **Discoverable through experimentation**
  - **Upgradeable** through repeat crafting or fusion

---

## 💰 Economy

### 💵 Currency

- **Gold** — Earned from dungeons, quests and the sale of common goods. Used primarily in the Town Marketplace and for lower tier items.
- **Guild Credits** — Earned through guild commissions, raids and investments. Required for high tier items and all Guild Exchange transactions.

### 🛒 Market Systems

1. **Town Marketplace** — Basic starter items and common cards. Uses **Gold** only and has limited stock that periodically refresishes. (`market.js` item listings depend on `currencyType` specified in data; no code enforces Gold-only for Town market, but this may be a data convention.)
2. **Black Market** — Offers rare or cursed cards with time limited rotations. Accepts either currency. (Depends on `currencyType` of listed items in `market.js`.)
3. **Guild Exchange** — Player run listings restricted to guild members. All trades consume **Guild Credits**. (`market.js` `listGuildItem` function hardcodes 'GuildCredit'.)
4. **Auction House** _(Player Economy)_ — Global bidding system for crafted and looted cards. Common items use **Gold** while higher rarities require **Guild Credits**. (`market.js` does not currently implement logic to enforce specific currencies based on item rarity in auctions; currency is determined at time of listing.)

Crafting recipes consume currency based on rarity and profession expertise (`crafting.js` checks `recipe.cost` which includes currency type and amount). Loot drops award Gold and occasionally Guild Credits (`postBattle.js` `generateCurrencyReward`), ensuring a steady flow of money into the economy while keeping high tier currency scarce.

---

## 🧑‍🤝‍🧑 Classes & Roles

### 🎭 Roles

- **Tank** — Draw aggro, soak damage, protect
- **Healer** — Restore HP, cleanse debuffs
- **Support** — Buff, control tempo, extend combos
- **DPS** — High single-target or AoE damage

### 🔖 Example Classes by Role

- **Tank**: Guardian, Warrior, Runestone Sentinel
- **Healer**: Cleric, Herbalist, Bloodweaver
- **Support**: Bard, Chronomancer, Totem Warden
- **DPS**: Blademaster, Wizard, Shadowblade, Ranger, Pyromancer

Each class has access to:

- **Core Cards** (all roles)
- **Role Cards**
- **Class-Specific Cards**

---

## 🧟 Enemy Design: Fungal Depths

| Enemy           | Type       | Abilities                                           |
| --------------- | ---------- | --------------------------------------------------- |
| Rotgrub Swarm   | Creature   | Bite Swarm (DoT), Burrow Latch (latched DoT)        |
| Spore Witch     | Demi-human | Spore Veil (miss chance), Heal Fungus               |
| Myconid Brute   | Creature   | Fungal Slam (knockback), Thick Hide (damage resist) |
| Mushroom Shaman | Demi-human | Mind Spore (slow), Hallucinate (confuse)            |

---

## 🧭 Encounter Flow

1. **Card Assignment Phase** – Player equips cards to each character
2. **Enter Dungeon** – Procedural biome floors generated
3. **Navigate Map** – Nodes may present combat, loot, random events, rest spots or traps
4. **Combat Phase** – Auto-battle executes based on speed and card AI logic
5. **Post-Battle** – Gain loot, fatigue, hunger, thirst
6. **Rest** – Use Food/Drink to recover, apply buffs
7. **Continue or Exit** – Players may advance deeper or retreat to reset

---

## 🧩 Core Data Models

Includes detailed field names for all card, character, enemy, profession, and recipe types. [Omitted here for brevity; maintained in backend schema]

---

## 🌍 Biome Synergy Bonuses

Each dungeon biome enhances its native enemies with unique, passive bonuses that reflect the biome’s thematic identity and difficulty curve. These bonuses are automatically applied to all enemies spawned within the biome.

### Biome Bonus Examples

- **Fungal Depths**: Poison effects last +1 turn (`biomes.js`: `EffectModifier` for 'Poison', `duration: 1`). First debuff applied to any monster has a 50% chance to fail (`biomes.js`: `Trigger` for 'FirstDebuffResist', `chance: 0.5`).
- **Frozen Bastion**: All enemies gain +1 SpeedModifier (`biomes.js`: `StatModifier` for 'speed', `value: 1`, `target: 'all'`). Defensive spells reduce +10% extra damage (`biomes.js`: `EffectModifier` for 'Defensive', `potency: 0.1`).
- **Inferno Ruins**: Burn effects can stack one additional time (`biomes.js`: `EffectModifier` for 'BurnStack', `value: 1`). Enemies ignore first tick of DoTs (`biomes.js`: `Trigger` for 'IgnoreFirstDotTick'). Enemies also take 50% less fire damage and deal +1 fire damage (`biomes.js`: `StatModifier` for 'fireResist' and 'firePower').
- **Thornwild Grove**: Root effects gain +1 duration (`biomes.js`: `EffectModifier` for 'Root', `duration: 1`). Regeneration heals +1 per turn (`biomes.js`: `EffectModifier` for 'Regeneration', `value: 1`).
- **Ashen Necropolis**: Undead are immune to fear/charm (`biomes.js`: `Immunity` for 'fear', 'charm', `target: 'undead'`). 10% chance to revive with 20% HP (`biomes.js`: `Trigger` for 'Revive', `chance: 0.1, hp: 0.2`, `target: 'undead'`).
- **Crystalline Hollow**: All enemies have a 10% chance to reflect magic damage (`biomes.js`: `Trigger` for 'MagicReflect', `chance: 0.1`, `target: 'all'`). Caster enemies gain +1 energy every 2 turns (`biomes.js`: `ResourceChange` for 'energy', `interval: 2, value: 1`, `target: 'caster'`).
- **Sunken Deep**: Melee attacks vs aquatic enemies have -15% accuracy (`biomes.js`: `EffectModifier` for 'MeleeAccuracy', `value: -0.15`, `target: 'aquatic'`). All enemies below 50% HP gain +1 SpeedModifier (`biomes.js`: `Trigger` for 'LowHpSpeed', `value: 1, threshold: 0.5`, `target: 'all'`).
- **Obsidian Reach**: All enemies have a 20% chance to evade AoE (`biomes.js`: `Trigger` for 'EvadeAoE', `chance: 0.2`, `target: 'all'`). Shadow-type enemies' shadow abilities cost 0 energy but may cause self-debuffs (`biomes.js`: `EffectModifier` for 'ZeroCost', `selfDebuff: true`, `target: 'shadow'`).

---

## 🌋 Floor-Wide Dynamic Events

Dynamic dungeon events are randomly assigned to certain floors to alter combat flow, increase variety, and force adaptive strategy.

### Examples by Biome

- **Fungal Depths – Spore Bloom**: +15% miss chance for 3 turns. (Matches `events.js`: `id: 'spore-bloom'`, `effectDetails: { chance: 0.15, turns: 3 }`)
- **Frozen Bastion – Mana Freeze**: Halved energy regen. (`events.js`: `id: 'mana-freeze'`, `effectDetails: { multiplier: 0.5 }`, `duration: 'floor'`. GDD's "for first 3 turns" is not specified in code.)
- **Inferno Ruins – Volcanic Eruption**: A random party member takes 1 damage every 4 turns. (`events.js`: `id: 'volcanic-eruption'`, `effectDetails: { interval: 4, value: 1, target: 'party' }`. GDD's "random burn" differs from code's "1 damage".)
- **Thornwild Grove – Vine Wrath**: Increased chance of being rooted (20%). (`events.js`: `id: 'vine-wrath'`, `effectDetails: { chance: 0.2 }`. GDD's "10%" differs from code's 20%.)
- **Ashen Necropolis – Haunting Echoes**: 30% chance for first card each turn to cast twice. (Matches `events.js`: `id: 'haunting-echoes'`, `effectDetails: { chance: 0.3 }`)
- **Crystalline Hollow – Arcane Overload**: Abilities cost +1 energy to play. (`events.js`: `id: 'arcane-overload'`, `effectDetails: { amount: 1 }`. GDD's "+25% spell damage, 15% fumble risk" is different.)
- **Sunken Deep – Crashing Wave**: Water surges push combatants, reducing melee accuracy by 10%. (`events.js`: `id: 'crashing-wave'`, `effectDetails: { value: -0.1 }` for melee accuracy. GDD's "All frontliners pushed back every 5 turns" is different.)
- **Obsidian Reach – Whispers in the Dark**: Occasionally confuses adventurers into skipping a turn (10% chance). (`events.js`: `id: 'whispers-in-the-dark'`, `effectDetails: { chance: 0.1 }`. GDD's "Random cooldowns increased each round" is different.)

Events are shown at the top of the combat UI and may be toggled for added challenge or disabled in standard runs.

---

## 🤖 Combo-Aware Enemy AI

Enemies with combo-aware AI can sequence their actions intelligently, using starter and finisher cards within the same combat window or across units in the same enemy party.

### Features

- Tracks last used card and synergy tags.
- Prioritizes combo finishers if a valid setup occurred within X turns.
- Weighs target selection based on status (e.g., marked, poisoned, stunned).
- Elite groups may share synergy memory for group-wide combos.

### EnemyAIProfile Additions

```csharp
public bool enableComboAwareness; // Present in `enemies.js` aiProfile
public int comboWindowTurns = 2; // Present in `enemies.js` aiProfile
public bool prefersFinisherChains; // Present in `enemies.js` aiProfile
public string[] preferredComboTags; // Used by `enemyAI.js` logic, but not currently populated in `enemies.js` aiProfile data.
```

### Sample Chain

- **Turn 1**: Spore Witch casts "Mark Target" (isComboStarter, synergyTag: Execute)
- **Turn 2**: Mushroom Shaman casts "Shadow Execution" (isComboFinisher, synergyTag: Execute)

---

## Party Setup & Drafting

Before entering the dungeon, players choose their party composition in a
dedicated setup screen. Available classes can be rerolled and each selected
character drafts a small hand of Level&nbsp;1 ability cards. These early choices
set the tone for the run and encourage experimentation.

Codex files in the repository provide reference tables for all classes and
enemies at Level&nbsp;1.

---

## Implementation Notes

The repository contains an early prototype of the systems described above. Many features are stubbed out or simplified (e.g., market logic, some event effects in `floorEvents.js` are placeholders). However, core systems like crafting, biome effects, basic enemy AI, and card definitions show functional logic. The React client now includes an interactive dungeon map component with a battle overlay. Economy helpers (`market.js`) and combo-aware enemy AI (`enemyAI.js`) are available under `shared/systems`. Refer to the source code for the current state of the card system and combat logic.

### Game Architecture Diagram

```
+-----------------+     +-----------------+     +-----------------+
|     Client      |<--->|     Shared      |<--->|      Game       |
| (React UI)      |     | (Models, Utils) |     | (Phaser 3)      |
+-----------------+     +-----------------+     +-----------------+
       ^                                                 ^
       |                                                 |
       +----------------localStorage---------------------+
                       (partyData, progress)
```

## Data Flow

Data exchange between the React client and the Phaser game primarily utilizes the browser's `localStorage`.

1.  **Party Finalization (Client to Game):** When the player finalizes their party in the React UI and clicks "Start Game," the party composition (`partyData`) is written to `localStorage`.
2.  **Dungeon Progress (Client/Game):** Basic dungeon progress is also saved to `localStorage`, allowing both the client and game to be aware of the current state if the session is interrupted or reloaded.
3.  **Game Initialization (Game from localStorage):** When the Phaser game scenes load, they read `partyData` and any relevant dungeon progress from `localStorage` to set up the map, characters, and ongoing state.
4.  **Shared Code (Client & Game):** Both the client and game packages can import and use common models, utilities, and system logic (e.g., economy helpers, AI logic) directly from the `shared` package. This ensures consistency in data structures and core game rules.

## Contributing

If you would like to propose changes to the game design, please start by
opening an issue in the repository. Feedback and pull requests are
appreciated.

_Last updated: 2025_
