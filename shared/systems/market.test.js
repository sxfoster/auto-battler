import { MarketSystem } from './market';

describe('MarketSystem', () => {
  let marketSystem;

  beforeEach(() => {
    marketSystem = new MarketSystem();
    // Initialize with some player balances for testing
    marketSystem.playerBalances.set('player1', { Gold: 100, GuildCredit: 10 });
    marketSystem.playerBalances.set('player2', { Gold: 50, GuildCredit: 5 });
  });

  describe('Player Balance', () => {
    it('should update player balance correctly', () => {
      marketSystem.updatePlayerBalance('player1', 'Gold', 50);
      expect(marketSystem.getBalance('player1', 'Gold')).toBe(150);
      marketSystem.updatePlayerBalance('player1', 'Gold', -25);
      expect(marketSystem.getBalance('player1', 'Gold')).toBe(125);
    });

    it('should initialize balance if player does not exist', () => {
      marketSystem.updatePlayerBalance('player3', 'GuildCredit', 20);
      expect(marketSystem.getBalance('player3', 'GuildCredit')).toBe(20);
      expect(marketSystem.getBalance('player3', 'Gold')).toBe(0);
    });

    it('should return 0 for non-existent currency or player', () => {
      expect(marketSystem.getBalance('nonExistentPlayer', 'Gold')).toBe(0);
      // Assuming 'Silver' is not a defined currency type
      expect(marketSystem.getBalance('player1', 'Silver')).toBe(0);
    });
  });

  describe('Listings and Selling', () => {
    const testItem = { id: 'item1', name: 'Test Sword', rarity: 'Common', category: 'Weapon', price: 10, currencyType: 'Gold' };
    const testItem2 = { id: 'item2', name: 'Rare Shield', rarity: 'Rare', category: 'Armor', price: 5, currencyType: 'GuildCredit' };

    it('should add an item to sell in the Town market', () => {
      const listing = marketSystem.sellItem('player1', 'Town', testItem, testItem.price, testItem.currencyType);
      expect(listing).not.toBeNull();
      expect(listing.seller).toBe('player1');
      expect(listing.item.id).toBe('item1');
      expect(listing.price).toBe(10);
      const townListings = marketSystem.getAvailableListings('Town');
      expect(townListings.length).toBe(1);
      expect(townListings[0].item.name).toBe('Test Sword');
    });

    it('should return null for invalid market type on sellItem', () => {
      const listing = marketSystem.sellItem('player1', 'InvalidMarket', testItem, 10, 'Gold');
      expect(listing).toBeNull();
    });

    it('should get available listings with filters', () => {
      marketSystem.sellItem('player1', 'Town', testItem, testItem.price, testItem.currencyType);
      marketSystem.sellItem('player2', 'Town', testItem2, testItem2.price, testItem2.currencyType);

      const commonItems = marketSystem.getAvailableListings('Town', { rarity: 'Common' });
      expect(commonItems.length).toBe(1);
      expect(commonItems[0].item.rarity).toBe('Common');

      const armorItems = marketSystem.getAvailableListings('Town', { category: 'Armor' });
      expect(armorItems.length).toBe(1);
      expect(armorItems[0].item.category).toBe('Armor');

      const allItems = marketSystem.getAvailableListings('Town');
      expect(allItems.length).toBe(2);
    });
  });

  describe('Buying Items', () => {
    const sellerId = 'player2';
    const buyerId = 'player1';
    const itemToSell = { id: 'buyTestItem1', name: 'Potion of Healing', price: 20, currencyType: 'Gold' };

    beforeEach(() => {
      // Ensure buyer has enough funds
      marketSystem.updatePlayerBalance(buyerId, 'Gold', 200); // Set to 200 + initial 100 = 300
      // Seller lists an item
      marketSystem.sellItem(sellerId, 'Town', itemToSell, itemToSell.price, itemToSell.currencyType);
    });

    it('should allow a player to buy an item if they have enough balance', () => {
      const initialSellerBalance = marketSystem.getBalance(sellerId, 'Gold');
      const success = marketSystem.buyItem(buyerId, 'Town', itemToSell.id);
      expect(success).toBe(true);
      expect(marketSystem.getBalance(buyerId, 'Gold')).toBe(300 - itemToSell.price);
      expect(marketSystem.getBalance(sellerId, 'Gold')).toBe(initialSellerBalance + itemToSell.price);
      const townListings = marketSystem.getAvailableListings('Town');
      expect(townListings.find(l => l.item.id === itemToSell.id)).toBeUndefined();
    });

    it('should not allow a player to buy an item if they have insufficient balance', () => {
      marketSystem.updatePlayerBalance(buyerId, 'Gold', -290); // Buyer now has 10 Gold
      const success = marketSystem.buyItem(buyerId, 'Town', itemToSell.id);
      expect(success).toBe(false);
      expect(marketSystem.getBalance(buyerId, 'Gold')).toBe(10); // Unchanged
      const townListings = marketSystem.getAvailableListings('Town');
      expect(townListings.find(l => l.item.id === itemToSell.id)).toBeDefined(); // Still there
    });

    it('should return false if item ID does not exist in buyItem', () => {
      const success = marketSystem.buyItem(buyerId, 'Town', 'nonExistentItemId');
      expect(success).toBe(false);
    });

    it('should return false for invalid market type on buyItem', () => {
      const success = marketSystem.buyItem(buyerId, 'InvalidMarket', itemToSell.id);
      expect(success).toBe(false);
    });
  });

  describe('Auction Bidding', () => {
    const auctionItem = { id: 'auctionItem1', name: 'Legendary Axe', price: 100, currencyType: 'GuildCredit' };
    const bidder1 = 'player1'; // Has 10 GuildCredit initially
    const bidder2 = 'player2'; // Has 5 GuildCredit initially

    beforeEach(() => {
      marketSystem.sellItem('npc', 'Auction', auctionItem, auctionItem.price, auctionItem.currencyType);
      marketSystem.updatePlayerBalance(bidder1, 'GuildCredit', 150); // Total 160
      marketSystem.updatePlayerBalance(bidder2, 'GuildCredit', 100); // Total 105
    });

    it('should allow a player to place a bid if they have enough balance and bid is highest', () => {
      const success = marketSystem.placeBid(bidder1, auctionItem.id, 110);
      expect(success).toBe(true);
      const listing = marketSystem.getAvailableListings('Auction').find(l => l.item.id === auctionItem.id);
      expect(listing.bids.length).toBe(1);
      expect(listing.bids[0].bidder).toBe(bidder1);
      expect(listing.bids[0].amount).toBe(110);
    });

    it('should not allow a bid if amount is less than or equal to current highest bid', () => {
      marketSystem.placeBid(bidder1, auctionItem.id, 110);
      const success = marketSystem.placeBid(bidder2, auctionItem.id, 110);
      expect(success).toBe(false);
      const listing = marketSystem.getAvailableListings('Auction').find(l => l.item.id === auctionItem.id);
      expect(listing.bids.length).toBe(1); // Still 1 bid
    });

    it('should not allow a bid if player has insufficient balance', () => {
      const success = marketSystem.placeBid(bidder2, auctionItem.id, 150); // bidder2 only has 105
      expect(success).toBe(false);
    });

    it('should return false if auction item ID does not exist', () => {
      const success = marketSystem.placeBid(bidder1, 'nonExistentAuctionItem', 100);
      expect(success).toBe(false);
    });
  });

  describe('Market Restocking', () => {
    const itemsToRestock = [
      { id: 'restock1', name: 'Iron Ore', price: 5, currencyType: 'Gold' },
      { id: 'restock2', name: 'Silk', price: 12, currencyType: 'Gold' },
    ];

    it('should restock Town market with new items', () => {
      marketSystem.restockMarketplace('Town', itemsToRestock);
      const townListings = marketSystem.getAvailableListings('Town');
      expect(townListings.length).toBe(2);
      expect(townListings[0].item.name).toBe('Iron Ore');
      expect(townListings[0].seller).toBe('npc');
      expect(townListings[1].item.name).toBe('Silk');
    });

    it('should clear existing items when restocking', () => {
      const initialItem = { id: 'initialItem', name: 'Old Boots', price: 1, currencyType: 'Gold' };
      marketSystem.sellItem('player1', 'Town', initialItem, 1, 'Gold');
      marketSystem.restockMarketplace('Town', itemsToRestock);
      const townListings = marketSystem.getAvailableListings('Town');
      expect(townListings.length).toBe(2); // Not 3
      expect(townListings.find(l => l.item.id === 'initialItem')).toBeUndefined();
    });

    it('should not restock non-Town/Black markets', () => {
      marketSystem.restockMarketplace('Guild', itemsToRestock);
      const guildListings = marketSystem.getAvailableListings('Guild');
      expect(guildListings.length).toBe(0);
    });
  });

  describe('Guild Listings', () => {
    const guildItem = { id: 'guildItem1', name: 'Epic Staff', price: 50 }; // Currency is GuildCredit by default

    it('should list an item in the Guild market with GuildCredit', () => {
      const listing = marketSystem.listGuildItem('player1', guildItem, guildItem.price);
      expect(listing).not.toBeNull();
      expect(listing.marketType).toBe('Guild');
      expect(listing.currencyType).toBe('GuildCredit');
      expect(listing.price).toBe(50);
      const guildListings = marketSystem.getAvailableListings('Guild');
      expect(guildListings.length).toBe(1);
      expect(guildListings[0].item.id).toBe('guildItem1');
    });
  });
});
