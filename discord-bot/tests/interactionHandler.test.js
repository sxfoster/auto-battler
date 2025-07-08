jest.mock('../src/services/playerService', () => ({ storeStatSelection: jest.fn() }));
jest.mock('../src/utils/embedBuilder', () => ({ simple: jest.fn(() => 'embed') }));

const { handleStatSelectMenu } = require('../index');
const playerService = require('../src/services/playerService');
const embeds = require('../src/utils/embedBuilder');

test('handleStatSelectMenu sets stats and replies', async () => {
  const interaction = {
    user: { id: '123' },
    values: ['MGT'],
    reply: jest.fn().mockResolvedValue()
  };

  await handleStatSelectMenu(interaction);

  expect(playerService.storeStatSelection).toHaveBeenCalledWith('123', ['MGT']);
  expect(embeds.simple).toHaveBeenCalledWith('Starting stats saved!', [{ name: 'Selected', value: 'MGT' }]);
  expect(interaction.reply).toHaveBeenCalledWith({ embeds: ['embed'], ephemeral: true });
});
