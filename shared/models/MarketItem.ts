import type { Rarity } from './Card'
import type { CurrencyType } from './Currency'

export interface MarketItem {
  /** Unique item id */
  id: string
  /** Display name */
  name: string
  /** Category for filtering */
  category: string
  /** Listing price */
  price: number
  /** Currency required */
  currencyType: CurrencyType
  /** Player selling the item */
  seller?: string
  /** Rarity of the item */
  rarity: Rarity
  /** Optional expiry timestamp */
  expiry?: number
}
