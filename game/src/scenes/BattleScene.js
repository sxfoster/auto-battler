import Phaser from 'phaser'
import { applyRolePenalty, getSynergyBonuses } from 'shared/systems/classRole.js'
import { applyBiomeBonuses, getCurrentBiome } from 'shared/systems/biome.js'
import { applyEventEffects } from 'shared/systems/floorEvents.js'
import { chooseEnemyAction, trackEnemyActions, chooseTarget } from 'shared/systems/enemyAI.js'
import { canUseAbility, applyCooldown, tickCooldowns } from 'shared/systems/abilities.js'
import { floatingText } from '../effects.js'
import { loadGameState } from '../state'
import {
  STATUS_META,
  addStatusEffect,
  getStatusValue,
  applyStatusTick,
} from '../statusSystem.js'


export default class BattleScene extends Phaser.Scene {
  constructor() {
    super('battle')
    this.biome = null
  }

  preload() {
    // audio assets removed
  }

  getSprite(combatant) {
    return (
      this.playerSprites.find((s) => s.data.id === combatant.data.id) ||
      this.enemySprites.find((s) => s.data.id === combatant.data.id)
    )
  }

  showFloat(text, combatant, color) {
    const sprite = this.getSprite(combatant)
    if (sprite) {
      floatingText(this, text, sprite.rect.x, sprite.rect.y - 40, color)
    }
  }

  updateStatusIcons(combatant) {
    const sprite = this.getSprite(combatant)
    if (!sprite) return
    sprite.statusIcons = sprite.statusIcons || {}
    const active = combatant.statusEffects.map((s) => s.type)
    // remove missing
    Object.keys(sprite.statusIcons).forEach((type) => {
      if (!active.includes(type)) {
        const icon = sprite.statusIcons[type]
        this.tweens.add({
          targets: icon,
          alpha: 0,
          duration: 300,
          onComplete: () => icon.destroy(),
        })
        delete sprite.statusIcons[type]
      }
    })
    active.forEach((type, idx) => {
      let icon = sprite.statusIcons[type]
      const meta = STATUS_META[type] || {}
      if (!icon) {
        icon = this.add
          .text(0, 0, meta.icon || type[0], {
            fontSize: '14px',
            color: meta.color || '#ffffff',
          })
          .setAlpha(0)
        this.tweens.add({ targets: icon, alpha: 1, duration: 300 })
        sprite.statusIcons[type] = icon
      }
      icon.setText(meta.icon || type[0])
      icon.setPosition(sprite.rect.x - 20 + idx * 20, sprite.rect.y - 50)
    })
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
    const available = combatant.data.deck.filter((c) => canUseAbility(combatant.data, c))
    for (let i = 0; i < count; i++) {
      const pool = available.length ? available : combatant.data.deck
      const card = Phaser.Math.RND.pick(pool)
      combatant.data.hand.push(card)
    }
  }

  init(data) {
    this.roomIndex = data.roomIndex || 0
  }

  create() {
    const partyDataJSON = localStorage.getItem('partyData')
    if (partyDataJSON) {
      try {
        const parsed = JSON.parse(partyDataJSON)
        this.party = Array.isArray(parsed) ? parsed : parsed.characters || []
      } catch (e) {
        console.error('Failed to parse party data', e)
        this.party = []
      }
    } else {
      this.party = []
    }

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

    this.combatants = [
      ...this.party.map((c, idx) => ({
        type: 'player',
        data: c,
        hp: c.stats.hp,
        speed: c.stats.speed,
        statusEffects: [],
        position: idx,
      })),
      ...this.enemies.map((e, idx) => ({
        type: 'enemy',
        data: e,
        hp: e.stats.hp,
        speed: e.stats.speed,
        statusEffects: [],
        position: idx,
      })),
    ]
    this.turnOrder = this.combatants.sort((a, b) => b.speed - a.speed)
    this.turnIndex = 0
    this.turnNumber = 0
    this.isFirstCard = true

    this.drawBattlefield()
    this.startTurn()
  }

  drawBattlefield() {
    this.playerSprites = []
    this.enemySprites = []
    const startY = 150
    const offsetY = 100

    this.party.forEach((p, i) => {
      const y = startY + i * offsetY
      const rect = this.add.rectangle(150, y, 60, 60, 0x6699ff).setOrigin(0.5)
      const hpText = this.add.text(110, y + 40, '', { fontSize: '16px' })
      this.playerSprites.push({ rect, hpText, data: p, statusIcons: {} })
    })

    this.enemies.forEach((e, i) => {
      const y = startY + i * offsetY
      const rect = this.add.rectangle(650, y, 60, 60, 0xff6666).setOrigin(0.5)
      const hpText = this.add.text(610, y + 40, '', { fontSize: '16px' })
      this.enemySprites.push({ rect, hpText, data: e, statusIcons: {} })
    })

    this.turnText = this.add.text(350, 50, '', { fontSize: '20px' })
    if (this.biome) {
      this.add.text(350, 20, this.biome.name, { fontSize: '16px' }).setOrigin(0.5)
    }
    if (this.activeEvent) {
      this.add.text(350, 40, this.activeEvent.name, { fontSize: '16px', color: '#ffff00' }).setOrigin(0.5)
    }
    if (this.biome) {
      const bonusText = this.biome.bonuses.map((b) => b.description).filter(Boolean).join('\n')
      if (bonusText) {
        this.add.text(350, 70, bonusText, { fontSize: '14px', color: '#ffaa00', align: 'center' }).setOrigin(0.5)
      }
    }
    this.cardTexts = []
    this.updateHealth()
    this.combatants.forEach((c) => this.updateStatusIcons(c))
  }

  updateHealth() {
    this.playerSprites.forEach((sprite, i) => {
      const combat = this.turnOrder.find((c) => c.type === 'player' && c.data.id === sprite.data.id)
      sprite.hpText.setText(`HP: ${combat.hp}`)
    })
    this.enemySprites.forEach((sprite, i) => {
      const combat = this.turnOrder.find((c) => c.type === 'enemy' && c.data.id === sprite.data.id)
      sprite.hpText.setText(`HP: ${combat.hp}`)
    })
  }

  startTurn() {
    if (this.checkEnd()) return
    this.current = this.turnOrder[this.turnIndex % this.turnOrder.length]
    this.turnText.setText(`${this.current.data.name}'s turn`)
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
      this.time.delayedCall(300, () => this.nextTurn())
      return
    }

    if (this.current.type === 'player') {
      this.current.data.hand = []
      this.draw(this.current, 2)
      this.showPlayerCards()
    } else {
      this.time.delayedCall(500, () => {
        this.enemyAction()
      })
    }
  }

  showPlayerCards() {
    this.clearCards()
    const hand = this.current.data.hand || []
    hand.forEach((card, idx) => {
      const cd = this.current.data.cooldowns?.[card.id] || 0
      const label = cd > 0 ? `${card.name} (${cd})` : `${card.name}\n${card.description}`
      const txt = this.add.text(100 + idx * 120, 500, label, { fontSize: '16px', backgroundColor: '#ddd', padding: 5, align: 'center' })
      if (cd === 0) {
        txt.setInteractive().on('pointerdown', () => {
          this.resolveCard(card, this.current, this.enemies[0])
        })
      } else {
        txt.setFill('#777777')
      }
      this.cardTexts.push(txt)
    })
  }

  clearCards() {
    this.cardTexts.forEach((t) => t.destroy())
    this.cardTexts = []
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
    if (!canUseAbility(this.current.data, card)) {
      const available = this.current.data.deck.filter((c) => canUseAbility(this.current.data, c))
      card = available.length ? Phaser.Math.RND.pick(available) : card
    }
    const targetCombat = chooseTarget(players) || players[0]
    if (card.isComboFinisher) {
      console.log(`${this.current.data.name} executes combo ${card.synergyTag}`)
    }
    trackEnemyActions(this.current.data, card, this.turnNumber, this.enemyGroup)
    this.resolveCard(card, this.current, targetCombat)
  }

  resolveCard(card, actor, target) {
    const preContext = { phase: 'beforeCard' }
    applyEventEffects(this.activeEvent, preContext)
    if (preContext.cancel) {
      this.clearCards()
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
      }
      if (effect.type === 'heal') {
        const heal = effect.magnitude || effect.value || 0
        actor.hp = Math.min(actor.data.stats.hp, actor.hp + heal)
        this.showFloat(`+${heal}`, actor, '#44ff44')
      }
      if (effect.type === 'status') {
        addStatusEffect(target, {
          type: effect.statusType,
          duration: effect.duration || 1,
          value: effect.magnitude || effect.value || 0,
        })
        this.updateStatusIcons(target)
        this.showFloat(effect.statusType, target, STATUS_META[effect.statusType]?.color || '#ffaa88')
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
      }
      if (effect.type === 'debuff') {
        addStatusEffect(target, {
          type: 'marked',
          duration: effect.duration || 1,
          value: effect.magnitude || effect.value || 0,
        })
        this.updateStatusIcons(target)
        this.showFloat('Marked', target, STATUS_META.marked.color)
      }
    })
    applyCooldown(actor.data, card)
    this.updateHealth()
    const postContext = { phase: 'afterCard', isFirstCard: this.isFirstCard }
    applyEventEffects(this.activeEvent, postContext)
    this.isFirstCard = false
    if (postContext.repeat) {
      this.resolveCard(card, actor, target)
      return
    }
    this.clearCards()
    this.nextTurn()
  }

  nextTurn() {
    this.turnIndex = (this.turnIndex + 1) % this.turnOrder.length
    this.startTurn()
  }

  checkEnd() {
    const playersAlive = this.turnOrder.some((c) => c.type === 'player' && c.hp > 0)
    const enemiesAlive = this.turnOrder.some((c) => c.type === 'enemy' && c.hp > 0)
    if (!playersAlive || !enemiesAlive) {
      this.clearCards()
      const text = !playersAlive ? 'Defeat' : 'Victory'
      this.add.text(360, 300, text, { fontSize: '32px' }).setOrigin(0.5)
      this.showFloat(text, this.current, text === 'Victory' ? '#44ff44' : '#ff4444')
      if (enemiesAlive === false) {
        const dungeon = this.scene.get('dungeon')
        dungeon.rooms[this.roomIndex].cleared = true
      }
      this.time.delayedCall(1500, () => {
        this.scene.stop()
        this.scene.wake('dungeon')
      })
      return true
    }
    return false
  }
}
