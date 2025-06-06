// Basic in-memory economy and market utilities
// This module manages item listings and player currency.

/** @typedef {import('../models').CurrencyType} CurrencyType */
/** @typedef {import('../models').MarketListing} MarketListing */
/** @typedef {import('../models').MarketItem} MarketItem */

/**
 * Manages market listings, player currency balances, and transactions.
 * Supports different market types like Town, Black Market, Guild, and Auction.
 */
export class MarketSystem {
  /**
   * Initializes a new MarketSystem instance.
   * Sets up empty listings for each market type and an empty map for player balances.
   */
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
   * Adjusts a player's currency balance for a specified currency type.
   * If the player does not have a balance record, it initializes one.
   *
   * @param {string} playerId - The unique identifier for the player.
   * @param {CurrencyType} currency - The type of currency to update (e.g., "Gold", "GuildCredit").
   * @param {number} amount - The amount to add (positive) or subtract (negative) from the balance.
   */
  updatePlayerBalance(playerId, currency, amount) {
    const bal = this.playerBalances.get(playerId) || { Gold: 0, GuildCredit: 0 };
    bal[currency] = (bal[currency] || 0) + amount;
    this.playerBalances.set(playerId, bal);
  }

  /**
   * Retrieves the current balance of a specific currency for a player.
   *
   * @param {string} playerId - The unique identifier for the player.
   * @param {CurrencyType} currency - The type of currency to retrieve.
   * @returns {number} The player's current balance for the specified currency. Returns 0 if no balance or player not found.
   */
  getBalance(playerId, currency) {
    const bal = this.playerBalances.get(playerId) || { Gold: 0, GuildCredit: 0 };
    return bal[currency] || 0;
  }

  /**
   * Retrieves available listings for a specified market type, with optional filters.
   *
   * @param {'Town'|'Black'|'Guild'|'Auction'} marketType - The type of market to get listings from.
   * @param {Object<string, any>} [filters={}] - Optional filters to apply, e.g., { rarity: 'Common', category: 'Weapon' }.
   * @returns {MarketListing[]} An array of market listings matching the criteria.
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
   * Lists an item for sale in a specified market.
   * Creates a new market listing and adds it to the appropriate market.
   *
   * @param {string} playerId - The ID of the player selling the item.
   * @param {'Town'|'Black'|'Guild'|'Auction'} marketType - The market to list the item in.
   * @param {MarketItem} item - The item to be listed. Should have properties like id, expiry, etc.
   * @param {number} price - The price of the item.
   * @param {CurrencyType} currencyType - The type of currency for the price.
   * @returns {MarketListing | null} The created market listing object, or null if the market type is invalid.
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
   * Allows a player to purchase an item from a specified market.
   * Checks if the market and item exist, if the player has enough balance,
   * then updates player and seller balances and removes the item from the market.
   *
   * @param {string} playerId - The ID of the player purchasing the item.
   * @param {'Town'|'Black'|'Guild'|'Auction'} marketType - The market to buy from.
   * @param {string} itemId - The ID of the item or listing to purchase.
   * @returns {boolean} True if the purchase was successful, false otherwise.
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
   * Places a bid on an item listed in the Auction market.
   * Validates if the listing exists, if the player has enough balance, and if the bid amount is higher than the current highest bid.
   *
   * @param {string} playerId - The ID of the player placing the bid.
   * @param {string} itemId - The ID of the auction listing or item.
   * @param {number} amount - The amount of the bid.
   * @returns {boolean} True if the bid was successfully placed, false otherwise.
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
   * Restocks the Town or Black markets with a new set of items.
   * Clears existing listings for that market type and adds new ones.
   * Items are typically sold by 'npc' or 'system'.
   *
   * @param {'Town'|'Black'} marketType - The market to restock (only 'Town' or 'Black' supported).
   * @param {MarketItem[]} [newItems=[]] - An array of new items to add to the market. Each item should have price, currencyType, expiry, and id.
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
   * Lists an item specifically in the Guild market, using GuildCredit as the currency.
   * This is a convenience method that calls `sellItem` with 'Guild' market type and 'GuildCredit'.
   *
   * @param {string} playerId - The ID of the player listing the item.
   * @param {MarketItem} item - The item to be listed.
   * @param {number} price - The price of the item in GuildCredit.
   * @returns {MarketListing | null} The created market listing object, or null if listing fails.
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
