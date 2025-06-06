import type { Stats } from './Character'

export interface Effect {
  /** Identifier for the effect (e.g. "damage", "heal") */
  type: string
  /** Numerical magnitude of the effect */
  magnitude?: number
  /** Optional duration in turns */
  duration?: number
  /** Optional description of the target */
  target?: string
}

export interface Buff {
  /** Stat affected by the buff */
  stat: keyof Stats
  /** Amount the stat is modified */
  magnitude: number
  /** Duration of the buff in turns */
  duration: number
}

export enum CardCategory {
  Ability = 'Ability',
  Equipment = 'Equipment',
  Ingredient = 'Ingredient',
  FoodDrink = 'FoodDrink',
  Elixir = 'Elixir',
  Utility = 'Utility',
}

export enum Rarity {
  Common = 'Common',
  Uncommon = 'Uncommon',
  Rare = 'Rare',
  Legendary = 'Legendary',
}

export enum Role {
  Tank = 'Tank',
  Healer = 'Healer',
  Support = 'Support',
  DPS = 'DPS',
}

export enum Class {
  Guardian = 'Guardian',
  Warrior = 'Warrior',
  RunestoneSentinel = 'RunestoneSentinel',
  Cleric = 'Cleric',
  Herbalist = 'Herbalist',
  Bloodweaver = 'Bloodweaver',
  Bard = 'Bard',
  Chronomancer = 'Chronomancer',
  TotemWarden = 'TotemWarden',
  Blademaster = 'Blademaster',
  Wizard = 'Wizard',
  Shadowblade = 'Shadowblade',
  Ranger = 'Ranger',
  Pyromancer = 'Pyromancer',
}

export enum EquipmentSlot {
  Head = 'Head',
  Body = 'Body',
  Weapon = 'Weapon',
  Offhand = 'Offhand',
  Accessory = 'Accessory',
}

export interface StatModifier {
  /** Stat affected by the modifier */
  stat: keyof Stats
  /** Amount the stat is modified */
  value: number
}

export interface BaseCard {
  /** Unique card id */
  id: string
  /** Display name */
  name: string
  /** Card description */
  description: string
  /** Rarity of the card */
  rarity: Rarity
  /** Category */
  category: CardCategory
  /** Optional crafter tag for crafted items */
  craftedBy?: string
}

export interface AbilityCard extends BaseCard {
  category: CardCategory.Ability
  /** Energy cost to activate */
  energyCost: number
  /** Cooldown in turns */
  cooldown: number
  /** Primary effect */
  effect: Effect
  /** Role tag for AI usage */
  roleTag: Role
  /** Optional class restriction */
  classRestriction?: Class
  /** Optional synergy identifier */
  synergyTag?: string
  /** Bonus effect if synergy conditions met */
  synergyEffect?: Effect
}

export interface EquipmentCard extends BaseCard {
  category: CardCategory.Equipment
  /** Stat bonuses provided */
  statModifiers: StatModifier[]
  /** Equipment slot */
  slot: EquipmentSlot
  /** Optional class requirement */
  requiredClass?: Class
}

export interface IngredientCard extends BaseCard {
  category: CardCategory.Ingredient
  /** Ingredient type identifier */
  ingredientType: string
}

export interface FoodDrinkCard extends BaseCard {
  category: CardCategory.FoodDrink
  /** Hunger restored */
  restoreHunger: number
  /** Thirst restored */
  restoreThirst: number
  /** Optional temporary buffs */
  buffs?: Buff[]
}

export interface ElixirCard extends BaseCard {
  category: CardCategory.Elixir
  /** Effects granted while active */
  effects: Effect[]
  /** Duration in encounters */
  duration: number
}

export interface UtilityCard extends BaseCard {
  category: CardCategory.Utility
  /** Utility type identifier */
  utilityType: string
  /** Effect of the utility item */
  effect: Effect
}

export type Card =
  | AbilityCard
  | EquipmentCard
  | IngredientCard
  | FoodDrinkCard
  | ElixirCard
  | UtilityCard

export function serializeCard(card: Card): string {
  return JSON.stringify(card)
}

export function deserializeCard<T extends Card = Card>(json: string): T {
  return JSON.parse(json) as T
}
