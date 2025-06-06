import { classes } from '../models/classes.js'

/**
 * Retrieves the class definition object for a given character.
 *
 * @param {import('../models').Character} character - The character object.
 * @returns {import('../models/classes.js').classes[0] | undefined} The class definition object if found, otherwise undefined.
 */
function getClassDef(character) {
  return classes.find(c => c.name === character.class)
}

import { Role } from '../models/classes.js'; // Import Role enum

/**
 * Checks if a character can use a specific card based on class and role restrictions.
 * It validates character and card inputs, checks for valid character class and card roleTag,
 * and then verifies against class restrictions, role tags, and allowed card lists.
 *
 * @param {import('../models').Character} character - The character attempting to use the card.
 * @param {import('../models').Card} card - The card to be used.
 * @returns {boolean} True if the character can use the card, false otherwise.
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
 * Applies a penalty to a card's effect if the character's role does not match the card's role tag.
 * If there is a mismatch and the card effect has a magnitude, the magnitude is reduced by 75%.
 *
 * @param {import('../models').Card} card - The card whose effect is being considered.
 * @param {import('../models').Character} character - The character using the card.
 * @returns {import('../models').Effect} The card's effect, potentially modified with a penalty.
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
 * Activates a card's synergy effect if the character's class matches the card's class restriction.
 *
 * @param {import('../models').Card} card - The card to check for synergy.
 * @param {import('../models').Character} character - The character using the card.
 * @returns {import('../models').Effect | null} The synergy effect if applicable, otherwise null.
 */
export function applyClassSynergy(card, character) {
  if (card.synergyEffect && card.classRestriction === character.class) {
    return card.synergyEffect
  }
  return null
}

/**
 * Retrieves any applicable synergy bonuses for a card when used by a specific character,
 * based on class matching the card's class restriction.
 *
 * @param {import('../models').Card} card - The card to check for synergy bonuses.
 * @param {import('../models').Character} character - The character using the card.
 * @returns {import('../models').Effect[]} An array of synergy effects. Currently, it only considers class synergy.
 */
export function getSynergyBonuses(card, character) {
  const bonuses = []
  const bonus = applyClassSynergy(card, character)
  if (bonus) bonuses.push(bonus)
  return bonuses
}
