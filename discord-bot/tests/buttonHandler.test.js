const marketManager = require('../features/marketManager');

jest.mock('../features/marketManager', () => ({
  handleBoosterPurchase: jest.fn(),
}));

jest.mock('../features/tutorialManager', () => ({
  handleTutorialButton: jest.fn(),
}));

jest.mock('../commands/town', () => ({
  getTownMenu: jest.fn(),
}));

const buttonHandler = require('../handlers/buttonHandler');

describe('buttonHandler', () => {
  test('delegates buy_pack button to handleBoosterPurchase', async () => {
    const interaction = {
      customId: 'buy_pack_hero_pack',
      deferUpdate: jest.fn().mockResolvedValue(),
      user: { id: '123' },
    };

    await buttonHandler(interaction);

    expect(marketManager.handleBoosterPurchase).toHaveBeenCalledWith(
      interaction,
      '123',
      'hero_pack',
      0
    );
  });
});
