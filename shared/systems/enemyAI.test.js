import {
  trackEnemyActions,
  findComboStarter, // Helper, might not be directly tested but used in context
  findComboFinisher, // Helper
  shouldExecuteCombo,
  chooseEnemyAction,
} from './enemyAI.js';
import { CardCategory, Rarity, Role } from '../models/Card.js'; // Enums for card creation

// Helper for basic assertion
function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

// Mock Data
const mockComboStarterCard = {
  id: 'starter1',
  name: 'Setup Strike',
  description: 'Starts a combo.',
  category: CardCategory.Ability,
  rarity: Rarity.Common,
  energyCost: 1,
  cooldown: 0,
  effect: { type: 'damage', magnitude: 3 },
  roleTag: Role.DPS,
  synergyTag: 'TestCombo',
  isComboStarter: true,
};

const mockComboFinisherCard = {
  id: 'finisher1',
  name: 'Payoff Hit',
  description: 'Finishes a combo.',
  category: CardCategory.Ability,
  rarity: Rarity.Common,
  energyCost: 2,
  cooldown: 1,
  effect: { type: 'damage', magnitude: 10 },
  roleTag: Role.DPS,
  synergyTag: 'TestCombo',
  isComboFinisher: true,
};

const mockNormalCard = {
  id: 'normal1',
  name: 'Basic Jab',
  description: 'A simple attack.',
  category: CardCategory.Ability,
  rarity: Rarity.Common,
  energyCost: 1,
  cooldown: 0,
  effect: { type: 'damage', magnitude: 4 },
  roleTag: Role.DPS,
};

function createMockEnemy(profileOverrides = {}, deck = [mockNormalCard]) {
  return {
    id: 'enemy1',
    archetype: 'Tester',
    stats: { hp: 50, energy: 3, speed: 2 },
    deck: [...deck], // Clone deck
    aiProfile: {
      behavior: 'aggressive',
      aggressiveness: 0.7,
      enableComboAwareness: true,
      comboWindowTurns: 2,
      prefersFinisherChains: true,
      ...profileOverrides,
    },
    lastUsedCards: [],
  };
}

describe('Enemy AI System', () => {
  describe('trackEnemyActions', () => {
    let enemy;
    beforeEach(() => {
      enemy = createMockEnemy();
    });

    it('should add actions to enemy.lastUsedCards', () => {
      trackEnemyActions(enemy, mockNormalCard, 1);
      assert(enemy.lastUsedCards.length === 1, 'Should have 1 card in lastUsedCards');
      assert(enemy.lastUsedCards[0].card.id === mockNormalCard.id, 'Correct card should be tracked');
      assert(enemy.lastUsedCards[0].turn === 1, 'Correct turn should be tracked');
    });

    it('should respect comboWindowTurns for filtering old actions', () => {
      enemy.aiProfile.comboWindowTurns = 1; // Only remember 1 turn back (current + previous)
      trackEnemyActions(enemy, mockNormalCard, 1);
      trackEnemyActions(enemy, mockComboStarterCard, 2);
      // mockNormalCard (turn 1) should still be there as 2-1 <= 1
      assert(enemy.lastUsedCards.length === 2, 'Should have 2 cards after turn 2');

      trackEnemyActions(enemy, mockComboFinisherCard, 3);
      // mockNormalCard (turn 1) should be gone as 3-1 > 1
      // mockComboStarterCard (turn 2) should remain as 3-2 <= 1
      assert(enemy.lastUsedCards.length === 2, 'Should have 2 cards after turn 3, one expired');
      assert(enemy.lastUsedCards.find(a => a.card.id === mockNormalCard.id) === undefined, 'Old card should be filtered out');
      assert(enemy.lastUsedCards.find(a => a.card.id === mockComboStarterCard.id) !== undefined, 'Recent card should remain');
    });

    it('should handle group tracking if group context is provided', () => {
      const groupContext = { lastUsedCards: [] };
      trackEnemyActions(enemy, mockNormalCard, 1, groupContext);
      assert(enemy.lastUsedCards.length === 1, 'Enemy should track its own action');
      assert(groupContext.lastUsedCards.length === 1, 'Group should also track the action');
      assert(groupContext.lastUsedCards[0].card.id === mockNormalCard.id, 'Group tracked correct card');

      // Test filtering on group context as well
      enemy.aiProfile.comboWindowTurns = 0; // only current turn
      trackEnemyActions(enemy, mockComboStarterCard, 2, groupContext);
      assert(groupContext.lastUsedCards.length === 1, 'Group should filter old card');
      assert(groupContext.lastUsedCards[0].card.id === mockComboStarterCard.id, 'Group kept only current turn card');
    });
  });

  describe('shouldExecuteCombo', () => {
    let enemy;
    let context;

    beforeEach(() => {
      enemy = createMockEnemy({}, [mockComboStarterCard, mockComboFinisherCard, mockNormalCard]);
      context = { currentTurn: 1 };
    });

    it('should return true if a valid combo starter was used recently and finisher is available', () => {
      trackEnemyActions(enemy, mockComboStarterCard, 1); // Starter used on turn 1
      context.currentTurn = 2; // Current turn is 2
      assert(shouldExecuteCombo(enemy, context) === true, 'Should be true with recent starter and available finisher');
    });

    it('should return false if enableComboAwareness is false', () => {
      enemy.aiProfile.enableComboAwareness = false;
      trackEnemyActions(enemy, mockComboStarterCard, 1);
      context.currentTurn = 2;
      assert(shouldExecuteCombo(enemy, context) === false, 'Should be false if combo awareness is disabled');
    });

    it('should return false if no combo starter was used', () => {
      trackEnemyActions(enemy, mockNormalCard, 1);
      context.currentTurn = 2;
      assert(shouldExecuteCombo(enemy, context) === false, 'Should be false if no starter was used');
    });

    it('should return false if combo starter is too old', () => {
      enemy.aiProfile.comboWindowTurns = 1;
      trackEnemyActions(enemy, mockComboStarterCard, 1); // Starter on turn 1
      context.currentTurn = 3; // Current turn 3, window is 1 (so only turn 2 actions count for turn 3)
      assert(shouldExecuteCombo(enemy, context) === false, 'Should be false if starter is outside window');
    });

    it('should return false if no finisher card is in the enemy deck for the synergyTag', () => {
      enemy.deck = [mockComboStarterCard, mockNormalCard]; // No finisher
      trackEnemyActions(enemy, mockComboStarterCard, 1);
      context.currentTurn = 2;
      assert(shouldExecuteCombo(enemy, context) === false, 'Should be false if no finisher in deck');
    });

    it('should use group context for lastUsedCards if provided', () => {
        const groupContext = { currentTurn: 2, lastUsedCards: [] };
        // Starter card used by another enemy in the group
        trackEnemyActions(createMockEnemy(), mockComboStarterCard, 1, groupContext);
        // Enemy itself did not use a starter
        enemy.lastUsedCards = [];

        assert(shouldExecuteCombo(enemy, groupContext) === true, 'Should use group memory for combo setup');
    });
  });

  describe('chooseEnemyAction', () => {
    let enemy;
    let context;

    beforeEach(() => {
      enemy = createMockEnemy({}, [mockNormalCard, mockComboStarterCard, mockComboFinisherCard]);
      context = { currentTurn: 1 };
    });

    it('should select finisher if shouldExecuteCombo is true and finisher is found', () => {
      trackEnemyActions(enemy, mockComboStarterCard, 1);
      context.currentTurn = 2; // next turn
      // shouldExecuteCombo will be true now
      const action = chooseEnemyAction(enemy, context);
      assert(action.id === mockComboFinisherCard.id, 'Should choose finisher card');
    });

    it('should select default action (first card) if shouldExecuteCombo is false', () => {
      trackEnemyActions(enemy, mockNormalCard, 1); // No combo setup
      context.currentTurn = 2;
      const action = chooseEnemyAction(enemy, context);
      assert(action.id === enemy.deck[0].id, 'Should choose default action (first card)');
    });

    it('should select default action if combo starter was too old', () => {
      enemy.aiProfile.comboWindowTurns = 0; // Actions only last for the current turn
      trackEnemyActions(enemy, mockComboStarterCard, 1); // Starter on turn 1
      context.currentTurn = 2; // Current turn is 2, starter is now too old
      const action = chooseEnemyAction(enemy, context);
      assert(action.id === enemy.deck[0].id, 'Should choose default action if starter is too old');
    });

    it('should select default action if combo awareness is disabled', () => {
      enemy.aiProfile.enableComboAwareness = false;
      trackEnemyActions(enemy, mockComboStarterCard, 1);
      context.currentTurn = 2;
      const action = chooseEnemyAction(enemy, context);
      assert(action.id === enemy.deck[0].id, 'Should choose default if combo awareness disabled');
    });

    it('should select default action if finisher is not in deck, even if combo was set up', () => {
      enemy.deck = [mockNormalCard, mockComboStarterCard]; // Finisher removed
      trackEnemyActions(enemy, mockComboStarterCard, 1);
      context.currentTurn = 2;
      const action = chooseEnemyAction(enemy, context);
      assert(action.id === enemy.deck[0].id, 'Should choose default if finisher not in deck');
    });
  });
});

console.log("shared/systems/enemyAI.test.js created with test structures.");
console.log("To run these tests, a test runner like Jest or Vitest should be configured for the project.");
// Placeholder for a simple runner (would require more work to properly execute describe/it)
// function runTests() { ... } runTests();
// The tests are structured for Jest/Vitest.
