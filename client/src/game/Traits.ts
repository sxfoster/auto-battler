export interface TraitBonus {
  /** Number of units with this trait required */
  required: number
  /** Description of the bonus */
  description: string
  /** Flat stat bonuses applied when active */
  stats?: {
    hp?: number
    attack?: number
    defense?: number
    speed?: number
  }
}

export interface Trait {
  id: string
  name: string
  bonuses: TraitBonus[]
}

/**
 * Example trait definitions used by the auto-battler.
 * Additional traits can be appended as the roster grows.
 */
export const traits: Trait[] = [
  {
    id: 'warrior',
    name: 'Warrior',
    bonuses: [
      {
        required: 3,
        description: '+2 attack for all Warriors',
        stats: { attack: 2 },
      },
    ],
  },
  {
    id: 'mage',
    name: 'Mage',
    bonuses: [
      {
        required: 2,
        description: '+1 speed for all Mages',
        stats: { speed: 1 },
      },
    ],
  },
]
