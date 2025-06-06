// Utilities for tracking ability cooldowns

/** @typedef {import('../models').Card} Card */
/** @typedef {import('../models').Character} Character */

/** Ensure the character has a cooldown map */
export function initCooldowns(character) {
  if (!character.cooldowns) character.cooldowns = {}
}

/**
 * Determine if the ability can currently be used.
 * @param {Character} character
 * @param {Card} card
 */
export function canUseAbility(character, card) {
  initCooldowns(character)
  return (character.cooldowns[card.id] || 0) <= 0
}

/**
 * Apply the card's cooldown to the character after use.
 * @param {Character} character
 * @param {Card} card
 */
export function applyCooldown(character, card) {
  initCooldowns(character)
  const cd = card.cooldown || 0
  if (cd > 0) {
    character.cooldowns[card.id] = cd
  }
}

/**
 * Reduce all cooldown timers by one turn.
 * @param {Character} character
 */
export function tickCooldowns(character) {
  initCooldowns(character)
  for (const id of Object.keys(character.cooldowns)) {
    character.cooldowns[id] = Math.max(0, character.cooldowns[id] - 1)
  }
}
