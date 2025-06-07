import { Combatant } from '../Combatant.js';

class Card { constructor({ id, name, cost }) { this.id=id; this.name=name; this.cost=cost; } }

describe('Combatant model', () => {
  let c;
  beforeEach(() => {
    c = new Combatant({ id: '1', name: 'Test', stats: { hp: 10, mana: 3 }, deck: [
      new Card({ id: 'a', name: 'A', cost:1 }),
      new Card({ id: 'b', name: 'B', cost:2 })
    ]});
  });

  it('gains energy up to max', () => {
    c.currentEnergy = 2;
    c.gainEnergy();
    expect(c.currentEnergy).toBe(3);
    c.gainEnergy();
    expect(c.currentEnergy).toBe(3);
  });

  it('draws cards into hand and removes from deck', () => {
    c.hand = [];
    c.drawCard();
    expect(c.hand.length).toBe(1);
    expect(c.deck.length).toBe(1);
  });
});
