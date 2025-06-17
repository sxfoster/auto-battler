# Game Mechanics Design Document - Status Effects

## 1. Core Status Conditions

### 1.1. Stun
* **Effect:** Target skips their next action.
* **Duration:** 1 turn (unless extended by rare effects).
* **Common Sources:** Warrior’s Shield Bash, Wizard’s Lightning Bolt, Barbarian’s Juggernaut Charge.

### 1.2. Poison
* **Effect:** Target takes damage over time (1-2 damage per turn).
* **Duration:** Typically 2-3 turns.
* **Common Sources:** Druid’s Poison abilities, Rogue’s Poison Blade, Ranger traps.

### 1.3. Bleed
* **Effect:** Target takes damage over time and may suffer from reduced healing (-50% healing received).
* **Duration:** 2 turns unless cleansed.
* **Common Sources:** Rogue’s Bleeding Strike, Barbarian’s Savage Cleave.

### 1.4. Burn
* **Effect:** Target takes damage over time and suffers -1 defense while burning.
* **Duration:** 2 turns.
* **Common Sources:** Sorcerer’s Firestorm, Wizard’s Fireball, Enchanter illusions (rare cases).

### 1.5. Slow
* **Effect:** Target’s speed is reduced by 1 (affects initiative and turn order).
* **Duration:** 1-2 turns.
* **Common Sources:** Wizard’s Ice Storm, Druid’s Entangle.

### 1.6. Confuse
* **Effect:** Target has a 50% chance to miss their action.
* **Duration:** 1 turn (stackable by certain abilities).
* **Common Sources:** Enchanter’s Illusionary Strike, Phantasmal Blades.

### 1.7. Root
* **Effect:** Target cannot act or cannot move for 1 turn.
* **Duration:** 1 turn.
* **Common Sources:** Druid’s Entangle, Ranger traps.

### 1.8. Shock
* **Effect:** Target has 50% chance to fail casting abilities (spells or special attacks).
* **Duration:** 1 turn.
* **Common Sources:** Wizard’s Lightning Bolt, Sorcerer’s Chain Lightning.

## 2. Buff Keywords

### 2.1. Evasion
* **Effect:** Increase chance to dodge attacks (e.g., +2 evasion = 20% dodge boost).
* **Duration:** Usually 1-2 turns.

### 2.2. Defense Boost
* **Effect:** Reduce incoming damage by X points.
* **Duration:** Varies (1 turn to multi-turn).

### 2.3. Crit Chance Up
* **Effect:** Increases critical hit chance by X%.
* **Duration:** Usually 1-2 turns.

### 2.4. Speed Boost
* **Effect:** Improves initiative or action order, gaining turns earlier.
* **Duration:** Often 1-2 turns.

### 2.5. Extra Action
* **Effect:** Gain +1 action this turn or next turn.

## 3. Debuff Keywords

### 3.1. Attack Down
* **Effect:** Reduce target’s attack power by X.
* **Duration:** 1-2 turns.

### 3.2. Defense Down
* **Effect:** Reduce target’s damage mitigation by X.
* **Duration:** 1-2 turns.

### 3.3. Vulnerable
* **Effect:** Target takes +1 bonus damage from all attacks.
* **Duration:** Usually 1 turn.

## 4. Optional Advanced Conditions
* **Silence:** Prevents the use of spells/abilities.
* **Taunt:** Forces enemies to target you.
* **Stealth:** Cannot be directly targeted unless revealed.
