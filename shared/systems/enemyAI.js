/** Enemy AI utilities supporting combo tracking and execution */

let debugListener = null

/**
 * Register a debug listener to receive AI decision details.
 * @param {(info: any) => void} fn
 */
export function setAIDebugListener(fn) {
  debugListener = typeof fn === 'function' ? fn : null
}

function debug(info) {
  if (debugListener) debugListener(info)
}

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

/** Basic card scoring based on health and effect */
export function evaluateCard(enemy, card, context = {}) {
  let score = 0
  const effect = card.effect || card.effects?.[0] || {}
  const hp = context.enemyHP ?? enemy.stats.hp
  const max =
    context.enemyMaxHP ??
    (enemy.stats.maxHp !== undefined ? enemy.stats.maxHp : enemy.stats.hp)
  if (effect.type === 'heal') {
    score += Math.max(0, max - hp)
  }
  if (effect.type === 'damage') {
    score += effect.magnitude || effect.value || 0
  }
  return score
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
    if (finisher) {
      debug({ enemyId: enemy.id, turn: context.currentTurn, decision: 'comboFinisher', card: finisher.id })
      return finisher
    }
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
      const chosen = best || starters[0]
      debug({ enemyId: enemy.id, turn: context.currentTurn, decision: 'comboStarter', card: chosen.id })
      return chosen
    }
  }

  const scored = enemy.deck.map((c) => ({ card: c, score: evaluateCard(enemy, c, context) }))
  scored.sort((a, b) => b.score - a.score)
  const choice = scored[0]?.card || enemy.deck[0]
  debug({ enemyId: enemy.id, turn: context.currentTurn, decision: 'scored', card: choice?.id })
  return choice
}

/** Select a target from the player party */
export function chooseTarget(players) {
  if (!players.length) return null
  return players.reduce((best, p) => {
    if (!best) return p
    if (p.hp < best.hp) return p
    if (p.hp === best.hp && p.position != null && best.position != null) {
      return p.position < best.position ? p : best
    }
    return best
  }, null)
}
