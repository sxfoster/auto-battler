import {
  attemptCraft,
  getAvailableRecipes,
  levelUpProfession,
  registerRecipeDiscovery,
} from './crafting.js';
import { sampleCards } from '../models/cards.js';
import { sampleRecipes } from '../models/recipes.js';

// Helper for basic assertion. In a real test environment, use expect from Jest/Vitest.
function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

// Mock data setup
const mockPlayer = {
  id: 'player1',
  name: 'Test Player',
  professions: {
    Cooking: { name: 'Cooking', level: 1, experience: 0, unlockedRecipes: [] },
    Smithing: { name: 'Smithing', level: 1, experience: 0, unlockedRecipes: [] },
    Alchemy: { name: 'Alchemy', level: 1, experience: 0, unlockedRecipes: [] },
  },
  discoveredRecipes: [],
  currencies: { Gold: 100, GuildCredit: 10 },
};

const herbCard = sampleCards.find(c => c.id === 'herb');
const breadCard = sampleCards.find(c => c.id === 'bread');
const ironSwordCard = sampleCards.find(c => c.id === 'iron_sword');

if (!herbCard || !breadCard || !ironSwordCard) {
  throw new Error("Required sample cards for testing not found. Check card IDs.");
}

describe('Crafting System', () => {
  describe('attemptCraft', () => {
    it('should successfully craft an item with a valid recipe and profession level', () => {
      const profession = { ...mockPlayer.professions.Cooking, level: 1 };
      const ingredients = [herbCard, breadCard]; // For 'cooked_meat'
      const result = attemptCraft(profession, ingredients, sampleRecipes);
      assert(result.success === true, 'Crafting should succeed');
      assert(result.result && result.result.id.startsWith('cooked_meat'), 'Should craft cooked_meat');
      assert(result.newRecipeDiscovered === true, 'cooked_meat should be a new discovery');
    });

    it('should fail crafting if ingredients are invalid for any recipe', () => {
      const profession = { ...mockPlayer.professions.Cooking, level: 1 };
      const ingredients = [herbCard, ironSwordCard]; // Invalid for Cooking
      const result = attemptCraft(profession, ingredients, sampleRecipes);
      assert(result.success === false, 'Crafting should fail with invalid ingredients');
      assert(result.result === null, 'Result should be null on failure');
    });

    it('should fail crafting if profession level is too low', () => {
      const profession = { ...mockPlayer.professions.Smithing, level: 1 }; // Flame Sword needs level 2
      const ingredients = [ironSwordCard, herbCard]; // For 'flame_sword'
      const result = attemptCraft(profession, ingredients, sampleRecipes);
      assert(result.success === false, 'Crafting should fail if level is too low');
    });

    it('should correctly identify a new recipe discovery', () => {
      const profession = { ...mockPlayer.professions.Alchemy, level: 1, unlockedRecipes: [] };
      const ingredients = [herbCard, herbCard]; // For 'healing_elixir'
      const result = attemptCraft(profession, ingredients, sampleRecipes);
      assert(result.success === true, 'Crafting should succeed');
      assert(result.newRecipeDiscovered === true, 'New recipe should be discovered');
    });

    it('should not mark an already known recipe as a new discovery', () => {
      const healingElixirRecipe = sampleRecipes.find(r => r.id === 'healing_elixir');
      const profession = { ...mockPlayer.professions.Alchemy, level: 1, unlockedRecipes: [healingElixirRecipe.id] };
      const ingredients = [herbCard, herbCard];
      const result = attemptCraft(profession, ingredients, sampleRecipes);
      assert(result.success === true, 'Crafting should succeed');
      assert(result.newRecipeDiscovered === false, 'Recipe should not be marked as new');
    });

    it('should return an error if profession data is invalid', () => {
        const ingredients = [herbCard, breadCard];
        const result = attemptCraft(null, ingredients, sampleRecipes);
        assert(result.success === false && result.error === 'Invalid profession data', 'Should fail for null profession');
    });

    it('should return an error if usedCards is empty or invalid', () => {
        const profession = { ...mockPlayer.professions.Cooking, level: 1 };
        const resultEmpty = attemptCraft(profession, [], sampleRecipes);
        assert(resultEmpty.success === false && resultEmpty.error === 'No cards provided for crafting', 'Should fail for empty cards');

        const resultInvalid = attemptCraft(profession, [null], sampleRecipes);
        assert(resultInvalid.success === false && resultInvalid.error === 'Invalid card data among used cards', 'Should fail for invalid card in array');
    });
  });

  describe('getAvailableRecipes', () => {
    it('should return recipes matching profession and level', () => {
      const profession = { ...mockPlayer.professions.Cooking, level: 1 };
      const available = getAvailableRecipes(profession, sampleRecipes);
      assert(available.length === 1, 'Should find 1 cooking recipe at level 1');
      assert(available[0].id === 'cooked_meat', 'Cooked meat recipe should be available');
    });

    it('should return multiple recipes if level is high enough', () => {
      const profession = { ...mockPlayer.professions.Smithing, level: 2 };
      const available = getAvailableRecipes(profession, sampleRecipes);
      // Assuming there's only flame_sword for Smithing in sampleRecipes
      assert(available.length === 1 && available[0].id === 'flame_sword', 'Flame sword should be available for Smithing Lvl 2');
    });

    it('should return no recipes if level is too low for any profession recipes', () => {
      const profession = { ...mockPlayer.professions.Smithing, level: 1 }; // Flame Sword needs Lvl 2
      const available = getAvailableRecipes(profession, sampleRecipes);
      assert(available.length === 0, 'No smithing recipes should be available at level 1');
    });

    it('should return no recipes if profession does not match any recipes', () => {
      const profession = { name: 'Fletching', level: 5, experience: 0, unlockedRecipes: [] };
      const available = getAvailableRecipes(profession, sampleRecipes);
      assert(available.length === 0, 'No fletching recipes should be available');
    });
  });

  describe('levelUpProfession', () => {
    it('should correctly add experience to a profession', () => {
      const profession = { name: 'Cooking', level: 1, experience: 0, unlockedRecipes: [] };
      levelUpProfession(profession, 50);
      assert(profession.experience === 50, 'Experience should be 50');
      assert(profession.level === 1, 'Level should still be 1');
    });

    it('should level up the profession when experience threshold is met', () => {
      const profession = { name: 'Cooking', level: 1, experience: 50, unlockedRecipes: [] };
      levelUpProfession(profession, 50); // Total 100, needs 1*100
      assert(profession.level === 2, 'Level should be 2');
      assert(profession.experience === 0, 'Experience should reset to 0 after level up');
    });

    it('should handle multiple level ups correctly', () => {
      const profession = { name: 'Cooking', level: 1, experience: 0, unlockedRecipes: [] };
      levelUpProfession(profession, 350); // Needs 100 for L2 (exp 250 left), needs 200 for L3 (exp 50 left)
      assert(profession.level === 3, 'Level should be 3');
      assert(profession.experience === 50, 'Experience should be 50 after multiple level ups');
    });

    it('should not level up beyond max level (10)', () => {
      const profession = { name: 'Cooking', level: 9, experience: 0, unlockedRecipes: [] };
      levelUpProfession(profession, 10000); // Enough for L10 and beyond
      assert(profession.level === 10, 'Level should cap at 10');
      // Experience might accumulate at max level or reset, current logic keeps it
      // For this test, we only care about level cap.
      // If it should reset: assert(profession.experience === 0, 'Experience should be 0 or capped at max level');
    });
     it('should not change level if already at max level (10) and gains exp', () => {
      const profession = { name: 'Cooking', level: 10, experience: 0, unlockedRecipes: [] };
      levelUpProfession(profession, 50);
      assert(profession.level === 10, 'Level should remain 10');
      assert(profession.experience === 50, 'Experience should still accumulate at max level');
    });
  });

  describe('registerRecipeDiscovery', () => {
    let testPlayer;
    const cookedMeatRecipe = sampleRecipes.find(r => r.id === 'cooked_meat');
    const flameSwordRecipe = sampleRecipes.find(r => r.id === 'flame_sword');

    beforeEach(() => {
      // Deep clone mockPlayer to ensure test isolation for this describe block
      testPlayer = JSON.parse(JSON.stringify(mockPlayer));
    });

    it('should add a new recipe to players discoveredRecipes list', () => {
      registerRecipeDiscovery(testPlayer, cookedMeatRecipe);
      assert(testPlayer.discoveredRecipes.includes(cookedMeatRecipe.id), 'Player should have discovered cooked_meat');
    });

    it('should add a new recipe to the specific professions unlockedRecipes list', () => {
      registerRecipeDiscovery(testPlayer, cookedMeatRecipe);
      assert(testPlayer.professions.Cooking.unlockedRecipes.includes(cookedMeatRecipe.id), 'Cooking profession should have unlocked cooked_meat');
    });

    it('should not add duplicates to discoveredRecipes', () => {
      registerRecipeDiscovery(testPlayer, cookedMeatRecipe);
      registerRecipeDiscovery(testPlayer, cookedMeatRecipe); // Add again
      assert(testPlayer.discoveredRecipes.filter(id => id === cookedMeatRecipe.id).length === 1, 'Cooked_meat should only appear once in discoveredRecipes');
    });

    it('should not add duplicates to profession unlockedRecipes', () => {
      registerRecipeDiscovery(testPlayer, cookedMeatRecipe);
      registerRecipeDiscovery(testPlayer, cookedMeatRecipe); // Add again
      assert(testPlayer.professions.Cooking.unlockedRecipes.filter(id => id === cookedMeatRecipe.id).length === 1, 'Cooked_meat should only appear once in Cooking unlockedRecipes');
    });

    it('should handle different professions correctly', () => {
      registerRecipeDiscovery(testPlayer, cookedMeatRecipe); // Cooking
      registerRecipeDiscovery(testPlayer, flameSwordRecipe); // Smithing

      assert(testPlayer.discoveredRecipes.includes(cookedMeatRecipe.id), 'Player discovered cooked_meat');
      assert(testPlayer.discoveredRecipes.includes(flameSwordRecipe.id), 'Player discovered flame_sword');
      assert(testPlayer.professions.Cooking.unlockedRecipes.includes(cookedMeatRecipe.id), 'Cooking unlocked cooked_meat');
      assert(testPlayer.professions.Smithing.unlockedRecipes.includes(flameSwordRecipe.id), 'Smithing unlocked flame_sword');
      assert(!testPlayer.professions.Cooking.unlockedRecipes.includes(flameSwordRecipe.id), 'Cooking should not have flame_sword');
    });

     it('should not fail if player profession does not exist (though this is bad data)', () => {
      const recipeForMissingProfession = { id: 'phantom_recipe', ingredients: [], result: {}, profession: 'NonExistentProfession', levelRequirement: 1 };
      // This test is more about graceful handling than correct behavior with bad data
      assert(typeof testPlayer.professions.NonExistentProfession === 'undefined', 'Profession should not exist initially');
      registerRecipeDiscovery(testPlayer, recipeForMissingProfession);
      assert(testPlayer.discoveredRecipes.includes(recipeForMissingProfession.id), 'Recipe for missing profession should be in global list');
      // The function doesn't create professions, so no error should be thrown, and no profession list updated.
    });
  });
});

// A simple runner for these tests if not using Jest/Vitest
// In a real setup, these would be run by the test runner.
// To run: node shared/systems/crafting.test.js
// (This will only work if imports/exports are CJS or if run with ESM support)

function runTests() {
  console.log("Running Crafting System Tests...");
  const testSuites = {
    'Crafting System': {
      'attemptCraft': [
        () => describe('Crafting System', () => {}).children[0].children[0].fn(), // success
        () => describe('Crafting System', () => {}).children[0].children[1].fn(), // invalid ingredients
        () => describe('Crafting System', () => {}).children[0].children[2].fn(), // level too low
        () => describe('Crafting System', () => {}).children[0].children[3].fn(), // new discovery
        () => describe('Crafting System', () => {}).children[0].children[4].fn(), // not new discovery
        () => describe('Crafting System', () => {}).children[0].children[5].fn(), // invalid profession
        () => describe('Crafting System', () => {}).children[0].children[6].fn(), // empty/invalid cards
      ],
      'getAvailableRecipes': [
        () => describe('Crafting System', () => {}).children[1].children[0].fn(),
        () => describe('Crafting System', () => {}).children[1].children[1].fn(),
        () => describe('Crafting System', () => {}).children[1].children[2].fn(),
        () => describe('Crafting System', () => {}).children[1].children[3].fn(),
      ],
      'levelUpProfession': [
        () => describe('Crafting System', () => {}).children[2].children[0].fn(),
        () => describe('Crafting System', () => {}).children[2].children[1].fn(),
        () => describe('Crafting System', () => {}).children[2].children[2].fn(),
        () => describe('Crafting System', () => {}).children[2].children[3].fn(),
        () => describe('Crafting System', () => {}).children[2].children[4].fn(),
      ],
      'registerRecipeDiscovery': [
        // Need to re-init describe for beforeEach to work correctly if tests are run this way
        () => {
          const suite = describe('Crafting System', () => {});
          suite.children[3].beforeEachs[0](); // Call beforeEach
          suite.children[3].children[0].fn();
        },
        () => {
          const suite = describe('Crafting System', () => {});
          suite.children[3].beforeEachs[0]();
          suite.children[3].children[1].fn();
        },
        () => {
          const suite = describe('Crafting System', () => {});
          suite.children[3].beforeEachs[0]();
          suite.children[3].children[2].fn();
        },
         () => {
          const suite = describe('Crafting System', () => {});
          suite.children[3].beforeEachs[0]();
          suite.children[3].children[3].fn();
        },
        () => {
          const suite = describe('Crafting System', () => {});
          suite.children[3].beforeEachs[0]();
          suite.children[3].children[4].fn();
        },
        () => {
          const suite = describe('Crafting System', () => {});
          suite.children[3].beforeEachs[0]();
          suite.children[3].children[5].fn();
        },
      ]
    }
  };

  // Mocking describe/it/beforeEach for standalone execution
  global.describe = (name, fn) => {
    const suite = { name, children: [], beforeEachs: [] };
    const originalIt = global.it;
    const originalBeforeEach = global.beforeEach;
    global.it = (testName, testFn) => suite.children.push({ name: testName, fn: testFn });
    global.beforeEach = (beforeFn) => suite.beforeEachs.push(beforeFn);
    fn(); // Execute the describe block to populate suite
    global.it = originalIt;
    global.beforeEach = originalBeforeEach;
    return suite; // Return the suite structure
  };

  let testsPassed = 0;
  let testsFailed = 0;

  for (const suiteName in testSuites) {
    console.log(`\nRunning suite: ${suiteName}`);
    for (const describeName in testSuites[suiteName]) {
      console.log(`  Describing: ${describeName}`);
      const testCases = testSuites[suiteName][describeName];
      testCases.forEach((testCaseFn, index) => {
        // This is a hacky way to get test names, assumes it() was called in order
        // A proper test runner would handle this.
        // For now, just using index.
        const testName = `Test Case #${index + 1}`;
        try {
          testCaseFn(); // This will execute the describe, then the it block
          console.log(`    [PASS] ${testName}`);
          testsPassed++;
        } catch (e) {
          console.error(`    [FAIL] ${testName}: ${e.message}`);
          testsFailed++;
        }
      });
    }
  }

  console.log(`\nTests Finished. Passed: ${testsPassed}, Failed: ${testsFailed}`);
  if (testsFailed > 0) {
    // throw new Error(`${testsFailed} tests failed.`); // Or process.exit(1)
  }
}

// Uncomment to run if this file is executed directly:
// runTests();
// Note: This basic runner won't work perfectly with describe/it structure without more complex parsing.
// It's better to use a real test runner (Jest, Vitest, Mocha).
// The tests themselves are structured for such runners.
// For the purpose of this task, the file contains the test logic.
// If this file were to be executed by a test runner, the `runTests` and its call would be removed.
// The `describe`, `it`, `beforeEach` calls are standard for Jest/Vitest.
// The `assert` helper would be replaced by `expect().toBe()`, etc.
console.log("shared/systems/crafting.test.js created with test structures.");
console.log("To run these tests, a test runner like Jest or Vitest should be configured for the project.");
console.log("The 'runTests' function is a placeholder for manual execution and has limitations.");

// Example of how a test would look with Jest/Vitest:
//
// import { attemptCraft } from './crafting';
// import { sampleCards } from '../models/cards';
// import { sampleRecipes } from '../models/recipes';
//
// describe('attemptCraft', () => {
//   const mockProfession = { name: 'Cooking', level: 1, experience: 0, unlockedRecipes: [] };
//   const herbCard = sampleCards.find(c => c.id === 'herb');
//   const breadCard = sampleCards.find(c => c.id === 'bread');
//
//   it('should successfully craft an item', () => {
//     const ingredients = [herbCard, breadCard];
//     const result = attemptCraft(mockProfession, ingredients, sampleRecipes);
//     expect(result.success).toBe(true);
//     expect(result.result.id.startsWith('cooked_meat')).toBe(true);
//   });
// });
//
// For the purpose of this exercise, the file above contains the test logic using the provided 'assert'
// and is ready to be adapted to a proper test runner.Okay, `shared/systems/crafting.test.js` has been created. It includes:
-   Basic assertion helper (to be replaced by a test runner's assertions).
-   Mock player data and specific card references.
-   `describe` blocks for each function: `attemptCraft`, `getAvailableRecipes`, `levelUpProfession`, and `registerRecipeDiscovery`.
-   Multiple `it` blocks for various test cases, including success, failure, edge cases (like max level, empty arrays, invalid inputs for `attemptCraft`).
-   A placeholder `runTests()` function and comments about how to integrate with a proper test runner like Jest or Vitest. The tests are structured in a way that's compatible with these runners.

Next, I will create/update the test file for `enemyAI.js` (`shared/systems/enemyAI.test.js`).
This will involve testing `trackEnemyActions`, `shouldExecuteCombo`, and `chooseEnemyAction`.

I need to read `shared/systems/enemyAI.js` and relevant models (`Card.ts`, `Enemy.ts`).
