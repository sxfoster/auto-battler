export interface Unit {
  id: string
  name: string
  maxHp: number
  hp: number
  attack?: number
  defense?: number
  speed?: number
  /** Trait ids assigned to this unit */
  traits: string[]
}
