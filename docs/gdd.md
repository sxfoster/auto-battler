# Iron Accord – Game Design Document (GDD)

## Game Overview
**Title:** Iron Accord

**Genre:** Text-Based TTRPG Survival RPG

**Platform:** Discord (bot-driven)

**Backend:** PHP + MySQL

**Frontend:** Discord with an optional React client

**AI/LLM Use:** Local LLM (e.g. DeepSeek) provides narrative text and decision logic

**Summary**
Iron Accord is a survival-focused, TTRPG-inspired world delivered through Discord. Players take the role of survivors in a post-robot-apocalypse setting. Two factions remain:

- **Iron Accord:** Steampunk inspired, shuns technology, centered in the city of Brasshaven.
- **Neon Dharma:** Cyberpunk themed, embraces advanced tech, based in the ruins of Hong Kong.

## Core Philosophy
There is no middle ground. The factions are ideologically opposed and players must pick a side at character creation. Switching factions is not allowed. This divide informs mechanics, lore and player identity.

## Faction: Iron Accord
- **Aesthetic:** Steampunk, brass machinery and rugged engineering.
- **Beliefs:** Technology caused the fall. Strength, faith and labor will rebuild humanity.
- **City:** Brasshaven – sprawling, layered and powered by giant steam engines.
- **Systems:** Zeal trials, inquisition judgments and mechanical faith orders.

## Core System Structure
### Classless System
No locked classes. Player builds emerge from a combination of stats, skills and gear.

### Survival-Centered Progression
Characters must eat, drink, rest and repair equipment. Failure imposes real penalties such as debuffs and loss of progress.

## Stats
Players begin with a value of **1** in each of the six stats and choose one stat to raise by **+1**. The base cap is **10** and gear can raise it to **25**.

| Stat        | Code | Description                          |
|-------------|------|--------------------------------------|
| Might       | MGT  | Physical power, melee attacks, carry weight |
| Agility     | AGI  | Reflexes, stealth, ranged combat     |
| Fortitude   | FOR  | Endurance, resistance to hunger and fatigue |
| Intuition   | INTU | Scavenging and perception            |
| Resolve     | RES  | Willpower, morale and social checks  |
| Ingenuity   | ING  | Crafting, repairs and traps          |

### Modifier Table
| Score | Modifier |
|------:|---------:|
| 1     | -2 |
| 2–3   | -1 |
| 4–6   | +0 |
| 7–8   | +1 |
| 9–10  | +2 |
| 11–14 | +3 |
| 15–19 | +4 |
| 20–24 | +5 |
| 25+   | +6 |

## Skill System
Skills are tiered as **Trained** (+1), **Skilled** (+2) and **Mastered** (+3). They stack directly with stat modifiers. Each faction has unique versions that share mirrored mechanics but use distinct flavor.

Example Iron Accord skills:

- **Steamwright** (ING + MGT): Craft heavy equipment.
- **Zealforged Discipline** (MGT + RES): Tanking in close combat.
- **Forgeborn Grit** (FOR + INTU): Survival checks.
- **Voice of the Creed** (RES + INTU): Persuasion and faction influence.

## Execution System – “The Unseen Fate System”
Iron Accord uses a narrative-driven abstraction of a d20 mechanic. Players never see numbers; instead results appear via tiered narrative tags.

Internally the engine calculates:

```
Outcome = 1d20 + Stat + Skill + Gear
```

### Tiered Results (Iron Accord Flavor)
| Range | Tag | Description |
|-------|-----|-------------|
| Nat 1 | Catastrophic Misfire | Critical disaster |
| 2–9   | System Degraded      | Full failure |
| 10–14 | Barely Functional    | Success with compromise |
| 15–19 | Operational Success  | Solid, expected result |
| Nat 20 | Prime Execution     | Critical success with a bonus |
| 21+   | Optimal Yield        | Exceptional results with secrets |

Neon Dharma re-flavors these tags with its own terms such as “Thread Break” and “Cascade Lock.”

## Core Player Actions
- `/scavenge` — Uses INTU + Scavenging skill and gear. Determines loot and narrative tier.
- `/repair` — Uses ING + Field Engineering to restore item durability. Poor rolls may break gear.
- `/rest` — Uses FOR + Recuperation. Removes debuffs and restores skill uses. Requires food, water and safe time.
- `/aidrest` — Aids another player’s rest success. Once per mission per player.
- `/craft` — Uses ING + Steamwright with materials. Tiered results create different item quality; Prime or Optimal yields bonuses or named gear.

## Gear System
All gear has durability. Common items start around 50 durability while legendary pieces reach roughly 150. Items degrade, can break and must be repaired using tools and materials. Only the highest bonus gear applies per roll and carry weight influences performance through encumbrance.

## Death and Failure
If a player dies or fails survival requirements:

- All items, XP and discovered lore are lost.
- The character is revived in Brasshaven’s infirmary.
- Equipped items lose 5–10% durability.
- The Weary debuff is applied.

Recovery requires rest, food and water.

## Debuff System
**Weary**
- `-2` to all rolls.
- Reduced effectiveness when resting or recovering.
- Must be cleared before the player can progress further.

## Combat Structure (Semi-Idle)
Turns are timed (about one minute or 30 seconds if inactive). If players do not respond, combat proceeds in an idle-simulation style. Fights occur in Discord threads and use `/party create`, `/join` and `/leave` commands to organize groups.

## System Terminology
Certain tabletop terms are replaced with unique phrasing:

| Legacy Term       | Replaced With       |
|-------------------|--------------------|
| Roll (d20)        | Unseen Fate / Execution Tier |
| Modifier          | Calibration Bonus / Precision Offset |
| Critical Success  | Prime Execution |
| Critical Failure  | Catastrophic Misfire |
| DC                | Execution Threshold |
| Rest              | Recovery Cycle |
| Skills            | Crafts / Doctrines / Disciplines |

## Bot Architecture
The entire game operates through Discord bot commands. The backend uses PHP with MySQL, while optional React components provide a web client. All modifiers and rolls occur server-side, and narrative text may be generated by a local LLM.

Main commands include `/scavenge`, `/repair`, `/rest`, `/aidrest`, `/craft`, `/mission` and `/party`.

## Long-Term Content Pipeline
- PvP focused on counter-specialization.
- Permanent lore discoveries via codex entries.
- Crafting mastery leading to unique legendary items.
- Dynamic seasonal arcs.
- Optional esports-like events in balanced arenas.

## Conclusion
Iron Accord delivers a high-fidelity, immersive TTRPG experience through a text-first survival system. The design intentionally avoids direct references to proprietary tabletop mechanics while still capturing the complexity of classic games.
