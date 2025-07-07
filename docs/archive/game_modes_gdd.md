# Game Modes Design Document

## 1. PvP Tournament Flowchart with XP System
* **Players:** 20 players (Champions and Monsters).
* **Format:** 1v1 matches in a round-robin / elimination hybrid.
* **Elimination Condition:** 2 losses = elimination.
* **Duration:** Up to 10 rounds total until 1 champion remains.
* **Starting State:** All players start at Level 1 with basic decks.

### 1.1. Tournament Progression
* **Round 1:**
    * 10 matches result in 10 winners moving to winners' bracket and 10 losers to losers' bracket.
    * All players earn XP and rewards.
* **Round 2:**
    * Winners fight winners.
    * Losers fight losers (1st elimination possible).
    * 2 losses = elimination.
* **Rounds 3-10:**
    * Continue matching winners with winners and losers with losers.
    * Players who lose a second time are eliminated.
    * Tournament continues until 1 player remains undefeated or is the last survivor.

### 1.2. XP Rewards Per Match
* **Result:**
    * Win: +60 XP
    * Loss: +30 XP

### 1.3. XP Progression Table
* **Goal:** A player with consistent wins (8-10 victories) will reach Level 10 by the final round. Players who lose early will still progress but at a slower XP rate.
* **Table:**

| Level | Total XP Required | XP to Next Level |
| :---- | :---------------- | :--------------- |
| 1 | 0 | 60 XP |
| 2 | 60 XP | 70 XP |
| 3 | 130 XP | 80 XP |
| 4 | 210 XP | 90 XP |
| 5 | 300 XP | 100 XP |
| 6 | 400 XP | 110 XP |
| 7 | 510 XP | 120 XP |
| 8 | 630 XP | 130 XP |
| 9 | 760 XP | 140 XP |
| 10 | 900 XP | Max Level |

### 1.4. Post-Match Rewards
* Gold and random cards are awarded based on player level.
* Shops are available between rounds for deck upgrades.

### 1.5. Deck Reset Each Tournament
* All players reset to Level 1 at the start of each tournament.
* Players must rebuild their decks from scratch as they progress.

### 1.6. End Condition
* The last undefeated player or the final remaining player is declared Champion.

### 1.7. Optional Additions
* Streak rewards for players on 3+ win streaks.
* Optional bonus XP for special objectives (e.g., perfect victory without taking damage).

### 1.8. Scalability
* Designed for scalability: Expandable to larger brackets (32 or 64 players) with this system.

## 2. PvP Stat Framework
* **Base Concepts:**
    * Speed affects initiative order.
    * HP scales with role (tanks will have more HP, assassins less).
    * Each level-up will offer improvements to HP, energy, or speed.

### 2.1. Champions Base Stats

| Champion Class | Starting HP | Speed |
| :------------- | :---------- | :---- |
| Warrior | 18 | 3 |
| Bard | 14 | 5 |
| Barbarian | 20 | 3 |
| Cleric | 16 | 4 |
| Druid | 15 | 4 |
| Enchanter | 14 | 4 |
| Paladin | 18 | 3 |
| Rogue | 13 | 6 |
| Ranger | 14 | 5 |
| Sorcerer | 13 | 4 |
| Wizard | 13 | 4 |

### 2.2. Monster Base Stats

| Monster Archetype | Starting HP | Speed |
| :---------------- | :---------- | :---- |
| Brute | 20 | 3 |
| Venomspawn | 15 | 4 |
| Necromancer | 16 | 4 |
| Shadowfiend | 13 | 6 |
| Blood Witch | 15 | 4 |
| Infernal Beast | 17 | 4 |
| Frost Revenant | 16 | 3 |
| Grave Titan | 22 | 2 |
| Void Horror | 15 | 4 |
| Storm Serpent | 14 | 6 |
| Plague Bringer | 16 | 4 |

### 2.3. Level-Up Matrix (Level 1 to Level 10)
* All Classes & Monsters follow this general structure:

| Level | HP Bonus | Speed Bonus (Cap) | Energy Gain (Cap) |
| :---- | :------- | :--------------------------- | :---------------- |
| 1 | Base HP | Base Speed | 1 |
| 2 | +2 HP | | |
| 3 | +2 HP | | +1 (max 2) |
| 4 | +2 HP | +1 speed (optional for agile classes/monsters) | |
| 5 | +2 HP | | |
| 6 | +2 HP | | +1 (max 3) |
| 7 | +2 HP | +1 speed (optional again for agile types) | |
| 8 | +2 HP | | |
| 9 | +2 HP | | +1 (max 4) |
| 10 | +2 HP | +1 speed (final cap based on archetype) | |

* **Optional Speed Scaling Rules:**
    * **Tanky Classes (e.g., Warrior, Paladin, Brute, Grave Titan):** +1 speed cap out at Level 7.
    * **Agile Classes (e.g., Rogue, Ranger, Shadowfiend, Storm Serpent):** +1 speed gains can occur earlier (Level 4 and 7), allowing them to outpace slower archetypes.
* **By Level 10:**
    * Champions/monsters will gain +18 HP total (up to +20 with some variations).
    * Energy maxes at 4.
    * Speed increases +1 to +3 depending on archetype.

### 2.4. PvP Role Tiering for Champions & Monsters
* To help balance PvP, we can assign roles to each class/archetype so players understand how each performs in typical 1v1 or team fights.

#### 2.4.1. Tiered Role Breakdown
* **1. Tanks / Bruisers (High HP, Sustain, Defense Tools)**
    * **Champion:** Warrior, Paladin, Barbarian
    * **Monster:** Brute, Grave Titan, Frost Revenant
    * **Traits:** High base HP (18-22). Access to damage reduction, defense boosts, or self-sustain. Excel at soaking damage and controlling zones.
* **2. Control / Support (Debuffs, Buffs, Crowd Control)**
    * **Champion:** Bard, Cleric, Druid, Enchanter
    * **Monster:** Necromancer, Blood Witch, Frost Revenant, Void Horror
    * **Traits:** Mid-level HP (14-16) with battlefield manipulation tools. Specialize in Fear, Roots, Slows, buffs, or healing. Often vital in team comps but can be outpaced 1v1 by burst builds.
* **3. Assassin / Burst DPS (High Damage, Low HP, Speed Focus)**
    * **Champion:** Rogue, Ranger, Sorcerer, Wizard
    * **Monster:** Shadowfiend, Storm Serpent, Infernal Beast
    * **Traits:** Lower HP (13-14) but high speed (5-6 base). Focus on burst damage or evasion stacking. Excel at eliminating control classes and healers quickly.
* **4. Hybrid Controllers (DoT / Utility DPS)**
    * **Champion:** Druid, Enchanter, Bard
    * **Monster:** Venomspawn, Plague Bringer, Void Horror
    * **Traits:** Blend damage-over-time with soft control like Poison, Disease, or hand/energy disruption. Mid-range HP and speed, but rely on attrition rather than burst.

#### 2.4.2. PvP Balance Notes
* Tanks tend to struggle vs. debuffers (e.g., Enchanters or Venomspawn), but thrive against assassins.
* Controllers can stall or disable bruisers and DPS, but risk being bursted down without support.
* Assassins dominate against low-speed support/control builds, but fold to heavy AoE pressure.
