const town = require('../commands/town');

test('replies with town hub embed', async () => {
  const interaction = { reply: jest.fn().mockResolvedValue() };
  await town.execute(interaction);
  expect(interaction.reply).toHaveBeenCalledWith(
    expect.objectContaining({ embeds: expect.any(Array), components: expect.any(Array), ephemeral: true })
  );
});
