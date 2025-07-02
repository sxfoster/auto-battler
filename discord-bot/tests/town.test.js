const town = require('../commands/town');
const { MessageFlags } = require('discord.js');

jest.mock('../src/utils/userService', () => ({ setUserLocation: jest.fn() }));
const userService = require('../src/utils/userService');

test('replies with town hub embed', async () => {
  const interaction = { user: { id: '1' }, reply: jest.fn().mockResolvedValue() };
  await town.execute(interaction);
  expect(userService.setUserLocation).toHaveBeenCalledWith('1', 'town');
  expect(interaction.reply).toHaveBeenCalledWith(
    expect.objectContaining({ embeds: expect.any(Array), components: expect.any(Array), flags: [MessageFlags.Ephemeral] })
  );
});
