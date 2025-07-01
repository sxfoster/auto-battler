const auctionHouse = require('../commands/auctionhouse');

test('command posts welcome message with buy/sell buttons', async () => {
  const interaction = { reply: jest.fn().mockResolvedValue() };
  await auctionHouse.execute(interaction);
  expect(interaction.reply).toHaveBeenCalledWith(
    expect.objectContaining({
      content: expect.stringContaining('Welcome'),
      components: expect.any(Array),
      ephemeral: true
    })
  );
});
