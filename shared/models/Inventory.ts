import type { LootItem } from './LootItem'

export interface Inventory {
  /** Items held by the player */
  items: LootItem[]
}
