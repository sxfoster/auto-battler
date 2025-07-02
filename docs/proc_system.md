# Proc System

The combat engine supports data-driven "procs" – conditional effects attached to equipment. Weapons and armor may include a `procs` array and each entry in that array describes when the proc triggers and what it does.

## Procs Array Structure
A proc object is a plain JSON record placed inside an item's `procs` array. An example from `backend/game/data.js`:
```javascript
{ trigger: 'on_attack', effect: 'bonus_damage', value: 2, condition: { target_hp_below: 0.5 } }
```

Common fields are:
- **trigger** – event name that causes the proc to be evaluated.
- **effect** – identifier for the action or status to apply.
- **value** – numeric amount used by many effects (damage, stat bonus, etc.).
- **status** – status name when the effect applies a condition.
- **duration** – how many turns the status lasts.
- **chance** – optional probability (0–1) the proc activates.
- **condition** – object with additional requirements (see below).
- **target**, **stat**, **permanent**, **once_per_combat**, **damage_type** – extra keys used by specific effects.

## Supported Triggers
The current data defines the following trigger strings:
- `on_combat_start`
- `on_attack`
- `on_hit`
- `on_attacked`
- `on_ability_used`
- `on_ability_targeted`
- `on_kill`
- `on_status_applied`

`GameEngine` presently fires `on_combat_start`, `on_attack`, `on_hit`, `on_attacked` and `on_ability_used`. Other triggers are reserved for future expansion.

## Condition Processing
When `ProcEngine.trigger()` runs, it scans the attacker and defender's equipment for procs matching the event name. For each candidate proc it calls `checkConditions` to verify optional rules:
```javascript
if (proc.condition.first_attack && (attacker.attacksMade || 0) > 0) return false;
if (proc.condition.target_hp_below && (defender.currentHp / defender.maxHp) >= proc.condition.target_hp_below) return false;
if (proc.condition.attacker_is_faster && attacker.speed <= defender.speed) return false;
if (proc.condition.target_has_status) {
    const hasStatus = proc.condition.target_has_status.some(status =>
        defender.statusEffects.some(e => e.name === status)
    );
    if (!hasStatus) return false;
}
```
Only when all conditions pass does the proc's effect activate.

## Effect Resolution
`executeEffect` performs the proc action. A summary of the implemented handlers:
```javascript
switch (proc.effect) {
    case 'cleave':
        const others = allCombatants.filter(c => c.team !== attacker.team && c.id !== defender.id && c.currentHp > 0);
        for (const enemy of others) {
            context.applyDamage(attacker, enemy, proc.value);
        }
        break;
    case 'apply_status':
        if (!proc.chance || Math.random() < proc.chance) {
            context.applyStatus(defender, proc.status, proc.duration, { damage: proc.value });
        }
        break;
    case 'bonus_damage':
        if (!proc.chance || Math.random() < proc.chance) {
            context.applyDamage(attacker, defender, proc.value);
        }
        break;
    case 'apply_status_to_attacker':
        if (!proc.chance || Math.random() < proc.chance) {
            context.applyStatus(attacker, proc.status, proc.duration, { damage: proc.value });
        }
        break;
    default:
        if (!proc.chance || Math.random() < proc.chance) {
            context.applyStatus(defender, proc.effect, proc.duration, { amount: proc.amount });
        }
        break;
}
```
Unrecognised effect names fall through to the `default` case and are treated as status effects on the defender.

