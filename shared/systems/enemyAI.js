/** Enemy AI utilities supporting combo tracking and execution */

/**
 * Records a card usage for an enemy and optionally for an enemy group, for combo tracking purposes.
 * It maintains a list of recently used cards within a defined combo window.
 *
 * @param {import('../models').Enemy} enemy - The enemy that used the card. This enemy object is mutated.
 * @param {import('../models').Card} card - The card that was used.
 * @param {number} turn - The current turn number.
 * @param {{ lastUsedCards?: { card: import('../models').Card, turn: number }[] }} [group] - Optional. The enemy group to also track this action for. If provided, this group object is mutated.
 */
export function trackEnemyActions(enemy, card, turn, group) {
  if (!enemy.lastUsedCards) enemy.lastUsedCards = []
  enemy.lastUsedCards.push({ card, turn })
  const window = enemy.aiProfile.comboWindowTurns || 2
  enemy.lastUsedCards = enemy.lastUsedCards.filter((c) => turn - c.turn <= window)
  if (group) {
    if (!group.lastUsedCards) group.lastUsedCards = []
    group.lastUsedCards.push({ card, turn })
    group.lastUsedCards = group.lastUsedCards.filter(
      (c) => turn - c.turn <= window,
    )
  }
}

/**
 * Finds a combo starter card with a specific synergy tag from a list of cards.
 *
 * @param {import('../models').Card[]} cards - An array of cards to search within.
 * @param {string} comboTag - The synergy tag to look for in a combo starter.
 * @returns {import('../models').Card | null} The found combo starter card, or null if not found.
 */
export function findComboStarter(cards, comboTag) {
  return cards.find((c) => c.isComboStarter && c.synergyTag === comboTag) || null
}

/**
 * Finds a combo finisher card with a specific synergy tag from a list of cards.
 *
 * @param {import('../models').Card[]} cards - An array of cards to search within.
 * @param {string} comboTag - The synergy tag to look for in a combo finisher.
 * @returns {import('../models').Card | null} The found combo finisher card, or null if not found.
 */
export function findComboFinisher(cards, comboTag) {
  return cards.find((c) => c.isComboFinisher && c.synergyTag === comboTag) || null
}

/**
 * Determines if an enemy should try to execute a combo finisher based on recently played cards.
 * It checks if a combo starter was recently played (within the combo window) and if a corresponding
 * finisher is available in the enemy's deck.
 *
 * @param {import('../models').Enemy} enemy - The enemy to evaluate.
 * @param {{ currentTurn: number, group?: { lastUsedCards?: { card: import('../models').Card, turn: number }[] } }} context - The current game context, including the current turn and optional group actions.
 * @returns {boolean} True if the enemy should attempt a combo finisher, false otherwise.
 */
export function shouldExecuteCombo(enemy, context) {
  const profile = enemy.aiProfile
  if (!profile.enableComboAwareness) return false
  const memory = context.group?.lastUsedCards || enemy.lastUsedCards || []
  const turn = context.currentTurn
  const window = profile.comboWindowTurns || 2
  const recent = [...memory]
    .reverse()
    .find((r) => r.card.isComboStarter && turn - r.turn <= window)
  if (!recent) return false
  return !!findComboFinisher(enemy.deck, recent.card.synergyTag)
}

/**
 * Chooses the next card an enemy should play.
 * If the enemy should execute a combo (based on `shouldExecuteCombo`), it will select the
 * appropriate finisher. Otherwise, it defaults to playing the first card in its deck.
 *
 * @param {import('../models').Enemy} enemy - The enemy choosing the action.
 * @param {{ currentTurn: number, group?: { lastUsedCards?: { card: import('../models').Card, turn: number }[] } }} context - The current game context.
 * @returns {import('../models').Card} The card chosen for the enemy to play.
 */
export function chooseEnemyAction(enemy, context) {
  if (shouldExecuteCombo(enemy, context)) {
    const memory = context.group?.lastUsedCards || enemy.lastUsedCards || []
    const turn = context.currentTurn
    const window = enemy.aiProfile.comboWindowTurns || 2
    const recent = [...memory]
      .reverse()
      .find((r) => r.card.isComboStarter && turn - r.turn <= window)
    const finisher = findComboFinisher(enemy.deck, recent.card.synergyTag)
    if (finisher) return finisher
  }
  return enemy.deck[0]
}
