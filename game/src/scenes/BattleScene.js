import Phaser from 'phaser'
import { applyRolePenalty, getSynergyBonuses } from 'shared/systems/classRole.js'
import { applyBiomeBonuses, getCurrentBiome } from 'shared/systems/biome.js'
import { applyEventEffects } from 'shared/systems/floorEvents.js'
import { chooseEnemyAction, trackEnemyActions, chooseTarget } from 'shared/systems/enemyAI.js'
import { canUseAbility, applyCooldown, tickCooldowns } from 'shared/systems/abilities.js'
import { floatingText } from '../effects.js'
import { loadGameState } from '../state'
import { partyState, loadPartyState } from '../shared/partyState.js'
import { InitiativeQueue } from '../../shared/initiativeQueue.js'
import { sampleCharacters } from 'shared/models/characters.js'
import { sampleCards } from 'shared/models/cards.js'
import { markRoomCleared } from 'shared/dungeonState.js'
import { shuffleArray } from '../utils/shuffleArray.js'
import {
  STATUS_META,
  addStatusEffect,
  getStatusValue,
  applyStatusTick,
} from '../statusSystem.js'
const defaultPortrait = new URL('../../../shared/images/default-portrait.png', import.meta.url).href

const INITIAL_HAND_SIZE = 2

// Amount of energy each unit gains at the start of its turn
const ENERGY_PER_TURN = 1

// Number of cards drawn at the start of each turn
const DRAW_PER_TURN = 1


export default class BattleScene extends Phaser.Scene {
  constructor() {
    super('battle')
    this.biome = null
  }

  preload() {
    // audio assets removed
    loadPartyState()
    this.party = partyState.members.map((m) => {
      const base = sampleCharacters.find((c) => c.id === m.class)
      const cards = (m.cards || [])
        .map((cid) => sampleCards.find((sc) => sc.id === cid))
        .filter(Boolean)
      const deck = cards.length ? cards : base?.deck || []
      return base ? { ...base, deck } : { id: m.class, name: m.class, stats: { hp: 10, energy: 1, speed: 1 }, deck, portrait: defaultPortrait }
    })

    const dungeon = this.scene.get('dungeon')
    const enemy = dungeon.rooms[this.roomIndex]?.enemy
    this.enemies = enemy ? [JSON.parse(JSON.stringify(enemy))] : []

    this.party.forEach((p) => {
      this.load.image(`portrait-${p.id}`, p.portrait || defaultPortrait)
    })
    this.enemies.forEach((e) => {
      this.load.image(`portrait-${e.id}`, e.portrait || defaultPortrait)
    })
  }

  getSprite(combatant) {
    return (
      this.playerSprites.find((s) => s.data.id === combatant.data.id) ||
      this.enemySprites.find((s) => s.data.id === combatant.data.id)
    )
  }

  showFloat(text, combatant, color) {
    const sprite = this.getSprite(combatant)
    if (sprite && sprite.ref) {
      const { x, y } = sprite.ref
      floatingText(this, text, x, y - 40, color)
    }
  }

  updateStatusIcons(combatant) {
    // HUD handles status icon rendering
  }

  getPlayerUnits() {
    return this.combatants.filter((c) => c.type === 'player')
  }

  getEnemyUnits() {
    return this.combatants.filter((c) => c.type === 'enemy')
  }

  selectTarget(unit) {
    const opponents =
      unit.type === 'player' ? this.getEnemyUnits() : this.getPlayerUnits()
    return opponents.find((o) => o.hp > 0)
  }


  calculateDamage(effect, attacker, defender) {
    let dmg = effect.magnitude || effect.value || 0
    dmg += getStatusValue(attacker, 'attack')
    dmg -= getStatusValue(defender, 'defense')
    dmg += getStatusValue(defender, 'marked')
    if (effect.element === 'fire') {
      if (attacker.data?.stats?.firePower) {
        dmg += attacker.data.stats.firePower
      }
      if (defender.data?.stats?.fireResist) {
        dmg *= 1 - defender.data.stats.fireResist
      }
    }
    if (dmg < 0) dmg = 0
    return Math.round(dmg)
  }

  applyStatusEffects(combatant) {
    const skip = applyStatusTick(this, combatant, (t, c, col) =>
      this.showFloat(t, c, col)
    )
    this.updateHealth()
    this.updateStatusIcons(combatant)
    return skip
  }

  draw(combatant, count = 1) {
    if (!combatant.data.hand) {
      combatant.data.hand = []
    }
    for (let i = 0; i < count; i++) {
      if (combatant.data.deck.length === 0) break
      const card = combatant.data.deck.shift()
      if (canUseAbility(combatant.data, card)) {
        combatant.data.hand.push(card)
      } else {
        combatant.data.deck.push(card)
      }
    }
  }

  pickPlayableCard(unit) {
    unit.data.hand = unit.data.hand || []
    if (unit.data.hand.length === 0) {
      this.draw(unit, 1)
    }
    return unit.data.hand.find(
      (c) => (c.energyCost || 0) <= (unit.energy || 0),
    )
  }


  initializeCombatants() {
    this.combatants = [
      ...this.party.map((c, idx) => ({
        type: 'player',
        data: c,
        hp: c.stats.hp,
        energy: c.stats.energy,
        speed: c.stats.speed,
        statusEffects: [],
        position: idx,
      })),
      ...this.enemies.map((e, idx) => ({
        type: 'enemy',
        data: e,
        hp: e.stats.hp,
        energy: e.stats.energy,
        speed: e.stats.speed,
        statusEffects: [],
        position: idx,
      })),
    ]
    this.turnOrder = this.combatants.sort((a, b) => b.speed - a.speed)
    this.turnIndex = 0
    this.turnNumber = 0
    this.isFirstCard = true
  }

  startBattle() {
    this.input.off('gameobjectdown')
    this.drawBattlefield()
    this.startTurn()
  }

  selectEnemyTarget() {
    return this.turnOrder.find((c) => c.type === 'enemy' && c.hp > 0)
  }

  regenEnergy(combatant, amount = 1) {
    const max = combatant.data.stats.energy || 0
    combatant.energy = Math.min(max, (combatant.energy || 0) + amount)
  }

  init(data) {
    this.roomIndex = data.roomIndex || 0
  }

  create() {
    loadPartyState()
    this.party = partyState.members.map((m) => {
      const base = sampleCharacters.find((c) => c.id === m.class)
      const cards = (m.cards || [])
        .map((cid) => sampleCards.find((sc) => sc.id === cid))
        .filter(Boolean)
      const deck = cards.length ? cards : base?.deck || []
      return base ? { ...base, deck } : { id: m.class, name: m.class, stats: { hp: 10, energy: 1, speed: 1 }, deck }
    })

    const dungeon = this.scene.get('dungeon')
    this.enemy = dungeon.rooms[this.roomIndex].enemy
    // clone enemy so we can modify stats
    this.enemies = [JSON.parse(JSON.stringify(this.enemy))]
    this.enemyGroup = { lastUsedCards: [] }
    const state = loadGameState()
    const biome = getCurrentBiome(state)
    this.biome = biome
    applyBiomeBonuses(biome, this.enemies)
    this.activeEvent = state.activeEvent || null
    this.initializeCombatants()

    const emitState = () => {
      this.events.emit('initial-state', {
        order: this.turnOrder.map((c) => c.data.id),
        combatants: this.turnOrder.reduce(
          (acc, c) => ({
            ...acc,
            [c.data.id]: {
              id: c.data.id,
              name: c.data.name,
              portraitUrl: c.data.portrait,
              maxHp: c.data.stats.hp,
              currentHp: c.hp,
              maxEnergy:
                c.data.stats.mana ||
                c.data.stats.energy ||
                c.data.stats.maxMana ||
                0,
              currentEnergy: c.data.currentEnergy || c.energy || 0,
              type: c.type,
            },
          }),
          {},
        ),
      })
    }
    emitState()
    this.events.on('request-state', emitState)

    // ─── Draw initial hand for every combatant ───
    this.turnOrder.forEach((combatant) => {
      // ensure a hand array exists
      combatant.data.hand = combatant.data.hand || []
      // draw INITIAL_HAND_SIZE cards into hand
      this.draw(combatant, INITIAL_HAND_SIZE)
    })

    console.debug(
      'Initial hands:',
      this.turnOrder.map((c) => ({
        name: c.data.name,
        handSize: c.data.hand.length,
      })),
    )

    this.initiativeQueue = new InitiativeQueue()
    this.initiativeQueueReady = (unit) => {
      this.events.emit('turn-start', {
        actorId: unit.data.id,
        currentEnergy: unit.data.currentEnergy,
        hand: (unit.data.hand || []).map((c) => c.id),
      })

      const target = this.selectTarget(unit)
      if (!target) return

      const playable = (unit.data.hand || []).filter(
        (c) => (c.energyCost ?? c.cost ?? 0) <= (unit.data.currentEnergy || 0),
      )
      if (playable.length) {
        const card = playable[0]
        const cost = card.energyCost ?? card.cost ?? 0
        unit.data.currentEnergy = Math.max(0, (unit.data.currentEnergy || 0) - cost)
        unit.energy = unit.data.currentEnergy
        this.events.emit('card-played', {
          actorId: unit.data.id,
          cardId: card.id,
          targetId: target.data.id,
          cost,
        })
        this.resolveCard(card, unit, target)
      } else {
        this.events.emit('turn-skipped', { actorId: unit.data.id })
      }
    }
    const playerUnits = this.getPlayerUnits()
    const enemyUnits = this.getEnemyUnits()
    ;[...playerUnits, ...enemyUnits].forEach((unit) => {
      const initialDelay = 1000 / unit.speed
      this.initiativeQueue.add(unit, initialDelay)
    })
    this.startBattle()

    // Battle log handled by React HUD
  }



  drawBattlefield() {
    this.playerSprites = []
    this.enemySprites = []
    const startY = 150
    const offsetY = 100

    this.party.forEach((p, i) => {
      const y = startY + i * offsetY
      this.playerSprites.push({ ref: { x: 150, y }, data: p, statusIcons: {} })
    })

    this.enemies.forEach((e, i) => {
      const y = startY + i * offsetY
      this.enemySprites.push({ ref: { x: 650, y }, data: e, statusIcons: {} })
    })

  }

  updateHealth() {
    // UI updated via React
  }

  startTurn() {
    if (this.checkBattleEnd()) {
      this.endBattle()
      return
    }
    this.current = this.turnOrder[this.turnIndex % this.turnOrder.length]
    this.regenEnergy(this.current)
    this.events.emit('turn-start', {
      actorId: this.current.data.id,
      currentEnergy: this.current.data.currentEnergy,
      hand: (this.current.data.hand || []).map((c) => c.id),
    })
    this.turnNumber += 1
    this.isFirstCard = true
    this.turnOrder.forEach((c) => tickCooldowns(c.data))
    applyEventEffects(this.activeEvent, {
      phase: 'turnStart',
      turn: this.turnNumber,
      party: this.turnOrder.filter((c) => c.type === 'player'),
      enemies: this.turnOrder.filter((c) => c.type === 'enemy'),
    })

    const skip = this.applyStatusEffects(this.current)
    if (skip) {
      this.events.emit('turn-skipped', { actorId: this.current.data.id })
      this.time.delayedCall(300, () => this.nextTurn())
      return
    }

    if (this.current.type === 'player') {
      this.time.delayedCall(300, () => {
        this.enemyAction()
      })
    } else {
      this.time.delayedCall(500, () => {
        this.enemyAction()
      })
    }
  }

  enemyAction() {
    const players = this.turnOrder.filter((c) => c.type === 'player')
    const context = {
      currentTurn: this.turnNumber,
      group: this.enemyGroup,
      enemyHP: this.current.hp,
      enemyMaxHP: this.current.data.stats.hp,
      players,
    }
    let card = chooseEnemyAction(this.current.data, context)
    let available = this.current.data.deck.filter(
      (c) =>
        canUseAbility(this.current.data, c) &&
        (c.energyCost || 0) <= (this.current.energy || 0),
    )
    if (!available.length) {
      this.showFloat('Wait', this.current, '#ffffff')
      this.regenEnergy(this.current)
      this.time.delayedCall(300, () => this.nextTurn())
      return
    }
    if (!canUseAbility(this.current.data, card) || card.energyCost > this.current.energy) {
      card = available[0]
    }
    const targetCombat = chooseTarget(players) || players[0]
    if (card.isComboFinisher) {
      console.log(`${this.current.data.name} executes combo ${card.synergyTag}`)
    }
    trackEnemyActions(this.current.data, card, this.turnNumber, this.enemyGroup)
    this.current.energy = Math.max(
      0,
      (this.current.energy || 0) - (card.energyCost || 0),
    )
    this.resolveCard(card, this.current, targetCombat)
  }

  resolveCard(card, actor, target) {
    actor.energy = Math.max(0, (actor.energy || 0) - (card.energyCost || 0))
    const preContext = { phase: 'beforeCard' }
    applyEventEffects(this.activeEvent, preContext)
    if (preContext.cancel) {
      this.nextTurn()
      return
    }
    this.showFloat(card.name, actor, '#ffff66')
    const effects = []
    if (card.effect) effects.push(card.effect)
    if (Array.isArray(card.effects)) effects.push(...card.effects)

    const baseEffects = effects.map((e) => ({ ...e }))
    const penalized = baseEffects.map((e) => applyRolePenalty({ effect: e, roleTag: card.roleTag }, actor.data))
    const synergy = getSynergyBonuses(card, actor.data)
    const finalEffects = penalized.concat(synergy)

    finalEffects.forEach((effect) => {
      if (effect.type === 'damage') {
        const dmg = this.calculateDamage(effect, actor, target)
        target.hp -= dmg
        this.showFloat(`-${dmg}`, target, '#ff4444')
        this.events.emit(
          'battle-log',
          `${actor.data.name} used ${card.name} on ${target.data.name}, dealing ${dmg} damage.`
        )
      }
      if (effect.type === 'heal') {
        const heal = effect.magnitude || effect.value || 0
        actor.hp = Math.min(actor.data.stats.hp, actor.hp + heal)
        this.showFloat(`+${heal}`, actor, '#44ff44')
        this.events.emit(
          'battle-log',
          `${actor.data.name} used ${card.name}, healing ${heal} HP.`
        )
      }
      if (effect.type === 'status') {
        addStatusEffect(target, {
          type: effect.statusType,
          duration: effect.duration || 1,
          value: effect.magnitude || effect.value || 0,
        })
        this.updateStatusIcons(target)
        this.showFloat(effect.statusType, target, STATUS_META[effect.statusType]?.color || '#ffaa88')
        this.events.emit(
          'battle-log',
          `${actor.data.name} applied ${effect.statusType} to ${target.data.name} for ${effect.duration} turns.`
        )
      }
      if (effect.type === 'buff') {
        const tgt = effect.target === 'self' ? actor : target
        addStatusEffect(tgt, {
          type: effect.stat || 'attack',
          duration: effect.duration || 1,
          value: effect.magnitude || effect.value || 0,
        })
        this.updateStatusIcons(tgt)
        this.showFloat(`+${effect.stat || 'buff'}`, tgt, STATUS_META[effect.stat]?.color || '#66ccff')
        this.events.emit(
          'battle-log',
          `${actor.data.name} increased ${tgt.data.name}'s ${effect.stat || 'stat'} by ${effect.magnitude || effect.value || 0} for ${effect.duration || 1} turns.`
        )
      }
      if (effect.type === 'debuff') {
        addStatusEffect(target, {
          type: 'marked',
          duration: effect.duration || 1,
          value: effect.magnitude || effect.value || 0,
        })
        this.updateStatusIcons(target)
        this.showFloat('Marked', target, STATUS_META.marked.color)
        this.events.emit(
          'battle-log',
          `${actor.data.name} marked ${target.data.name} for ${effect.duration || 1} turns.`
        )
      }
    })
    applyCooldown(actor.data, card)
    this.updateHealth()
    const postContext = { phase: 'afterCard', isFirstCard: this.isFirstCard }
    applyEventEffects(this.activeEvent, postContext)
    // emit a summary line after resolving all effects
    this.events.emit('battle-log', `${actor.data.name} finished using ${card.name}.`)
    this.isFirstCard = false
    if (postContext.repeat) {
      this.resolveCard(card, actor, target)
      return
    }
    const alliesAlive = this.turnOrder.some(c => c.type === 'player' && c.hp > 0)
    const enemiesAlive = this.turnOrder.some(c => c.type === 'enemy' && c.hp > 0)
    if (!alliesAlive && !enemiesAlive) {
      this.events.emit('battle-log', 'Both sides have fallen! It\u2019s a draw.')
      return this.endBattle()
    }
    this.nextTurn()
  }

  nextTurn() {
    this.turnIndex = (this.turnIndex + 1) % this.turnOrder.length
    this.startTurn()
  }

  checkBattleEnd() {
    const playersAlive = this.turnOrder.some((c) => c.type === 'player' && c.hp > 0)
    const enemiesAlive = this.turnOrder.some((c) => c.type === 'enemy' && c.hp > 0)
    return !playersAlive || !enemiesAlive
  }

  endBattle() {
    const playersAlive = this.turnOrder.some((c) => c.type === 'player' && c.hp > 0)
    const enemiesAlive = this.turnOrder.some((c) => c.type === 'enemy' && c.hp > 0)
    let text
    if (!playersAlive && !enemiesAlive) text = 'Draw'
    else if (!playersAlive) text = 'Defeat'
    else text = 'Victory'
    this.events.emit('battle-end', { result: text })
    this.showFloat(text, this.current, text === 'Victory' ? '#44ff44' : '#ff4444')
    if (enemiesAlive === false) {
      const dungeon = this.scene.get('dungeon')
      const room = dungeon.rooms[this.roomIndex]
      markRoomCleared(room.x, room.y)
    }
    this.time.delayedCall(1500, () => {
      this.scene.stop()
      this.scene.wake('dungeon')
    })
  }

  checkEnd() {
    if (this.checkBattleEnd()) {
      this.endBattle()
      return true
    }
    return false
  }

  update(time, delta) {
    if (!this.initiativeQueue) return
    this.initiativeQueue.update(delta)
    const readyUnits = this.initiativeQueue.getReadyUnits()
    readyUnits.forEach(({ unit }) => {
      if (unit.hp > 0) {
        // ─── Turn Start: Gain Energy ───
        if (unit.data.currentEnergy == null) {
          // initialize if missing
          unit.data.currentEnergy = unit.energy || 0
        }
        const maxEnergy =
          unit.data.stats.maxMana ||
          unit.data.stats.mana ||
          unit.data.stats.energy ||
          Infinity
        unit.data.currentEnergy = Math.min(
          unit.data.currentEnergy + ENERGY_PER_TURN,
          maxEnergy,
        )
        // keep combatant energy in sync for existing logic
        unit.energy = unit.data.currentEnergy

        // ─── Turn Start: Draw Cards ───
        unit.data.hand = unit.data.hand || []
        if (unit.data.deck.length === 0) {
          unit.data.deck = shuffleArray(unit.data.hand.splice(0))
          console.debug(`${unit.data.name} reshuffled their hand into deck`)
        }
        this.draw(unit, DRAW_PER_TURN)
        if (this.initiativeQueueReady) {
          this.initiativeQueueReady(unit)
        }
        const newDelay = 1000 / unit.speed
        this.initiativeQueue.add(unit, newDelay)
      }
      this.initiativeQueue.remove(unit)
    })

    if (readyUnits.length) {
      this.updateHealth()
    }

    if (this.checkBattleEnd()) {
      this.endBattle()
    }
  }
}
