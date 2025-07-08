const missionEngine = require('./missionEngine');
const itemService = require('../services/itemService');
const userService = require('../services/userService');

/**
 * Resolve a mission choice then persist resulting effects.
 *
 * @param {number} playerId
 * @param {object} choiceData
 * @returns {Promise<object>} The missionEngine result
 */
async function handleChoice(playerId, choiceData) {
  const result = await missionEngine.resolveChoice(playerId, choiceData);

  if (result.durability_loss && choiceData.item_id) {
    await itemService.reduceDurability(choiceData.item_id, result.durability_loss);
  }

  if (Array.isArray(result.flags)) {
    for (const flag of result.flags) {
      await userService.addFlag(playerId, flag);
    }
  }

  if (Array.isArray(result.loot)) {
    for (const item of result.loot) {
      await itemService.addItem(playerId, item);
    }
  }

  if (Array.isArray(result.codex)) {
    for (const frag of result.codex) {
      await userService.addCodexFragment(playerId, frag);
    }
  }

  return result;
}

module.exports = { handleChoice };
