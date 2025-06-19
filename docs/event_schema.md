# Battle Event Schema

This document defines the JSON event payloads emitted by the battle simulator. These events are consumed by the front‑end to render the battle log and update the UI.

## Event Envelope
Each event is an object with the following keys:

```json
{
  "eventType": "BATTLE_START",
  "payload": { /* event specific fields */ },
  "timestamp": 1697043123.123
}
```

- **eventType** – String identifier for the event.
- **payload** – Object with fields described per event type below.
- **timestamp** – Unix timestamp with microsecond precision.

## Event Types

### BATTLE_START
Emitted once when a battle begins.

```json
{
  "turn": 0,
  "actor": "System",
  "player_team_names": ["Hero 1", "Hero 2"],
  "player_initial_hp_1": 12,
  "player_initial_hp_2": 14,
  "opponent_team_names": ["Enemy 1", "Enemy 2"],
  "opponent_initial_hp_1": 10,
  "opponent_initial_hp_2": 10
}
```

### TURN_START
```
{ "turn": n, "actor": "System" }
```

### CARD_PLAYED
```
{
  "turn": n,
  "caster": { /* GameEntity */ },
  "card": { /* Card */ },
  "target": "Target Name"
}
```

### DAMAGE_DEALT
```
{
  "turn": n,
  "caster": { /* GameEntity */ },
  "target": { /* GameEntity */ },
  "card": { /* Card */ },
  "result": { "damageDealt": x }
}
```

### HEAL_APPLIED
```
{
  "turn": n,
  "caster": { /* GameEntity */ },
  "target": { /* GameEntity */ },
  "card": { /* Card */ },
  "result": { "healed": x, "targetHpAfter": y }
}
```

### STATUS_EFFECT_APPLIED
```
{
  "turn": n,
  "caster": { /* GameEntity */ },
  "target": { /* GameEntity */ },
  "card": { /* Card */ },
  "effect": { "type": "buff|debuff|dot", ... }
}
```

### TURN_END
```
{
  "turn": n,
  "actor": "System",
  "player_hp_1": hp1,
  "player_hp_2": hp2,
  "opponent_hp_1": ohp1,
  "opponent_hp_2": ohp2
}
```

### BATTLE_END
```
{
  "turn": n,
  "actor": "System",
  "winner": "Team Name",
  "result": "win|loss|draw"
}
```

### Additional Events
Other events currently produced by the simulator include `TURN_SKIPPED`, `TURN_PASSED`, `ENERGY_GAIN`, `TURN_ACTION`, `ACTION_FAILED` and `EFFECT_APPLYING`. These share the same envelope structure and follow a similar pattern with `turn`, `actor`/`caster` and relevant fields.

## Entity Formats
`GameEntity` and `Card` entries appear as plain JSON objects containing identifiers, names, stats and any active effects.  The current JavaScript implementation defines these structures in `hero-game/js/data.js` and related modules.

