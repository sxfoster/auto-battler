// Basic in-memory economy and market utilities
// This module manages item listings and player currency.

/** @typedef {import('../models').CurrencyType} CurrencyType */
/** @typedef {import('../models').MarketListing} MarketListing */
/** @typedef {import('../models').MarketItem} MarketItem */

const listings = {
  Town: [],
  Black: [],
  Guild: [],
  Auction: [],
}

const playerBalances = new Map()

/**
 * Adjust a player's currency balance.
 * @param {string} playerId
 * @param {CurrencyType} currency
 * @param {number} amount
 */
export function updatePlayerBalance(playerId, currency, amount) {
  const bal = playerBalances.get(playerId) || { Gold: 0, GuildCredit: 0 }
  bal[currency] = (bal[currency] || 0) + amount
  playerBalances.set(playerId, bal)
}

/**
 * Retrieve current balance for a player
 * @param {string} playerId
 * @param {CurrencyType} currency
 */
export function getBalance(playerId, currency) {
  const bal = playerBalances.get(playerId) || { Gold: 0, GuildCredit: 0 }
  return bal[currency] || 0
}

/**
 * Get available listings for a market
 * @param {'Town'|'Black'|'Guild'|'Auction'} marketType
 * @param {Record<string, any>=} filters
 * @returns {MarketListing[]}
 */
export function getAvailableListings(marketType, filters = {}) {
  return listings[marketType].filter((l) => {
    if (filters.rarity && l.item.rarity !== filters.rarity) return false
    if (filters.category && l.item.category !== filters.category) return false
    return true
  })
}

/**
 * List an item for sale in a market
 * @param {string} playerId
 * @param {MarketItem} item
 * @param {'Town'|'Black'|'Guild'|'Auction'} marketType
 * @param {number} price
 * @param {CurrencyType} currencyType
 */
export function sellItem(playerId, item, marketType, price, currencyType) {
  const listing = {
    item,
    marketType,
    seller: playerId,
    price,
    currencyType,
    expiresAt: item.expiry,
  }
  listings[marketType].push(listing)
  return listing
}

/**
 * Purchase an item from a market
 * @param {string} playerId
 * @param {'Town'|'Black'|'Guild'|'Auction'} marketType
 * @param {string} itemId
 */
export function buyItem(playerId, marketType, itemId) {
  const market = listings[marketType]
  const idx = market.findIndex((l) => l.item.id === itemId)
  if (idx === -1) return false
  const listing = market[idx]
  const balance = getBalance(playerId, listing.currencyType)
  if (balance < listing.price) return false
  updatePlayerBalance(playerId, listing.currencyType, -listing.price)
  updatePlayerBalance(listing.seller, listing.currencyType, listing.price)
  market.splice(idx, 1)
  return true
}

/**
 * Place a bid on an auction listing
 * @param {string} playerId
 * @param {string} itemId
 * @param {number} amount
 */
export function placeBid(playerId, itemId, amount) {
  const listing = listings.Auction.find((l) => l.item.id === itemId)
  if (!listing) return false
  if (!listing.bids) listing.bids = []
  const balance = getBalance(playerId, listing.currencyType)
  if (balance < amount) return false
  listing.bids.push({ bidder: playerId, amount, time: Date.now() })
  return true
}

/** Restock the town or black markets with new items */
export function restockMarketplace(marketType, newItems = []) {
  listings[marketType] = newItems.map((item) => ({
    item,
    marketType,
    seller: 'npc',
    price: item.price,
    currencyType: item.currencyType,
    expiresAt: item.expiry,
  }))
}

/** Add a guild only listing */
export function listGuildItem(playerId, item, price) {
  return sellItem(playerId, item, 'Guild', price, 'GuildCredit')
}
