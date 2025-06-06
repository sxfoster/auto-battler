export interface DecisionPoint {
  /** Available options presented to the player */
  options: ['Advance', 'Retreat']
  /** Consequence callbacks keyed by option */
  consequences: { [option: string]: () => void }
}
