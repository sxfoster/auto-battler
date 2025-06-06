/** @type {import('./Card').Card[]} */
export const sampleCards = [
  {
    id: 'strike',
    name: 'Strike',
    description: 'A basic attack dealing minor damage.',
    category: 'Ability', // Matches CardCategory.Ability
    rarity: 'Common',   // Matches Rarity.Common
    energyCost: 1,
    cooldown: 0,
    effect: { type: 'damage', magnitude: 5 },
    roleTag: 'DPS',     // Matches Role.DPS
    synergyTag: 'Frenzy',
    synergyEffect: { type: 'extra_attack', magnitude: 1 },
    isComboStarter: true,
  },
  {
    id: 'heal',
    name: 'Heal',
    description: 'Restores a small amount of health to a target.',
    category: 'Ability',
    rarity: 'Common',
    energyCost: 1,
    cooldown: 0,
    effect: { type: 'heal', magnitude: 5 },
    roleTag: 'Healer',  // Matches Role.Healer
  },
  {
    id: 'inspire',
    name: 'Inspire',
    description: 'Grants a temporary buff to an ally.',
    category: 'Ability',
    rarity: 'Common',
    energyCost: 1,
    cooldown: 0,
    effect: { type: 'buff', magnitude: 1, target: 'ally' }, // Consider defining Effect type more strictly if possible
    roleTag: 'Support', // Matches Role.Support
  },
  {
    id: 'iron_sword',
    name: 'Iron Sword',
    description: 'A standard sword, provides a small attack bonus.',
    category: 'Equipment', // Matches CardCategory.Equipment
    rarity: 'Common',
    statModifiers: [{ stat: 'attack', value: 2 }], // 'attack' should be a keyof Stats
    slot: 'Weapon',     // Matches EquipmentSlot.Weapon
  },
  {
    id: 'herb',
    name: 'Medicinal Herb',
    description: 'A common herb used in crafting potions.',
    category: 'Ingredient', // Matches CardCategory.Ingredient
    rarity: 'Common',
    ingredientType: 'Herb',
  },
  {
    id: 'bread',
    name: 'Stale Bread',
    description: 'Better than nothing. Restores some hunger.',
    category: 'FoodDrink', // Matches CardCategory.FoodDrink
    rarity: 'Common',
    restoreHunger: 5,
    restoreThirst: 0,
    // buffs: [] // Optional, can be omitted
  },
  {
    id: 'haste_elixir',
    name: 'Haste Elixir',
    description: 'Temporarily increases speed for several encounters.',
    category: 'Elixir',    // Matches CardCategory.Elixir
    rarity: 'Uncommon', // Matches Rarity.Uncommon
    effects: [{ type: 'speed', magnitude: 1, duration: 3 }],
    duration: 3, // Duration in encounters
  },
  {
    id: 'campfire',
    name: 'Campfire Kit',
    description: 'Allows the party to rest and recover.',
    category: 'Utility',  // Matches CardCategory.Utility
    rarity: 'Common',
    utilityType: 'Campfire',
    effect: { type: 'rest', magnitude: 5 }, // Effect of the utility item
  },
  {
    id: 'mark_target',
    name: 'Mark Target',
    description: 'Marks an enemy, making them vulnerable to finishers.',
    category: 'Ability',
    rarity: 'Common',
    energyCost: 1,
    cooldown: 0,
    effect: { type: 'debuff', magnitude: 1, target: 'enemy' },
    roleTag: 'Support',
    synergyTag: 'Execute',
    isComboStarter: true,
  },
  {
    id: 'shadow_execution',
    name: 'Shadow Execution',
    description: 'Deals high damage to a marked target.',
    category: 'Ability',
    rarity: 'Common',
    energyCost: 1,
    cooldown: 0,
    effect: { type: 'damage', magnitude: 8 },
    roleTag: 'DPS',
    synergyTag: 'Execute',
    isComboFinisher: true,
  },
];
