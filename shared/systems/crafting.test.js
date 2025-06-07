import assert from 'assert';
import {
  attemptCraft,
  levelUpProfession,
  registerRecipeDiscovery,
  craftWithInventory,
} from './crafting.js';

// --- Mock Data Helpers ---
const createMockProfession = (name = 'Alchemy', level = 1, experience = 0, unlockedRecipes = []) => ({
  name,
  level,
  experience,
  unlockedRecipes: [...unlockedRecipes],
});

const createMockCard = (id, name = id, category = 'Ingredient') => ({
  id,
  name,
  category,
});

const createMockRecipe = (id, ingredients, resultId, resultName, professionName, levelReq, cost = null) => ({
  id,
  ingredients: ingredients.map(ingId => (typeof ingId === 'string' ? ingId : ingId.id)),
  result: { id: resultId, name: resultName, description: `Crafted ${resultName}` },
  profession: professionName,
  levelRequirement: levelReq,
  cost,
});

const createMockPlayer = (currencies = { Gold: 100, GuildCredit: 10 }, discoveredRecipes = [], professions = {}) => ({
  currencies: { ...currencies },
  discoveredRecipes: [...discoveredRecipes],
  professions: JSON.parse(JSON.stringify(professions)),
});

const createMockInventory = (items = []) => ({
  items: [...items.map(item => ({ ...item }))],
});

// --- Test Cases ---

function testAttemptCraft_Success_NoCost_NewDiscovery() {
  const profession = createMockProfession('Alchemy', 1);
  const player = createMockPlayer();
  const ingredients = [createMockCard('herb1'), createMockCard('water1')];
  const recipes = [
    createMockRecipe('potion1', ['herb1', 'water1'], 'health_potion', 'Health Potion', 'Alchemy', 1),
  ];
  const attempt = attemptCraft(profession, ingredients, recipes, player);
  assert.strictEqual(attempt.success, true, 'Should succeed');
  assert.ok(attempt.result, 'Should have a result item');
  assert.strictEqual(attempt.result.name, 'Health Potion', 'Result item name mismatch');
  assert.strictEqual(attempt.newRecipeDiscovered, true, 'Should be a new discovery');
  assert.strictEqual(attempt.recipeId, 'potion1', 'Recipe ID should match');
}

function testAttemptCraft_Success_WithCost_OldDiscovery() {
  const profession = createMockProfession('Alchemy', 2, 0, ['potion_strong']);
  const player = createMockPlayer({ Gold: 50 });
  const ingredients = [createMockCard('herb_rare'), createMockCard('gem1')];
  const recipeCost = { amount: 20, currency: 'Gold' };
  const recipes = [
    createMockRecipe('potion_strong', ['herb_rare', 'gem1'], 'strong_potion', 'Strong Potion', 'Alchemy', 2, recipeCost),
  ];
  const initialGold = player.currencies.Gold;
  const attempt = attemptCraft(profession, ingredients, recipes, player);
  assert.strictEqual(attempt.success, true, 'Should succeed with cost');
  assert.ok(attempt.result, 'Should have a result item with cost');
  assert.strictEqual(attempt.result.name, 'Strong Potion', 'Result item name mismatch with cost');
  assert.strictEqual(attempt.newRecipeDiscovered, false, 'Should not be a new discovery');
  assert.strictEqual(player.currencies.Gold, initialGold - recipeCost.amount, 'Player currency should be debited');
}

function testAttemptCraft_Success_IngredientOrderAgnostic() {
  const profession = createMockProfession('Smithing', 1);
  const player = createMockPlayer();
  const ingredients = [createMockCard('metal_scrap'), createMockCard('wood1')];
  const recipeIngredients = ['wood1', 'metal_scrap'];
  const recipes = [
    createMockRecipe('dagger1', recipeIngredients, 'basic_dagger', 'Basic Dagger', 'Smithing', 1),
  ];
  const attempt = attemptCraft(profession, ingredients, recipes, player);
  assert.strictEqual(attempt.success, true, 'Should succeed regardless of ingredient order');
  assert.strictEqual(attempt.result.name, 'Basic Dagger', 'Result item name mismatch for order test');
}

function testAttemptCraft_Failure_WrongIngredients() {
  const profession = createMockProfession('Alchemy', 1);
  const player = createMockPlayer();
  const ingredients = [createMockCard('wrong_herb'), createMockCard('water1')];
  const recipes = [
    createMockRecipe('potion1', ['herb1', 'water1'], 'health_potion', 'Health Potion', 'Alchemy', 1),
  ];
  const attempt = attemptCraft(profession, ingredients, recipes, player);
  assert.strictEqual(attempt.success, false, 'Should fail with wrong ingredients');
  assert.strictEqual(attempt.result, null, 'Result should be null on failure');
}

function testAttemptCraft_Failure_LevelTooLow() {
  const profession = createMockProfession('Alchemy', 1);
  const player = createMockPlayer();
  const ingredients = [createMockCard('herb1'), createMockCard('water1')];
  const recipes = [
    createMockRecipe('potion_advanced', ['herb1', 'water1'], 'advanced_potion', 'Advanced Potion', 'Alchemy', 5),
  ];
  const attempt = attemptCraft(profession, ingredients, recipes, player);
  assert.strictEqual(attempt.success, false, 'Should fail if level is too low');
  assert.strictEqual(attempt.result, null, 'Result should be null on level failure');
}

function testAttemptCraft_Failure_InsufficientFunds() {
  const profession = createMockProfession('Alchemy', 1);
  const player = createMockPlayer({ Gold: 5 });
  const ingredients = [createMockCard('herb1'), createMockCard('water1')];
  const recipeCost = { amount: 10, currency: 'Gold' };
  const recipes = [
    createMockRecipe('costly_potion', ['herb1', 'water1'], 'costly_item', 'Costly Potion', 'Alchemy', 1, recipeCost),
  ];
  const initialGold = player.currencies.Gold;
  const attempt = attemptCraft(profession, ingredients, recipes, player);
  assert.strictEqual(attempt.success, false, 'Should fail with insufficient funds');
  assert.strictEqual(attempt.result, null, 'Result should be null on funds failure');
  assert.strictEqual(player.currencies.Gold, initialGold, 'Player currency should be unchanged on funds failure');
}

function testLevelUpProfession_AddXP_NoLevelUp() {
  const profession = createMockProfession('Cooking', 1, 10);
  levelUpProfession(profession, 20);
  assert.strictEqual(profession.level, 1, 'Level should not change');
  assert.strictEqual(profession.experience, 30, 'Experience should be added');
}

function testLevelUpProfession_AddXP_LevelUp() {
  const profession = createMockProfession('Cooking', 1, 80);
  levelUpProfession(profession, 30);
  assert.strictEqual(profession.level, 2, 'Level should increment');
  assert.strictEqual(profession.experience, 0, 'Experience should reset to 0 after level up');
}

function testLevelUpProfession_AddXP_MultipleLevelUps_CurrentBehavior() {
    const profession = createMockProfession('Cooking', 1, 80);
    levelUpProfession(profession, 250);
    assert.strictEqual(profession.level, 2, 'Level should increment only once per call with current code');
    assert.strictEqual(profession.experience, 0, 'Experience should reset after a single level up based on current code');
}

function testLevelUpProfession_AddXP_MaxLevel() {
  const profession = createMockProfession('Cooking', 10, 50);
  levelUpProfession(profession, 1000);
  assert.strictEqual(profession.level, 10, 'Level should stay at max (10)');
  assert.strictEqual(profession.experience, 1050, 'Experience should still accumulate at max level');
}

function testRegisterRecipeDiscovery_NewDiscovery() {
  const player = createMockPlayer({}, [], { Cooking: createMockProfession('Cooking') });
  const recipe = createMockRecipe('cake', ['flour', 'sugar'], 'cake_item', 'Cake', 'Cooking', 1);
  registerRecipeDiscovery(player, recipe);
  assert.ok(player.discoveredRecipes.includes('cake'), 'Player should have discovered recipe');
  assert.ok(player.professions.Cooking.unlockedRecipes.includes('cake'), 'Profession should have unlocked recipe');
}

function testRegisterRecipeDiscovery_RepeatDiscovery() {
  const player = createMockPlayer({ Gold: 100 }, ['cake'], { Cooking: createMockProfession('Cooking', 1, 0, ['cake']) });
  const recipe = createMockRecipe('cake', ['flour', 'sugar'], 'cake_item', 'Cake', 'Cooking', 1);
  const initialDiscoveredCount = player.discoveredRecipes.length;
  const initialUnlockedCount = player.professions.Cooking.unlockedRecipes.length;
  registerRecipeDiscovery(player, recipe);
  assert.strictEqual(player.discoveredRecipes.length, initialDiscoveredCount, 'Player discovered recipes count should not change');
  assert.strictEqual(player.professions.Cooking.unlockedRecipes.length, initialUnlockedCount, 'Profession unlocked recipes count should not change');
}

function testCraftWithInventory_SuccessfulCraft() {
  const playerProfessions = { Alchemy: createMockProfession('Alchemy', 1) };
  const player = createMockPlayer({ Gold: 100 }, [], playerProfessions);
  const ingredients = [createMockCard('herb1', 'Herb'), createMockCard('water1', 'Water')];
  const inventory = createMockInventory([...ingredients]);
  const recipeCost = { amount: 10, currency: 'Gold' };
  const recipes = [
    createMockRecipe('potion1', ['herb1', 'water1'], 'health_potion', 'Health Potion', 'Alchemy', 1, recipeCost),
  ];
  const initialGold = player.currencies.Gold;
  const initialHerbCount = inventory.items.filter(i => i.id === 'herb1').length;
  const initialWaterCount = inventory.items.filter(i => i.id === 'water1').length;

  const attempt = craftWithInventory(player, player.professions.Alchemy, ingredients, recipes, inventory);

  assert.strictEqual(attempt.success, true, 'craftWithInventory should succeed');
  assert.ok(attempt.result, 'craftWithInventory result should exist');
  assert.strictEqual(attempt.result.name, 'Health Potion', 'craftWithInventory result name mismatch');

  const finalHerbCount = inventory.items.filter(i => i.id === 'herb1').length;
  const finalWaterCount = inventory.items.filter(i => i.id === 'water1').length;
  assert.strictEqual(finalHerbCount, initialHerbCount - 1, 'Ingredient herb1 should be removed');
  assert.strictEqual(finalWaterCount, initialWaterCount - 1, 'Ingredient water1 should be removed');

  assert.ok(inventory.items.some(item => item.name === 'Health Potion'), 'Crafted item should be in inventory');
  assert.strictEqual(player.professions.Alchemy.experience, 10, 'Profession should gain XP');
  assert.ok(player.discoveredRecipes.includes('potion1'), 'Recipe should be discovered by player');
  assert.ok(player.professions.Alchemy.unlockedRecipes.includes('potion1'), 'Recipe should be unlocked by profession');
  assert.strictEqual(player.currencies.Gold, initialGold - recipeCost.amount, 'Player gold should be debited');
}

function testCraftWithInventory_FailedCraft_BadRecipe() {
  const playerProfessions = { Alchemy: createMockProfession('Alchemy', 1) };
  const player = createMockPlayer({ Gold: 100 }, [], playerProfessions);
  const ingredients = [createMockCard('wrong_item'), createMockCard('water1')];
  const inventory = createMockInventory([...ingredients]);
  const recipes = [
    createMockRecipe('potion1', ['herb1', 'water1'], 'health_potion', 'Health Potion', 'Alchemy', 1),
  ];
  const initialInventoryCount = inventory.items.length;
  const initialExp = player.professions.Alchemy.experience;
  const initialGold = player.currencies.Gold;

  const attempt = craftWithInventory(player, player.professions.Alchemy, ingredients, recipes, inventory);

  assert.strictEqual(attempt.success, false, 'craftWithInventory should fail for bad recipe');
  assert.strictEqual(inventory.items.length, initialInventoryCount, 'Inventory should be unchanged on failed craft');
  assert.strictEqual(player.professions.Alchemy.experience, initialExp, 'Profession XP should be unchanged on failed craft');
  assert.strictEqual(player.currencies.Gold, initialGold, 'Player gold should be unchanged on failed craft');
  assert.strictEqual(player.discoveredRecipes.includes('potion1'), false, 'Recipe should not be discovered on failed craft');
}

// --- Test Runner ---
const runTests = () => {
  let passed = 0;
  let failed = 0;
  const testFunctions = [
    testAttemptCraft_Success_NoCost_NewDiscovery,
    testAttemptCraft_Success_WithCost_OldDiscovery,
    testAttemptCraft_Success_IngredientOrderAgnostic,
    testAttemptCraft_Failure_WrongIngredients,
    testAttemptCraft_Failure_LevelTooLow,
    testAttemptCraft_Failure_InsufficientFunds,
    testLevelUpProfession_AddXP_NoLevelUp,
    testLevelUpProfession_AddXP_LevelUp,
    testLevelUpProfession_AddXP_MultipleLevelUps_CurrentBehavior,
    testLevelUpProfession_AddXP_MaxLevel,
    testRegisterRecipeDiscovery_NewDiscovery,
    testRegisterRecipeDiscovery_RepeatDiscovery,
    testCraftWithInventory_SuccessfulCraft,
    testCraftWithInventory_FailedCraft_BadRecipe,
  ];

  console.log('--- Running crafting.test.js ---');
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

  console.log(`\n--- crafting.test.js Results ---`);
  console.log(`Total: ${testFunctions.length}, Passed: ${passed}, Failed: ${failed}`);

  if (failed > 0) {
    // Node.js specific: process.exit will terminate the script.
    // In some test environments or if this script were part of a larger suite managed differently,
    // just throwing an error might be preferred.
    if (typeof process !== 'undefined' && process.exit) {
        process.exit(1);
    } else {
        throw new Error(`${failed} crafting test(s) failed.`);
    }
  }
};

runTests();
