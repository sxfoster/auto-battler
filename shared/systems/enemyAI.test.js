import { test } from 'node:test'
import assert from 'assert'
import { chooseEnemyAction, trackEnemyActions, setAIDebugListener } from './enemyAI.js'
import { sampleCards } from '../models/cards.js'

const enemyBase = {
  id: 'e1',
  archetype: 'test',
  stats: { hp: 10, energy: 1, speed: 1 },
  deck: [],
  aiProfile: { behavior: 'aggressive', aggressiveness: 1, enableComboAwareness: true },
}

test('chooseEnemyAction uses combo finisher when setup exists', () => {
  const enemy = JSON.parse(JSON.stringify(enemyBase))
  enemy.deck = [sampleCards.find(c => c.id === 'mark_target'), sampleCards.find(c => c.id === 'shadow_execution')]
  // simulate previous turn using starter
  trackEnemyActions(enemy, enemy.deck[0], 1)
  const card = chooseEnemyAction(enemy, { currentTurn: 2 })
  assert.strictEqual(card.id, 'shadow_execution')
})

test('chooseEnemyAction starts a combo when no setup', () => {
  const enemy = JSON.parse(JSON.stringify(enemyBase))
  enemy.deck = [sampleCards.find(c => c.id === 'mark_target'), sampleCards.find(c => c.id === 'shadow_execution')]
  const card = chooseEnemyAction(enemy, { currentTurn: 1 })
  assert.strictEqual(card.id, 'mark_target')
})

test('chooseEnemyAction favors healing when low HP', () => {
  const enemy = JSON.parse(JSON.stringify(enemyBase))
  enemy.deck = [sampleCards.find(c => c.id === 'strike'), sampleCards.find(c => c.id === 'heal')]
  enemy.aiProfile.enableComboAwareness = false
  const card = chooseEnemyAction(enemy, { currentTurn: 1, enemyHP: 2, enemyMaxHP: 10 })
  assert.strictEqual(card.id, 'heal')
})

test('debug listener receives decision info', () => {
  const enemy = JSON.parse(JSON.stringify(enemyBase))
  enemy.deck = [sampleCards.find(c => c.id === 'strike')]
  let received = null
  const listener = (info) => {
    received = info
  }
  setAIDebugListener(listener)
  const card = chooseEnemyAction(enemy, { currentTurn: 1 })
  assert.ok(received)
  assert.strictEqual(received.card, card.id)
  setAIDebugListener(null)
})
