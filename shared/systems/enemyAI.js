/** Enemy AI utilities supporting combo tracking and execution */

/**
 * Record a card usage for combo tracking.
 * @param {import('../models').Enemy} enemy
 * @param {import('../models').Card} card
 * @param {number} turn
 * @param {{ lastUsedCards?: { card: import('../models').Card, turn: number }[] }} [group]
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

/** Find a combo starter with the given tag */
export function findComboStarter(cards, comboTag) {
  return cards.find((c) => c.isComboStarter && c.synergyTag === comboTag) || null
}

/** Find a combo finisher with the given tag */
export function findComboFinisher(cards, comboTag) {
  return cards.find((c) => c.isComboFinisher && c.synergyTag === comboTag) || null
}

/** Determine if the enemy should try to execute a combo finisher */
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

/** Choose which card the enemy should play next */
export function chooseEnemyAction(enemy, context) {
  const profile = enemy.aiProfile || {}
  if (shouldExecuteCombo(enemy, context)) {
    const memory = context.group?.lastUsedCards || enemy.lastUsedCards || []
    const turn = context.currentTurn
    const window = profile.comboWindowTurns || 2
    const recent = [...memory]
      .reverse()
      .find((r) => r.card.isComboStarter && turn - r.turn <= window)
    const finisher = findComboFinisher(enemy.deck, recent.card.synergyTag)
    if (finisher) return finisher
  }

  if (profile.enableComboAwareness) {
    const starters = enemy.deck.filter((c) => c.isComboStarter)
    if (starters.length) {
      const preferred = profile.preferredComboTags || []
      starters.sort((a, b) => {
        const aPref = preferred.includes(a.synergyTag) ? 1 : 0
        const bPref = preferred.includes(b.synergyTag) ? 1 : 0
        return bPref - aPref
      })
      const best = starters.find((s) => findComboFinisher(enemy.deck, s.synergyTag))
      if (best) return best
      return starters[0]
    }
  }

  return enemy.deck[0]
}

/** Select a target from the player party */
export function chooseTarget(players) {
  if (!players.length) return null
  return players.reduce((low, p) => (p.hp < low.hp ? p : low), players[0])
}
