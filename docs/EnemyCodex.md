# Enemy Codex

This codex lists each monster archetype and their Level 1 ability cards in a concise format.

For overall design goals see [../GAME_DESIGN.md](../GAME_DESIGN.md).

## Blood Witch

Dark support caster specializing in curses and lifedrain.

| Card Name        | Cost | Effect                                  | Target     | Duration | Notes |
| ---------------- | ---- | --------------------------------------- | ---------- | -------- | ----- |
| Blood Boil       | 1    | 2 dark damage; heal self 2 if cursed    | Enemy      | Instant  |       |
| Hex of Weakness  | 1    | -2 ATK and DEF                          | Enemy      | 2 turns  |       |
| Blood Pact       | 1    | Lose 2 HP, heal ally 4                  | Ally       | Instant  |       |
| Vile Mending     | 1    | Cleanse curses, heal 4                  | Self       | Instant  |       |
| Dark Benediction | 2    | All allies +1 damage and take +1 damage | All Allies | 2 turns  |       |

## Brute

Frontline bruiser with heavy swings and stuns.

| Card Name       | Cost | Effect                           | Target           | Duration | Notes |
| --------------- | ---- | -------------------------------- | ---------------- | -------- | ----- |
| Crushing Blow   | 1    | 4 damage                         | Enemy            | Instant  |       |
| Slam            | 2    | 2 damage and Stun                | Enemy            | 1 turn   |       |
| Armor Break     | 1    | 2 damage, remove shield & -2 DEF | Enemy            | 2 turns  |       |
| War Shout       | 1    | Taunt all enemies, gain +2 DEF   | Self             | 1 turn   |       |
| Juggernaut Rush | 2    | 2 AoE damage, gain Shield 5      | All Enemies/Self | Instant  |       |

## Frost Revenant

Controller that slows and roots foes with icy power.

| Card Name      | Cost | Effect                              | Target      | Duration | Notes |
| -------------- | ---- | ----------------------------------- | ----------- | -------- | ----- |
| Frostbolt      | 1    | 2 cold damage and Slow              | Enemy       | 2 turns  |       |
| Glacial Chains | 1    | Root target, prevent actions        | Enemy       | 1 turn   |       |
| Blizzard       | 2    | 1 AoE cold damage, Slow all enemies | All Enemies | 1 turn   |       |
| Ice Shield     | 1    | Shield 5, immune to Slow            | Self        | 2 turns  |       |
| Shatter        | 1    | 4 damage to slowed or frozen target | Enemy       | Instant  |       |

## Grave Titan

Massive juggernaut focused on area control and toughness.

| Card Name    | Cost | Effect                       | Target      | Duration | Notes |
| ------------ | ---- | ---------------------------- | ----------- | -------- | ----- |
| Titanic Slam | 2    | 3 damage and knockback       | Enemy       | 1 turn   |       |
| Bone Plating | 1    | Gain 8 Shield                | Self        | 2 turns  |       |
| Earthquake   | 2    | 2 AoE damage, -1 initiative  | All Enemies | 1 turn   |       |
| Siege Step   | 1    | Taunt, next attack +2 damage | Self        | 1 turn   |       |
| Devour       | 1    | Heal 4 if below 50% HP       | Self        | Instant  |       |

## Infernal Beast

Reckless fire-spewing monster dealing heavy burn damage.

| Card Name      | Cost | Effect                                 | Target           | Duration | Notes |
| -------------- | ---- | -------------------------------------- | ---------------- | -------- | ----- |
| Inferno Breath | 2    | 2 AoE fire damage and Burn             | All Enemies      | 2 turns  |       |
| Rampage        | 1    | 4 damage, lose 2 HP                    | Enemy            | Instant  |       |
| Flame Shield   | 1    | Shield 5, reflect 1 fire dmg           | Self             | 2 turns  |       |
| Wild Roar      | 1    | All enemies -2 DEF, self +1 initiative | All Enemies/Self | 1 turn   |       |
| Sear Flesh     | 1    | 2 fire damage, target cannot heal      | Enemy            | 2 turns  |       |

## Necromancer

Summoner that raises undead minions and spreads fear.

| Card Name       | Cost | Effect                           | Target      | Duration  | Notes          |
| --------------- | ---- | -------------------------------- | ----------- | --------- | -------------- |
| Summon Skeleton | 2    | Add Skeleton Minion to battle    | Self/Field  | Permanent | Extra attacker |
| Fear            | 2    | Target skips next turn           | Enemy       | 1 turn    |                |
| Grave Touch     | 1    | 2 damage, heal 2 if enemy KO'd   | Enemy       | Instant   |                |
| Bone Armor      | 1    | Gain Shield 5                    | Self        | 2 turns   |                |
| Death Pulse     | 2    | 2 AoE dark damage, -1 initiative | All Enemies | 1 turn    |                |

## Plague Bringer

Sinister master of disease and healing suppression.

| Card Name      | Cost | Effect                              | Target      | Duration | Notes |
| -------------- | ---- | ----------------------------------- | ----------- | -------- | ----- |
| Plague Cloud   | 2    | 1 AoE poison damage, -50% healing   | All Enemies | 2 turns  |       |
| Infection      | 1    | 2 poison damage, target cannot heal | Enemy       | 2 turns  |       |
| Virulent Burst | 1    | Spread all debuffs to all enemies   | Enemy       | Instant  |       |
| Rotting Touch  | 1    | 1 damage and Weak (-2 ATK)          | Enemy       | 2 turns  |       |
| Malignant Aura | 2    | All enemies lose 1 HP/turn          | All Enemies | 2 turns  |       |

## Shadowfiend

Stealthy assassin relying on evasion and burst attacks.

| Card Name      | Cost | Effect                           | Target | Duration | Notes |
| -------------- | ---- | -------------------------------- | ------ | -------- | ----- |
| Shadowstep     | 1    | Untargetable, +2 crit chance     | Self   | 1 turn   |       |
| Ambush         | 2    | 4 damage (+2 if undetected)      | Enemy  | Instant  |       |
| Eviscerate     | 1    | 2 damage and Bleed               | Enemy  | 2 turns  |       |
| Cloak of Dusk  | 1    | Gain 5 shield, +30% dodge        | Self   | 2 turns  |       |
| Mark for Death | 1    | Next attack on target double dmg | Enemy  | 1 turn   |       |

## Storm Serpent

Lightning elemental manipulating speed and initiative.

| Card Name       | Cost | Effect                                  | Target      | Duration | Notes |
| --------------- | ---- | --------------------------------------- | ----------- | -------- | ----- |
| Chain Lightning | 2    | 2 AoE lightning damage and Shock        | All Enemies | 1 turn   |       |
| Static Field    | 1    | All enemies take 1 damage on their turn | All Enemies | 2 turns  |       |
| Flash Strike    | 1    | 3 damage, gain +1 initiative            | Enemy       | 1 turn   |       |
| Electric Coil   | 1    | Stun target                             | Enemy       | 1 turn   |       |
| Storm Surge     | 1    | All allies +1 initiative                | All Allies  | 1 turn   |       |

## Venomspawn

Poisonous controller that roots foes and blocks healing.

| Card Name       | Cost | Effect                        | Target      | Duration | Notes   |
| --------------- | ---- | ----------------------------- | ----------- | -------- | ------- |
| Venomous Strike | 1    | 2 poison damage, 1/turn       | Enemy       | 2 turns  |         |
| Root Snare      | 1    | Root target, prevent movement | Enemy       | 1 turn   |         |
| Neurotoxin      | 1    | Target cannot heal            | Enemy       | 2 turns  |         |
| Acid Spit       | 2    | 1 AoE acid damage, -2 DEF     | All Enemies | 1 turn   |         |
| Molt            | 1    | Remove all debuffs from self  | Self        | Instant  | Cleanse |

## Void Horror

Reality-bending disruptor that manipulates energy and minds.

| Card Name      | Cost | Effect                               | Target      | Duration | Notes                  |
| -------------- | ---- | ------------------------------------ | ----------- | -------- | ---------------------- |
| Reality Tear   | 1    | 3 arcane damage, shuffle target deck | Enemy       | Instant  |                        |
| Null Pulse     | 2    | All enemies lose 2 energy            | All Enemies | Instant  | Resource drain         |
| Warp Echo      | 1    | Copy last ability used by enemy      | Enemy       | Instant  | Mimic                  |
| Paranoia       | 1    | Enemy attacks ally instead           | Enemy       | 1 turn   | Mind control           |
| Entropic Field | 2    | Remove all buffs from enemies        | All Enemies | Instant  | Strip positive effects |
