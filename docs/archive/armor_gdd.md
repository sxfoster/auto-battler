# Armor Design Document (Armor GDD)

## 1. Armor Deck Concept
* **Core Design:** Armor cards represent defensive techniques or passive effects based on the type of armor worn (light, medium, heavy, magical). Each armor type provides different defensive mechanics such as damage reduction, evasion boosts, counterattacks, or magic resistance.

## 2. Armor Categories & Abilities

### 2.1. Light Armor (Agility & Evasion Focus)
* **Theme:** Focused on evasion and mobility.
* **Abilities:**

| Rarity    | Ability         | Effect                                   | Energy Cost | Armor Type  |
| :-------- | :-------------- | :--------------------------------------- | :---------- | :---------- |
| Common    | Leather Padding | Reduce damage by 1 this turn.            | 1           | Light Armor |
| Uncommon  | Agile Reflexes  | Gain +2 evasion for 2 turns.             | 2           | Light Armor |
| Rare      | Shadow Garb     | Gain +2 evasion and +1 speed for 2 turns.| 3           | Light Armor |
| Legendary | Phantom Cloak   | Become untargetable until your next turn.| 4           | Light Armor |

### 2.2. Medium Armor (Balanced Defense + Utility)
* **Theme:** Balanced between damage reduction and utility.
* **Abilities:**

| Rarity    | Ability          | Effect                                       | Energy Cost | Armor Type   |
| :-------- | :--------------- | :------------------------------------------- | :---------- | :----------- |
| Common    | Studded Vest     | Reduce damage by 1 and gain +1 evasion.      | 1           | Medium Armor |
| Uncommon  | Chainmail Guard  | Reduce damage by 2 this turn.                | 2           | Medium Armor |
| Rare      | Vanguard Mail    | Reduce damage by 2 and reflect 1 damage when hit.| 3           | Medium Armor |
| Legendary | Captain’s Bulwark| Reduce damage by 2 for 2 turns and ally gains +1 defense.| 4           | Medium Armor |

### 2.3. Heavy Armor (Tank + Damage Soak)
* **Theme:** Pure damage soak with trade-offs like speed reduction.
* **Abilities:**

| Rarity    | Ability               | Effect                                       | Energy Cost | Armor Type   |
| :-------- | :-------------------- | :------------------------------------------- | :---------- | :----------- |
| Common    | Iron Plate            | Reduce damage by 2 this turn.                | 1           | Heavy Armor  |
| Uncommon  | Reinforced Plating    | Reduce damage by 3, but lose 1 speed next turn.| 2           | Heavy Armor  |
| Rare      | Juggernaut Armor      | Reduce damage by 3 and gain immunity to Stun for 1 turn.| 3           | Heavy Armor  |
| Legendary | Aegis of the Colossus | Reduce all incoming damage to 0 for this turn.| 4           | Heavy Armor  |

### 2.4. Magic Armor (Magical Defense + Utility)
* **Theme:** Specializes in magic resistance and defensive buffs.
* **Abilities:**

| Rarity    | Ability          | Effect                                       | Energy Cost | Armor Type   |
| :-------- | :--------------- | :------------------------------------------- | :---------- | :----------- |
| Common    | Mystic Robes     | Reduce magic damage by 2 this turn.          | 1           | Magic Armor  |
| Uncommon  | Arcane Shielding | Block the next magic attack.                 | 2           | Magic Armor  |
| Rare      | Runed Cloak      | Reduce magic damage by 3 and gain +1 speed next turn.| 3           | Magic Armor  |
| Legendary | Ward of Eternity | Immune to all magic damage for 2 turns.      | 4           | Magic Armor  |

## 3. Armor Type & Class Synergy Map

### 3.1. Light Armor Synergy
* **Best suited for:** Rogue, Ranger, Bard, Enchanter
* **Why?** Light Armor enhances evasion-based and speed-dependent classes. Classes like Rogue and Ranger benefit from being harder to hit while setting up ambushes or hit-and-run tactics. Bard benefits by staying mobile and using tempo control. Enchanter pairs it with illusionary tactics (evasion + confuse loops).

### 3.2. Medium Armor Synergy
* **Best suited for:** Druid, Cleric, Ranger, Bard
* **Why?** Medium Armor suits hybrid roles like Druid and Cleric, who need some survivability without sacrificing speed. It also benefits Ranger when switching from aggressive to defensive tactics (e.g., against AoE-heavy enemies). Bard can switch to Medium Armor when focusing on more defensive support builds.

### 3.3. Heavy Armor Synergy
* **Best suited for:** Warrior, Paladin, Barbarian
* **Why?** Heavy Armor synergizes with frontline tanks and bruisers who aim to soak damage and control enemy focus. Paladins lean into damage mitigation and buffs. Warriors and Barbarians combine stuns, self-heals, or berserker effects with armor that lets them stay in the fight longer.

### 3.4. Magic Armor Synergy
* **Best suited for:** Wizard, Sorcerer, Enchanter
* **Why?** Magic Armor is essential for spellcasters who need protection from enemy magic damage while casting from range. Wizards and Sorcerers can focus fully on offense when shielded against hostile casters. Enchanters can complement their control tools with Arcane Shielding for survival.

### 3.5. Bonus Concept: Hybrid Builds
* Some classes (e.g., Druid, Bard, Ranger) can switch between Light and Medium armor based on deck build. Players can customize armor choice to suit aggressive, defensive, or hybrid strategies.

## 4. Armor Drop Rarity Table

| Level Range | Common (%) | Uncommon (%) | Rare (%) | Legendary (%) |
| :---------- | :--------- | :----------- | :------- | :------------ |
| Level 1-2 | 70% | 25% | 5% | 0% |
| Level 3-4 | 60% | 30% | 10% | 0% |
| Level 5-6 | 50% | 30% | 15% | 5% |
| Level 7+ | 40% | 30% | 20% | 10% |

* **Example: Armor Drop Logic**
    * Basic Encounters drop Common/Uncommon armor.
    * Elite/Boss Battles have a higher chance to drop Rare/Legendary armor.
    * Treasure Chests and Shops follow the same rarity rules, with Legendary pieces being rare and expensive.

## 5. Armor Power Curve by Rarity

| Rarity | Effect Strength | Duration or Bonus |
| :-------- | :-------------------------------------------- | :-------------------------------------- |
| Common | Reduce damage by 1-2, or basic evasion | 1 turn or flat effect |
| Uncommon | Reduce damage by 2-3, or add evasion/speed | 1-2 turns or conditional buffs |
| Rare | Reduce damage by 3, with additional effects (e.g., reflect, immunity to stun)| 2 turns or stronger reactive effects |
| Legendary | Unique effects (e.g., damage immunity, team buffs, or multi-turn shields)| 2+ turns, often game-changing abilities |

## 6. Armor Crafting & Upgrade System
* **Core Concept:** An armor forge system that mirrors the ability crafting system but with armor-specific twists.

### 6.1. Armor Salvage Tokens
When players dismantle or salvage armor, they receive Armor Tokens based on rarity:

| Rarity | Salvage Yield |
| :-------------- | :------------------- |
| Common Armor | 1x Common Armor Token|
| Uncommon Armor | 3x Common Armor Tokens|
| Rare Armor | 5x Uncommon Armor Tokens|
| Legendary Armor | 8x Rare Armor Tokens |

### 6.2. Crafting Costs

| Armor Rarity | Tokens Required to Craft |
| :-------------- | :------------------------- |
| Common Armor | 3x Common Tokens |
| Uncommon Armor | 6x Common Tokens |
| Rare Armor | 8x Uncommon Tokens |
| Legendary Armor | 12x Rare Tokens + optional Boss Material |

### 6.3. Bonus Materials System
For Legendary Armor, players may also require:
* “Boss Materials” (e.g., Titan Ore, Spectral Silk, etc.)
* Earned from elite boss encounters.
* Needed to craft highly thematic Legendary armor pieces.

### 6.4. Token Conversion System
Players can also:
* Convert Up: 3 Common Tokens → 1 Uncommon Token
* Convert Down: 1 Rare Token → 3 Uncommon Tokens

### 6.5. Optional Upgrade Path
Instead of just crafting fresh armor, players can also:
* Upgrade existing armor (e.g., upgrading a Common armor to Uncommon keeps its base identity but adds an extra bonus).
* **Example:** Upgrade Leather Padding (reduce damage by 1) into Reinforced Leather (reduce damage by 1 + gain +1 evasion).

## 7. Legendary Armor Examples

### 7.1. Aegis of the Colossus (Heavy Armor)
* **Effect:** Reduce all incoming damage to 0 for this turn. Gain +1 defense permanently after activation (stacks up to 3 times).
* **Crafting Cost:** 12 Rare Armor Tokens + Titan Ore (Boss Material)
* **Flavor:** Forged from the bones of an ancient titan, it shifts the balance of any battle.

### 7.2. Cloak of the Voidwalker (Light Armor)
* **Effect:** Become untargetable for 2 turns and gain +2 evasion after emerging. When untargetable, deal 1 automatic damage to the attacker’s next action.
* **Crafting Cost:** 12 Rare Armor Tokens + Void Essence (Boss Material)
* **Flavor:** Used by assassins from the shadow realm to phase between planes.

### 7.3. Ward of Eternity (Magic Armor)
* **Effect:** Immune to all magic damage for 2 turns. Also reflects 2 magic damage back to the caster.
* **Crafting Cost:** 12 Rare Armor Tokens + Spectral Silk (Boss Material)
* **Flavor:** A relic from the First Mages’ Circle, shimmering with eternal enchantments.

### 7.4. Shield of the Iron Legion (Medium Armor)
* **Effect:** Reduce damage by 3 for 2 turns, and your nearest ally also gains +1 defense. Grants Stun immunity while active.
* **Crafting Cost:** 12 Rare Armor Tokens + Legion Crest (Boss Material)
* **Flavor:** Passed down through generations of battle-hardened legionnaires.

