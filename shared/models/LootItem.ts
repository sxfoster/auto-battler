export interface LootItem {
  /** Unique loot id */
  id: string
  /** Category of loot */
  type: 'Ability' | 'Equipment' | 'Ingredient' | 'FoodDrink' | 'Elixir' | 'Utility'
  /** Loot rarity */
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Legendary'
  /** Effects applied when used (for consumables) */
  effects: { type: 'RestoreFatigue' | 'RestoreHunger' | 'RestoreThirst'; value: number }[]
}
