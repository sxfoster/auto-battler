import type { Encounter, LootItem, Player, Inventory } from '../../shared/models'
import { generateLoot, generateCurrencyReward, awardCurrency, distributeLoot } from '../../shared/systems/postBattle.js'

export interface BattleRewards {
  loot: LootItem[]
  currency: { Gold: number; GuildCredit: number }
}

/** Generate rewards for a completed encounter. */
export function generateRewards(encounter: Encounter): BattleRewards {
  return {
    loot: generateLoot(encounter),
    currency: generateCurrencyReward(encounter),
  }
}

/** Apply rewards to the player's inventory and balances. */
export function applyRewards(player: Player, inventory: Inventory, rewards: BattleRewards) {
  awardCurrency(player, rewards.currency)
  distributeLoot(rewards.loot, inventory)
}
