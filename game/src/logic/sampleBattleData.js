export const playerParty = [
  {
    id: 'valerius',
    name: 'Valerius',
    stats: { hp: 12, mana: 1 },
    deck: [
      { id: 'val_strike', energyCost: 1, effect: { type: 'damage', magnitude: 4 } },
    ],
  },
  {
    id: 'lyra',
    name: 'Lyra',
    stats: { hp: 10, mana: 1 },
    deck: [
      { id: 'lyra_heal', energyCost: 1, effect: { type: 'heal', magnitude: 3 } },
    ],
  },
];

export const enemyParty = [
  {
    id: 'goblin_slinger',
    name: 'Goblin Slinger',
    stats: { hp: 8, mana: 1 },
    deck: [
      { id: 'stone_throw', energyCost: 1, effect: { type: 'damage', magnitude: 2 } },
    ],
  },
  {
    id: 'grumpy_slime',
    name: 'Grumpy Slime',
    stats: { hp: 9, mana: 1 },
    deck: [
      { id: 'slime_slap', energyCost: 1, effect: { type: 'damage', magnitude: 1 } },
    ],
  },
];
