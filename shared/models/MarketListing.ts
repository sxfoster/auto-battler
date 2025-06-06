import type { CurrencyType } from './Currency'
import type { MarketItem } from './MarketItem'

export type MarketType = 'Town' | 'Black' | 'Guild' | 'Auction'

export interface MarketListing {
  /** Item being listed */
  item: MarketItem
  /** Market the listing belongs to */
  marketType: MarketType
  /** Seller id */
  seller: string
  /** Listing price */
  price: number
  /** Currency used */
  currencyType: CurrencyType
  /** Expiration timestamp */
  expiresAt?: number
}
