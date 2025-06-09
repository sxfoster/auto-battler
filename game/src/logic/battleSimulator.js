import { applyCardEffects, chooseTarget, shuffleArray } from './battleUtils.js';

// Temporary card definitions to make the simulator work with new sampleBattleData
const cardDataMap = {
  // Valerius
  'Shield Bash': { id: 'Shield Bash', cost: 1, effect: { type: 'damage', magnitude: 5 } },
  'Vigilant Strike': { id: 'Vigilant Strike', cost: 1, effect: { type: 'damage', magnitude: 6 } },
  // Lyra
  'Quick Shot': { id: 'Quick Shot', cost: 1, effect: { type: 'damage', magnitude: 4 } },
  'Pinning Arrow': { id: 'Pinning Arrow', cost: 1, effect: { type: 'damage', magnitude: 3 } },
  // Goblin Slinger
  'Hurl Rock': { id: 'Hurl Rock', cost: 1, effect: { type: 'damage', magnitude: 2 } },
  // Grumpy Slime
  'Corrosive Spit': { id: 'Corrosive Spit', cost: 1, effect: { type: 'damage', magnitude: 3 } },
};

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
  const normalizeUnit = (d) => {
    const hp = d.hp ?? d.stats?.hp ?? 0;
    const energy = d.energy ?? d.stats?.mana ?? d.stats?.energy ?? 0;
    const deckData = [...(d.deck || d.cards || d.actions || [])].map((card) => {
      if (typeof card === 'string') {
        return cardDataMap[card] || { id: card, cost: 0 };
      }
      return card;
    });
    return { ...d, hp, energy, currentHp: hp, currentEnergy: 0, deck: deckData, hand: [] };
  };

  const parties = deepClone(partyData).map(normalizeUnit);
  const enemies = deepClone(enemyData).map(normalizeUnit);

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
    const max = unit.energy ?? 0; // Use direct energy property
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
  let maxRounds = 200; // Safeguard against infinite loops
  let currentRound = 0;

  while (aliveParties && aliveEnemies) {
    currentRound++;
    if (currentRound > maxRounds) {
      console.error("Battle simulation exceeded maximum rounds, likely an infinite loop.");
      addStep('system', 'error', { message: 'Max rounds exceeded' }, [], snapshot(parties, enemies), snapshot(parties, enemies), 'Error: Max rounds exceeded');
      break;
    }

    for (const unit of turnOrder) {
      if (unit.currentHp <= 0) continue;

      const preTurn = snapshot(parties, enemies);
      gainEnergy(unit);
      drawCard(unit);
      addStep(unit.id, 'startTurn', {}, [], preTurn, snapshot(parties, enemies), `${unit.id} starts turn`);

      const playableCards = unit.hand.filter(card => {
        const data = card;
        const cost = data.energyCost ?? data.cost ?? 0;
        return cost <= unit.currentEnergy;
      });

      if (playableCards.length === 0) {
        continue;
      }

      const playedCard = playableCards[0];
      const cost = playedCard.energyCost ?? playedCard.cost ?? 0;
      const prePlay = snapshot(parties, enemies);
      unit.currentEnergy = Math.max(0, unit.currentEnergy - cost);

      const cardIndexInHand = unit.hand.indexOf(playedCard);
      if (cardIndexInHand > -1) {
        unit.hand.splice(cardIndexInHand, 1);
      }

      const defenders = parties.includes(unit) ? enemies : parties;
      const target = chooseTarget(defenders);
      if (!target) continue; // Should not happen if battle doesn't end prematurely

      const { damage, heal } = applyCardEffects(unit, target, playedCard);
      if (heal) {
        unit.currentHp = Math.min(unit.hp, unit.currentHp + heal); // Use direct hp property for max HP
      }
      if (damage) {
        target.currentHp = Math.max(0, target.currentHp - damage);
      }
      const afterPlay = snapshot(parties, enemies);
      addStep(
        unit.id,
        'playCard',
        { cardId: playedCard.id, cost, heal, damage },
        [target.id],
        prePlay,
        afterPlay,
        `${unit.id} played ${playedCard.id} on ${target.id}`
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
