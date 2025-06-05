export interface Effect {
  /**
   * The effect type identifier (e.g. "damage", "heal").
   */
  type: string
  /**
   * Numerical value associated with the effect.
   */
  value?: number
  /**
   * Optional target description for the effect.
   */
  target?: string
}

export interface Card {
  /** Unique card id */
  id: string
  /** Display name */
  name: string
  /** Category of card (attack, defense, item, etc.) */
  type: string
  /** Resource cost to play the card */
  cost: number
  /** Effects triggered when the card is used */
  effects: Effect[]
  /** Optional description shown in the UI */
  description?: string
}
