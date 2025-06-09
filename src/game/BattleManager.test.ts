import { BattleManager, Unit } from './BattleManager';
import { Card } from './CombatResolver'; // Assuming Card is exported or can be mocked
import { BattleStep } from '../../shared/models/BattleLog';

// Mock AIController.decideAction to control outcomes
jest.mock('./AIController', () => ({
  decideAction: jest.fn(),
}));
import { decideAction } from './AIController';

// Mock CombatResolver.executeAction if needed, or use its actual implementation
// For initial tests, using actual executeAction might be okay if its dependencies are simple
// jest.mock('./CombatResolver', () => ({
//   ...jest.requireActual('./CombatResolver'), // Import and retain default behavior
//   executeAction: jest.fn(), // Override executeAction with a mock
// }));
// import { executeAction as mockExecuteAction } from './CombatResolver';


describe('BattleManager', () => {
  let playerUnit: Unit;
  let enemyUnit: Unit;
  let sampleCard: Card;

  beforeEach(() => {
    // Reset mocks before each test
    (decideAction as jest.Mock).mockReset();

    playerUnit = {
      id: 'player1',
      name: 'Hero',
      team: 'player',
      stats: { hp: 100, speed: 10 },
      deck: [],
      statusEffects: [],
    };
    enemyUnit = {
      id: 'enemy1',
      name: 'Goblin',
      team: 'enemy',
      stats: { hp: 50, speed: 5 },
      deck: [],
      statusEffects: [],
    };
    sampleCard = {
      id: 'card1',
      name: 'Quick Slash',
      effects: [{ type: 'damage', magnitude: 10 }],
    };

    // Mock decideAction to return a specific action
    (decideAction as jest.Mock).mockImplementation((actor, { opponents }) => {
      if (actor.id === playerUnit.id && opponents.length > 0) {
        return { action: sampleCard, target: opponents[0] };
      }
      if (actor.id === enemyUnit.id && opponents.length > 0) {
        // Make enemy do nothing for simplicity in this test, or a different card
        return { action: { id: 'card2', name: 'Defend', effects: [] }, target: actor };
      }
      return null;
    });
  });

  test('should generate a BattleStep when a unit takes an action', () => {
    const units = [playerUnit, enemyUnit];
    const battleManager = new BattleManager(units);
    battleManager.start();

    const stepResult = battleManager.step(); // Player's turn

    expect(stepResult).not.toBeNull();
    expect(stepResult?.actorId).toBe(playerUnit.id);
    expect(stepResult?.actionType).toBe('dealDamage'); // Based on sampleCard effect
    expect(stepResult?.targets).toEqual([enemyUnit.id]);
    expect(stepResult?.details.cardId).toBe(sampleCard.id);
    expect(stepResult?.logMessage).toBe('Hero used Quick Slash on Goblin.');

    // Check preState
    const playerPreState = stepResult?.preState.find(s => s.unitId === playerUnit.id);
    const enemyPreState = stepResult?.preState.find(s => s.unitId === enemyUnit.id);
    expect(playerPreState?.hp).toBe(100);
    expect(enemyPreState?.hp).toBe(50);

    // Check postState (after damage)
    const playerPostState = stepResult?.postState.find(s => s.unitId === playerUnit.id);
    const enemyPostState = stepResult?.postState.find(s => s.unitId === enemyUnit.id);
    expect(playerPostState?.hp).toBe(100); // Player HP unchanged
    expect(enemyPostState?.hp).toBe(40); // Enemy HP reduced by 10
  });

  test('should add BattleStep to battleLog', () => {
    const units = [playerUnit, enemyUnit];
    const battleManager = new BattleManager(units);
    battleManager.start();

    battleManager.step(); // Player's turn
    const log = battleManager.getBattleLog();

    expect(log).toHaveLength(1);
    expect(log[0].actorId).toBe(playerUnit.id);
    expect(log[0].details.cardName).toBe(sampleCard.name);
  });

  test('should handle a full round and log multiple steps', () => {
    // Ensure player is faster so they go first
    playerUnit.stats.speed = 10;
    enemyUnit.stats.speed = 5;

    const units = [playerUnit, enemyUnit];
    const battleManager = new BattleManager(units);
    battleManager.start();

    // Player's turn
    (decideAction as jest.Mock).mockImplementationOnce((actor, { opponents }) => {
        if (actor.id === playerUnit.id && opponents.length > 0) {
            return { action: sampleCard, target: opponents[0] };
        }
        return null;
    });
    battleManager.step();

    // Enemy's turn - let's make them use a different card or a simple action
    const enemyCard = { id: 'enemyCard1', name: 'Weak Hit', effects: [{ type: 'damage', magnitude: 5 }]};
    (decideAction as jest.Mock).mockImplementationOnce((actor, { opponents }) => {
        if (actor.id === enemyUnit.id && opponents.length > 0) {
            return { action: enemyCard, target: opponents[0] };
        }
        return null;
    });
    battleManager.step();

    const log = battleManager.getBattleLog();
    expect(log).toHaveLength(2);

    // Check first step (Player's action)
    expect(log[0].actorId).toBe(playerUnit.id);
    expect(log[0].details.cardName).toBe(sampleCard.name);
    const enemyPostStateAfterPlayerAction = log[0].postState.find(s => s.unitId === enemyUnit.id);
    expect(enemyPostStateAfterPlayerAction?.hp).toBe(40);

    // Check second step (Enemy's action)
    expect(log[1].actorId).toBe(enemyUnit.id);
    expect(log[1].details.cardName).toBe(enemyCard.name);
    const playerPostStateAfterEnemyAction = log[1].postState.find(s => s.unitId === playerUnit.id);
    expect(playerPostStateAfterEnemyAction?.hp).toBe(95); // Player HP reduced by 5

    // Verify preState of the second action matches postState of the first (for affected units)
    const playerPreStateForEnemyAction = log[1].preState.find(s => s.unitId === playerUnit.id);
    expect(playerPreStateForEnemyAction?.hp).toBe(100); // Player HP before enemy attack
    const enemyPreStateForEnemyAction = log[1].preState.find(s => s.unitId === enemyUnit.id);
    expect(enemyPreStateForEnemyAction?.hp).toBe(40);
  });

  test('should correctly log status effects application', () => {
    const statusCard: Card = {
      id: 'statusCard1',
      name: 'Apply Poison',
      // Corrected: 'status' effect type should align with what executeAction expects.
      // Assuming executeAction processes an effect like { type: 'status', statusType: 'poison', duration: 3 }
      // For the test, we need to ensure the mock or actual implementation of executeAction
      // correctly translates this card effect into a unit.statusEffects update.
      // Let's assume a simple 'status' effect type on the card directly maps to a statusEffect object.
      effects: [{ type: 'status', statusType: 'poison', duration: 3, value: 1 }] // Added value for potential damage/effect magnitude
    };
    (decideAction as jest.Mock).mockImplementation((actor, { opponents }) => {
      if (actor.id === playerUnit.id && opponents.length > 0) {
        return { action: statusCard, target: opponents[0] };
      }
      return null;
    });

    const battleManager = new BattleManager([playerUnit, enemyUnit]);
    battleManager.start();
    const stepResult = battleManager.step();

    expect(stepResult).not.toBeNull();
    // ActionType determination based on card effects:
    if (statusCard.effects.some(e => e.type === 'damage')) {
        expect(stepResult?.actionType).toBe('dealDamage');
    } else if (statusCard.effects.some(e => e.type === 'heal')) {
        expect(stepResult?.actionType).toBe('heal');
    } else {
        // If no damage or heal, it currently defaults to 'playCard'.
        // This could be enhanced to 'applyBuff' or 'statusEffectApply' if effects are introspected further.
        expect(stepResult?.actionType).toBe('playCard');
    }

    expect(stepResult?.details.cardName).toBe(statusCard.name);

    const enemyPostState = stepResult?.postState.find(s => s.unitId === enemyUnit.id);
    // Assuming executeAction correctly applies the status effect from the card.
    // The structure of statusEffects on Unit and UnitState should match.
    expect(enemyPostState?.statusEffects).toHaveLength(1);
    // The exact properties depend on how executeAction translates card effects to status effects.
    // Based on UnitState, it expects { type: string, duration: number, value?: any }
    // So, if card effect is { type: 'status', statusType: 'poison', duration: 3, value:1 }
    // executeAction should create something like { type: 'poison', duration: 3, value: 1 } on the unit.
    expect(enemyPostState?.statusEffects[0]).toMatchObject({ type: 'poison', duration: 3, value: 1 });

    const enemyPreState = stepResult?.preState.find(s => s.unitId === enemyUnit.id);
    expect(enemyPreState?.statusEffects).toHaveLength(0);
  });

  test('should log a generic step if no action/target', () => {
    (decideAction as jest.Mock).mockImplementation(() => {
      // Simulate AI deciding no action (e.g. unit is stunned or no valid plays)
      return null; // Or return { action: null, target: null }; based on decideAction's actual possible returns
    });

    const battleManager = new BattleManager([playerUnit, enemyUnit]);
    battleManager.start();
    const stepResult = battleManager.step();

    expect(stepResult).not.toBeNull();
    expect(stepResult?.actionType).toBe('generic');
    expect(stepResult?.actorId).toBe(playerUnit.id);
    expect(stepResult?.logMessage).toContain('took no action');
    expect(battleManager.getBattleLog()).toHaveLength(1);
  });

});
