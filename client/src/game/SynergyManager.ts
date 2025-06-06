import { traits, TraitBonus } from './Traits'
import type { Unit } from './Unit'

export interface ActiveSynergy {
  trait: string
  bonus: TraitBonus
}

/**
 * Determine which trait synergies are active for a given team.
 */
export function getActiveSynergies(units: Unit[]): ActiveSynergy[] {
  const results: ActiveSynergy[] = []
  for (const trait of traits) {
    const count = units.filter(u => u.traits.includes(trait.id)).length
    trait.bonuses.forEach(bonus => {
      if (count >= bonus.required) {
        results.push({ trait: trait.id, bonus })
      }
    })
  }
  return results
}

/**
 * Apply stat bonuses from active synergies and return new unit copies.
 */
export function applySynergyBonuses(units: Unit[]): Unit[] {
  const synergies = getActiveSynergies(units)
  return units.map(unit => {
    const updated = { ...unit }
    synergies.forEach(({ trait, bonus }) => {
      if (unit.traits.includes(trait) && bonus.stats) {
        if (bonus.stats.hp) {
          updated.maxHp += bonus.stats.hp
          updated.hp += bonus.stats.hp
        }
        if (bonus.stats.attack)
          updated.attack = (updated.attack || 0) + bonus.stats.attack
        if (bonus.stats.defense)
          updated.defense = (updated.defense || 0) + bonus.stats.defense
        if (bonus.stats.speed)
          updated.speed = (updated.speed || 0) + bonus.stats.speed
      }
    })
    return updated
  })
}
