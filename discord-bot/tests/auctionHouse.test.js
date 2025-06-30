const auction = require('../commands/auction');

jest.mock('../src/utils/auctionHouseService', () => ({
  getCheapestListings: jest.fn(),
  purchaseListing: jest.fn()
}));
const auctionHouseService = require('../src/utils/auctionHouseService');

describe('auction house', () => {
  beforeEach(() => jest.clearAllMocks());

  test('handleBuyButton shows cheapest listings', async () => {
    auctionHouseService.getCheapestListings.mockResolvedValue([
      { id: 1, card_id: 3111, price: 100, seller_name: 'Alice' }
    ]);
    const interaction = { update: jest.fn().mockResolvedValue() };
    await auction.handleBuyButton(interaction);
    expect(auctionHouseService.getCheapestListings).toHaveBeenCalled();
    expect(interaction.update).toHaveBeenCalledWith(
      expect.objectContaining({ embeds: expect.any(Array), components: expect.any(Array) })
    );
    const button = interaction.update.mock.calls[0][0].components[0].components[0];
    expect(button.data.custom_id).toBe('ah-buy-listing:1');
  });

  test('handleBuyListing successful purchase', async () => {
    auctionHouseService.purchaseListing.mockResolvedValue({
      buyer: { name: 'Buyer', discord_id: '1' },
      seller: { name: 'Seller', discord_id: '2' },
      listing: { card_id: 3111, price: 50 }
    });
    const sellerSend = jest.fn().mockResolvedValue();
    const interaction = {
      customId: 'ah-buy-listing:1',
      user: { id: '1' },
      client: { users: { fetch: jest.fn().mockResolvedValue({ send: sellerSend }) } },
      update: jest.fn().mockResolvedValue()
    };
    await auction.handleBuyListing(interaction);
    expect(auctionHouseService.purchaseListing).toHaveBeenCalledWith(1, '1');
    expect(interaction.client.users.fetch).toHaveBeenCalledWith('2');
    expect(sellerSend).toHaveBeenCalled();
    expect(interaction.update).toHaveBeenCalledWith(expect.objectContaining({ content: expect.stringContaining('You bought') }));
  });

  test('handleBuyListing insufficient funds', async () => {
    auctionHouseService.purchaseListing.mockRejectedValue(new Error('Insufficient funds'));
    const interaction = {
      customId: 'ah-buy-listing:2',
      user: { id: '1' },
      client: { users: { fetch: jest.fn() } },
      update: jest.fn().mockResolvedValue()
    };
    await auction.handleBuyListing(interaction);
    expect(interaction.update).toHaveBeenCalledWith(expect.objectContaining({ content: 'Insufficient funds' }));
  });

  test('handleBuyListing already sold', async () => {
    auctionHouseService.purchaseListing.mockRejectedValue(new Error('Listing already sold'));
    const interaction = {
      customId: 'ah-buy-listing:3',
      user: { id: '1' },
      client: { users: { fetch: jest.fn() } },
      update: jest.fn().mockResolvedValue()
    };
    await auction.handleBuyListing(interaction);
    expect(interaction.update).toHaveBeenCalledWith(expect.objectContaining({ content: 'Listing already sold' }));
  });
});
