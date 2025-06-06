/**
 * @fileoverview This file contains a list of all possible biomes in the game.
 * Each biome is an object with the following properties:
 *  - id: string - A unique identifier for the biome.
 *  - name: string - The display name of the biome.
 *  - description: string - A short description of the biome.
 *  - bonuses: object[] - A list of bonuses that apply in this biome. Each bonus object has the following properties:
 *    - type: string - The type of bonus (e.g., "EffectModifier", "StatModifier", "Trigger", "Immunity", "ResourceChange").
 *    - target: string - Who the bonus applies to (e.g., "all", "undead", "caster", "aquatic", "shadow").
 *    - effectDetails: object - Details of the bonus effect, which varies depending on the bonus type.
 */
/** @type {import('./Biome').Biome[]} */
export const biomes = [
  {
    id: 'fungal-depths',
    name: 'Fungal Depths',
    description: 'Dank tunnels overrun with toxic spores.',
    bonuses: [
      {
        type: 'EffectModifier',
        target: 'all',
        effectDetails: { effect: 'Poison', duration: 1 },
      },
      {
        type: 'Trigger',
        target: 'all',
        effectDetails: { effect: 'FirstDebuffResist', chance: 0.5 },
      },
    ],
  },
  {
    id: 'frozen-bastion',
    name: 'Frozen Bastion',
    description: 'Glacial fortress where the cold empowers its denizens.',
    bonuses: [
      {
        type: 'StatModifier',
        target: 'all',
        effectDetails: { stat: 'speed', value: 1 },
      },
      {
        type: 'EffectModifier',
        target: 'all',
        effectDetails: { effect: 'Defensive', potency: 0.1 },
      },
    ],
  },
  {
    id: 'inferno-ruins',
    name: 'Inferno Ruins',
    description: 'Charred remains crackling with endless flame.',
    bonuses: [
      {
        type: 'EffectModifier',
        target: 'all',
        effectDetails: { effect: 'BurnStack', value: 1 },
      },
      {
        type: 'Trigger',
        target: 'all',
        effectDetails: { effect: 'IgnoreFirstDotTick' },
      },
    ],
  },
  {
    id: 'thornwild-grove',
    name: 'Thornwild Grove',
    description: 'Lush forest teeming with hostile plant life.',
    bonuses: [
      {
        type: 'EffectModifier',
        target: 'all',
        effectDetails: { effect: 'Root', duration: 1 },
      },
      {
        type: 'EffectModifier',
        target: 'all',
        effectDetails: { effect: 'Regeneration', value: 1 },
      },
    ],
  },
  {
    id: 'ashen-necropolis',
    name: 'Ashen Necropolis',
    description: 'City of the dead, steeped in dark magic.',
    bonuses: [
      {
        type: 'Immunity',
        target: 'undead',
        effectDetails: { effects: ['fear', 'charm'] },
      },
      {
        type: 'Trigger',
        target: 'undead',
        effectDetails: { effect: 'Revive', chance: 0.1, hp: 0.2 },
      },
    ],
  },
  {
    id: 'crystalline-hollow',
    name: 'Crystalline Hollow',
    description: 'Cavern glittering with arcane crystals.',
    bonuses: [
      {
        type: 'Trigger',
        target: 'all',
        effectDetails: { effect: 'MagicReflect', chance: 0.1 },
      },
      {
        type: 'ResourceChange',
        target: 'caster',
        effectDetails: { resource: 'energy', interval: 2, value: 1 },
      },
    ],
  },
  {
    id: 'sunken-deep',
    name: 'Sunken Deep',
    description: 'Flooded halls echoing with unseen currents.',
    bonuses: [
      {
        type: 'EffectModifier',
        target: 'aquatic',
        effectDetails: { effect: 'MeleeAccuracy', value: -0.15 },
      },
      {
        type: 'Trigger',
        target: 'all',
        effectDetails: { effect: 'LowHpSpeed', value: 1, threshold: 0.5 },
      },
    ],
  },
  {
    id: 'obsidian-reach',
    name: 'Obsidian Reach',
    description: 'Shattered land cloaked in perpetual shadow.',
    bonuses: [
      {
        type: 'Trigger',
        target: 'all',
        effectDetails: { effect: 'EvadeAoE', chance: 0.2 },
      },
      {
        type: 'EffectModifier',
        target: 'shadow',
        effectDetails: { effect: 'ZeroCost', selfDebuff: true },
      },
    ],
  },
]
