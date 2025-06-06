export interface DecisionPoint {
  options: ['Advance', 'Retreat']
  consequences: { [option: string]: Function }
}
