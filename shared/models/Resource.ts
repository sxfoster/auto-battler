import type { Effect } from './Card'

export interface Resource {
  /** Unique resource id */
  id: string
  /** Name shown to players */
  name: string
  /** Effect granted when consumed or used */
  effect: Effect
  /** Quantity carried or available */
  quantity: number
}
