// Basic in-memory economy and market utilities
// This module manages item listings and player currency.

/** @typedef {import('../models').CurrencyType} CurrencyType */
/** @typedef {import('../models').MarketListing} MarketListing */
/** @typedef {import('../models').MarketItem} MarketItem */

export class MarketSystem {
  constructor() {
    this.listings = {
      Town: [],
      Black: [],
      Guild: [],
      Auction: [],
    };
    this.playerBalances = new Map();
  }

  /**
   * Adjust a player's currency balance.
   * @param {string} playerId
   * @param {CurrencyType} currency
   * @param {number} amount
   */
  updatePlayerBalance(playerId, currency, amount) {
    const bal = this.playerBalances.get(playerId) || { Gold: 0, GuildCredit: 0 };
    bal[currency] = (bal[currency] || 0) + amount;
    this.playerBalances.set(playerId, bal);
  }

  /**
   * Retrieve current balance for a player
   * @param {string} playerId
   * @param {CurrencyType} currency
   * @returns {number}
   */
  getBalance(playerId, currency) {
    const bal = this.playerBalances.get(playerId) || { Gold: 0, GuildCredit: 0 };
    return bal[currency] || 0;
  }

  /**
   * Get available listings for a market
   * @param {'Town'|'Black'|'Guild'|'Auction'} marketType
   * @param {Record<string, any>=} filters
   * @returns {MarketListing[]}
   */
  getAvailableListings(marketType, filters = {}) {
    if (!this.listings[marketType]) {
      return [];
    }
    return this.listings[marketType].filter((l) => {
      if (filters.rarity && l.item.rarity !== filters.rarity) return false;
      if (filters.category && l.item.category !== filters.category) return false;
      // Add more filters as needed
      return true;
    });
  }

  /**
   * List an item for sale in a market
   * @param {string} playerId
   * @param {'Town'|'Black'|'Guild'|'Auction'} marketType
   * @param {MarketItem} item
   * @param {number} price
   * @param {CurrencyType} currencyType
   * @returns {MarketListing | null}
   */
  sellItem(playerId, marketType, item, price, currencyType) {
    if (!this.listings[marketType]) {
      console.error(`Market type ${marketType} does not exist.`);
      return null;
    }
    const listing = {
      item,
      marketType,
      seller: playerId,
      price,
      currencyType,
      expiresAt: item.expiry, // Assuming item has an expiry property
      id: item.id || `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Ensure item has an ID
    };
    this.listings[marketType].push(listing);
    return listing;
  }

  /**
   * Purchase an item from a market
   * @param {string} playerId
   * @param {'Town'|'Black'|'Guild'|'Auction'} marketType
   * @param {string} itemId
   * @returns {boolean} True if purchase was successful, false otherwise.
   */
  buyItem(playerId, marketType, itemId) {
    if (!this.listings[marketType]) {
      return false;
    }
    const market = this.listings[marketType];
    const idx = market.findIndex((l) => l.id === itemId || l.item.id === itemId);
    if (idx === -1) return false;

    const listing = market[idx];
    const balance = this.getBalance(playerId, listing.currencyType);
    if (balance < listing.price) return false;

    this.updatePlayerBalance(playerId, listing.currencyType, -listing.price);
    // Only update seller balance if it's not an NPC or system sale
    if (listing.seller !== 'npc' && listing.seller !== 'system') {
      this.updatePlayerBalance(listing.seller, listing.currencyType, listing.price);
    }

    market.splice(idx, 1);
    return true;
  }

  /**
   * Place a bid on an auction listing
   * @param {string} playerId
   * @param {string} itemId
   * @param {number} amount
   * @returns {boolean} True if bid was successful, false otherwise.
   */
  placeBid(playerId, itemId, amount) {
    const listing = this.listings.Auction.find((l) => l.id === itemId || l.item.id === itemId);
    if (!listing) return false;
    if (!listing.bids) listing.bids = [];

    const balance = this.getBalance(playerId, listing.currencyType);
    if (balance < amount) return false;
    // Basic bid validation: new bid must be higher than current highest bid
    const highestBid = listing.bids.reduce((max, bid) => Math.max(max, bid.amount), 0);
    if (amount <= highestBid) return false;

    listing.bids.push({ bidder: playerId, amount, time: Date.now() });
    return true;
  }

  /**
   * Restock the town or black markets with new items
   * @param {'Town'|'Black'} marketType
   * @param {MarketItem[]} newItems
   */
  restockMarketplace(marketType, newItems = []) {
    if (marketType !== 'Town' && marketType !== 'Black') {
      console.error('Restocking is only available for Town and Black markets.');
      return;
    }
    this.listings[marketType] = newItems.map((item) => ({
      item,
      marketType,
      seller: 'npc', // Or 'system'
      price: item.price,
      currencyType: item.currencyType,
      expiresAt: item.expiry,
      id: item.id || `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    }));
  }

  /**
   * Add a guild only listing
   * @param {string} playerId
   * @param {MarketItem} item
   * @param {number} price
   * @returns {MarketListing | null}
   */
  listGuildItem(playerId, item, price) {
    return this.sellItem(playerId, 'Guild', item, price, 'GuildCredit');
  }
}

// For backwards compatibility, we can export a default instance.
// However, it's recommended to create instances where needed.
// const defaultMarketSystem = new MarketSystem();

// export function updatePlayerBalance(playerId, currency, amount) {
//   return defaultMarketSystem.updatePlayerBalance(playerId, currency, amount);
// }
// export function getBalance(playerId, currency) {
//   return defaultMarketSystem.getBalance(playerId, currency);
// }
// export function getAvailableListings(marketType, filters = {}) {
//   return defaultMarketSystem.getAvailableListings(marketType, filters);
// }
// export function sellItem(playerId, marketType, item, price, currencyType) {
//   return defaultMarketSystem.sellItem(playerId, marketType, item, price, currencyType);
// }
// export function buyItem(playerId, marketType, itemId) {
//   return defaultMarketSystem.buyItem(playerId, marketType, itemId);
// }
// export function placeBid(playerId, itemId, amount) {
//   return defaultMarketSystem.placeBid(playerId, itemId, amount);
// }
// export function restockMarketplace(marketType, newItems = []) {
//   defaultMarketSystem.restockMarketplace(marketType, newItems);
// }
// export function listGuildItem(playerId, item, price) {
//   return defaultMarketSystem.listGuildItem(playerId, item, price);
// }
//This approach of exporting functions that use a default instance is a temporary measure.
//Ideally, other modules should instantiate MarketSystem themselves.
//If this is not feasible due to existing code structure, this provides a bridge.

//If other files are expected to import these functions directly,
//you might need to instantiate MarketSystem and export methods bound to that instance,
//or adjust other files to instantiate MarketSystem.
//For now, I will comment out the direct exports to encourage instantiation.
//The game's entry point or relevant service manager should create an instance of MarketSystem.
//Example:
// gameManager.js
// export const marketSystem = new MarketSystem();
//
// otherFile.js
// import { marketSystem } from './gameManager';
// marketSystem.getBalance(...)
// This is generally a better pattern than a singleton via module exports.
