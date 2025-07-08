# Iron Accord MVP Story: End-to-End Walkthrough

## Engineering Reference: Quest + Codex Flow

### Player Starts
- **Faction:** Iron Accord
- **Starting Location:** Brasshaven — Tier 3 Safeforge
- **Initial Stats:** 1 point in each stat, plus 1 bonus stat
- **Neutral Gear:** patched coat, standard breather, ration x1, wrench
- **Commands:** `/start`, `/mission`, `/scavenge`, `/rest`, `/codex`, `/repair`

## Mainline Quest Flow

### Mission 1: "The Breach at Gratewall East"
**Story Summary:**
Respond to a steam burst in a lower tunnel, confront a rogue construct, and uncover failed pressure systems.

**Key Steps**
1. Navigate collapsing tunnel (AGI/INTU check)
2. Encounter Steam-Bound Construct (combat or disable)
3. Seal the pipe (FOR/ING check or party assist)
4. Retrieve a Steambound Core and pressure log

**Codex Unlocked**
- **Breath of Brass**
  - Fragment found at the breach
  - Tier 2 unlock: repair breach successfully
  - Tier 3 unlock: `/craft` steam-resistant item using core

### Mission 2: "Ash in the Reservoir"
**Story Summary:**
Investigate thermal contamination and face the Blightborn Ember, a lingering AI-flame creature.

**Key Steps**
1. Stabilize walkway or analyze boil pattern
2. Combat/contain Blightborn Ember
3. Solve valve glyph puzzle to restore cooling
4. Discover a Machine Saint and choose to restore or extract

**Codex Unlocked**
- **Ember of Guilt**
  - Fragment gained after killing or containing Ember
  - Tier 2 unlock: restore Machine Saint
  - Tier 3: requires Blight Husk + `/pray`

### Mission 3: "The Bells of Hollowgate"
**Story Summary:**
Bells toll in a derelict Forge-Cathedral where a bell-encoded mindcore calls for remembrance.

**Key Steps**
1. Decode bell tone (INTU/RES or lore skill)
2. Interact with zealots (social, intimidate, or combat)
3. Interact with the bell (listen, reject, or bind)

**Codex Unlocked**
- **Voice of the Flame**
  - Fragment from bell resonance
  - Tier 2: `/listen` or `/bind` to core
  - Tier 3: requires Faction Favor + `/resonance` chant prayer

## Optional / Dynamic Codex Sources
- **Hammer’s Voice**
  - Found during any combat with rogue Accord constructs
  - Requires: scavenge a Memory Plate, use `/analyze` on enemy corpse, survive mission without abandoning
- **Gasket Gospel**
  - Found in longplay or survival-focused missions
  - Requires: complete a mission with 3+ damaged gear, rest while Weary from hunger/thirst, interact with a Forge Altar

## Codex Unlock Logic Overview
| Codex Name     | Trigger Source                | Unlock Gates                                       |
| -------------- | ----------------------------- | -------------------------------------------------- |
| Breath of Brass| Gratewall Breach (Mission 1)  | Survive + Repair + Core Item Use                   |
| Ember of Guilt | Reservoir (Mission 2)         | Defeat/contain Ember + Restore Machine Saint       |
| Voice of the Flame | Hollowgate Bell (Mission 3) | Bell interaction + prayer or mindcore bind         |
| Hammer’s Voice | Combat loot                  | Analyze Memory Plate + complete fight              |
| Gasket Gospel  | Endurance events             | Damaged gear + Weary status + prayer rest          |

## Engineering Notes

### Missions
Each mission equals 3–4 Discord rounds, gated via `/mission` command.
Each round presents a scene description, provides 2–3 response options, and results in outcome tiers:
- Catastrophic Misfire
- System Degraded
- Operational Success
- Prime Execution
- Divine Precision

### Codex System
- Codex entries are hidden until discovered
- Three tiers: Etched Fragment, Forged Truth, Brasslocked Revelation
- `/codex` displays unlocked entries, tier status, and any usage limits (some powers are 1× per mission)

## Structural Integration

### Player Database
- `player_id`
- `faction`
- `stats`
- `gear[]`
- `codex[]` (with tier status)
- `status_flags` (weary, injured, in-mission)
- `mission_log[]`

### Mission System
- `mission_id`
- `rounds[]`
- `branch_options[]`
- `required_stats[]`
- `loot_table[]`
- `codex_triggers[]`
- `combat_trigger` (boolean)

### Roll System
Based on the hidden Unseen Fate Engine: `d20 + stat + skill + modifier`.
Execution tier determines mission output and Codex availability.
