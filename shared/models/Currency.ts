export type CurrencyType = 'Gold' | 'GuildCredit'

export interface Currency {
  /** Currency name */
  type: CurrencyType
  /** Player balance for this currency */
  balance: number
}
