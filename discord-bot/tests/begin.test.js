const db = require('../util/database');
const gameData = require('../util/gameData');
const embedBuilder = require('../src/utils/embedBuilder');

jest.mock('../util/database', () => ({
  execute: jest.fn()
}));

jest.mock('../util/gameData', () => ({
  getRandomCardsForPack: jest.fn()
}));

jest.mock('../src/utils/embedBuilder', () => ({
  simple: jest.fn(() => ({ data: {} }))
}));

jest.mock('../../backend/game/data', () => ({
  allPossibleAbilities: [
    { id: 1, name: 'Bolt', class: 'Mage', effect: 'Zap', rarity: 'Common' },
    { id: 2, name: 'Fireball', class: 'Mage', effect: 'Burn', rarity: 'Uncommon' },
    { id: 3, name: 'Sneak', class: 'Rogue', effect: 'Hide', rarity: 'Common' }
  ]
}));

const beginCommand = require('../commands/begin');
const selectMenuHandler = require('../handlers/selectMenuHandler');
const beginManager = require('../features/beginManager');

describe('begin command flow', () => {
  test('executing /begin calls showClassSelection', async () => {
    const spy = jest.spyOn(beginManager, 'showClassSelection').mockResolvedValue();
    const interaction = {};
    await beginCommand.execute(interaction);
    expect(spy).toHaveBeenCalledWith(interaction);
    spy.mockRestore();
  });

  test('select menu invokes handleClassSelected', async () => {
    const spy = jest.spyOn(beginManager, 'handleClassSelected').mockResolvedValue();
    const interaction = {
      customId: 'begin_class_select',
      values: ['Mage'],
      user: { id: '42' },
      deferUpdate: jest.fn().mockResolvedValue()
    };
    await selectMenuHandler(interaction);
    expect(spy).toHaveBeenCalledWith(interaction, '42', 'Mage');
    spy.mockRestore();
  });

  test('opening starter pack inserts cards and sends embed', async () => {
    const interaction = {
      editReply: jest.fn().mockResolvedValue(),
      followUp: jest.fn().mockResolvedValue()
    };
    gameData.getRandomCardsForPack.mockReturnValue([
      { id: 1, name: 'Bolt', class: 'Mage', effect: 'Zap' },
      { id: 2, name: 'Fireball', class: 'Mage', effect: 'Burn' },
      { id: 4, name: 'Ice', class: 'Mage', effect: 'Freeze' }
    ]);
    db.execute.mockResolvedValue([]);

    await beginManager.handleClassSelected(interaction, '99', 'Mage');

    expect(db.execute).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE users SET class'),
      ['Mage', '99']
    );
    expect(db.execute).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO user_inventory'),
      ['99', 1, 'ability']
    );
    expect(interaction.followUp).toHaveBeenCalledWith(expect.objectContaining({ embeds: [expect.any(Object)] }));
  });
});
