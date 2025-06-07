# Class Codex

This codex lists every playable class and their Level 1 cards with concise technical data.

For overall design goals see [../GAME_DESIGN.md](../GAME_DESIGN.md).

**IDs**: Each class is identified by a lowercase hyphenated id. When referencing a class in code use this id (e.g. `cleric`). The first four cards listed for each class are guaranteed to be draftable.

## Guardian

Sturdy protector that draws enemy attacks and shields allies.

| Card Name | Cost | Effect | Target | Duration | Notes |
|-----------|------|--------|--------|----------|-------|
| Fortified Stance | 1 | -30% damage taken | Self | 1 turn |  |
| Intervene | 1 | Redirect next attack | Ally | 1 turn |  |
| Guard's Challenge | 1 | Taunt | All Enemies | 1 turn |  |
| Bulwark | 2 | 8 Shield | Team | 1 turn |  |

## Warrior

Aggressive melee combatant excelling at frontline skirmishes.

| Card Name | Cost | Effect | Target | Duration | Notes |
|-----------|------|--------|--------|----------|-------|
| Strike | 1 | 3 damage | Enemy | Instant |  |
| Iron Sword | 1 | 4 damage | Enemy | Instant | -1 DEF for 2 turns |
| Shield Wall | 2 | 5 Shield | Team | 1 turn |  |
| Taunt | 1 | Taunt | All Enemies | 1 turn |  |

## Runestone Sentinel

Tank that channels rune magic to harden defenses.

| Card Name | Cost | Effect | Target | Duration | Notes |
|-----------|------|--------|--------|----------|-------|
| Rune Slam | 2 | 2 damage AoE | All Enemies | 1 turn | 50% chance to Stun |
| Stone Guard | 1 | 5 Shield | Self | 2 turns |  |
| Earthen Grasp | 1 | Root | Enemy | 1 turn |  |
| Runic Pulse | 1 | 3 arcane damage | Enemy | Instant | Self gains 2 Shield for 1 turn |

## Cleric

Devout healer who mends wounds with holy magic.

| Card Name | Cost | Effect | Target | Duration | Notes |
|-----------|------|--------|--------|----------|-------|
| Heal | 1 | Restore 4 HP | Ally | Instant |  |
| Holy Light | 1 | Restore 6 HP | Ally | Instant |  |
| Smite | 1 | 4 holy damage | Enemy | Instant |  |
| Sanctuary | 2 | 2 damage reduction | Team | 1 turn |  |

## Herbalist

Nature healer brewing restorative and toxic concoctions.

| Card Name | Cost | Effect | Target | Duration | Notes |
|-----------|------|--------|--------|----------|-------|
| Haste Elixir | - | +1 speed | Self | 3 turns |  |
| Healing Herbs | 1 | Restore 5 HP | Ally | Instant |  |
| Toxic Spores | 1 | 3 poison damage | Enemy | 2 turns |  |
| Growth Burst | 1 | +2 initiative | Ally | 1 turn |  |

## Bloodweaver

Mystic manipulating life essence to heal or harm.

| Card Name | Cost | Effect | Target | Duration | Notes |
|-----------|------|--------|--------|----------|-------|
| Blood Leech | 1 | 2 damage | Enemy | Instant | Heal self 2 |
| Sanguine Gift | 1 | Restore 4 HP | Ally | Instant | User loses 2 HP |
| Hemorrhage | 1 | 2 bleed damage | Enemy | 2 turns |  |
| Blood Pact | 2 | Swap hp percentages | Ally | Instant |  |

## Bard

Inspirational performer empowering allies through song.

| Card Name | Cost | Effect | Target | Duration | Notes |
|-----------|------|--------|--------|----------|-------|
| Inspire | 1 | +2 ATK | Ally | 2 turns |  |
| Song of Swiftness | 1 | +1 initiative | Team | 1 turn |  |
| Lullaby | 1 | Sleep | Enemy | 1 turn |  |
| Motivational Tune | 1 | Restore 2 energy | Team | Instant |  |

## Chronomancer

Temporal magician bending time to aid the party.

| Card Name | Cost | Effect | Target | Duration | Notes |
|-----------|------|--------|--------|----------|-------|
| Time Warp | 2 | Extra action | Ally | 1 turn |  |
| Temporal Strike | 1 | 3 damage | Enemy | 1 turn | Delays target action by 1 turn |
| Rewind | 1 | Undo 2 damage | Ally | Instant |  |
| Accelerate | 1 | +2 initiative | Team | 1 turn |  |

## Totem Warden

Places totems that bolster friends or weaken foes.

| Card Name | Cost | Effect | Target | Duration | Notes |
|-----------|------|--------|--------|----------|-------|
| Totem of Vitality | 2 | Restore 1 HP AoE | Team | 2 turns |  |
| Totem of Fury | 2 | +1 ATK | Team | 2 turns |  |
| Totem of Stoneskin | 2 | +2 DEF | Team | 2 turns |  |
| Totem Recall | 1 | Trigger totems | Team | Instant |  |

## Blademaster

Master of blades delivering relentless attacks.

| Card Name | Cost | Effect | Target | Duration | Notes |
|-----------|------|--------|--------|----------|-------|
| Quick Slash | 1 | 3 damage | Enemy | Instant | +1 initiative |
| Blade Fury | 2 | 2 hits of 2 damage | Enemy | Instant |  |
| Deflect | 1 | Block | Self | 1 turn |  |
| Deadly Focus | 1 | Next attack +3 damage | Self | 1 turn |  |

## Wizard

Arcane caster wielding destructive and protective spells.

| Card Name | Cost | Effect | Target | Duration | Notes |
|-----------|------|--------|--------|----------|-------|
| Arcane Bolt | 1 | 5 arcane damage | Enemy | Instant |  |
| Mana Shield | 1 | Absorb 4 damage | Self | 2 turns |  |
| Frost Nova | 2 | 2 cold damage AoE | All Enemies | 1 turn | Enemies -1 initiative for 1 turn |
| Energize | 1 | Restore 3 mana | Self | Instant |  |

## Shadowblade

Stealthy assassin striking from the darkness.

| Card Name | Cost | Effect | Target | Duration | Notes |
|-----------|------|--------|--------|----------|-------|
| Shadow Execution | 2 | Execute <20% HP target | Enemy | Instant |  |
| Backstab | 1 | 4 damage | Enemy | Instant | 2 damage if detected |
| Smoke Bomb | 1 | Stealth | Self | 1 turn | Next attack +2 damage |
| Shadowstep | 1 | Move to back row | Self | 2 turns | +2 crit chance |

## Ranger

Expert archer adept at controlling the battlefield.

| Card Name | Cost | Effect | Target | Duration | Notes |
|-----------|------|--------|--------|----------|-------|
| Arrow Shot | 1 | 3 damage | Enemy | Instant |  |
| Entangling Trap | 1 | Root | Enemy | 1 turn |  |
| Mark Target | 1 | Mark an enemy; attacks deal +2 damage | Enemy | 2 turns |  |
| Eagle Eye | 1 | +25% crit chance | Self | 2 turns |  |

## Pyromancer

Sorcerer harnessing fire for offense and defense.

| Card Name | Cost | Effect | Target | Duration | Notes |
|-----------|------|--------|--------|----------|-------|
| Fireball | 2 | 2 fire damage to all enemies and inflict Burn | All Enemies | 2 turns | Burn 1 dmg/turn for 2 turns |
| Flame Shield | 1 | 5 Shield | Self | 2 turns | Reflect 1 fire dmg/attack |
| Ignite | 1 | 2 fire damage and apply Burn | Enemy | 2 turns | Burn 1 dmg/turn for 2 turns |
| Cauterize | 1 | Restore 3 HP | Self | Instant | Removes one debuff |
