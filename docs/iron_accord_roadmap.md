# Iron Accord Development Roadmap

## Overview
This roadmap outlines the high-level and detailed phases of development for **Iron Accord**, a text-driven survival TTRPG hosted on Discord. It covers project phases, goals, technical responsibilities, and integration timelines.

## Phase Breakdown

### Phase 1: World & System Design (✅ Complete)
- Core Lore: Iron Accord vs. Neon Dharma
- Stat System: 6 core stats + gear scaling
- Skill System: Tiered, faction-exclusive, stacking
- Execution System: Abstracted d20 → "Unseen Fate System"
- Roll Tiers & Flavor: Unique narrative per result, per faction
- Item Durability: Breakdown mechanics, repair logic
- Survival Systems: Food, thirst, rest, repair requirements
- Debuff & Recovery Systems
- Classless, gear-driven progression

### Phase 2: Technical Planning (✅ Complete)
- Command Mapping: `/scavenge`, `/repair`, `/rest`, etc.
- Backend Design: PHP + MySQL logic framework
- Bot Layer: Discord bot to connect logic → output
- Semi-Idle Combat Flow: Action timers and fallback logic
- Party System Design: `/party` commands and state sync
- Scalable flavor text system using execution tiers

### Phase 3: Prototyping & MVP Bot
**Backend (PHP/MySQL):**
- Action resolver (roll engine)
- Inventory & gear storage
- User state tracking (fatigue, encumbrance, debuffs)
- Faction-lock & XP tracking

**Discord Bot:**
- Command parser
- Response formatting engine
- Channel/thread isolation per mission
- Cooldown & timeout handling

**Narrative System:**
- Dynamic message renderer (by faction & tier)
- Basic Codex system
- Item flavor pool integration

### Phase 4: Survival Mechanics & Missions
- Resource usage logic: thirst, hunger, weight
- Debuff propagation & cure tracking
- Scavenging loot tables & mission zones
- Item crafting system
- Field repair logic with failure states
- `/mission` creation tool
- Faction-themed NPC generation
- Codex discovery hooks & narrative ties

### Phase 5: Core Content Layer
- Create 20+ loot items (tiered)
- 10+ tools and weapons with durability
- 3+ reusable mission templates
- 10+ Codex entries with narrative tiering
- Dialogue flavor pools for Iron Accord
- 3+ story-based mission arcs

### Phase 6: Worldbuilding & Expansion
- Map district interactions (Brasshaven zones)
- Implement `/camp` survival loop
- Travel risk system (environment-based)
- City economy prototype (barter, repair fees, vendors)
- Rest facilities, temples, and faction housing
- Begin Neon Dharma implementation

### Phase 7: PvP & Seasonal Systems
- Asynchronous PvP prototype
- Balanced arena-style fights (gear-normalized)
- Faction resource war events
- Seasonal arcs with timed missions
- Leaderboards (lore-tied reward cycles)

## Project Management & Pipeline Notes
- Narrative flavor and mechanics are entirely lore-driven
- All dice logic is hidden and abstracted
- Survival is the natural time gate — no artificial energy/timer
- Initial deployment is Discord-only with optional React-based Codex browser
- Content expands via Codex unlocks, mission discoveries, and updates

## Current Documentation Assets
- ✅ Game Design Document (System)
- ✅ Lore Design Document (Iron Accord)
- ⏳ Neon Dharma Lore GDD (Upcoming)
- ✅ Execution Tier Narrative System
- ✅ Modular skill, stat, and item architecture

## Final Launch MVP Goals
- Full Iron Accord bot with `/scavenge`, `/repair`, `/rest`, `/craft`, `/mission`
- Functional faction lock and progression tracking
- Narrative Codex progression
- Modular skill/gear/build systems
- Basic PvP or survival leaderboard trial

Let me know when you're ready to move into engineering task breakdowns, GitHub issue scaffolding, or Neon Dharma design.
