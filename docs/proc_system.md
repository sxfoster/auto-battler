# Proc System

This document explains how passive procs are defined in the prototype and how the battle engine applies them during combat.

## Proc Object Structure
A proc object describes a conditional effect that may occur when a specific trigger fires. It is typically attached to a weapon via the `passiveEffect` field.

Example from `backend/game/data.js`:
```javascript
{ trigger: 'on_auto_attack', chance: 0.25, effect: 'Poison', duration: 2 }
```

The object fields are:

- **trigger** – event name that causes the proc to be evaluated. The current implementation uses `on_auto_attack`.
- **chance** – number between `0` and `1` representing the probability that the proc activates when its trigger occurs.
- **effect** – name of the effect to apply. Common effects include `Poison`, `Slow`, `Armor Break`, `Stun`, `BonusDamagePoisoned`, `BonusDamageIfFaster`, `AttackDownIfLast`, `CannotBeEvaded`, `HealOnAbility`, `AbilityDamageBoost`, `ExtraEnergy`, `GainDefenseOnStart`, `Guardian`, and `StunOnFirstHit`.
- **duration** – optional number of turns that a status effect lasts.
- **amount** – optional numeric value used by some effects (for example bonus damage or defense gained).

Some effect names encode additional conditions (e.g. `IfFaster` or `OnFirstHit`). These are interpreted by the battle engine as bespoke rules when implemented.

## Battle Engine Processing
During a turn the engine resolves each combatant's auto‑attack. After dealing damage it checks the attacker’s weapon for a `passiveEffect`. If the trigger matches and a random roll is less than the listed `chance`, the effect is applied to the defender.

Snippet from `engine.js` demonstrating this logic:
```javascript
const weapon = attacker.weaponData;
if (weapon && weapon.passiveEffect && weapon.passiveEffect.trigger === 'on_auto_attack') {
    if (Math.random() < weapon.passiveEffect.chance) {
        const eff = weapon.passiveEffect;
        this.applyStatusEffect(targetEnemy, eff.effect, eff.duration, { amount: eff.amount });
    }
}
```

Effects resolved here typically add a status effect to the target via `applyStatusEffect`, after which they are processed like any other status during subsequent turns.
