/**
 * @fileoverview This file contains a list of sample recipes for the game.
 * Each recipe is an object with the following properties:
 *  - id: string - A unique identifier for the recipe.
 *  - ingredients: string[] - A list of ingredient IDs required for the recipe.
 *  - result: object - An object describing the item created by the recipe. This object has the following properties:
 *    - id: string - A unique identifier for the resulting item.
 *    - name: string - The display name of the resulting item.
 *    - description: string - A short description of the resulting item.
 *    - rarity: string - The rarity of the resulting item (e.g., "Common", "Uncommon").
 *    - category: string - The category of the resulting item (e.g., "FoodDrink", "Equipment", "Elixir").
 *    - restoreHunger: number (optional) - The amount of hunger restored by the item (for FoodDrink items).
 *    - restoreThirst: number (optional) - The amount of thirst restored by the item (for FoodDrink items).
 *    - statModifiers: object[] (optional) - A list of stat modifiers for the item (for Equipment items).
 *    - slot: string (optional) - The equipment slot for the item (for Equipment items).
 *    - effects: object[] (optional) - A list of effects for the item (for Elixir items).
 *    - duration: number (optional) - The duration of the elixir effect in encounters (for Elixir items).
 *  - profession: string - The profession required to craft the recipe (e.g., "Cooking", "Smithing", "Alchemy").
 *  - levelRequirement: number - The profession level required to craft the recipe.
 */
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
