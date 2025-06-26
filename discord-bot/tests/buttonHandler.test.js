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
  test('handles back_to_town button', async () => {
    const interaction = {
      customId: 'back_to_town',
      update: jest.fn().mockResolvedValue(),
      user: { id: '123' },
    };

    await buttonHandler(interaction);

    expect(require('../commands/town').getTownMenu).toHaveBeenCalled();
    expect(interaction.update).toHaveBeenCalled();
  });
});
