export interface ExperienceState {
  level: number
  experience: number
  experienceToNext: number
}

/**
 * Add experience to the state and handle level ups.
 * Returns the number of levels gained.
 */
export function gainExperience(state: ExperienceState, amount: number): number {
  let levels = 0
  state.experience += amount
  while (state.experience >= state.experienceToNext) {
    state.experience -= state.experienceToNext
    state.level += 1
    levels += 1
    // scale next level requirement
    state.experienceToNext = Math.round(state.experienceToNext * 1.5)
  }
  return levels
}

/**
 * Initialize a new experience state at level 1.
 */
export function createExperienceState(level = 1): ExperienceState {
  return { level, experience: 0, experienceToNext: 100 }
}
