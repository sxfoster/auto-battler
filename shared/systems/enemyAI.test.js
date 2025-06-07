import assert from 'assert';
import {
  trackEnemyActions,
  findComboStarter,
  findComboFinisher,
  evaluateCard,
  shouldExecuteCombo,
  chooseEnemyAction,
  chooseTarget,
  setAIDebugListener, // Import to ensure it can be called (e.g., to disable logging during tests)
} from './enemyAI.js';

// Disable AI debug logging for tests
setAIDebugListener(null);

// --- Mock Data Helpers ---
const createMockEnemy = (id, deck = [], aiProfile = {}, stats = { hp: 10, maxHp: 10 }, lastUsedCards = []) => ({
  id,
  deck: [...deck],
  aiProfile: {
    enableComboAwareness: true,
    comboWindowTurns: 2,
    prefersFinisherChains: true, // Defaulting based on GDD observation
    preferredComboTags: [],
    ...aiProfile,
  },
  stats: { ...stats },
  lastUsedCards: JSON.parse(JSON.stringify(lastUsedCards)), // Deep copy
});

const createMockCard = (id, { name = id, effect = { type: 'damage', magnitude: 1 }, isComboStarter = false, isComboFinisher = false, synergyTag = null, ...props } = {}) => ({
  id,
  name,
  effect: { ...effect },
  isComboStarter,
  isComboFinisher,
  synergyTag,
  ...props,
});

const createMockPlayer = (id, hp = 10, position = 0) => ({
  id,
  hp,
  position,
});

const createMockContext = (currentTurn = 1, groupLastUsedCards = undefined, enemyHP, enemyMaxHP) => {
    const context = {
        currentTurn,
        group: groupLastUsedCards && Array.isArray(groupLastUsedCards)
               ? { lastUsedCards: JSON.parse(JSON.stringify(groupLastUsedCards)) }
               : null,
    };
    if (enemyHP !== undefined) context.enemyHP = enemyHP;
    if (enemyMaxHP !== undefined) context.enemyMaxHP = enemyMaxHP;
    return context;
};


// --- Test Cases ---

// trackEnemyActions
function testTrackEnemyActions_AddsCardAndTurn() {
  const enemy = createMockEnemy('e1');
  const card = createMockCard('c1');
  trackEnemyActions(enemy, card, 5);
  assert.strictEqual(enemy.lastUsedCards.length, 1, 'Card should be added');
  assert.deepStrictEqual(enemy.lastUsedCards[0], { card, turn: 5 }, 'Card and turn should match');
}

function testTrackEnemyActions_RespectsComboWindow() {
  const enemy = createMockEnemy('e1', [], { comboWindowTurns: 1 });
  const card1 = createMockCard('c1');
  const card2 = createMockCard('c2');
  trackEnemyActions(enemy, card1, 1);
  trackEnemyActions(enemy, card2, 3); // card1 should be filtered out (3 - 1 > 1)
  assert.strictEqual(enemy.lastUsedCards.length, 1, 'Older card should be filtered out');
  assert.deepStrictEqual(enemy.lastUsedCards[0].card, card2, 'Only recent card should remain');
}

function testTrackEnemyActions_TracksInGroup() {
  const enemy = createMockEnemy('e1');
  const card = createMockCard('c1');
  const groupContext = { lastUsedCards: [] };
  trackEnemyActions(enemy, card, 1, groupContext);
  assert.strictEqual(groupContext.lastUsedCards.length, 1, 'Card should be added to group');
  assert.deepStrictEqual(groupContext.lastUsedCards[0], { card, turn: 1 }, 'Group card and turn should match');
}

// findComboStarter / findComboFinisher
function testFindComboStarter_FindsCard() {
  const card1 = createMockCard('s1', { isComboStarter: true, synergyTag: 'TestTag' });
  const card2 = createMockCard('s2', { isComboStarter: false, synergyTag: 'TestTag' });
  const deck = [card1, card2];
  const found = findComboStarter(deck, 'TestTag');
  assert.deepStrictEqual(found, card1, 'Should find the correct starter card');
}

function testFindComboStarter_ReturnsNullIfNotFound() {
  const deck = [createMockCard('s1', { isComboStarter: false, synergyTag: 'TestTag' })];
  const found = findComboStarter(deck, 'TestTag');
  assert.strictEqual(found, null, 'Should return null if no starter found');
}

function testFindComboFinisher_FindsCard() {
  const card1 = createMockCard('f1', { isComboFinisher: true, synergyTag: 'TestTag' });
  const card2 = createMockCard('f2', { isComboFinisher: false, synergyTag: 'TestTag' });
  const deck = [card1, card2];
  const found = findComboFinisher(deck, 'TestTag');
  assert.deepStrictEqual(found, card1, 'Should find the correct finisher card');
}

function testFindComboFinisher_ReturnsNullIfNotFound() {
  const deck = [createMockCard('f1', { isComboFinisher: false, synergyTag: 'TestTag' })];
  const found = findComboFinisher(deck, 'TestTag');
  assert.strictEqual(found, null, 'Should return null if no finisher found');
}

// evaluateCard
function testEvaluateCard_HealScoresHigherWhenLowHP() {
  const enemy = createMockEnemy('e1', [], {}, { hp: 2, maxHp: 10 });
  const healCard = createMockCard('h1', { effect: { type: 'heal', magnitude: 5 } });
  const context = createMockContext(1, [], enemy.stats.hp, enemy.stats.maxHp);
  const score = evaluateCard(enemy, healCard, context);
  assert.ok(score > 0, 'Heal card should have positive score when HP is low');
  // Max HP (10) - Current HP (2) = 8. Heal magnitude is 5.
  // The current logic is `score += Math.max(0, max - hp)`, so score should be 8.
  assert.strictEqual(score, 8, 'Heal score calculation error');
}

function testEvaluateCard_DamageScoresByMagnitude() {
  const enemy = createMockEnemy('e1');
  const damageCard = createMockCard('d1', { effect: { type: 'damage', magnitude: 7 } });
  const context = createMockContext(1, [], enemy.stats.hp, enemy.stats.maxHp);
  const score = evaluateCard(enemy, damageCard, context);
  assert.strictEqual(score, 7, 'Damage card score should be its magnitude');
}

function testEvaluateCard_DefaultMaxHPUsed() {
  const enemy = createMockEnemy('e1', [], {}, { hp: 5, maxHp: 10 });
  const healCard = createMockCard('h2', { effect: { type: 'heal', magnitude: 5 } });
  // Provide current HP but omit enemyMaxHP so function must read from stats
  const context = createMockContext(1, [], enemy.stats.hp);
  const score = evaluateCard(enemy, healCard, context);
  assert.strictEqual(score, 5, 'Heal score should use stats.maxHp when context value missing');
}

// shouldExecuteCombo
function testShouldExecuteCombo_ReturnsTrue() {
  const starter = createMockCard('s1', { isComboStarter: true, synergyTag: 'ComboA' });
  const finisher = createMockCard('f1', { isComboFinisher: true, synergyTag: 'ComboA' });
  const enemy = createMockEnemy('e1', [finisher], {}, {}, [{ card: starter, turn: 1 }]);
  const context = createMockContext(2); // currentTurn is 2, starter was turn 1 (within window)
  assert.strictEqual(shouldExecuteCombo(enemy, context), true, 'Should be true for valid combo');
}

function testShouldExecuteCombo_False_NoRecentStarter() {
  const finisher = createMockCard('f1', { isComboFinisher: true, synergyTag: 'ComboA' });
  const enemy = createMockEnemy('e1', [finisher]); // No starters used
  const context = createMockContext(1);
  assert.strictEqual(shouldExecuteCombo(enemy, context), false, 'Should be false if no starter used');
}

function testShouldExecuteCombo_False_NoMatchingFinisherInDeck() {
  const starter = createMockCard('s1', { isComboStarter: true, synergyTag: 'ComboA' });
  const enemy = createMockEnemy('e1', [], {}, {}, [{ card: starter, turn: 1 }]); // Deck is empty
  const context = createMockContext(2);
  assert.strictEqual(shouldExecuteCombo(enemy, context), false, 'Should be false if no matching finisher in deck');
}

function testShouldExecuteCombo_False_StarterOutsideWindow() {
  const starter = createMockCard('s1', { isComboStarter: true, synergyTag: 'ComboA' });
  const finisher = createMockCard('f1', { isComboFinisher: true, synergyTag: 'ComboA' });
  const enemy = createMockEnemy('e1', [finisher], { comboWindowTurns: 2 }, {}, [{ card: starter, turn: 1 }]);
  const context = createMockContext(4); // currentTurn 4, starter turn 1 (4-1=3 > 2)
  assert.strictEqual(shouldExecuteCombo(enemy, context), false, 'Should be false if starter is outside window');
}

function testShouldExecuteCombo_False_ComboAwarenessDisabled() {
  const starter = createMockCard('s1', { isComboStarter: true, synergyTag: 'ComboA' });
  const finisher = createMockCard('f1', { isComboFinisher: true, synergyTag: 'ComboA' });
  const enemy = createMockEnemy('e1', [finisher], { enableComboAwareness: false }, {}, [{ card: starter, turn: 1 }]);
  const context = createMockContext(2);
  assert.strictEqual(shouldExecuteCombo(enemy, context), false, 'Should be false if enableComboAwareness is false');
}

// chooseEnemyAction
function testChooseEnemyAction_ChoosesFinisher() {
  const starter = createMockCard('s1', { isComboStarter: true, synergyTag: 'ComboA' });
  const finisher = createMockCard('f1', { isComboFinisher: true, synergyTag: 'ComboA', effect: { type: 'damage', magnitude: 10 } });
  const otherCard = createMockCard('c_other', {effect: {type: 'damage', magnitude: 5}});
  const enemy = createMockEnemy('e1', [finisher, otherCard], {}, {}, [{ card: starter, turn: 1 }]);
  const context = createMockContext(2);
  const chosenAction = chooseEnemyAction(enemy, context);
  assert.deepStrictEqual(chosenAction, finisher, 'Should prioritize finisher');
}

function testChooseEnemyAction_ChoosesPreferredStarter() {
  const preferredStarter = createMockCard('ps1', { isComboStarter: true, synergyTag: 'Preferred', effect: {type: 'damage', magnitude: 1}});
  const preferredFinisher = createMockCard('pf1', { isComboFinisher: true, synergyTag: 'Preferred' });
  const otherStarter = createMockCard('os1', { isComboStarter: true, synergyTag: 'Other', effect: {type: 'damage', magnitude: 100}}); // high score
  const otherFinisher = createMockCard('of1', { isComboFinisher: true, synergyTag: 'Other' });
  const enemy = createMockEnemy('e1', [preferredStarter, preferredFinisher, otherStarter, otherFinisher], { preferredComboTags: ['Preferred'] });
  const context = createMockContext(1);
  const chosenAction = chooseEnemyAction(enemy, context);
  assert.deepStrictEqual(chosenAction, preferredStarter, 'Should choose preferred starter if full combo exists');
}

function testChooseEnemyAction_ChoosesAnyStarterIfComboExists() {
  const starter = createMockCard('s1', { isComboStarter: true, synergyTag: 'AnyCombo', effect: { type: 'damage', magnitude: 1 }});
  const finisher = createMockCard('f1', { isComboFinisher: true, synergyTag: 'AnyCombo' });
  const highDamageCard = createMockCard('d1', { effect: { type: 'damage', magnitude: 100 } });
  const enemy = createMockEnemy('e1', [starter, finisher, highDamageCard]);
  const context = createMockContext(1);
  const chosenAction = chooseEnemyAction(enemy, context);
  assert.deepStrictEqual(chosenAction, starter, 'Should choose any starter if a full combo exists');
}

function testChooseEnemyAction_FallbackToScoredCard() {
  const card1 = createMockCard('c1', { effect: { type: 'damage', magnitude: 5 } });
  const card2 = createMockCard('c2', { effect: { type: 'damage', magnitude: 10 } }); // Higher score
  const enemy = createMockEnemy('e1', [card1, card2]); // No combo cards
  const context = createMockContext(1);
  const chosenAction = chooseEnemyAction(enemy, context);
  assert.deepStrictEqual(chosenAction, card2, 'Should choose highest scored card if no combo');
}

function testChooseEnemyAction_DisabledAI_ChoosesScoredCard() {
  const starter = createMockCard('s1', { isComboStarter: true, synergyTag: 'ComboA', effect: {type: 'damage', magnitude: 1}});
  const finisher = createMockCard('f1', { isComboFinisher: true, synergyTag: 'ComboA' });
  const card1 = createMockCard('c1', { effect: { type: 'damage', magnitude: 5 } });
  const card2 = createMockCard('c2', { effect: { type: 'damage', magnitude: 10 } });
  const enemy = createMockEnemy('e1', [starter, finisher, card1, card2], { enableComboAwareness: false });
  const context = createMockContext(1, [{ card: starter, turn: 0 }]); // Provide starter in history
  const chosenAction = chooseEnemyAction(enemy, context);
  assert.deepStrictEqual(chosenAction, card2, 'Should choose highest scored card if AI disabled');
}

// chooseTarget
function testChooseTarget_SelectsLowestHP() {
  const p1 = createMockPlayer('p1', 5);
  const p2 = createMockPlayer('p2', 10);
  const p3 = createMockPlayer('p3', 3); // Lowest HP
  const players = [p1, p2, p3];
  const target = chooseTarget(players);
  assert.deepStrictEqual(target, p3, 'Should target player with lowest HP');
}

function testChooseTarget_SelectsLowestPositionIfHPTied() {
  const p1 = createMockPlayer('p1', 5, 1);
  const p2 = createMockPlayer('p2', 3, 2);
  const p3 = createMockPlayer('p3', 3, 0); // Lowest HP tied, lowest position
  const players = [p1, p2, p3];
  const target = chooseTarget(players);
  assert.deepStrictEqual(target, p3, 'Should target player with lowest position on HP tie');
}

function testChooseTarget_HandlesEmptyArray() {
  const players = [];
  const target = chooseTarget(players);
  assert.strictEqual(target, null, 'Should return null for empty player array');
}


// --- Test Runner ---
const runTests = () => {
  let passed = 0;
  let failed = 0;
  const testFunctions = [
    testTrackEnemyActions_AddsCardAndTurn,
    testTrackEnemyActions_RespectsComboWindow,
    testTrackEnemyActions_TracksInGroup,
    testFindComboStarter_FindsCard,
    testFindComboStarter_ReturnsNullIfNotFound,
    testFindComboFinisher_FindsCard,
    testFindComboFinisher_ReturnsNullIfNotFound,
    testEvaluateCard_HealScoresHigherWhenLowHP,
    testEvaluateCard_DamageScoresByMagnitude,
    testEvaluateCard_DefaultMaxHPUsed,
    testShouldExecuteCombo_ReturnsTrue,
    testShouldExecuteCombo_False_NoRecentStarter,
    testShouldExecuteCombo_False_NoMatchingFinisherInDeck,
    testShouldExecuteCombo_False_StarterOutsideWindow,
    testShouldExecuteCombo_False_ComboAwarenessDisabled,
    testChooseEnemyAction_ChoosesFinisher,
    testChooseEnemyAction_ChoosesPreferredStarter,
    testChooseEnemyAction_ChoosesAnyStarterIfComboExists,
    testChooseEnemyAction_FallbackToScoredCard,
    testChooseEnemyAction_DisabledAI_ChoosesScoredCard,
    testChooseTarget_SelectsLowestHP,
    testChooseTarget_SelectsLowestPositionIfHPTied,
    testChooseTarget_HandlesEmptyArray,
  ];

  console.log('--- Running enemyAI.test.js ---');
  testFunctions.forEach(testFn => {
    try {
      testFn();
      console.log(`PASSED: ${testFn.name}`);
      passed++;
    } catch (e) {
      console.error(`FAILED: ${testFn.name}`);
      console.error(e.message);
      failed++;
    }
  });

  console.log(`\n--- enemyAI.test.js Results ---`);
  console.log(`Total: ${testFunctions.length}, Passed: ${passed}, Failed: ${failed}`);

  if (failed > 0) {
    if (typeof process !== 'undefined' && process.exit) {
      process.exit(1);
    } else {
      throw new Error(`${failed} enemyAI test(s) failed.`);
    }
  }
};

runTests();
