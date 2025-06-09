import { MOCK_HEROES, MOCK_ENEMIES, MOCK_CARDS } from './mock-data.js';
import { randomUUID } from 'crypto';

// A helper to deep clone units to avoid mutating the original mock data
const deepClone = (obj) => JSON.parse(JSON.stringify(obj));

/**
 * Simulates a complete battle based on GDD rules.
 * @param {UnitState[]} playerParty - Array of player units.
 * @param {UnitState[]} enemyParty - Array of enemy units.
 * @returns {object[]} - An array of BattleStep objects detailing the entire fight.
 */
export function battleSimulator(playerParty, enemyParty) {
  const battleLog = [];

  // --- BATTLE SETUP ---
  const allUnits = [
    ...playerParty.map(deepClone),
    ...enemyParty.map(deepClone)
  ].map(unit => ({ ...unit, currentHp: unit.hp })); // Use currentHp for tracking damage

  // Deal starting hands
  allUnits.forEach(unit => {
    // For MVP, we draw 2 cards from the battle deck.
    // Ensure the battleDeck has cards before trying to draw.
    if (unit.battleDeck && unit.battleDeck.length > 0) {
      unit.cardsInHand = [...unit.battleDeck.slice(0, 2)];
    } else {
      unit.cardsInHand = [];
    }
  });

  const createLogEntry = (type, message, state) => ({
    id: randomUUID(),
    type,
    message,
    state: deepClone(state)
  });

  battleLog.push(createLogEntry(
    'BATTLE_START',
    'The battle has begun!',
    allUnits
  ));

  // --- MAIN BATTLE LOOP ---
  let roundCount = 0;
  const isTeamAlive = (team) => team.some(unit => unit.currentHp > 0);

  while (isTeamAlive(allUnits.filter(u => playerParty.some(p => p.id === u.id))) && isTeamAlive(allUnits.filter(u => enemyParty.some(e => e.id === u.id))) && roundCount < 50) { // Safety break
    roundCount++;
    battleLog.push(createLogEntry('ROUND_START', `Round ${roundCount} begins.`, allUnits));

    // --- TURN ORDER DETERMINATION ---
    const turnQueue = allUnits
      .filter(unit => unit.currentHp > 0)
      .sort((a, b) => b.speed - a.speed);

    // --- PROCESS TURNS FOR THE ROUND ---
    for (const activeUnit of turnQueue) {
      if (activeUnit.currentHp <= 0) continue; // Skip if defeated earlier in the round

      // 1. Gain Energy
      activeUnit.energy += 1;
      battleLog.push(createLogEntry('ENERGY_GAIN', `${activeUnit.name} gains 1 Energy.`, allUnits));

      // 2. Action Selection (MVP AI)
      let cardToPlay = null;
      for (const card of activeUnit.cardsInHand) {
        if (activeUnit.energy >= card.cost) {
          cardToPlay = card;
          break; // Play the first affordable card
        }
      }

      // 3. Execute Action
      if (cardToPlay) {
        // Deduct cost and remove card from hand
        activeUnit.energy -= cardToPlay.cost;
        activeUnit.cardsInHand = activeUnit.cardsInHand.filter(c => c.id !== cardToPlay.id);

        // Find a random, living target from the opposing team
        const isPlayerTeam = playerParty.some(p => p.id === activeUnit.id);
        const opposingTeam = allUnits.filter(u => u.currentHp > 0 && (isPlayerTeam ? !playerParty.some(p => p.id === u.id) : playerParty.some(p => p.id === u.id)));

        if (opposingTeam.length > 0) {
            const target = opposingTeam[Math.floor(Math.random() * opposingTeam.length)];

            // For now, assume damage is hardcoded in description (e.g., "3 damage")
            // Ensure there's a match and a number before trying to access it.
            const damageMatch = cardToPlay.description.match(/\d+/);
            const damage = damageMatch && damageMatch[0] ? parseInt(damageMatch[0]) : 0;
            target.currentHp -= damage;

            battleLog.push(createLogEntry(
                'ACTION',
                `${activeUnit.name} uses ${cardToPlay.name} on ${target.name}, dealing ${damage} damage.`,
                allUnits
            ));

            if (target.currentHp <= 0) {
                battleLog.push(createLogEntry('DEFEAT', `${target.name} has been defeated.`, allUnits));
            }
        }
      } else {
        battleLog.push(createLogEntry('NO_ACTION', `${activeUnit.name} has no affordable cards and ends its turn.`, allUnits));
      }
    }
  }

  // --- BATTLE CONCLUSION ---
  const playerTeamAlive = isTeamAlive(allUnits.filter(u => playerParty.some(p => p.id === u.id)));

  if (playerTeamAlive) {
    battleLog.push(createLogEntry('BATTLE_END', 'Victory! The player\'s party is victorious.', allUnits));
  } else {
    battleLog.push(createLogEntry('BATTLE_END', 'Defeat! The player\'s party has been defeated.', allUnits));
  }

  return battleLog;
}

// --- TEMPORARY TEST ---
// This allows you to run `node game/src/logic/battleSimulator.js` to see the output.
const testPlayerParty = [MOCK_HEROES.RANGER, MOCK_HEROES.BARD];
const testEnemyParty = [MOCK_ENEMIES.GOBLIN, MOCK_ENEMIES.GOBLIN];

// Assign battle decks for the test
testPlayerParty[0].battleDeck = [MOCK_CARDS.ARROW_SHOT, MOCK_CARDS.EAGLE_EYE];
testPlayerParty[1].battleDeck = [MOCK_CARDS.INSPIRE, MOCK_CARDS.LULLABY];

// Need to import MOCK_CARDS for the test to work

const finalLog = battleSimulator(testPlayerParty, testEnemyParty);
console.log(JSON.stringify(finalLog, null, 2));
