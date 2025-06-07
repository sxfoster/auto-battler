import assert from 'assert';
import {
  updatePlayerBalance,
  getBalance,
  sellItem,
  getAvailableListings,
  buyItem,
  placeBid,
  restockMarketplace,
  listGuildItem,
  resetMarketForTesting, // Import the reset function
} from './market.js';

// --- Mock Data Helpers ---
const createMockItem = (id, name = id, category = 'Weapon', rarity = 'Common', price = 10, currencyType = 'Gold', expiry = null) => ({
  id,
  name,
  category,
  rarity,
  price, // For restockMarketplace
  currencyType, // For restockMarketplace
  expiry,
});

// --- Test State Management ---
const beforeEachTest = () => {
  resetMarketForTesting();
};

// --- Test Cases ---

function testUpdateAndGetBalance() {
  beforeEachTest();
  const playerId = 'player1';
  updatePlayerBalance(playerId, 'Gold', 100);
  assert.strictEqual(getBalance(playerId, 'Gold'), 100, 'getBalance should return initial Gold');
  updatePlayerBalance(playerId, 'Gold', -20);
  assert.strictEqual(getBalance(playerId, 'Gold'), 80, 'getBalance should reflect subtraction for Gold');
  updatePlayerBalance(playerId, 'GuildCredit', 50);
  assert.strictEqual(getBalance(playerId, 'GuildCredit'), 50, 'getBalance should return initial GuildCredit');
  assert.strictEqual(getBalance('newPlayer', 'Gold'), 0, 'getBalance should return 0 for new player');
}

function testSellAndGetAvailableListings() {
  beforeEachTest();
  const item1 = createMockItem('sword1', 'Sword', 'Weapon', 'Common');
  const item2 = createMockItem('shield1', 'Shield', 'Armor', 'Uncommon');
  const item3 = createMockItem('potion1', 'Potion', 'Consumable', 'Common');

  sellItem('seller1', item1, 'Town', 10, 'Gold');
  sellItem('seller2', item2, 'Town', 50, 'Gold');
  sellItem('seller1', item3, 'Black', 5, 'GuildCredit');

  const townListings = getAvailableListings('Town');
  assert.strictEqual(townListings.length, 2, 'Should retrieve 2 items from Town market');
  assert.ok(townListings.some(l => l.item.id === 'sword1'), 'Town listings should include sword1');

  const blackMarketListings = getAvailableListings('Black');
  assert.strictEqual(blackMarketListings.length, 1, 'Should retrieve 1 item from Black market');
  assert.strictEqual(blackMarketListings[0].item.id, 'potion1', 'Black market listing incorrect');

  const commonTownListings = getAvailableListings('Town', { rarity: 'Common' });
  assert.strictEqual(commonTownListings.length, 1, 'Should filter Town by Common rarity');
  assert.strictEqual(commonTownListings[0].item.id, 'sword1', 'Common filter incorrect');

  const armorTownListings = getAvailableListings('Town', { category: 'Armor' });
  assert.strictEqual(armorTownListings.length, 1, 'Should filter Town by Armor category');
  assert.strictEqual(armorTownListings[0].item.id, 'shield1', 'Armor filter incorrect');
}

function testBuyItem_Success() {
  beforeEachTest();
  const sellerId = 'seller1';
  const buyerId = 'buyer1';
  const item = createMockItem('axe1', 'Axe');
  sellItem(sellerId, item, 'Town', 20, 'Gold');
  updatePlayerBalance(buyerId, 'Gold', 100);
  updatePlayerBalance(sellerId, 'Gold', 0); // Seller starts with 0 for easier check

  const result = buyItem(buyerId, 'Town', 'axe1');
  assert.strictEqual(result, true, 'buyItem should return true on success');
  assert.strictEqual(getBalance(buyerId, 'Gold'), 80, 'Buyer balance should be debited');
  assert.strictEqual(getBalance(sellerId, 'Gold'), 20, 'Seller balance should be credited');
  assert.strictEqual(getAvailableListings('Town').length, 0, 'Item should be removed from market');
}

function testBuyItem_Failure_InsufficientFunds() {
  beforeEachTest();
  const sellerId = 'seller1';
  const buyerId = 'buyer1';
  const item = createMockItem('axe1');
  sellItem(sellerId, item, 'Town', 100, 'Gold');
  updatePlayerBalance(buyerId, 'Gold', 20); // Not enough funds
  updatePlayerBalance(sellerId, 'Gold', 0);

  const result = buyItem(buyerId, 'Town', 'axe1');
  assert.strictEqual(result, false, 'buyItem should return false for insufficient funds');
  assert.strictEqual(getBalance(buyerId, 'Gold'), 20, 'Buyer balance unchanged on failed buy');
  assert.strictEqual(getBalance(sellerId, 'Gold'), 0, 'Seller balance unchanged on failed buy');
  assert.strictEqual(getAvailableListings('Town').length, 1, 'Item should remain on market on failed buy');
}

function testBuyItem_Failure_ItemNotFound() {
  beforeEachTest();
  const buyerId = 'buyer1';
  updatePlayerBalance(buyerId, 'Gold', 100);
  const result = buyItem(buyerId, 'Town', 'nonexistent_axe');
  assert.strictEqual(result, false, 'buyItem should return false for item not found');
  assert.strictEqual(getBalance(buyerId, 'Gold'), 100, 'Buyer balance unchanged for item not found');
}

function testPlaceBid_Success() {
  beforeEachTest();
  const bidderId = 'bidder1';
  const item = createMockItem('rare_sword');
  sellItem('sellerNPC', item, 'Auction', 100, 'GuildCredit'); // Listing on Auction
  updatePlayerBalance(bidderId, 'GuildCredit', 200);

  const result = placeBid(bidderId, 'rare_sword', 150);
  assert.strictEqual(result, true, 'placeBid should return true on success');
  const auctionListings = getAvailableListings('Auction');
  assert.strictEqual(auctionListings.length, 1, 'Item should still be on auction');
  assert.ok(auctionListings[0].bids, 'Bids array should exist');
  assert.strictEqual(auctionListings[0].bids.length, 1, 'Bid should be added');
  assert.strictEqual(auctionListings[0].bids[0].bidder, bidderId, 'Bidder ID incorrect');
  assert.strictEqual(auctionListings[0].bids[0].amount, 150, 'Bid amount incorrect');
}

function testPlaceBid_Failure_InsufficientFunds() {
  beforeEachTest();
  const bidderId = 'bidder1';
  const item = createMockItem('rare_sword');
  sellItem('sellerNPC', item, 'Auction', 100, 'GuildCredit');
  updatePlayerBalance(bidderId, 'GuildCredit', 50); // Not enough for a 150 bid

  const result = placeBid(bidderId, 'rare_sword', 150);
  assert.strictEqual(result, false, 'placeBid should return false for insufficient funds');
  const auctionListings = getAvailableListings('Auction');
  assert.ok(!auctionListings[0].bids || auctionListings[0].bids.length === 0, 'No bid should be added on failure');
}

function testPlaceBid_Failure_ItemNotFound() {
  beforeEachTest();
  const bidderId = 'bidder1';
  updatePlayerBalance(bidderId, 'GuildCredit', 200);
  const result = placeBid(bidderId, 'nonexistent_item', 150);
  assert.strictEqual(result, false, 'placeBid should return false for item not found');
}

function testRestockMarketplace() {
  beforeEachTest();
  const initialItem = createMockItem('old_item');
  sellItem('sellerOld', initialItem, 'Town', 10, 'Gold'); // Pre-existing item

  const newItem1 = createMockItem('new_sword', 'New Sword', 'Weapon', 'Uncommon', 50, 'Gold');
  const newItem2 = createMockItem('new_shield', 'New Shield', 'Armor', 'Rare', 10, 'GuildCredit');
  const newItems = [newItem1, newItem2];

  restockMarketplace('Town', newItems);
  const townListings = getAvailableListings('Town');
  assert.strictEqual(townListings.length, 2, 'Town market should have 2 new items after restock');
  assert.ok(townListings.some(l => l.item.id === 'new_sword'), 'Restocked items should include new_sword');
  assert.ok(townListings.every(l => l.seller === 'npc'), 'Restocked items should have npc as seller');
  assert.ok(!townListings.some(l => l.item.id === 'old_item'), 'Old items should be cleared on restock');
}

function testListGuildItem() {
  beforeEachTest();
  const playerId = 'guild_member1';
  const item = createMockItem('guild_helm');
  updatePlayerBalance(playerId, 'GuildCredit', 100); // Ensure player has GC if listGuildItem checked balance (it doesn't)

  const listing = listGuildItem(playerId, item, 75);
  assert.strictEqual(listing.marketType, 'Guild', 'Item should be listed in Guild market');
  assert.strictEqual(listing.currencyType, 'GuildCredit', 'Item currency should be GuildCredit');
  assert.strictEqual(listing.price, 75, 'Item price incorrect');
  assert.strictEqual(listing.seller, playerId, 'Seller should be the player');

  const guildListings = getAvailableListings('Guild');
  assert.strictEqual(guildListings.length, 1, 'Guild market should have 1 item');
  assert.strictEqual(guildListings[0].item.id, 'guild_helm', 'Guild item ID incorrect');
}


// --- Test Runner ---
const runTests = () => {
  let passed = 0;
  let failed = 0;
  const testFunctions = [
    testUpdateAndGetBalance,
    testSellAndGetAvailableListings,
    testBuyItem_Success,
    testBuyItem_Failure_InsufficientFunds,
    testBuyItem_Failure_ItemNotFound,
    testPlaceBid_Success,
    testPlaceBid_Failure_InsufficientFunds,
    testPlaceBid_Failure_ItemNotFound,
    testRestockMarketplace,
    testListGuildItem,
  ];

  console.log('--- Running market.test.js ---');
  testFunctions.forEach(testFn => {
    try {
      // Call beforeEachTest before each test function execution
      beforeEachTest();
      testFn();
      console.log(`PASSED: ${testFn.name}`);
      passed++;
    } catch (e) {
      console.error(`FAILED: ${testFn.name}`);
      console.error(e.message);
      failed++;
    }
  });

  console.log(`\n--- market.test.js Results ---`);
  console.log(`Total: ${testFunctions.length}, Passed: ${passed}, Failed: ${failed}`);

  if (failed > 0) {
    if (typeof process !== 'undefined' && process.exit) {
      process.exit(1);
    } else {
      throw new Error(`${failed} market test(s) failed.`);
    }
  }
};

runTests();
