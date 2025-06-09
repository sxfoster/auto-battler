export const MOCK_CARDS = {
  // Ranger Cards
  ARROW_SHOT: { id: 'ARROW_SHOT', name: 'Arrow Shot', cost: 1, description: 'Shoot an arrow dealing 3 damage.' },
  EAGLE_EYE: { id: 'EAGLE_EYE', name: 'Eagle Eye', cost: 1, description: 'Increase critical hit chance by 25% for 2 turns.' },
  ENTANGLING_TRAP: { id: 'ENTANGLING_TRAP', name: 'Entangling Trap', cost: 2, description: 'Root an enemy, preventing movement or actions for 1 turn.' },

  // Bard Cards
  INSPIRE: { id: 'INSPIRE', name: 'Inspire', cost: 1, description: 'Grant +2 ATK to an ally for 2 turns.' },
  LULLABY: { id: 'LULLABY', name: 'Lullaby', cost: 2, description: 'Put an enemy to sleep for 1 turn.' },
  MOTIVATIONAL_TUNE: { id: 'MOTIVATIONAL_TUNE', name: 'Motivational Tune', cost: 1, description: 'Restore 1 energy to all allies.' },
};

export const MOCK_HEROES = {
  RANGER: {
    id: 'RANGER_1',
    name: 'Ranger',
    class: 'Ranger',
    hp: 75,
    maxHp: 75,
    energy: 0,
    speed: 30,
    position: null,
    cardsInHand: [],
    battleDeck: [],
    cardPool: [MOCK_CARDS.ARROW_SHOT, MOCK_CARDS.EAGLE_EYE, MOCK_CARDS.ENTANGLING_TRAP],
    archetype: 'DPS',
  },
  BARD: {
    id: 'BARD_1',
    name: 'Bard',
    class: 'Bard',
    hp: 90,
    maxHp: 90,
    energy: 0,
    speed: 25,
    position: null,
    cardsInHand: [],
    battleDeck: [],
    cardPool: [MOCK_CARDS.INSPIRE, MOCK_CARDS.LULLABY, MOCK_CARDS.MOTIVATIONAL_TUNE],
    archetype: 'Support',
  },
};

export const MOCK_ENEMIES = {
    GOBLIN: {
        id: 'GOBLIN_1',
        name: 'Goblin Grunt',
        class: 'Goblin',
        hp: 20,
        maxHp: 20,
        energy: 0,
        speed: 15,
        position: null,
        cardsInHand: [],
        battleDeck: [{ id: 'PUNCH', name: 'Punch', cost: 1, description: 'Deal 2 damage.' }],
        cardPool: [{ id: 'PUNCH', name: 'Punch', cost: 1, description: 'Deal 2 damage.' }],
        archetype: 'DPS',
    }
}
