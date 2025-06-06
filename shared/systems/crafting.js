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
export function attemptCraft(profession, usedCards, recipes, player) {
  const ingredientIds = usedCards.map((c) => c.id).sort().join('|')
  const recipe = recipes.find(
    (r) =>
      r.profession === profession.name &&
      r.ingredients.slice().sort().join('|') === ingredientIds &&
      profession.level >= r.levelRequirement,
  )

  if (recipe) {
    if (recipe.cost && player) {
      const bal = player.currencies[recipe.cost.currency] || 0
      if (bal < recipe.cost.amount) {
        return { usedCards, result: null, success: false, newRecipeDiscovered: false }
      }
      player.currencies[recipe.cost.currency] = bal - recipe.cost.amount
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
