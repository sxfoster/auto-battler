import { simulateBattle } from '../battleSimulator.js';
import { playerParty, enemyParty } from '../sampleBattleData.js';

describe('battleSimulator', () => {
  test('should produce a valid sequence of battle steps', () => {
    const steps = simulateBattle(playerParty, enemyParty);

    // Check that steps is an array and is not empty
    expect(Array.isArray(steps)).toBe(true);
    expect(steps.length).toBeGreaterThan(0);

    // Check that the first step object has the required properties
    if (steps.length > 0) {
      expect(steps[0]).toHaveProperty('actorId');
      expect(steps[0]).toHaveProperty('actionType');
      expect(steps[0]).toHaveProperty('preState');
      expect(steps[0]).toHaveProperty('postState');
      expect(steps[0]).toHaveProperty('logMessage');

      // Check that preState and postState in the first step are arrays
      expect(Array.isArray(steps[0].preState)).toBe(true);
      expect(Array.isArray(steps[0].postState)).toBe(true);
    }
  });
});
