# Iron Accord – MVP Three‑Phase Rollout Strategy

This document summarizes the staged rollout plan for the Iron Accord Discord bot. Each phase adds new features and AI integration to gradually build the game loop.

## Phase 1: Core System (Common Tier Only)
- **Objective:** Prove that the basic mission loop works and establish Codex and survival mechanics.
- **Resources:**
  - 5 scripted Codex entries
  - ~8–10 pieces of starting gear (common tier)
  - 3 fully designed missions
- **Commands:** `/mission`, `/codex`, `/inventory`, `/rest`, `/equip`
- **Tech Focus:**
  - GPT agents drive Codex, inventory, and mission logic
  - PHP/MySQL handle item stats and mission progress
  - Discord bot acts as the primary interface
  - Prototype GM commands: `/trigger`, `/fail`, `/modify`

## Phase 2: Gear & Mechanics Expansion
- **Objective:** Add reward depth and introduce crafting and durability systems.
- **Adds:**
  - Uncommon and Rare gear tiers
  - Basic crafting recipes
  - Item upgrade and repair logic
  - Durability decay with Codex‑infused flavor
  - Mission environmental modifiers (steam, gas, cold)
- **Tech Focus:**
  - GPT‑assisted item generation and dynamic loot tables
  - AI balance testing and stat/flavor synergy prompts

## Phase 3: Adaptive World & AI Layer
- **Objective:** Introduce emergent narrative elements and advanced AI features.
- **Adds:**
  - Dynamically generated missions
  - Procedural Codex entries tied to narrative arcs
  - NPC dialogue via lightweight local models
  - Visual outputs from mission logs (image generation)
- **Tech Focus:**
  - Codex agents suggest story expansions
  - GPT‑4o or local agents create item variants
  - Player choices influence generated missions
  - Begin an exportable React/WebGL frontend

## Codex Agent Integration Concepts
| GPT Agent Use Case      | MVP Phase | Tooling Suggestion                     |
|-------------------------|-----------|---------------------------------------|
| Codex entry creation    | Phase 1   | GPT‑4o or prompt‑style lore builder    |
| Item generator          | Phase 2   | Codex prompts for weapons/armor/tools |
| Dialogue/NPC assistant  | Phase 3   | GPT‑4o or local wrapper               |
| Auto‑mission designer   | Phase 3   | Task GPT agent to build mission threads|

