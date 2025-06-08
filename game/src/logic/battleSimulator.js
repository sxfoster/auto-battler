import _ from 'lodash';
import { applyCardEffects, chooseTarget, shuffleArray } from './battleUtils.js';

/**
 * @typedef {Object} BattleEvent
 * @property {number} time
 * @property {'turn-start'|'card-played'|'turn-skipped'|'damage'|'heal'|'battle-end'} type
 * @property {string} actorId
 * @property {string} [targetId]
 * @property {string} [cardId]
 * @property {number} [amount]
 * @property {string} [result]
 */

/**
 * Simulate a full battle between two sides.
 * @param {Object[]} partyData
 * @param {Object[]} enemyData
 * @returns {BattleEvent[]}
 */
export function simulateBattle(partyData, enemyData) {
  const parties = _.cloneDeep(partyData).map(d => ({ ...d, currentHp: d.stats.hp, currentEnergy: 0, deck: [...(d.deck || [])], hand: [] }));
  const enemies = _.cloneDeep(enemyData).map(d => ({ ...d, currentHp: d.stats.hp, currentEnergy: 0, deck: [...(d.deck || [])], hand: [] }));

  const turnOrder = [...parties, ...enemies];

  /** @type {BattleEvent[]} */
  const events = [];
  let step = 0;
  const record = (type, payload) => {
    events.push({ time: step++, type, ...payload });
  };

  const gainEnergy = (unit) => {
    const max = unit.stats.mana ?? unit.stats.energy ?? unit.stats.maxMana ?? 0;
    unit.currentEnergy = Math.min(max, (unit.currentEnergy || 0) + 1);
  };

  const drawCard = (unit) => {
    if (unit.deck.length === 0) {
      unit.deck = shuffleArray(unit.hand.splice(0));
    }
    if (unit.deck.length) {
      const card = unit.deck.shift();
      unit.hand.push(card);
    }
  };

  let aliveParties = true;
  let aliveEnemies = true;
  while (aliveParties && aliveEnemies) {
    for (const unit of turnOrder) {
      if (unit.currentHp <= 0) continue;
      gainEnergy(unit);
      drawCard(unit);
      record('turn-start', { actorId: unit.id });
      const playable = unit.hand.filter(c => (c.energyCost ?? c.cost ?? 0) <= unit.currentEnergy);
      if (playable.length === 0) {
        record('turn-skipped', { actorId: unit.id });
      } else {
        const card = playable[0];
        const cost = card.energyCost ?? card.cost ?? 0;
        unit.currentEnergy = Math.max(0, unit.currentEnergy - cost);
        const defenders = parties.includes(unit) ? enemies : parties;
        const target = chooseTarget(defenders);
        if (!target) continue;
        record('card-played', { actorId: unit.id, cardId: card.id, targetId: target.id });
        const { damage, heal } = applyCardEffects(unit, target, card);
        if (damage) {
          target.currentHp = Math.max(0, target.currentHp - damage);
          record('damage', { actorId: unit.id, targetId: target.id, amount: damage });
        }
        if (heal) {
          unit.currentHp = Math.min(unit.stats.hp, unit.currentHp + heal);
          record('heal', { actorId: unit.id, amount: heal });
        }
      }
      aliveParties = parties.some(u => u.currentHp > 0);
      aliveEnemies = enemies.some(u => u.currentHp > 0);
      if (!aliveParties && !aliveEnemies) {
        record('battle-end', { actorId: unit.id, result: 'draw' });
        return events;
      }
      if (!aliveEnemies) {
        record('battle-end', { actorId: unit.id, result: 'victory' });
        return events;
      }
      if (!aliveParties) {
        record('battle-end', { actorId: unit.id, result: 'defeat' });
        return events;
      }
    }
  }
  return events;
}
