// Central configuration for booster pack definitions

const BOOSTER_PACKS = {
  // Tavern Packs
  hero_pack: {
    name: 'Hero Pack',
    cost: 100,
    currency: 'soft_currency',
    type: 'hero_pack',
    rarity: 'basic',
    category: 'tavern'
  },
  ability_pack: {
    name: 'Ability Pack',
    cost: 100,
    currency: 'soft_currency',
    type: 'ability_pack',
    rarity: 'standard',
    category: 'tavern'
  },
  // Armory Packs
  weapon_pack: {
    name: 'Weapon Pack',
    cost: 100,
    currency: 'soft_currency',
    type: 'weapon_pack',
    rarity: 'premium',
    category: 'armory'
  },
  armor_pack: {
    name: 'Armor Pack',
    cost: 100,
    currency: 'soft_currency',
    type: 'armor_pack',
    rarity: 'basic',
    category: 'armory'
  },
  // Altar Packs
  monster_pack: {
    name: 'Monster Pack',
    cost: 100,
    currency: 'soft_currency',
    type: 'monster_pack',
    rarity: 'basic',
    category: 'altar'
  },
  monster_ability_pack: {
    name: 'Monster Ability Pack',
    cost: 100,
    currency: 'soft_currency',
    type: 'monster_ability_pack',
    rarity: 'standard',
    category: 'altar'
  }
};

module.exports = { BOOSTER_PACKS };

