/**
 * Crafting utilities for professions and magical pouch experiments.
 * @module crafting
 */

/**
 * Attempt to craft using the supplied cards and profession.
 * Checks recipes by matching ingredient ids regardless of order.
 * @param {import('../models').Profession} profession
 * @param {import('../models').Card[]} usedCards
 * @param {import('../models').Recipe[]} recipes
 * @returns {import('../models').CraftingAttempt}
 */
export function attemptCraft(profession, usedCards, recipes) {
  // Validate profession object
  if (!profession || typeof profession !== 'object' ||
      typeof profession.name !== 'string' ||
      typeof profession.level !== 'number' ||
      !Array.isArray(profession.unlockedRecipes)) {
    console.warn('Invalid profession object provided to attemptCraft.');
    return { usedCards, result: null, success: false, newRecipeDiscovered: false, error: 'Invalid profession data' };
  }

  // Validate usedCards array
  if (!Array.isArray(usedCards) || usedCards.length === 0) {
    console.warn('usedCards must be a non-empty array.');
    return { usedCards, result: null, success: false, newRecipeDiscovered: false, error: 'No cards provided for crafting' };
  }

  // Validate individual cards in usedCards
  for (const card of usedCards) {
    if (!card || typeof card !== 'object' || typeof card.id !== 'string') {
      console.warn('Invalid card found in usedCards array (missing id or not an object).');
      return { usedCards, result: null, success: false, newRecipeDiscovered: false, error: 'Invalid card data among used cards' };
    }
  }

  // Validate recipes array
  if (!Array.isArray(recipes)) {
    console.warn('Recipes must be an array.');
    // Depending on strictness, you might allow crafting without recipes (always fails) or error out
    return { usedCards, result: null, success: false, newRecipeDiscovered: false, error: 'Invalid recipes data' };
  }

  const ingredientIds = usedCards.map((c) => c.id).sort().join('|');
  const recipe = recipes.find(
    (r) =>
      r.profession === profession.name &&
      Array.isArray(r.ingredients) && // Ensure recipe.ingredients is an array
      r.ingredients.slice().sort().join('|') === ingredientIds &&
      profession.level >= r.levelRequirement,
  );

  if (recipe) {
    // Ensure recipe.result and recipe.result.id exist
    if (!recipe.result || typeof recipe.result.id !== 'string') {
        console.warn(`Recipe ${recipe.id} has invalid result or result.id.`);
        return { usedCards, result: null, success: false, newRecipeDiscovered: false, error: 'Invalid recipe result data' };
    }
    const crafted = { ...recipe.result, id: `${recipe.result.id}_${Date.now()}` }
    return {
      usedCards,
      result: crafted,
      success: true,
      newRecipeDiscovered: !profession.unlockedRecipes.includes(recipe.id),
    }
  }

  return { usedCards, result: null, success: false, newRecipeDiscovered: false }
}

/**
 * Retrieve all recipes available to the profession's current level.
 * @param {import('../models').Profession} profession
 * @param {import('../models').Recipe[]} recipes
 * @returns {import('../models').Recipe[]}
 */
export function getAvailableRecipes(profession, recipes) {
  return recipes.filter(
    (r) => r.profession === profession.name && r.levelRequirement <= profession.level,
  )
}

/**
 * Add experience and level up if threshold met.
 * @param {import('../models').Profession} profession
 * @param {number} exp
 */
export function levelUpProfession(profession, exp) {
  profession.experience += exp
  const needed = profession.level * 100
  if (profession.experience >= needed && profession.level < 10) {
    profession.level += 1
    profession.experience = 0
  }
}

/**
 * Record a discovered recipe for a player and profession.
 * @param {import('../models').Player} player
 * @param {import('../models').Recipe} recipe
 */
export function registerRecipeDiscovery(player, recipe) {
  if (!player.discoveredRecipes.includes(recipe.id)) {
    player.discoveredRecipes.push(recipe.id)
  }
  const prof = player.professions[recipe.profession]
  if (prof && !prof.unlockedRecipes.includes(recipe.id)) {
    prof.unlockedRecipes.push(recipe.id)
  }
}
