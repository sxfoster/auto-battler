import { classes } from '../models/classes.js'

/**
 * Get the class definition for a character
 */
function getClassDef(character) {
  return classes.find(c => c.name === character.class)
}

/**
 * Returns true if character's class/role matches card requirements
 * @param {import('../models').Character} character
 * @param {import('../models').Card} card
 */
export function canUseCard(character, card) {
  const cls = getClassDef(character)
  if (!cls) return false
  if (card.classRestriction && card.classRestriction !== character.class) return false
  if (card.roleTag && card.roleTag !== cls.role) return false
  if (cls.allowedCards && !cls.allowedCards.includes(card.id)) return false
  return true
}

/**
 * Applies -75% effectiveness penalty if role mismatch
 * @param {import('../models').Card} card
 * @param {import('../models').Character} character
 * @returns {import('../models').Effect}
 */
export function applyRolePenalty(card, character) {
  const cls = getClassDef(character)
  const effect = { ...(card.effect || {}) }
  if (card.roleTag && cls && card.roleTag !== cls.role && effect.magnitude) {
    effect.magnitude *= 0.25
  }
  return effect
}

/**
 * Activates synergy effect if class matches card's classRestriction
 * @param {import('../models').Card} card
 * @param {import('../models').Character} character
 * @returns {import('../models').Effect|null}
 */
export function applyClassSynergy(card, character) {
  if (card.synergyEffect && card.classRestriction === character.class) {
    return card.synergyEffect
  }
  return null
}

/**
 * Returns any applicable synergy bonuses based on role/class
 * @param {import('../models').Card} card
 * @param {import('../models').Character} character
 * @returns {import('../models').Effect[]}
 */
export function getSynergyBonuses(card, character) {
  const bonuses = []
  const bonus = applyClassSynergy(card, character)
  if (bonus) bonuses.push(bonus)
  return bonuses
}
