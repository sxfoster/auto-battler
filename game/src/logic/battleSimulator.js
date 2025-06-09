/**
 * Determines if a unit is a valid target based on MVP positioning rules.
 * @param {UnitState} target - The unit being considered as a target.
 * @param {UnitState[]} allEnemies - The full array of all enemy units.
 * @returns {boolean} - True if the unit can be targeted.
 */
function isTargetable(target, allEnemies) {
  // If the target is in the front row (row 0), it is always targetable.
  if (target.position.row === 0) {
    return true;
  }

  // If the target is in a back row, check if any other enemy exists in the front row.
  const isFrontRowOccupied = allEnemies.some(enemy => enemy.currentHp > 0 && enemy.position.row === 0);

  // The back row can only be targeted if the front row is empty.
  return !isFrontRowOccupied;
}

import { MOCK_HEROES, MOCK_ENEMIES, MOCK_CARDS } from './mock-data.js';
import { v4 as uuidv4 } from 'uuid'; // Use a library for unique IDs for battle steps

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
    id: uuidv4(),
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
        // --- TARGETING LOGIC REFACTOR ---
        const isPlayerTeam = playerParty.some(p => p.id === activeUnit.id);
        const opposingTeam = allUnits.filter(u => u.currentHp > 0 && (isPlayerTeam ? !playerParty.some(p => p.id === u.id) : playerParty.some(p => p.id === u.id)));

        let validTargets;

        // Check if the card has a special targeting property (e.g., for ranged attacks)
        if (cardToPlay.targetType === 'any') {
            validTargets = [...opposingTeam]; // This card can target anyone, ignoring isTargetable().
        } else {
            // Default behavior: use the positioning rules.
            validTargets = opposingTeam.filter(enemy => isTargetable(enemy, opposingTeam));
        }

        // If there are no valid targets, the unit cannot act.
        if (validTargets.length === 0) {
          battleLog.push(createLogEntry('NO_TARGET', `${activeUnit.name} has no valid targets for ${cardToPlay.name}.`, allUnits));
          // Refund energy since the card was not played
          activeUnit.energy += cardToPlay.cost;
          continue; // End this unit's turn
        }

        // AI Strategy: From the valid targets, choose the one with the lowest current HP.
        validTargets.sort((a, b) => a.currentHp - b.currentHp);
        const target = validTargets[0];
        // --- END REFACTOR ---

        // Deduct cost and remove card from hand
        activeUnit.energy -= cardToPlay.cost;
        activeUnit.cardsInHand = activeUnit.cardsInHand.filter(c => c.id !== cardToPlay.id);

        // Apply card effect (same as before)
        const damage = parseInt(cardToPlay.description.match(/\d+/)[0] || 0);
        target.currentHp -= damage;

        battleLog.push(createLogEntry(
            'ACTION',
            `${activeUnit.name} uses ${cardToPlay.name} on ${target.name}, dealing ${damage} damage.`,
            allUnits
        ));

        if (target.currentHp <= 0) {
            battleLog.push(createLogEntry('DEFEAT', `${target.name} has been defeated.`, allUnits));
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
const testPlayerParty = [MOCK_HEROES.RANGER, MOCK_HEROES.BARD];
const testEnemyParty = [deepClone(MOCK_ENEMIES.GOBLIN), deepClone(MOCK_ENEMIES.GOBLIN)];

// ** NEW: Assign positions for the test **
// Player positions
testPlayerParty[0].position = { row: 1, col: 1 }; // Ranger in back
testPlayerParty[1].position = { row: 0, col: 1 }; // Bard in front

// Enemy positions
testEnemyParty[0].id = 'GOBLIN_FRONT';
testEnemyParty[0].name = 'Goblin Front';
testEnemyParty[0].position = { row: 0, col: 1 }; // One goblin in front
testEnemyParty[1].id = 'GOBLIN_BACK';
testEnemyParty[1].name = 'Goblin Back';
testEnemyParty[1].position = { row: 1, col: 1 }; // One goblin in back

// Assign battle decks
testPlayerParty[0].battleDeck = [MOCK_CARDS.ARROW_SHOT, MOCK_CARDS.EAGLE_EYE];
testPlayerParty[1].battleDeck = [MOCK_CARDS.INSPIRE, MOCK_CARDS.LULLABY];

const finalLog = battleSimulator(testPlayerParty, testEnemyParty);
console.log("--- BATTLE LOG ---");
finalLog.forEach(step => {
    console.log(`[${step.type}] ${step.message}`);
});
// Manually inspect the log to ensure "Goblin Back" is not targeted until "Goblin Front" is defeated.
