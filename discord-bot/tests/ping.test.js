const ping = require('../commands/ping');

test('ping command replies', async () => {
  const interaction = { reply: jest.fn().mockResolvedValue() };
  await ping.execute(interaction);
  expect(interaction.reply).toHaveBeenCalledWith(
    expect.objectContaining({ ephemeral: true })
  );
});
