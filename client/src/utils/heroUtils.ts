import { UnitState } from '@shared/models/UnitState'

/**
 * Groups heroes by their archetype.
 * @param {UnitState[]} allHeroes - The full array of hero objects.
 * @returns {Record<string, UnitState[]>} - An object where keys are archetypes and values are arrays of heroes.
 */
function groupHeroesByArchetype(allHeroes: UnitState[]): Record<string, UnitState[]> {
  return allHeroes.reduce<Record<string, UnitState[]>>((acc, hero) => {
    const archetype = hero.archetype
    if (!acc[archetype]) {
      acc[archetype] = []
    }
    acc[archetype].push(hero)
    return acc
  }, {})
}

/**
 * Selects one random hero from each core archetype to create a draft pool.
 * @param {UnitState[]} allHeroes - The full array of hero objects.
 * @returns {UnitState[]} - An array containing one random Tank, DPS, Healer, and Support.
 */
export function getRandomizedArchetypeDraft(allHeroes: UnitState[]): UnitState[] {
  const archetypes: UnitState['archetype'][] = ['Tank', 'DPS', 'Healer', 'Support']
  const groupedHeroes = groupHeroesByArchetype(allHeroes)
  const draftPool: UnitState[] = []

  for (const type of archetypes) {
    const heroPool = groupedHeroes[type]
    if (heroPool && heroPool.length > 0) {
      const randomIndex = Math.floor(Math.random() * heroPool.length)
      draftPool.push(heroPool[randomIndex])
    }
  }

  return draftPool
}
