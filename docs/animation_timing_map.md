# Animation & Timing Map

This document maps each battle `eventType` to a suggested animation concept along with a target duration. The timings are guidelines for the frontend implementation.

| EventType | Animation Concept | Target Duration (ms) |
|-----------|------------------|----------------------|
| BATTLE_START | Arena doors open and teams slide into view | 600 |
| TURN_START | Active combatant highlighted; turn banner appears | 300 |
| TURN_ACTION | Actor card pulses to indicate their action | 200 |
| ENERGY_GAIN | Energy icon pops above actor | 200 |
| CARD_PLAYED | Caster card lifts and lunges toward target | 400 |
| DAMAGE_DEALT | Target card shakes with red flash, attacker lunges | 400 |
| HEAL_APPLIED | Target card flashes green with a healing glow | 300 |
| STATUS_EFFECT_APPLIED | Status icon appears over target with a brief tint | 500 |
| ACTION_FAILED | Caster card wobbles with a red "X" indicator | 300 |
| EFFECT_APPLYING | Swirling effect between caster and target | 300 |
| TURN_SKIPPED | Grey overlay and skip icon on actor card | 300 |
| TURN_PASSED | Actor card dims briefly to indicate pass | 300 |
| TURN_END | Quick fade to mark end of turn | 200 |
| BATTLE_END | Winning team glows; confetti drops | 800 |

These concepts serve as a baseline and can be iterated on as the visual style evolves.
