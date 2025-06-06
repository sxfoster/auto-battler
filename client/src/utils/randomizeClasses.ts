import { classes } from '../../../shared/models/classes.js'
import type { Role } from '../../../shared/models/Card'

export interface GameClass {
  id: string
  name: string
  description: string
  role: Role
  allowedCards: string[]
}

/**
 * Randomly select `count` classes ensuring at least one of each role if possible.
 */
export function getRandomClasses(count = 4, allClasses: GameClass[] = classes): GameClass[] {
  const result: GameClass[] = []
  const roles: Role[] = ['Tank', 'Healer', 'Support', 'DPS']
  const buckets: Record<Role, GameClass[]> = {
    Tank: [],
    Healer: [],
    Support: [],
    DPS: [],
  }
  allClasses.forEach((cls) => {
    buckets[cls.role].push(cls)
  })
  // Ensure one of each role when possible
  for (const role of roles) {
    if (result.length >= count) break
    const pool = buckets[role]
    if (pool.length) {
      const idx = Math.floor(Math.random() * pool.length)
      result.push(pool.splice(idx, 1)[0])
    }
  }
  const remaining = Object.values(buckets).flat()
  while (result.length < count && remaining.length) {
    const idx = Math.floor(Math.random() * remaining.length)
    result.push(remaining.splice(idx, 1)[0])
  }
  return result
}
