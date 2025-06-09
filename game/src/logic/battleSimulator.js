import { applyCardEffects, chooseTarget, shuffleArray } from './battleUtils.js';

const deepClone = (value) => {
  if (typeof globalThis.structuredClone === 'function') {
    return globalThis.structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value));
};

const snapshot = (party, foes) => {
  return [...party, ...foes].map(u => ({
    id: u.id,
    name: u.name,
    hp: u.currentHp,
    energy: u.currentEnergy,
    buffs: u.buffs || {},
    team: party.includes(u) ? 'party' : 'enemy',
  }));
};

/**
 * Simulate a full battle between two sides.
 * @param {Object[]} partyData
 * @param {Object[]} enemyData
 * @returns {import('../../shared/models/BattleStep').BattleStep[]}
 */
export function simulateBattle(partyData, enemyData) {
  const parties = deepClone(partyData).map(d => ({ ...d, currentHp: d.stats.hp, currentEnergy: 0, deck: [...(d.deck || [])], hand: [] }));
  const enemies = deepClone(enemyData).map(d => ({ ...d, currentHp: d.stats.hp, currentEnergy: 0, deck: [...(d.deck || [])], hand: [] }));

  const turnOrder = [...parties, ...enemies];

  /** @type {import('../../shared/models/BattleStep').BattleStep[]} */
  const steps = [];
  const addStep = (actorId, actionType, details, targets, pre, post, msg) => {
    steps.push({
      actorId,
      actionType,
      details: details || {},
      targets: targets || [],
      preState: pre,
      postState: post,
      logMessage: msg || '',
    });
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

      const preTurn = snapshot(parties, enemies);
      gainEnergy(unit);
      drawCard(unit);
      addStep(unit.id, 'startTurn', {}, [], preTurn, snapshot(parties, enemies), `${unit.id} starts turn`);

      const playable = unit.hand.filter(c => (c.energyCost ?? c.cost ?? 0) <= unit.currentEnergy);
      if (playable.length === 0) {
        continue;
      }

      const card = playable[0];
      const cost = card.energyCost ?? card.cost ?? 0;
      const prePlay = snapshot(parties, enemies);
      unit.currentEnergy = Math.max(0, unit.currentEnergy - cost);
      const defenders = parties.includes(unit) ? enemies : parties;
      const target = chooseTarget(defenders);
      if (!target) continue;
      const { damage, heal } = applyCardEffects(unit, target, card);
      if (heal) {
        unit.currentHp = Math.min(unit.stats.hp, unit.currentHp + heal);
      }
      if (damage) {
        target.currentHp = Math.max(0, target.currentHp - damage);
      }
      const afterPlay = snapshot(parties, enemies);
      addStep(
        unit.id,
        'playCard',
        { cardId: card.id, cost, heal, damage },
        [target.id],
        prePlay,
        afterPlay,
        `${unit.id} played ${card.id} on ${target.id}`
      );

      if (damage) {
        const preDamage = afterPlay; // before further modifications
        const postDamage = snapshot(parties, enemies);
        addStep(unit.id, 'dealDamage', { amount: damage }, [target.id], preDamage, postDamage, `${target.id} takes ${damage}`);
        if (target.currentHp <= 0) {
          const preDeath = postDamage;
          const postDeath = snapshot(parties, enemies);
          addStep(target.id, 'death', {}, [], preDeath, postDeath, `${target.id} is defeated`);
        }
      }

      aliveParties = parties.some(u => u.currentHp > 0);
      aliveEnemies = enemies.some(u => u.currentHp > 0);
      if (!aliveParties && !aliveEnemies) {
        addStep(unit.id, 'endBattle', { result: 'draw' }, [], snapshot(parties, enemies), snapshot(parties, enemies), 'Battle ends in a draw');
        return steps;
      }
      if (!aliveEnemies) {
        addStep(unit.id, 'endBattle', { result: 'victory' }, [], snapshot(parties, enemies), snapshot(parties, enemies), 'Victory');
        return steps;
      }
      if (!aliveParties) {
        addStep(unit.id, 'endBattle', { result: 'defeat' }, [], snapshot(parties, enemies), snapshot(parties, enemies), 'Defeat');
        return steps;
      }
    }
  }
  return steps;
}
