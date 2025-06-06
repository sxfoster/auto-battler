/**
 * Crafting utilities for professions and magical pouch experiments.
 * @module crafting
 */

/**
 * Attempts to craft an item using the supplied cards (ingredients) and profession.
 * It validates the inputs, then checks if the sorted ingredient IDs match any known recipe
 * for the given profession and level.
 * If a match is found and the profession level is sufficient, it returns a successful crafting attempt.
 *
 * @param {import('../models').Profession} profession - The profession object, including name, level, and unlocked recipes.
 * @param {import('../models').Card[]} usedCards - An array of card objects representing the ingredients used.
 * @param {import('../models').Recipe[]} recipes - An array of all available recipe definitions.
 * @returns {import('../models').CraftingAttempt} An object detailing the outcome of the crafting attempt,
 * including success status, the resulting item (if any), and whether a new recipe was discovered.
 * Returns an error message in the CraftingAttempt object if inputs are invalid.
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
 * Retrieves all recipes that are available to a character based on their profession and current level.
 *
 * @param {import('../models').Profession} profession - The profession object, including name and level.
 * @param {import('../models').Recipe[]} recipes - An array of all available recipe definitions.
 * @returns {import('../models').Recipe[]} An array of recipe objects that the character can currently use.
 */
export function getAvailableRecipes(profession, recipes) {
  return recipes.filter(
    (r) => r.profession === profession.name && r.levelRequirement <= profession.level,
  )
}

/**
 * Adds experience to a profession and levels it up if the experience threshold is met.
 * The experience needed for the next level is 100 times the current level.
 * The maximum profession level is 10.
 *
 * @param {import('../models').Profession} profession - The profession object to update. This object is mutated directly.
 * @param {number} exp - The amount of experience points to add.
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
 * Records a discovered recipe for a player.
 * It adds the recipe ID to the player's list of discovered recipes and
 * to the specific profession's list of unlocked recipes, if not already present.
 *
 * @param {import('../models').Player} player - The player object to update. This object is mutated directly.
 * @param {import('../models').Recipe} recipe - The recipe object that was discovered.
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
