const auctionHouse = require('../commands/auctionhouse');

jest.mock('../src/utils/userService', () => ({ getUser: jest.fn() }));
jest.mock('../src/utils/auctionHouseService', () => ({ purchaseListing: jest.fn() }));
const userService = require('../src/utils/userService');
const auctionService = require('../src/utils/auctionHouseService');
const handlers = require('../src/utils/auctionHouseHandlers');

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

  const navButton =
    interaction.reply.mock.calls[0][0].components[1].components[0].toJSON();
  expect(navButton.custom_id).toBe('nav-town');
});

test('handleBuySelect posts confirmation with back to town button', async () => {
  userService.getUser.mockResolvedValue({ id: 1 });
  auctionService.purchaseListing.mockResolvedValue({ ability_id: 3, price: 20 });
  const interaction = {
    values: ['5'],
    user: { id: '1' },
    client: {},
    update: jest.fn().mockResolvedValue()
  };

  await handlers.handleBuySelect(interaction);

  expect(auctionService.purchaseListing).toHaveBeenCalledWith(1, 5, interaction.client);
  expect(interaction.update).toHaveBeenCalledWith(
    expect.objectContaining({
      content: expect.stringContaining('successfully purchased'),
      components: expect.any(Array),
      ephemeral: true
    })
  );
  const navButton = interaction.update.mock.calls[0][0].components[0].components[0].toJSON();
  expect(navButton.custom_id).toBe('nav-town');
});
