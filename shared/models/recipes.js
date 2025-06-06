/** @type {import('./Recipe').Recipe[]} */
export const sampleRecipes = [
  {
    id: 'cooked_meat',
    ingredients: ['herb', 'bread'],
    result: {
      id: 'cooked_meat',
      name: 'Cooked Meat',
      description: 'Restores hunger and grants small buff.',
      rarity: 'Common',
      category: 'FoodDrink', // Matches CardCategory.FoodDrink from Card.ts
      restoreHunger: 10,
      restoreThirst: 0,
      // buffs: [] // Optional
    },
    profession: 'Cooking', // Assumes 'Cooking' is a valid ProfessionName
    levelRequirement: 1,
  },
  {
    id: 'flame_sword',
    ingredients: ['iron_sword', 'herb'],
    result: {
      id: 'flame_sword',
      name: 'Flame Sword',
      description: 'A sword engulfed in flames.',
      rarity: 'Uncommon',
      category: 'Equipment', // Matches CardCategory.Equipment from Card.ts
      statModifiers: [{ stat: 'attack', value: 4 }], // 'attack' should be keyof Stats
      slot: 'Weapon', // Matches EquipmentSlot.Weapon from Card.ts
    },
    profession: 'Smithing', // Assumes 'Smithing' is a valid ProfessionName
    levelRequirement: 2,
  },
  {
    id: 'healing_elixir',
    ingredients: ['herb', 'herb'],
    result: {
      id: 'healing_elixir',
      name: 'Healing Elixir',
      description: 'Restores health during dungeon runs.',
      rarity: 'Uncommon',
      category: 'Elixir', // Matches CardCategory.Elixir from Card.ts
      effects: [{ type: 'heal', magnitude: 10 }], // Effects array
      duration: 1, // Duration in encounters
    },
    profession: 'Alchemy', // Assumes 'Alchemy' is a valid ProfessionName
    levelRequirement: 1,
  },
]
