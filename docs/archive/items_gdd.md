# Item Design Document (Item GDD)

## 1. Overview
Items are essential in gameplay, providing buffs, healing, and enhanced combat abilities. Items are categorized into four tiers based on their power and rarity.

## 2. Item Tiers
- **Common Items:** Basic, widely available items that provide minor benefits.
- **Uncommon Items:** Offer noticeable stat boosts or effects, harder to find than common.
- **Rare Items:** Powerful items with unique effects, often obtained through challenging encounters.
- **Legendary Items:** The most powerful and rarest items, granting game-changing effects.

## 3. Item List by Rarity

### 3.1. Common Items
* **Core Design:** Simple effects: small heals, basic buffs
* **Notes:** Can be used frequently, easy to stockpile
* **Items:**

| Item Name            | Effect                                    | Energy Cost | Type    |
| :------------------- | :---------------------------------------- | :---------- | :------ |
| Minor Healing Potion | Restore 5 HP.                             | 1           | Healing |
| Throwing Dagger      | Deal 2 piercing damage (bypasses armor).  | 1           | Offense |
| Stamina Herb         | Gain +1 energy this turn.                 | 1           | Utility |

### 3.2. Uncommon Items
* **Core Design:** Moderate buffs or single-target utility
* **Notes:** Introduces disengage, energy boosts, or better healing
* **Items:**

| Item Name       | Effect                                                              | Energy Cost | Type    |
| :-------------- | :------------------------------------------------------------------ | :---------- | :------ |
| Strength Elixir | Gain +2 attack for 2 turns.                                         | 2           | Buff    |
| Smoke Bomb      | Gain +2 evasion and disengage from combat (prevent targeting this turn). | 2 | Defense |
| Healing Salve   | Heal yourself or an ally for 8 HP.                                  | 2           | Healing |

### 3.3. Rare Items
* **Core Design:** AoE tools and big swing effects.
* **Notes:** Combines buffs, debuffs, and healing in one item.
* **Items:**

| Item Name           | Effect                                                      | Energy Cost | Type            |
| :------------------ | :---------------------------------------------------------- | :---------- | :-------------- |
| Fire Flask          | Deal 3 fire damage to all enemies, applies Burn for 1 turn. | 3           | Offense         |
| Battle Tonic        | +3 attack and +2 speed for 1 turn.                          | 3           | Buff            |
| Restoration Crystal | Heal 10 HP and remove all debuffs from yourself.            | 3           | Healing/Utility |

### 3.4. Legendary Items
* **Core Design:** High-impact effects (revival, massive AoE).
* **Notes:** Usually build-defining or clutch-saving tools.
* **Items:**

| Item Name              | Effect                                                        | Energy Cost | Type    |
| :--------------------- | :------------------------------------------------------------ | :---------- | :------ |
| Phoenix Feather        | Upon defeat, revive with 50% HP immediately.                  | 4           | Revival |
| Orb of Obliteration    | Deal 6 magic damage to all enemies, but take 50% of your HP as recoil. | 4 | Offense |
| Elixir of the Ancients | Fully restore energy to max and draw 2 cards.                 | 4           | Utility |

## 4. Item Drop Rarity Table

| Level Range | Common (%) | Uncommon (%) | Rare (%) | Legendary (%) |
| :---------- | :--------- | :----------- | :------- | :------------ |
| Level 1-2   | 70%        | 25%          | 5%       | 0%            |
| Level 3-4   | 60%        | 30%          | 10%      | 0%            |
| Level 5-6   | 50%        | 30%          | 15%      | 5%            |
| Level 7+    | 40%        | 30%          | 20%      | 10%           |

**Loot Logic:**
- Regular enemies drop mostly Common and Uncommon items.
- Elites & Bosses provide access to Rare and Legendary consumables.
- Shops and chests will use this same rarity distribution, scaling as players level up.

## 5. Item Crafting & Alchemy System
*Core Concept:* A crafting system specifically for consumable items, giving players the option to brew or forge stronger items through an alchemy-like system.

### 5.1. Item Shard System (Alchemy Tokens)
When dismantling items, players gain Item Shards (tokens) based on rarity:

| Rarity        | Shards Gained on Dismantle |
| :------------ | :------------------------- |
| Common Item   | 1x Common Item Shard       |
| Uncommon Item | 3x Common Item Shards      |
| Rare Item     | 5x Uncommon Item Shards    |
| Legendary Item| 8x Rare Item Shards        |

### 5.2. Item Crafting Costs

| Item Rarity    | Shards Required to Craft                                    |
| :------------- | :----------------------------------------------------------- |
| Common Item    | 3x Common Item Shards                                       |
| Uncommon Item  | 6x Common Item Shards                                       |
| Rare Item      | 8x Uncommon Item Shards                                     |
| Legendary Item | 12x Rare Item Shards + Special Herb (alchemy catalyst)      |

### 5.3. Special Catalyst System
Legendary items require "Special Catalysts", rare ingredients that can only be found in specific locations:
- Phoenix Feather may require Phoenix Ashes.
- Orb of Obliteration may need a Void Core.
- Elixir of the Ancients could require Elder Root found in ancient ruins.

### 5.4. Conversion Mechanics
Players can upgrade or downgrade shards:
- 3 Common Shards → 1 Uncommon Shard
- 1 Rare Shard → 3 Uncommon Shards

### 5.5. Advanced Feature (Optional)
Add an "Experimental Alchemy" option where players can combine random shards + catalysts to craft a random Rare or Legendary item, adding risk/reward.
