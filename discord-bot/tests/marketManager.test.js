const marketManager = require('../features/marketManager');
const db = require('../util/database');
const gameData = require('../util/gameData');

jest.mock('../util/database', () => ({
  execute: jest.fn()
}));

jest.mock('../util/gameData', () => ({
  getRandomCardsForPack: jest.fn()
}));

jest.mock('../../backend/game/data', () => ({
  allPossibleHeroes: [],
  allPossibleWeapons: [],
  allPossibleArmors: [],
  allPossibleAbilities: []
}));

jest.mock('../src/utils/cardRenderer', () => ({
  generateCardImage: jest.fn(() => Promise.resolve(Buffer.from('x')))
}));

describe('handleBoosterPurchase', () => {
  test('sends debug gold DM and announces new card', async () => {
    gameData.getRandomCardsForPack.mockReturnValue([
      { id: 1, name: 'Test Card', rarity: 'Common', type: 'hero' }
    ]);

    db.execute
      .mockResolvedValueOnce([[{ soft_currency: 150 }]]) // check funds
      .mockResolvedValueOnce([]) // deduct
      .mockResolvedValueOnce([[{ soft_currency: 50 }]]) // new balance
      .mockResolvedValueOnce([[]]) // check ownership
      .mockResolvedValueOnce([]); // insert

    const channelSend = jest.fn().mockResolvedValue();
    const interaction = {
      editReply: jest.fn().mockResolvedValue(),
      user: { id: '123', username: 'Tester', send: jest.fn().mockResolvedValue() },
      client: { channels: { cache: { get: jest.fn(() => ({ send: channelSend })) } } }
    };

    await marketManager.handleBoosterPurchase(interaction, '123', 'hero_pack', 0);

    expect(interaction.user.send).toHaveBeenCalledWith('💰 Debug: Your new gold balance is 50');
    expect(channelSend).toHaveBeenCalledWith('📣 **Tester** has obtained a new card: **Test Card** (Common)!');
  });
});
