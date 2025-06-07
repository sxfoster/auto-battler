import { checkVictory } from '../BattleManager.js';
import { Combatant } from '../../actors/Combatant.js';

describe('checkVictory()', () => {
  it('returns true when one side is wiped', () => {
    const allies = [ new Combatant({ id:'a', stats:{ hp:0 } }) ];
    const enemies = [ new Combatant({ id:'e', stats:{ hp:0 } }) ];
    expect(checkVictory(allies, enemies)).toBe(true);
  });
});
