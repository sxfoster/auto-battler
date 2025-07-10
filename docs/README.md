# Documentation

The original design documents have been archived in [docs/archive](archive/).
The new game design will be documented in [gdd.md](gdd.md).

Additional worldbuilding details for the Iron Accord project can be found in
[iron_accord_roadmap.md](iron_accord_roadmap.md).

Background lore for the Iron Accord has been split into several focused files:
- [lore/world_overview.md](lore/world_overview.md)
- [factions/iron_accord.md](factions/iron_accord.md)
- [factions/neon_dharma.md](factions/neon_dharma.md)
- [factions/npc_groups.md](factions/npc_groups.md)
- [locations/brasshaven.md](locations/brasshaven.md)
- [lore/codex_of_embers.md](lore/codex_of_embers.md)
- [lore/mythology_of_metal.md](lore/mythology_of_metal.md)
- [lore/story_design_principles.md](lore/story_design_principles.md)
- [lore/narrative_hooks.md](lore/narrative_hooks.md)

The original combined document lives in
[archive/iron_accord_lore_gdd.md](archive/iron_accord_lore_gdd.md). The
opposing faction's design is still covered in
[neon_dharma_lore_gdd.md](neon_dharma_lore_gdd.md).

The MVP story walkthrough, including mission flow and Codex integration, is
documented in [iron_accord_mvp_story.md](iron_accord_mvp_story.md).
The phased rollout strategy is outlined in [iron_accord_mvp_rollout.md](iron_accord_mvp_rollout.md).

The dual LLM architecture powering narration and rules logic is documented in [dual_llm_engine.md](dual_llm_engine.md).

The snarky shopkeeper NPC is detailed in [edraz_character_bible.md](edraz_character_bible.md).


## Mission Data Fields

Mission JSON files are stored in `discord-bot/src/data/missions`. Each mission defines several rounds of player choices. Choice objects support additional fields used during combat:

- `combat` – boolean indicating that selecting the choice triggers a combat roll.
- `dc` – numeric difficulty class for that roll.
- `outcomes` – maps result tiers (e.g. `Operational Success`, `System Degraded`) to either `loot` or `penalty` data.

An example snippet:

```json
{
  "text": "A",
  "combat": true,
  "dc": 12,
  "outcomes": {
    "Operational Success": { "loot": { "gold": 1 } },
    "System Degraded": { "penalty": { "durability_loss": 5, "add_flag": "Injured" } }
  }
}
```
