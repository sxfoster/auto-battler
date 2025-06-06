import { classes } from '../models/classes.js'

/**
 * Get the class definition for a character
 */
function getClassDef(character) {
  return classes.find(c => c.name === character.class)
}

import { Role } from '../models/classes.js'; // Import Role enum

/**
 * Returns true if character's class/role matches card requirements
 * @param {import('../models').Character} character
 * @param {import('../models').Card} card
 */
export function canUseCard(character, card) {
  // Basic null/undefined checks for inputs
  if (!character || typeof character !== 'object' || !character.class) {
    console.warn('Invalid character object or missing class property.');
    return false;
  }
  if (!card || typeof card !== 'object') {
    console.warn('Invalid card object.');
    return false;
  }

  // Validate character.class
  const isValidClass = classes.some(c => c.name === character.class);
  if (!isValidClass) {
    console.warn(`Invalid character class: ${character.class}`);
    return false;
  }

  // Get class definition (should be successful due to the check above)
  const cls = getClassDef(character);
  if (!cls) {
    // This case should ideally not be reached if classes model is consistent
    console.error(`Class definition not found for: ${character.class}, though it passed validation. Check models.`);
    return false;
  }

  // Validate card.roleTag (if present)
  if (card.roleTag && !Object.values(Role).includes(card.roleTag)) {
    console.warn(`Invalid card roleTag: ${card.roleTag}`);
    return false;
  }

  // Original logic
  if (card.classRestriction && card.classRestriction !== character.class) return false;
  if (card.roleTag && card.roleTag !== cls.role) return false;

  // Ensure allowedCards is checked for existence if it's optional for a class
  if (cls.allowedCards && Array.isArray(cls.allowedCards) && !cls.allowedCards.includes(card.id)) return false;

  return true;
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
