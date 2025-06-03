# 🧭 Survival Dungeon CCG Auto-Battler — Game Design Document

## 🎯 Game Concept
A tactical survival dungeon crawler blended with collectible card game (CCG) mechanics and auto-battler combat.  
Players guide a party of 1–5 adventurers through procedurally generated dungeon biomes, surviving by managing hunger, thirst, fatigue, and tactical resources—all as upgradeable and tradable cards.

---

## ⚔️ Combat System

### Core Loop
- Auto-battle executes turns based on player-assigned ability cards.
- Characters have up to 4 ability cards from role and class pools.
- Tactical depth comes from synergy, card sequencing, and party composition.

### AI & Turn Flow
- Each character acts automatically; player controls card assignment, not moves.
- `SpeedModifier` controls action order each round.
- After every battle, party members gain Fatigue, Hunger, and Thirst.

---

## 📦 Card Categories

- **Ability Cards** – Used in auto-battle (Attack, Buff, Heal, Debuff, Utility)
- **Equipment Cards** – Weapons/Armor with passive effects
- **Ingredient Cards** – Raw materials for crafting
- **Food & Drink Cards** – Restore Hunger/Thirst, grant buffs
- **Elixir Cards** – Passive temporary dungeon buffs
- **Utility Cards** – Tools (Repair Kits, Traps, Campfires)

### Role & Class Restrictions
- Cards suffer **-75% penalty** when used outside their intended role.
- Class-restricted cards gain enhanced effects and combo synergies.

---

## 🧪 Crafting System

### Professions
- **Cooking** – Creates food/drink cards
- **Smithing** – Creates/upgrades equipment cards
- **Alchemy** – Produces elixirs and utility items

### Magical Pouch Crafting
- Drag up to 5 cards into the pouch, no equipment/tools needed.
- Output is determined by ingredient synergy.
- Some recipes are discoverable only via experimentation.

### Profession Progression (Lv. 1–10)
- Unlocks: success rate boosts, preview hints, exclusive recipes.
- "Crafted By" tag added to finished cards for fame/trade value.

---

## 💰 Economy

### Currency
- **Gold** – For basic goods and marketplace
- **Guild Credits** – Earned from raids and commissions

### Markets
1. **Town Marketplace** – Basic starter items
2. **Black Market** – Rare, cursed, or risky cards
3. **Guild Exchange** – Limited intra-guild trade
4. **Auction House** – Global player-driven card trading
   - Only Common cards tradable for Gold
   - Most card value flows through player-to-player economy

---

## 🛡️ Classes & Roles

### Roles
- **Tank** – Soaks damage, protects allies
- **Healer** – Restores HP, removes debuffs
- **Support** – Buffs allies, controls tempo
- **DPS** – High damage (physical/magical)

### Class Examples
- **Guardian** (Tank) – Shield, Taunt
- **Cleric** (Healer) – Group heal, purify
- **Bard** (Support) – Buff, song-based utility
- **Blademaster** (DPS) – Melee crit chain
- **Wizard** (DPS) – Spell combos, burst damage
- **Warrior** (Tank) – Fortify, war shouts

---

## 🎲 Combat Card Examples

| Role      | Card Name      | Effect                          |
|-----------|----------------|---------------------------------|
| Tank      | Shield Bash    | 1–3 dmg + 25% stun              |
| Healer    | Mending Touch  | Heal 2–4 HP                     |
| Support   | Rally Cry      | +1 damage to all allies         |
| DPS       | Quick Slash    | 2–4 damage, melee               |
| Wizard    | Arcane Spark   | 2–4 magic damage                |
| Warrior   | Fortify        | +1 Armor for 2 turns            |
| Bard      | Mood Maker     | Random +1 ATK/DEF/Energy Regen  |

---

## 🧟 Enemy Design: Fungal Depths Example

| Enemy             | Type        | Sample Abilities                    |
|-------------------|-------------|-------------------------------------|
| Rotgrub Swarm     | Creature    | Bite Swarm, Burrow Latch (DoT)      |
| Spore Witch       | Demi-human  | Spore Veil (miss debuff), Heal Fungus |
| Myconid Brute     | Creature    | Fungal Slam (knockback), Thick Hide |
| Mushroom Shaman   | Demi-human  | Mind Spore, Hallucinate             |

---

## 🗺️ Encounter Flow

1. **Preparation** – Assign cards, equip gear
2. **Enter Dungeon** – Procedural floor generation
3. **Combat** – Turn-based, auto-resolved by speed and AI logic
4. **Post-Battle** – Gain fatigue/hunger/thirst, loot, XP
5. **Rest** – Use Food/Drink to recover, apply buffs
6. **Repeat or Exit**

---

## 📂 Core Data Objects (for AI/codegen)

### CardData

| Field             | Type      | Description                                  |
|-------------------|-----------|----------------------------------------------|
| card_name         | String    | Display name                                 |
| description       | String    | Card effect summary                          |
| card_type         | Enum      | Ability, Equipment, Ingredient, FoodDrink, Elixir, Utility |
| role_restriction  | String    | Intended role (Tank, DPS, etc.)              |
| class_restriction | String    | Intended class (Warrior, Bard, etc.)         |
| effect_description| String    | Human-readable effect                        |
| rarity            | Enum      | Common, Uncommon, Rare, Legendary            |
| icon_path         | String    | Asset path for art                           |
| synergy_tags      | Array     | Combo/interaction keywords                   |
| energy_cost       | int       | Points to use card                           |
| is_combo_starter  | bool      | Starts a combo                               |
| is_combo_finisher | bool      | Finishes a combo                             |

### EnemyData

| Field            | Type      | Description                                   |
|------------------|-----------|-----------------------------------------------|
| enemy_name       | String    | Display name                                  |
| description      | String    | Flavour text                                  |
| enemy_type       | Enum      | Creature, DemiHuman, Undead, Boss             |
| abilities        | Array     | Cards or ability names the enemy can use      |
| base_hp          | int       | Starting health                               |
| base_attack      | int       | Base damage value                             |
| speed_modifier   | int       | Turn order modifier                           |
| loot_table       | Array     | Possible drops                                |
| encounter_weight | int       | Spawn weighting for random encounters         |
| icon_path        | String    | Optional sprite path                          |
| passive_traits   | Array     | Always-on traits or resistances               |

### CharacterData

| Field            | Type      | Description                                   |
|------------------|-----------|-----------------------------------------------|
| character_name   | String    | Party member name                             |
| role             | Enum      | Tank, Healer, Support, DPS                    |
| class_name       | String    | Specific class (Guardian, Wizard, etc.)       |
| base_hp          | int       | Starting health                               |
| base_attack      | int       | Base attack value                             |
| speed_modifier   | int       | Turn order modifier                           |
| assigned_cards   | Array     | Ability cards equipped (max 4)                |
| equipped_gear    | Array     | Equipment cards                               |
| profession       | String    | Crafting profession                           |
| hunger           | int       | Survival meter                                |
| thirst           | int       | Survival meter                                |
| fatigue          | int       | Survival meter                                |
| inventory        | Array     | Additional carried cards                      |
| icon_path        | String    | Optional portrait path                        |

### ProfessionData

Basic data describing a crafting profession and progress.

| Field           | Type      | Description                            |
|-----------------|-----------|----------------------------------------|
| profession_name | String    | Name of the profession                 |
| description     | String    | Short description                      |
| max_level       | int       | Maximum attainable level               |
| current_level   | int       | Current level                          |
| known_recipes   | Array     | Unlocked `RecipeData` references       |
| crafting_bonus  | float     | Percent success/quality bonus          |
| exclusive_cards | Array     | Special cards only this profession can craft |
| crafted_by_tag  | String    | Tag added to crafted cards             |

### RecipeData

Represents a crafting recipe for the Magical Pouch system.

| Field               | Type      | Description                          |
|---------------------|-----------|--------------------------------------|
| recipe_name         | String    | Name shown to the player             |
| input_cards         | Array     | Required cards or identifiers        |
| output_card         | CardData  | Resulting crafted card               |
| profession_required | String    | Profession that can craft it         |
| level_required      | int       | Minimum profession level             |
| synergy_tags        | Array     | Tags that trigger special effects    |
| discovered          | bool      | Whether the recipe is already known  |
