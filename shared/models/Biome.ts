export interface BiomeBonus {
  /** Type of bonus effect */
  type: 'StatModifier' | 'EffectModifier' | 'Immunity' | 'Trigger' | 'ResourceChange'
  /** Target group this bonus applies to (e.g. all, caster, undead) */
  target: string
  /** Implementation specific effect details */
  effectDetails: Record<string, any>
  /** Text describing the bonus to players */
  description?: string
}

export interface Biome {
  /** Unique biome id */
  id: string
  /** Display name */
  name: string
  /** Short description */
  description: string
  /** Optional visual theme identifier */
  theme?: string
  /** Bonuses applied to enemies spawned in this biome */
  bonuses: BiomeBonus[]
}
