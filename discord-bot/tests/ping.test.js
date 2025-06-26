const ping = require('../commands/ping');

test('ping command replies', async () => {
  const interaction = { reply: jest.fn().mockResolvedValue(), flags: [] };
  await ping.execute(interaction);
  expect(interaction.reply).toHaveBeenCalled();
});
