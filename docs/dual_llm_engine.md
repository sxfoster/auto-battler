Architectural Design Document: The Dual-LLM Engine
Date: July 8, 2025
Status: Proposed
Author: Gemini System

1. Context and Problem Statement
The core vision for Iron Accord is a living, breathing world built on the backbone of a TTRPG ruleset, where player actions have meaningful and persistent consequences. A single LLM, tasked with handling both creative, expansive narration and rapid, precise, rules-based adjudication, presents a significant architectural bottleneck.

Creative vs. Logical Conflict: Large, creative models (like Mixtral 8x7B or GPT-4o) excel at generating rich, descriptive prose but can be slow and less reliable for strict, logical tasks like damage calculation or state management.

Performance Bottleneck: A single, large model handling all tasks creates a slow interaction loop. The player must wait for the creative narration to finish before the next mechanical action can be resolved, leading to a sluggish and unresponsive gameplay experience.

Scalability Issues: As the ruleset grows in complexity, the prompt for a single "do-everything" LLM would become unwieldy, increasing the likelihood of errors and making it difficult to maintain.

2. Proposed Solution: The Dual-LLM Architecture
To address these challenges, we will implement a dual-LLM architecture that separates the responsibilities of storytelling and game mechanics. This system is composed of two specialized agents:

The "Lore Weaver" (Primary Creative LLM): A large, high-quality language model responsible for all player-facing narrative and descriptive text.

The "Dungeon Master" (Secondary Rules LLM): A lightweight, high-speed language model responsible for interpreting player intent, applying game rules, and managing state changes.

This separation allows each model to do what it does best, creating a system that is both deeply immersive and highly responsive.

3. Detailed System Roles and Responsibilities
3.1. The Lore Weaver

Model: A large, instruction-tuned model (e.g., Mixtral, Llama 3 70B, GPT-4o).

Responsibilities:

Generating all world, environmental, and atmospheric descriptions.

Crafting all NPC dialogue and character interactions.

Narrating the outcomes of actions based on structured input from the DM LLM.

Creating dynamic lore, item descriptions, and mission briefings.

Inputs: Receives high-level prompts and structured data (e.g., { "action": "player_attack", "result": "hit", "damage": 15 }).

Outputs: Produces natural language (prose) for the player.

3.2. The Dungeon Master (DM) LLM

Model: A small, fast, and highly-focused model (e.g., Phi-3, Gemma, a fine-tuned Llama 3 8B) optimized for a single GPU (e.g., NVIDIA 5090).

Responsibilities:

Parsing raw player input to determine intent (e.g., "I hit the golem" -> intent:attack, target:golem).

Applying the game's TTRPG ruleset to resolve actions (e.g., checking hit chance, calculating damage, applying status effects).

Managing turn order and combat flow.

Maintaining awareness of the immediate game state (character health, inventory, location).

Inputs: Receives player actions and the current game state.

Outputs: Produces structured, machine-readable data (JSON) describing the outcome of the action.

4. The Interaction Flow: A Step-by-Step Example
Scenario: A player is facing a "Steam Golem" and wants to attack it.

Scene Setting (Lore Weaver):

The Lore Weaver receives the prompt: "Describe the Steam Golem. It is damaged and venting hot steam."

It generates and sends the descriptive text to the player via the Discord bot.

Player Action:

The player types: I smash its leg with my reinforced wrench.

Action Resolution (DM LLM):

The player's input is sent to the DM LLM along with the current game state (player stats, golem stats).

The DM LLM's prompt includes the TTRPG rules for attacking.

The DM LLM processes the input and outputs a JSON object:

```
{
  "action": "player_attack",
  "target": "steam_golem",
  "weapon": "reinforced_wrench",
  "result": "hit",
  "damage_dealt": 18,
  "target_new_hp": 42,
  "additional_effect": "target_leg_crippled"
}
```

State Update (Python Application):

The Python bot receives the JSON from the DM LLM.

It updates the database: the Steam Golem's HP is now 42, and it has a "crippled_leg" status effect.

Narrate Outcome (Lore Weaver):

The JSON output is transformed into a prompt for the Lore Weaver: "Narrate a successful wrench attack that deals 18 damage and cripples the Steam Golem's leg."

The Lore Weaver generates the immersive result: "You swing the heavy wrench with all your might, connecting with a sickening crunch of metal. The golem's leg buckles under the impact, venting steam as it stumbles, clearly unbalanced..."

This text is sent to the player, and the loop is ready for the next action.

5. Benefits and Strategic Value
Unprecedented Responsiveness: Decoupling mechanics from narration allows the game to feel fast and reactive.

Deep Immersion: The Lore Weaver can focus solely on crafting a compelling story without being constrained by rules.

Emergent Gameplay: The DM LLM can interpret novel player solutions, allowing for a level of creativity impossible in a hard-coded system.

Maintainability: Game rules can be updated by modifying the DM LLM's prompts and ruleset, dramatically reducing development time compared to refactoring complex Python code. This architecture is the key to delivering on the promise of a truly living, breathing world where player actions shape the experience for everyone.
