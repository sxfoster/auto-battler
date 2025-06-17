// This file contains all the raw data for game entities.
// In a real application, this would likely be fetched from a server API.

export const allPossibleHeroes = [
    // 1. Stalwart Defender
    { type: 'hero', id: 101, name: 'Recruit', class: 'Stalwart Defender', rarity: 'Common', art: '../img/recruit_card.png', hp: 22, attack: 4, speed: 5, abilities: [] },
    { type: 'hero', id: 102, name: 'Soldier', class: 'Stalwart Defender', rarity: 'Uncommon', art: '../img/soldier_card.png', hp: 30, attack: 6, speed: 5, abilities: [] },
    { type: 'hero', id: 103, name: 'Vanguard', class: 'Stalwart Defender', rarity: 'Rare', art: '../img/vanguard_card.png', hp: 42, attack: 8, speed: 5, abilities: [] },
    { type: 'hero', id: 104, name: 'Warbringer', class: 'Stalwart Defender', rarity: 'Epic', art: '../img/warbringer_card.png', hp: 55, attack: 11, speed: 5, abilities: [] },

    // 2. Holy Warrior
    { type: 'hero', id: 201, name: 'Squire', class: 'Holy Warrior', rarity: 'Common', art: '../img/squire_card.png', hp: 20, attack: 5, speed: 5, abilities: [] },
    { type: 'hero', id: 202, name: 'Crusader', class: 'Holy Warrior', rarity: 'Uncommon', art: '../img/crusader_card.png', hp: 28, attack: 7, speed: 5, abilities: [] },
    { type: 'hero', id: 203, name: 'Paladin', class: 'Holy Warrior', rarity: 'Rare', art: '../img/paladin_card.png', hp: 38, attack: 9, speed: 5, abilities: [] },
    { type: 'hero', id: 204, name: 'Divine Aegis', class: 'Holy Warrior', rarity: 'Epic', art: '../img/divine_aegis_card.png', hp: 50, attack: 12, speed: 5, abilities: [] },

    // 3. Raging Fighter
    { type: 'hero', id: 301, name: 'Brawler', class: 'Raging Fighter', rarity: 'Common', art: '../img/brawler_card.png', hp: 18, attack: 7, speed: 6, abilities: [] },
    { type: 'hero', id: 302, name: 'Marauder', class: 'Raging Fighter', rarity: 'Uncommon', art: '../img/marauder_card.png', hp: 25, attack: 10, speed: 6, abilities: [] },
    { type: 'hero', id: 303, name: 'Berserker', class: 'Raging Fighter', rarity: 'Rare', art: '../img/berserker_card.png', hp: 33, attack: 14, speed: 6, abilities: [] },
    { type: 'hero', id: 304, name: 'Juggernaut', class: 'Raging Fighter', rarity: 'Epic', art: '../img/juggernaut_card.png', hp: 42, attack: 18, speed: 6, abilities: [] },

    // 4. Raw Power Mage
    { type: 'hero', id: 401, name: 'Adept', class: 'Raw Power Mage', rarity: 'Common', art: '../img/adept_card.png', hp: 12, attack: 2, speed: 4, abilities: [] },
    { type: 'hero', id: 402, name: 'Sorcerer', class: 'Raw Power Mage', rarity: 'Uncommon', art: '../img/sorcerer_card.png', hp: 16, attack: 3, speed: 4, abilities: [] },
    { type: 'hero', id: 403, name: 'Elementalist', class: 'Raw Power Mage', rarity: 'Rare', art: '../img/elementalist_card.png', hp: 21, attack: 4, speed: 4, abilities: [] },
    { type: 'hero', id: 404, name: 'Chaos Conduit', class: 'Raw Power Mage', rarity: 'Epic', art: '../img/chaos_conduit_card.png', hp: 27, attack: 5, speed: 4, abilities: [] },

    // 5. Divine Healer
    { type: 'hero', id: 501, name: 'Acolyte', class: 'Divine Healer', rarity: 'Common', art: '../img/acolyte_card.png', hp: 15, attack: 3, speed: 5, abilities: [] },
    { type: 'hero', id: 502, name: 'Priest', class: 'Divine Healer', rarity: 'Uncommon', art: '../img/priest_card.png', hp: 20, attack: 4, speed: 5, abilities: [] },
    { type: 'hero', id: 503, name: 'High Priest', class: 'Divine Healer', rarity: 'Rare', art: '../img/high_priest_card.png', hp: 26, attack: 5, speed: 5, abilities: [] },
    { type: 'hero', id: 504, name: 'Hierophant', class: 'Divine Healer', rarity: 'Epic', art: '../img/hierophant_card.png', hp: 33, attack: 6, speed: 5, abilities: [] },

    // 6. Nature Shaper
    { type: 'hero', id: 601, name: 'Naturalist', class: 'Nature Shaper', rarity: 'Common', art: '../img/naturalist_card.png', hp: 17, attack: 4, speed: 5, abilities: [] },
    { type: 'hero', id: 602, name: 'Shapeshifter', class: 'Nature Shaper', rarity: 'Uncommon', art: '../img/shapeshifter_card.png', hp: 24, attack: 6, speed: 5, abilities: [] },
    { type: 'hero', id: 603, name: 'Archdruid', class: 'Nature Shaper', rarity: 'Rare', art: '../img/archdruid_card.png', hp: 32, attack: 8, speed: 5, abilities: [] },
    { type: 'hero', id: 604, name: 'Avatar of the Wild', class: 'Nature Shaper', rarity: 'Epic', art: '../img/avatar_of_the_wild_card.png', hp: 40, attack: 10, speed: 5, abilities: [] },

    // 7. Inspiring Artist
    { type: 'hero', id: 701, name: 'Minstrel', class: 'Inspiring Artist', rarity: 'Common', art: '../img/minstrel_card.png', hp: 14, attack: 2, speed: 6, abilities: [] },
    { type: 'hero', id: 702, name: 'Skald', class: 'Inspiring Artist', rarity: 'Uncommon', art: '../img/skald_card.png', hp: 19, attack: 3, speed: 6, abilities: [] },
    { type: 'hero', id: 703, name: 'Maestro', class: 'Inspiring Artist', rarity: 'Rare', art: '../img/maestro_card.png', hp: 25, attack: 4, speed: 6, abilities: [] },
    { type: 'hero', id: 704, name: 'Muse Incarnate', class: 'Inspiring Artist', rarity: 'Epic', art: '../img/muse_card.png', hp: 32, attack: 5, speed: 6, abilities: [] },

    // 8. Wilderness Expert
    { type: 'hero', id: 801, name: 'Tracker', class: 'Wilderness Expert', rarity: 'Common', art: '../img/tracker_card.png', hp: 13, attack: 6, speed: 7, abilities: [] },
    { type: 'hero', id: 802, name: 'Beast Tamer', class: 'Wilderness Expert', rarity: 'Uncommon', art: '../img/beast_tamer_card.png', hp: 18, attack: 9, speed: 7, abilities: [] },
    { type: 'hero', id: 803, name: 'Beast Master', class: 'Wilderness Expert', rarity: 'Rare', art: '../img/beast_master_card.png', hp: 24, attack: 12, speed: 7, abilities: [] },
    { type: 'hero', id: 804, name: 'Wild Lord', class: 'Wilderness Expert', rarity: 'Epic', art: '../img/wild_lord_card.png', hp: 30, attack: 15, speed: 7, abilities: [] },
];

export const allPossibleWeapons = [
    // 1. Sword Family
    { id: 1101, type: 'weapon', name: 'Worn Sword', rarity: 'Common', art: '../img/weapons/worn_sword_card.png', statBonuses: { ATK: 3 }, ability: null },
    { id: 1102, type: 'weapon', name: 'Iron Sword', rarity: 'Uncommon', art: '../img/weapons/iron_sword_card.png', statBonuses: { ATK: 5 }, ability: { name: 'Cleave', description: 'Your auto-attacks deal 1 damage to an enemy adjacent to the target.' } },
    { id: 1103, type: 'weapon', name: 'Steel Longsword', rarity: 'Rare', art: '../img/weapons/steel_longsword_card.png', statBonuses: { ATK: 7, HP: 3 }, ability: { name: 'Improved Cleave', description: 'Your auto-attacks deal 2 damage to an enemy adjacent to the target.' } },
    { id: 1104, type: 'weapon', name: 'Dragonfang Blade', rarity: 'Epic', art: '../img/weapons/dragonfang_blade_card.png', statBonuses: { ATK: 10, SPD: 5 }, ability: { name: 'Blade Dance', description: 'When this hero kills an enemy, immediately perform an extra auto-attack.' } },

    // 2. Axe Family
    { id: 1201, type: 'weapon', name: 'Rusty Axe', rarity: 'Common', art: '../img/weapons/rusty_axe_card.png', statBonuses: { ATK: 4 }, ability: null },
    { id: 1202, type: 'weapon', name: 'Battle Axe', rarity: 'Uncommon', art: '../img/weapons/battle_axe_card.png', statBonuses: { ATK: 7, SPD: -2 }, ability: { name: 'Overwhelm', description: 'Your auto-attacks ignore 1 point of Block.' } },
    { id: 1203, type: 'weapon', name: 'Great Axe', rarity: 'Rare', art: '../img/weapons/great_axe_card.png', statBonuses: { ATK: 10, SPD: -3 }, ability: { name: 'Executioner', description: 'Your auto-attacks deal +2 damage to enemies below 50% HP.' } },
    { id: 1204, type: 'weapon', name: 'Stormreaver', rarity: 'Epic', art: '../img/weapons/stormreaver_card.png', statBonuses: { ATK: 15, SPD: -4 }, ability: { name: 'Reckless Smash', description: 'Your first auto-attack each combat deals double damage, but you take 5 damage.' } },

    // 3. Dagger Family
    { id: 1301, type: 'weapon', name: 'Rusty Knife', rarity: 'Common', art: '../img/weapons/rusty_knife_card.png', statBonuses: { ATK: 1, SPD: 2 }, ability: null },
    { id: 1302, type: 'weapon', name: 'Bandit Dirk', rarity: 'Uncommon', art: '../img/weapons/bandit_dirk_card.png', statBonuses: { ATK: 2, SPD: 4 }, ability: { name: 'Poison Tip', description: '25% chance on hit to apply Poison 1 for 2 turns.' } },
    { id: 1303, type: 'weapon', name: "Assassin's Stiletto", rarity: 'Rare', art: '../img/weapons/assassins_stiletto_card.png', statBonuses: { ATK: 4, SPD: 6 }, ability: { name: 'Improved Poison Tip', description: '50% chance on hit to apply Poison 2 for 2 turns.' } },
    { id: 1304, type: 'weapon', name: 'Venombite Fang', rarity: 'Epic', art: '../img/weapons/venombite_fang_card.png', statBonuses: { ATK: 6, SPD: 8 }, ability: { name: 'Shadowfang', description: 'Your auto-attacks deal +3 damage to enemies suffering from Poison or Bleed.' } },

    // 4. Mace Family
    { id: 1401, type: 'weapon', name: 'Crude Club', rarity: 'Common', art: '../img/weapons/crude_club_card.png', statBonuses: { ATK: 2, HP: 2 }, ability: null },
    { id: 1402, type: 'weapon', name: 'Iron Morningstar', rarity: 'Uncommon', art: '../img/weapons/iron_morningstar_card.png', statBonuses: { ATK: 4, HP: 3 }, ability: { name: 'Dazing Blow', description: '20% chance on hit to reduce enemy SPD by half for their next turn.' } },
    { id: 1403, type: 'weapon', name: 'Sunforge Maul', rarity: 'Rare', art: '../img/weapons/sunforge_maul_card.png', statBonuses: { ATK: 6, HP: 5 }, ability: { name: 'Armor Shatter', description: "Your auto-attacks permanently reduce the target's Block by 1." } },
    { id: 1404, type: 'weapon', name: 'Relic of Judgement', rarity: 'Epic', art: '../img/weapons/relic_of_judgement_card.png', statBonuses: { ATK: 9, HP: 7 }, ability: { name: 'Earthquake Slam', description: 'Your first auto-attack each combat has a 50% chance to Stun the target.' } },

    // 5. Spear Family
    { id: 1501, type: 'weapon', name: 'Broken Spear', rarity: 'Common', art: '../img/weapons/broken_spear_card.png', statBonuses: { ATK: 2, SPD: 1 }, ability: null },
    { id: 1502, type: 'weapon', name: "Soldier's Pike", rarity: 'Uncommon', art: '../img/weapons/soldiers_pike_card.png', statBonuses: { ATK: 4, SPD: 2 }, ability: { name: 'Disrupting Thrust', description: 'On hit, the target has their SPD reduced by 1 for their next turn.' } },
    { id: 1503, type: 'weapon', name: 'Celestial Glaive', rarity: 'Rare', art: '../img/weapons/celestial_glaive_card.png', statBonuses: { ATK: 6, SPD: 3 }, ability: { name: 'First Strike', description: 'If this hero has higher SPD than their target, their first auto-attack deals +3 damage.' } },
    { id: 1504, type: 'weapon', name: 'Wyrmspire Lance', rarity: 'Epic', art: '../img/weapons/wyrmspire_lance_card.png', statBonuses: { ATK: 8, SPD: 4 }, ability: { name: 'Set for Charge', description: 'At the start of combat, the first enemy that attacks this hero is Stunned.' } },

    // 6. Bow Family
    { id: 1601, type: 'weapon', name: 'Bent Shortbow', rarity: 'Common', art: '../img/weapons/bent_shortbow_card.png', statBonuses: { ATK: 3 }, ability: null },
    { id: 1602, type: 'weapon', name: 'Oak Longbow', rarity: 'Uncommon', art: '../img/weapons/oak_longbow_card.png', statBonuses: { ATK: 5 }, ability: { name: 'Hawk Eye', description: 'This hero gains +10% accuracy.' } },
    { id: 1603, type: 'weapon', name: 'Elven Warbow', rarity: 'Rare', art: '../img/weapons/elven_warbow_card.png', statBonuses: { ATK: 7, SPD: 3 }, ability: { name: 'Crippling Arrow', description: 'On hit, if the target is the last enemy in their row, their ATK is reduced by 2 for their next turn.' } },
    { id: 1604, type: 'weapon', name: 'Heartwood Stormbow', rarity: 'Epic', art: '../img/weapons/heartwood_stormbow_card.png', statBonuses: { ATK: 10, SPD: 5 }, ability: { name: 'True Shot', description: "This hero's auto-attacks cannot be Evaded." } },

    // 7. Staff Family
    { id: 1701, type: 'weapon', name: 'Crooked Stick', rarity: 'Common', art: '../img/weapons/crooked_stick_card.png', statBonuses: { HP: 3, SPD: 2 }, ability: null },
    { id: 1702, type: 'weapon', name: 'Apprentice Rod', rarity: 'Uncommon', art: '../img/weapons/apprentice_rod_card.png', statBonuses: { HP: 5, SPD: 3 }, ability: { name: 'Mana Tap', description: 'When this hero uses an Ability, they heal for 2 HP.' } },
    { id: 1703, type: 'weapon', name: "Sagewood Staff", rarity: 'Rare', art: '../img/weapons/sagewood_staff_card.png', statBonuses: { HP: 8, SPD: 4 }, ability: { name: 'Spell Power', description: "All damage dealt by this hero's equipped Ability cards is increased by 2." } },
    { id: 1704, type: 'weapon', name: 'Archmage Catalyst', rarity: 'Epic', art: '../img/weapons/archmage_catalyst_card.png', statBonuses: { HP: 12, SPD: 5 }, ability: { name: 'Ether Pulse', description: 'At the start of combat, gain 1 extra Energy.' } },

    // 8. Shield Family
    { id: 1801, type: 'weapon', name: 'Makeshift Buckler', rarity: 'Common', art: '../img/weapons/makeshift_buckler_card.png', statBonuses: { HP: 5 }, ability: null },
    { id: 1802, type: 'weapon', name: 'Iron Kite Shield', rarity: 'Uncommon', art: '../img/weapons/iron_kite_shield_card.png', statBonuses: { HP: 8 }, ability: { name: 'Shield Wall', description: 'When combat starts, this hero gains Block 1.' } },
    { id: 1803, type: 'weapon', name: 'Lionheart Wall', rarity: 'Rare', art: '../img/weapons/lionheart_wall_card.png', statBonuses: { HP: 12 }, ability: { name: 'Improved Shield Wall', description: 'When combat starts, this hero gains Block 2.' } },
    { id: 1804, type: 'weapon', name: 'Aegis of the Ages', rarity: 'Epic', art: '../img/weapons/aegis_of_the_ages_card.png', statBonuses: { HP: 15 }, ability: { name: 'Guardian', description: 'When this hero is hit, one adjacent ally gains Block 1 for the next attack against them.' } }
];
// NOTE: Placeholder art links ('...') and IDs have been assigned.

export const allPossibleAbilities = 
[
  {
    "id": 3111,
    "type": "ability",
    "name": "Power Strike",
    "class": "Stalwart Defender",
    "rarity": "Common",
    "art": "https://placehold.co/150x126/ef4444/FFFFFF?text=Ability",
    "energyCost": 1,
    "category": "Offense",
    "description": "Deal 2 damage to one enemy.",
    "effects": [
      {
        "type": "DEAL_DAMAGE",
        "target": "SINGLE_ENEMY",
        "amount": 2,
        "damageType": "Physical"
      }
    ]
  },
  {
    "id": 3112,
    "type": "ability",
    "name": "Fortify",
    "class": "Stalwart Defender",
    "rarity": "Common",
    "art": "https://placehold.co/150x126/ef4444/FFFFFF?text=Ability",
    "energyCost": 1,
    "category": "Defense",
    "description": "Reduce all incoming damage by 1 for 2 turns.",
    "effects": []
  },
  {
    "id": 3113,
    "type": "ability",
    "name": "Shield Bash",
    "class": "Stalwart Defender",
    "rarity": "Common",
    "art": "https://placehold.co/150x126/ef4444/FFFFFF?text=Ability",
    "energyCost": 1,
    "category": "Support",
    "description": "Deal 1 damage and stun the enemy for 1 turn.",
    "effects": [
      {
        "type": "DEAL_DAMAGE",
        "target": "SINGLE_ENEMY",
        "amount": 1,
        "damageType": "Physical"
      },
      {
        "type": "APPLY_STATUS",
        "target": "SINGLE_ENEMY",
        "status": "Stun",
        "duration": 1
      }
    ]
  },
  {
    "id": 3121,
    "type": "ability",
    "name": "Crippling Blow",
    "class": "Stalwart Defender",
    "rarity": "Uncommon",
    "art": "https://placehold.co/150x126/ef4444/FFFFFF?text=Ability",
    "energyCost": 2,
    "category": "Offense",
    "description": "Deal 3 damage and reduce the enemy’s attack by 1 next turn.",
    "effects": [
      {
        "type": "DEAL_DAMAGE",
        "target": "SINGLE_ENEMY",
        "amount": 3,
        "damageType": "Physical"
      }
    ]
  },
  {
    "id": 3122,
    "type": "ability",
    "name": "Parry & Riposte",
    "class": "Stalwart Defender",
    "rarity": "Uncommon",
    "art": "https://placehold.co/150x126/ef4444/FFFFFF?text=Ability",
    "energyCost": 2,
    "category": "Defense",
    "description": "Block next attack; if successful, counterattack for 2 damage.",
    "effects": []
  },
  {
    "id": 3123,
    "type": "ability",
    "name": "Battle Roar",
    "class": "Stalwart Defender",
    "rarity": "Uncommon",
    "art": "https://placehold.co/150x126/ef4444/FFFFFF?text=Ability",
    "energyCost": 2,
    "category": "Support",
    "description": "Gain +2 attack on your next attack.",
    "effects": []
  },
  {
    "id": 3131,
    "type": "ability",
    "name": "Whirlwind Slash",
    "class": "Stalwart Defender",
    "rarity": "Rare",
    "art": "https://placehold.co/150x126/ef4444/FFFFFF?text=Ability",
    "energyCost": 3,
    "category": "Offense",
    "env_effect": "wind",
    "target": "ENEMIES",
    "description": "Deal 2 damage to all enemies.",
    "effects": [
      {
        "type": "DEAL_DAMAGE",
        "target": "ALL_ENEMIES",
        "amount": 2,
        "damageType": "Physical"
      }
    ]
  },
  {
    "id": 3132,
    "type": "ability",
    "name": "Blood Frenzy",
    "class": "Stalwart Defender",
    "rarity": "Rare",
    "art": "https://placehold.co/150x126/ef4444/FFFFFF?text=Ability",
    "energyCost": 3,
    "category": "Defense",
    "description": "If under 50% HP, gain +2 attacks this turn.",
    "effects": []
  },
  {
    "id": 3133,
    "type": "ability",
    "name": "Relentless Pursuit",
    "class": "Stalwart Defender",
    "rarity": "Rare",
    "art": "https://placehold.co/150x126/ef4444/FFFFFF?text=Ability",
    "energyCost": 3,
    "category": "Support",
    "description": "Deal 3 damage and take an extra action if this kills the target.",
    "effects": [
      {
        "type": "DEAL_DAMAGE",
        "target": "SINGLE_ENEMY",
        "amount": 3,
        "damageType": "Physical"
      }
    ]
  },
  {
    "id": 3141,
    "type": "ability",
    "name": "Juggernaut Charge",
    "class": "Stalwart Defender",
    "rarity": "Epic",
    "art": "https://placehold.co/150x126/ef4444/FFFFFF?text=Ability",
    "energyCost": 4,
    "category": "Offense",
    "description": "Deal 5 damage to one enemy and stun for 1 turn.",
    "effects": [
      {
        "type": "DEAL_DAMAGE",
        "target": "SINGLE_ENEMY",
        "amount": 5,
        "damageType": "Physical"
      },
      {
        "type": "APPLY_STATUS",
        "target": "SINGLE_ENEMY",
        "status": "Stun",
        "duration": 1
      }
    ]
  },
  {
    "id": 3142,
    "type": "ability",
    "name": "Champion’s Wrath",
    "class": "Stalwart Defender",
    "rarity": "Epic",
    "art": "https://placehold.co/150x126/ef4444/FFFFFF?text=Ability",
    "energyCost": 4,
    "category": "Defense",
    "target": "ENEMIES",
    "description": "Deal 4 damage to all enemies. If you KO at least 1 enemy, gain another full turn immediately.",
    "effects": [
      {
        "type": "DEAL_DAMAGE",
        "target": "ALL_ENEMIES",
        "amount": 4,
        "damageType": "Physical"
      }
    ]
  },
  {
    "id": 3143,
    "type": "ability",
    "name": "Last Stand",
    "class": "Stalwart Defender",
    "rarity": "Epic",
    "art": "https://placehold.co/150x126/ef4444/FFFFFF?text=Ability",
    "energyCost": 4,
    "category": "Support",
    "description": "If under 25% HP, all attacks this turn deal double damage.",
    "effects": []
  },
  {
    "id": 3211,
    "type": "ability",
    "name": "Divine Strike",
    "class": "Holy Warrior",
    "rarity": "Common",
    "art": "https://placehold.co/150x126/ef4444/FFFFFF?text=Ability",
    "energyCost": 1,
    "category": "Offense",
    "description": "Deal 2 damage and heal yourself for 2 HP.",
    "effects": [
      {
        "type": "DEAL_DAMAGE",
        "target": "SINGLE_ENEMY",
        "amount": 2,
        "damageType": "Physical"
      },
      {
        "type": "HEAL",
        "target": "SELF",
        "amount": 2
      }
    ]
  },
  {
    "id": 3212,
    "type": "ability",
    "name": "Righteous Shield",
    "class": "Holy Warrior",
    "rarity": "Common",
    "art": "https://placehold.co/150x126/ef4444/FFFFFF?text=Ability",
    "energyCost": 1,
    "category": "Defense",
    "description": "Block the next attack completely.",
    "effects": []
  },
  {
    "id": 3213,
    "type": "ability",
    "name": "Holy Light",
    "class": "Holy Warrior",
    "rarity": "Common",
    "art": "https://placehold.co/150x126/ef4444/FFFFFF?text=Ability",
    "energyCost": 1,
    "category": "Support",
    "description": "Heal an ally for 4 HP.",
    "effects": [
      {
        "type": "HEAL",
        "target": "SINGLE_ALLY",
        "amount": 4
      }
    ]
  },
  {
    "id": 3221,
    "type": "ability",
    "name": "Judgment",
    "class": "Holy Warrior",
    "rarity": "Uncommon",
    "art": "https://placehold.co/150x126/ef4444/FFFFFF?text=Ability",
    "energyCost": 2,
    "category": "Offense",
    "description": "Deal 3 damage and reduce the enemy’s defense by 1 for 2 turns.",
    "effects": [
      {
        "type": "DEAL_DAMAGE",
        "target": "SINGLE_ENEMY",
        "amount": 3,
        "damageType": "Physical"
      }
    ]
  },
  {
    "id": 3222,
    "type": "ability",
    "name": "Aegis Aura",
    "class": "Holy Warrior",
    "rarity": "Uncommon",
    "art": "https://placehold.co/150x126/ef4444/FFFFFF?text=Ability",
    "energyCost": 2,
    "category": "Defense",
    "target": "ALLIES",
    "description": "All allies reduce incoming damage by 1 for 2 turns.",
    "effects": []
  },
  {
    "id": 3223,
    "type": "ability",
    "name": "Blessing of Valor",
    "class": "Holy Warrior",
    "rarity": "Uncommon",
    "art": "https://placehold.co/150x126/ef4444/FFFFFF?text=Ability",
    "energyCost": 2,
    "category": "Support",
    "target": "ALLIES",
    "description": "All allies gain +1 attack and +1 defense for 2 turns.",
    "effects": [
      {
        "type": "APPLY_STATUS",
        "target": "SELF",
        "status": "Attack Up",
        "power": 1,
        "duration": 2
      }
    ]
  },
  {
    "id": 3231,
    "type": "ability",
    "name": "Radiant Smite",
    "class": "Holy Warrior",
    "rarity": "Rare",
    "art": "https://placehold.co/150x126/ef4444/FFFFFF?text=Ability",
    "energyCost": 3,
    "category": "Offense",
    "description": "Deal 4 holy damage and stun the enemy if they are undead/dark-aligned.",
    "effects": [
      {
        "type": "APPLY_STATUS",
        "target": "SINGLE_ENEMY",
        "status": "Stun",
        "duration": 1
      }
    ]
  },
  {
    "id": 3232,
    "type": "ability",
    "name": "Sacred Vow",
    "class": "Holy Warrior",
    "rarity": "Rare",
    "art": "https://placehold.co/150x126/ef4444/FFFFFF?text=Ability",
    "energyCost": 3,
    "category": "Defense",
    "description": "You take half damage and cannot be debuffed for 2 turns.",
    "effects": []
  },
  {
    "id": 3233,
    "type": "ability",
    "name": "Lay on Hands",
    "class": "Holy Warrior",
    "rarity": "Rare",
    "art": "https://placehold.co/150x126/ef4444/FFFFFF?text=Ability",
    "energyCost": 3,
    "category": "Support",
    "description": "Fully heal one ally to max HP.",
    "effects": []
  },
  {
    "id": 3241,
    "type": "ability",
    "name": "Light’s Wrath",
    "class": "Holy Warrior",
    "rarity": "Epic",
    "art": "https://placehold.co/150x126/ef4444/FFFFFF?text=Ability",
    "energyCost": 4,
    "category": "Offense",
    "target": "ENEMIES",
    "description": "Deal 5 holy damage to all enemies and heal all allies for 5 HP.",
    "effects": [
      {
        "type": "HEAL",
        "target": "ALL_ALLIES",
        "amount": 5
      }
    ]
  },
  {
    "id": 3242,
    "type": "ability",
    "name": "Divine Intervention",
    "class": "Holy Warrior",
    "rarity": "Epic",
    "art": "https://placehold.co/150x126/ef4444/FFFFFF?text=Ability",
    "energyCost": 4,
    "category": "Defense",
    "target": "ALLIES",
    "description": "Prevent all allies from taking damage this turn (total immunity).",
    "effects": []
  },
  {
    "id": 3243,
    "type": "ability",
    "name": "Resurrection",
    "class": "Holy Warrior",
    "rarity": "Epic",
    "art": "https://placehold.co/150x126/ef4444/FFFFFF?text=Ability",
    "energyCost": 4,
    "category": "Support",
    "description": "Revive a fallen ally at 75% HP.",
    "effects": []
  },
  {
    "id": 3311,
    "type": "ability",
    "name": "Reckless Charge",
    "class": "Raging Fighter",
    "rarity": "Common",
    "art": "https://placehold.co/150x126/ef4444/FFFFFF?text=Ability",
    "energyCost": 1,
    "category": "Offense",
    "target": "ENEMIES",
    "description": "Deal 2 damage to all enemies, but you take 1 self-damage.",
    "effects": [
      {
        "type": "DEAL_DAMAGE",
        "target": "ALL_ENEMIES",
        "amount": 2,
        "damageType": "Physical"
      }
    ]
  },
  {
    "id": 3312,
    "type": "ability",
    "name": "Raging Strike",
    "class": "Raging Fighter",
    "rarity": "Common",
    "art": "https://placehold.co/150x126/ef4444/FFFFFF?text=Ability",
    "energyCost": 1,
    "category": "Defense",
    "description": "Deal 3 damage, but reduce your defense by 1 until next turn.",
    "effects": [
      {
        "type": "DEAL_DAMAGE",
        "target": "SINGLE_ENEMY",
        "amount": 3,
        "damageType": "Physical"
      }
    ]
  },
  {
    "id": 3313,
    "type": "ability",
    "name": "Battle Roar",
    "class": "Raging Fighter",
    "rarity": "Common",
    "art": "https://placehold.co/150x126/ef4444/FFFFFF?text=Ability",
    "energyCost": 1,
    "category": "Support",
    "description": "Gain +2 attack for 2 turns.",
    "effects": [
      {
        "type": "APPLY_STATUS",
        "target": "SELF",
        "status": "Attack Up",
        "power": 2,
        "duration": 2
      }
    ]
  },
  {
    "id": 3321,
    "type": "ability",
    "name": "Savage Cleave",
    "class": "Raging Fighter",
    "rarity": "Uncommon",
    "art": "https://placehold.co/150x126/ef4444/FFFFFF?text=Ability",
    "energyCost": 2,
    "category": "Offense",
    "env_effect": "wind",
    "description": "Deal 4 damage to one enemy. If you kill them, gain +1 attack on your next action.",
    "effects": [
      {
        "type": "DEAL_DAMAGE",
        "target": "SINGLE_ENEMY",
        "amount": 4,
        "damageType": "Physical"
      }
    ]
  },
  {
    "id": 3322,
    "type": "ability",
    "name": "Frenzied Defense",
    "class": "Raging Fighter",
    "rarity": "Uncommon",
    "art": "https://placehold.co/150x126/ef4444/FFFFFF?text=Ability",
    "energyCost": 2,
    "category": "Defense",
    "description": "Take -2 damage reduction this turn and deal 2 damage back when attacked.",
    "effects": [
      {
        "type": "DEAL_DAMAGE",
        "target": "SINGLE_ENEMY",
        "amount": 2,
        "damageType": "Physical"
      }
    ]
  },
  {
    "id": 3323,
    "type": "ability",
    "name": "Unbreakable Will",
    "class": "Raging Fighter",
    "rarity": "Uncommon",
    "art": "https://placehold.co/150x126/ef4444/FFFFFF?text=Ability",
    "energyCost": 2,
    "category": "Support",
    "description": "Prevent defeat if your HP would drop to 0 this turn (survive with 1 HP).",
    "effects": []
  },
  {
    "id": 3331,
    "type": "ability",
    "name": "Bloodbath",
    "class": "Raging Fighter",
    "rarity": "Rare",
    "art": "https://placehold.co/150x126/ef4444/FFFFFF?text=Ability",
    "energyCost": 3,
    "category": "Offense",
    "target": "ENEMIES",
    "description": "Deal 3 damage to all enemies. For each enemy hit, gain +1 attack next turn.",
    "effects": [
      {
        "type": "DEAL_DAMAGE",
        "target": "ALL_ENEMIES",
        "amount": 3,
        "damageType": "Physical"
      }
    ]
  },
  {
    "id": 3332,
    "type": "ability",
    "name": "Warlord’s Challenge",
    "class": "Raging Fighter",
    "rarity": "Rare",
    "art": "https://placehold.co/150x126/ef4444/FFFFFF?text=Ability",
    "energyCost": 3,
    "category": "Defense",
    "target": "ENEMIES",
    "description": "Force all enemies to target you next turn and gain +2 defense.",
    "effects": []
  },
  {
    "id": 3333,
    "type": "ability",
    "name": "Last Stand",
    "class": "Raging Fighter",
    "rarity": "Rare",
    "art": "https://placehold.co/150x126/ef4444/FFFFFF?text=Ability",
    "energyCost": 3,
    "category": "Support",
    "description": "If under 50% HP, all attacks this turn deal double damage.",
    "effects": []
  },
  {
    "id": 3341,
    "type": "ability",
    "name": "Titan Breaker",
    "class": "Raging Fighter",
    "rarity": "Epic",
    "art": "https://placehold.co/150x126/ef4444/FFFFFF?text=Ability",
    "energyCost": 4,
    "category": "Offense",
    "description": "Deal 7 damage to a single enemy and ignore all their defenses/armor.",
    "effects": [
      {
        "type": "DEAL_DAMAGE",
        "target": "SINGLE_ENEMY",
        "amount": 7,
        "damageType": "Physical"
      }
    ]
  },
  {
    "id": 3342,
    "type": "ability",
    "name": "Berserker’s Rage",
    "class": "Raging Fighter",
    "rarity": "Epic",
    "art": "https://placehold.co/150x126/ef4444/FFFFFF?text=Ability",
    "energyCost": 4,
    "category": "Defense",
    "description": "For 2 turns, all attacks deal +2 damage and you cannot be stunned or debuffed.",
    "effects": [
      {
        "type": "APPLY_STATUS",
        "target": "SELF",
        "status": "Stun",
        "duration": 1
      }
    ]
  },
  {
    "id": 3343,
    "type": "ability",
    "name": "Unending Rage",
    "class": "Raging Fighter",
    "rarity": "Epic",
    "art": "https://placehold.co/150x126/ef4444/FFFFFF?text=Ability",
    "energyCost": 4,
    "category": "Support",
    "description": "Your abilities cost 1 less energy for the rest of combat.",
    "effects": []
  },
  {
    "id": 3411,
    "type": "ability",
    "name": "Chaos Bolt",
    "class": "Raw Power Mage",
    "rarity": "Common",
    "art": "https://placehold.co/150x126/ef4444/FFFFFF?text=Ability",
    "energyCost": 1,
    "category": "Offense",
    "description": "Deal 3 damage of a random element.",
    "effects": [
      {
        "type": "DEAL_DAMAGE",
        "target": "SINGLE_ENEMY",
        "amount": 3,
        "damageType": "Physical"
      }
    ]
  },
  {
    "id": 3412,
    "type": "ability",
    "name": "Mana Surge",
    "class": "Raw Power Mage",
    "rarity": "Common",
    "art": "https://placehold.co/150x126/ef4444/FFFFFF?text=Ability",
    "energyCost": 1,
    "category": "Support",
    "description": "Restore 2 energy and gain +1 attack for spells this turn.",
    "effects": []
  },
  {
    "id": 3413,
    "type": "ability",
    "name": "Elemental Spark",
    "class": "Raw Power Mage",
    "rarity": "Common",
    "art": "https://placehold.co/150x126/ef4444/FFFFFF?text=Ability",
    "energyCost": 1,
    "category": "Defense",
    "description": "Deal 2 damage and apply a random debuff.",
    "effects": [
      {
        "type": "DEAL_DAMAGE",
        "target": "SINGLE_ENEMY",
        "amount": 2,
        "damageType": "Physical"
      }
    ]
  },
  {
    "id": 3421,
    "type": "ability",
    "name": "Arcane Explosion",
    "class": "Raw Power Mage",
    "rarity": "Uncommon",
    "art": "https://placehold.co/150x126/ef4444/FFFFFF?text=Ability",
    "energyCost": 2,
    "category": "Offense",
    "target": "ENEMIES",
    "description": "Deal 2 damage to all enemies.",
    "effects": [
      {
        "type": "DEAL_DAMAGE",
        "target": "ALL_ENEMIES",
        "amount": 2,
        "damageType": "Physical"
      }
    ]
  },
  {
    "id": 3422,
    "type": "ability",
    "name": "Elemental Infusion",
    "class": "Raw Power Mage",
    "rarity": "Uncommon",
    "art": "https://placehold.co/150x126/ef4444/FFFFFF?text=Ability",
    "energyCost": 2,
    "category": "Support",
    "description": "All spells deal +1 damage for 2 turns.",
    "effects": []
  },
  {
    "id": 3423,
    "type": "ability",
    "name": "Chain Lightning",
    "class": "Raw Power Mage",
    "rarity": "Uncommon",
    "art": "https://placehold.co/150x126/ef4444/FFFFFF?text=Ability",
    "energyCost": 2,
    "category": "Offense",
    "description": "Deal 3 lightning damage to one enemy and 2 to another.",
    "effects": []
  },
  {
    "id": 3431,
    "type": "ability",
    "name": "Firestorm",
    "class": "Raw Power Mage",
    "rarity": "Rare",
    "art": "https://placehold.co/150x126/ef4444/FFFFFF?text=Ability",
    "energyCost": 3,
    "category": "Offense",
    "target": "ENEMIES",
    "description": "Deal 3 fire damage to all enemies and apply Burn.",
    "effects": []
  },
  {
    "id": 3432,
    "type": "ability",
    "name": "Elemental Rift",
    "class": "Raw Power Mage",
    "rarity": "Rare",
    "art": "https://placehold.co/150x126/ef4444/FFFFFF?text=Ability",
    "energyCost": 3,
    "category": "Offense",
    "description": "Deal 4 damage of a random element and root the enemy.",
    "effects": [
      {
        "type": "DEAL_DAMAGE",
        "target": "SINGLE_ENEMY",
        "amount": 4,
        "damageType": "Physical"
      },
      {
        "type": "APPLY_STATUS",
        "target": "SINGLE_ENEMY",
        "status": "Root",
        "duration": 1
      }
    ]
  },
  {
    "id": 3433,
    "type": "ability",
    "name": "Spell Mirror",
    "class": "Raw Power Mage",
    "rarity": "Rare",
    "art": "https://placehold.co/150x126/ef4444/FFFFFF?text=Ability",
    "energyCost": 3,
    "category": "Defense",
    "description": "Reflect the next magical attack back at the caster.",
    "effects": []
  },
  {
    "id": 3441,
    "type": "ability",
    "name": "Annihilation Sphere",
    "class": "Raw Power Mage",
    "rarity": "Epic",
    "art": "https://placehold.co/150x126/ef4444/FFFFFF?text=Ability",
    "energyCost": 4,
    "category": "Offense",
    "target": "ENEMIES",
    "description": "Deal 5 damage to all enemies and apply random status effects.",
    "effects": [
      {
        "type": "DEAL_DAMAGE",
        "target": "ALL_ENEMIES",
        "amount": 5,
        "damageType": "Physical"
      }
    ]
  },
  {
    "id": 3442,
    "type": "ability",
    "name": "Chaos Mastery",
    "class": "Raw Power Mage",
    "rarity": "Epic",
    "art": "https://placehold.co/150x126/ef4444/FFFFFF?text=Ability",
    "energyCost": 4,
    "category": "Support",
    "description": "For 3 turns, spells deal +2 damage and cannot be resisted.",
    "effects": []
  },
  {
    "id": 3443,
    "type": "ability",
    "name": "Elemental Fury",
    "class": "Raw Power Mage",
    "rarity": "Epic",
    "art": "https://placehold.co/150x126/ef4444/FFFFFF?text=Ability",
    "energyCost": 4,
    "category": "Offense",
    "description": "Deal 6 damage of a random element to one enemy.",
    "effects": [
      {
        "type": "DEAL_DAMAGE",
        "target": "SINGLE_ENEMY",
        "amount": 6,
        "damageType": "Physical"
      }
    ]
  },
  {
    "id": 3511,
    "type": "ability",
    "name": "Divine Light",
    "class": "Divine Healer",
    "rarity": "Common",
    "art": "https://placehold.co/150x126/ef4444/FFFFFF?text=Ability",
    "energyCost": 1,
    "category": "Support",
    "description": "Heal an ally for 4 HP.",
    "effects": [
      {
        "type": "HEAL",
        "target": "SINGLE_ALLY",
        "amount": 4
      }
    ]
  },
  {
    "id": 3512,
    "type": "ability",
    "name": "Smite Evil",
    "class": "Divine Healer",
    "rarity": "Common",
    "art": "https://placehold.co/150x126/ef4444/FFFFFF?text=Ability",
    "energyCost": 1,
    "category": "Offense",
    "description": "Deal 2 damage, or 4 to undead enemies.",
    "effects": [
      {
        "type": "DEAL_DAMAGE",
        "target": "SINGLE_ENEMY",
        "amount": 2,
        "damageType": "Physical"
      }
    ]
  },
  {
    "id": 3513,
    "type": "ability",
    "name": "Holy Barrier",
    "class": "Divine Healer",
    "rarity": "Common",
    "art": "https://placehold.co/150x126/ef4444/FFFFFF?text=Ability",
    "energyCost": 1,
    "category": "Defense",
    "target": "ALLIES",
    "description": "Reduce all damage taken by allies by 1 this turn.",
    "effects": []
  },
  {
    "id": 3521,
    "type": "ability",
    "name": "Bless",
    "class": "Divine Healer",
    "rarity": "Uncommon",
    "art": "https://placehold.co/150x126/ef4444/FFFFFF?text=Ability",
    "energyCost": 2,
    "category": "Support",
    "target": "ALLIES",
    "description": "All allies gain +1 attack and +1 evasion for 2 turns.",
    "effects": [
      {
        "type": "APPLY_STATUS",
        "target": "SELF",
        "status": "Attack Up",
        "power": 1,
        "duration": 2
      }
    ]
  },
  {
    "id": 3522,
    "type": "ability",
    "name": "Purify",
    "class": "Divine Healer",
    "rarity": "Uncommon",
    "art": "https://placehold.co/150x126/ef4444/FFFFFF?text=Ability",
    "energyCost": 2,
    "category": "Defense",
    "description": "Remove all negative effects from an ally and heal 3 HP.",
    "effects": []
  },
  {
    "id": 3523,
    "type": "ability",
    "name": "Sacred Shield",
    "class": "Divine Healer",
    "rarity": "Uncommon",
    "art": "https://placehold.co/150x126/ef4444/FFFFFF?text=Ability",
    "energyCost": 2,
    "category": "Defense",
    "description": "One ally becomes immune to damage this turn.",
    "effects": []
  },
  {
    "id": 3531,
    "type": "ability",
    "name": "Judgment",
    "class": "Divine Healer",
    "rarity": "Rare",
    "art": "https://placehold.co/150x126/ef4444/FFFFFF?text=Ability",
    "energyCost": 3,
    "category": "Offense",
    "description": "Deal 3 damage and reduce enemy defense by 1 for 2 turns.",
    "effects": [
      {
        "type": "DEAL_DAMAGE",
        "target": "SINGLE_ENEMY",
        "amount": 3,
        "damageType": "Physical"
      },
      {
        "type": "APPLY_STATUS",
        "target": "SINGLE_ENEMY",
        "status": "Defense Down",
        "power": 1,
        "duration": 2
      }
    ]
  },
  {
    "id": 3532,
    "type": "ability",
    "name": "Radiant Wave",
    "class": "Divine Healer",
    "rarity": "Rare",
    "art": "https://placehold.co/150x126/ef4444/FFFFFF?text=Ability",
    "energyCost": 3,
    "category": "Support",
    "target": "ALLIES",
    "description": "Heal all allies for 3 HP and remove one debuff each.",
    "effects": [
      {
        "type": "HEAL",
        "target": "ALL_ALLIES",
        "amount": 3
      }
    ]
  },
  {
    "id": 3533,
    "type": "ability",
    "name": "Divine Retribution",
    "class": "Divine Healer",
    "rarity": "Rare",
    "art": "https://placehold.co/150x126/ef4444/FFFFFF?text=Ability",
    "energyCost": 3,
    "category": "Offense",
    "target": "ENEMIES",
    "description": "Deal 3 damage to all enemies and heal allies for 2 HP.",
    "effects": [
      {
        "type": "DEAL_DAMAGE",
        "target": "ALL_ENEMIES",
        "amount": 3,
        "damageType": "Physical"
      }
    ]
  },
  {
    "id": 3541,
    "type": "ability",
    "name": "Lay on Hands",
    "class": "Divine Healer",
    "rarity": "Epic",
    "art": "https://placehold.co/150x126/ef4444/FFFFFF?text=Ability",
    "energyCost": 4,
    "category": "Support",
    "description": "Fully restore one ally’s HP.",
    "effects": []
  },
  {
    "id": 3542,
    "type": "ability",
    "name": "Resurrect",
    "class": "Divine Healer",
    "rarity": "Epic",
    "art": "https://placehold.co/150x126/ef4444/FFFFFF?text=Ability",
    "energyCost": 4,
    "category": "Support",
    "description": "Revive a fallen ally at 50% HP and remove all debuffs.",
    "effects": []
  },
  {
    "id": 3543,
    "type": "ability",
    "name": "Heaven’s Fury",
    "class": "Divine Healer",
    "rarity": "Epic",
    "art": "https://placehold.co/150x126/ef4444/FFFFFF?text=Ability",
    "energyCost": 4,
    "category": "Offense",
    "description": "Deal 5 holy damage to undead enemies.",
    "effects": []
  },
  {
    "id": 3611,
    "type": "ability",
    "name": "Nature’s Wrath",
    "class": "Nature Shaper",
    "rarity": "Common",
    "art": "https://placehold.co/150x126/ef4444/FFFFFF?text=Ability",
    "energyCost": 1,
    "category": "Offense",
    "description": "Deal 1 damage and apply Poison 1 for 2 turns.",
    "effects": [
      {
        "type": "DEAL_DAMAGE",
        "target": "SINGLE_ENEMY",
        "amount": 1,
        "damageType": "Physical"
      },
      {
        "type": "APPLY_STATUS",
        "target": "SINGLE_ENEMY",
        "status": "Poison",
        "power": 1,
        "duration": 2
      }
    ]
  },
  {
    "id": 3612,
    "type": "ability",
    "name": "Regrowth",
    "class": "Nature Shaper",
    "rarity": "Common",
    "art": "https://placehold.co/150x126/ef4444/FFFFFF?text=Ability",
    "energyCost": 1,
    "category": "Support",
    "description": "Heal an ally for 2 HP per turn over 3 turns.",
    "effects": [
      {
        "type": "HEAL",
        "target": "SINGLE_ALLY",
        "amount": 2
      }
    ]
  },
  {
    "id": 3613,
    "type": "ability",
    "name": "Entangle",
    "class": "Nature Shaper",
    "rarity": "Common",
    "art": "https://placehold.co/150x126/ef4444/FFFFFF?text=Ability",
    "energyCost": 1,
    "category": "Defense",
    "description": "Root an enemy; they cannot act next turn.",
    "effects": [
      {
        "type": "APPLY_STATUS",
        "target": "SINGLE_ENEMY",
        "status": "Root",
        "duration": 1
      }
    ]
  },
  {
    "id": 3621,
    "type": "ability",
    "name": "Wild Growth",
    "class": "Nature Shaper",
    "rarity": "Uncommon",
    "art": "https://placehold.co/150x126/ef4444/FFFFFF?text=Ability",
    "energyCost": 2,
    "category": "Support",
    "target": "ALLIES",
    "description": "Heal all allies for 2 HP and give +1 defense for 1 turn.",
    "effects": [
      {
        "type": "HEAL",
        "target": "ALL_ALLIES",
        "amount": 2
      }
    ]
  },
  {
    "id": 3622,
    "type": "ability",
    "name": "Shapeshift – Bear Form",
    "class": "Nature Shaper",
    "rarity": "Uncommon",
    "art": "https://placehold.co/150x126/ef4444/FFFFFF?text=Ability",
    "energyCost": 2,
    "category": "Defense",
    "description": "Gain +2 attack and +2 defense for 2 turns, then revert.",
    "effects": [
      {
        "type": "APPLY_STATUS",
        "target": "SELF",
        "status": "Attack Up",
        "power": 2,
        "duration": 2
      }
    ]
  },
  {
    "id": 3623,
    "type": "ability",
    "name": "Venom Thorns",
    "class": "Nature Shaper",
    "rarity": "Uncommon",
    "art": "https://placehold.co/150x126/ef4444/FFFFFF?text=Ability",
    "energyCost": 2,
    "category": "Offense",
    "synergy": {
      "condition": "Poison",
      "bonus_multiplier": 2
    },
    "description": "Deal 2 damage. Deals double damage to Poisoned targets. If enemy attacks next turn they take 2 poison damage.",
    "effects": [
      {
        "type": "DEAL_DAMAGE",
        "target": "SINGLE_ENEMY",
        "amount": 2,
        "damageType": "Physical"
      },
      {
        "type": "APPLY_STATUS",
        "target": "SINGLE_ENEMY",
        "status": "Poison",
        "power": 1,
        "duration": 2
      }
    ]
  },
  {
    "id": 3631,
    "type": "ability",
    "name": "Shapeshift – Wolf Form",
    "class": "Nature Shaper",
    "rarity": "Rare",
    "art": "https://placehold.co/150x126/ef4444/FFFFFF?text=Ability",
    "energyCost": 3,
    "category": "Offense",
    "description": "Gain +2 speed and +1 attack for 3 turns, then revert.",
    "effects": []
  },
  {
    "id": 3632,
    "type": "ability",
    "name": "Poison Storm",
    "class": "Nature Shaper",
    "rarity": "Rare",
    "art": "https://placehold.co/150x126/ef4444/FFFFFF?text=Ability",
    "energyCost": 3,
    "category": "Offense",
    "target": "ENEMIES",
    "description": "Deal 1 damage to all enemies and poison them for 2 turns.",
    "effects": [
      {
        "type": "DEAL_DAMAGE",
        "target": "ALL_ENEMIES",
        "amount": 1,
        "damageType": "Physical"
      },
      {
        "type": "APPLY_STATUS",
        "target": "ALL_ENEMIES",
        "status": "Poison",
        "power": 1,
        "duration": 2
      }
    ]
  },
  {
    "id": 3633,
    "type": "ability",
    "name": "Barkskin",
    "class": "Nature Shaper",
    "rarity": "Rare",
    "art": "https://placehold.co/150x126/ef4444/FFFFFF?text=Ability",
    "energyCost": 3,
    "category": "Defense",
    "target": "ALLIES",
    "description": "All allies reduce damage by 2 for 1 turn.",
    "effects": [
      {
        "type": "APPLY_STATUS",
        "target": "ALL_ALLIES",
        "status": "Damage Reduction",
        "power": 2,
        "duration": 1
      }
    ]
  },
  {
    "id": 3641,
    "type": "ability",
    "name": "Avatar of the Wild",
    "class": "Nature Shaper",
    "rarity": "Epic",
    "art": "https://placehold.co/150x126/ef4444/FFFFFF?text=Ability",
    "energyCost": 4,
    "category": "Offense",
    "description": "Shapeshift into Avatar form for 3 turns; attacks poison enemies.",
    "effects": [
      {
        "type": "APPLY_STATUS",
        "target": "SINGLE_ENEMY",
        "status": "Poison",
        "power": 1,
        "duration": 3
      }
    ]
  },
  {
    "id": 3642,
    "type": "ability",
    "name": "Nature’s Renewal",
    "class": "Nature Shaper",
    "rarity": "Epic",
    "art": "https://placehold.co/150x126/ef4444/FFFFFF?text=Ability",
    "energyCost": 4,
    "category": "Support",
    "target": "ALLIES",
    "description": "Heal all allies for 6 HP and remove all debuffs.",
    "effects": [
      {
        "type": "HEAL",
        "target": "ALL_ALLIES",
        "amount": 6
      }
    ]
  },
  {
    "id": 3643,
    "type": "ability",
    "name": "Elemental Harmony",
    "class": "Nature Shaper",
    "rarity": "Epic",
    "art": "https://placehold.co/150x126/ef4444/FFFFFF?text=Ability",
    "energyCost": 4,
    "category": "Support",
    "target": "ALLIES",
    "description": "Allies gain Poison immunity and +1 attack for 2 turns.",
    "effects": [
      {
        "type": "APPLY_STATUS",
        "target": "SINGLE_ENEMY",
        "status": "Poison",
        "power": 1,
        "duration": 2
      }
    ]
  },
  {
    "id": 3711,
    "type": "ability",
    "name": "Inspiring Tune",
    "class": "Inspiring Artist",
    "rarity": "Common",
    "art": "https://placehold.co/150x126/ef4444/FFFFFF?text=Ability",
    "energyCost": 1,
    "category": "Support",
    "target": "ALLIES",
    "description": "All allies gain +1 attack for 2 turns.",
    "effects": [
      {
        "type": "APPLY_STATUS",
        "target": "SELF",
        "status": "Attack Up",
        "power": 1,
        "duration": 2
      }
    ]
  },
  {
    "id": 3712,
    "type": "ability",
    "name": "Dissonant Chord",
    "class": "Inspiring Artist",
    "rarity": "Common",
    "art": "https://placehold.co/150x126/ef4444/FFFFFF?text=Ability",
    "energyCost": 1,
    "category": "Offense",
    "description": "Deal 1 damage and reduce enemy attack by 1 next turn.",
    "effects": [
      {
        "type": "DEAL_DAMAGE",
        "target": "SINGLE_ENEMY",
        "amount": 1,
        "damageType": "Physical"
      }
    ]
  },
  {
    "id": 3713,
    "type": "ability",
    "name": "Quick Tempo",
    "class": "Inspiring Artist",
    "rarity": "Common",
    "art": "https://placehold.co/150x126/ef4444/FFFFFF?text=Ability",
    "energyCost": 1,
    "category": "Defense",
    "description": "Choose an ally: they may immediately take 1 extra action.",
    "effects": []
  },
  {
    "id": 3721,
    "type": "ability",
    "name": "Song of Restoration",
    "class": "Inspiring Artist",
    "rarity": "Uncommon",
    "art": "https://placehold.co/150x126/ef4444/FFFFFF?text=Ability",
    "energyCost": 2,
    "category": "Support",
    "description": "Heal an ally for 3 HP per turn over 2 turns.",
    "effects": [
      {
        "type": "HEAL",
        "target": "SINGLE_ALLY",
        "amount": 3
      }
    ]
  },
  {
    "id": 3722,
    "type": "ability",
    "name": "Encore",
    "class": "Inspiring Artist",
    "rarity": "Uncommon",
    "art": "https://placehold.co/150x126/ef4444/FFFFFF?text=Ability",
    "energyCost": 2,
    "category": "Support",
    "description": "Replay your last Bard ability.",
    "effects": []
  },
  {
    "id": 3723,
    "type": "ability",
    "name": "Harmony",
    "class": "Inspiring Artist",
    "rarity": "Uncommon",
    "art": "https://placehold.co/150x126/ef4444/FFFFFF?text=Ability",
    "energyCost": 2,
    "category": "Defense",
    "target": "ALLIES",
    "description": "Buff all allies: +1 attack and +1 evasion for 1 turn.",
    "effects": []
  },
  {
    "id": 3731,
    "type": "ability",
    "name": "Ballad of Courage",
    "class": "Inspiring Artist",
    "rarity": "Rare",
    "art": "https://placehold.co/150x126/ef4444/FFFFFF?text=Ability",
    "energyCost": 3,
    "category": "Support",
    "target": "ALLIES",
    "description": "All allies gain +2 attack and +2 speed for 2 turns.",
    "effects": [
      {
        "type": "APPLY_STATUS",
        "target": "SELF",
        "status": "Attack Up",
        "power": 2,
        "duration": 2
      }
    ]
  },
  {
    "id": 3732,
    "type": "ability",
    "name": "Discordant Blast",
    "class": "Inspiring Artist",
    "rarity": "Rare",
    "art": "https://placehold.co/150x126/ef4444/FFFFFF?text=Ability",
    "energyCost": 3,
    "category": "Offense",
    "target": "ENEMIES",
    "description": "Deal 2 damage to all enemies and reduce their attack by 1.",
    "effects": [
      {
        "type": "DEAL_DAMAGE",
        "target": "ALL_ENEMIES",
        "amount": 2,
        "damageType": "Physical"
      }
    ]
  },
  {
    "id": 3733,
    "type": "ability",
    "name": "Rhythm Shift",
    "class": "Inspiring Artist",
    "rarity": "Rare",
    "art": "https://placehold.co/150x126/ef4444/FFFFFF?text=Ability",
    "energyCost": 3,
    "category": "Defense",
    "description": "Swap turn order so an ally goes first.",
    "effects": []
  },
  {
    "id": 3741,
    "type": "ability",
    "name": "Crescendo",
    "class": "Inspiring Artist",
    "rarity": "Epic",
    "art": "https://placehold.co/150x126/ef4444/FFFFFF?text=Ability",
    "energyCost": 4,
    "category": "Support",
    "target": "ALLIES",
    "description": "All allies gain +3 attack and take an immediate action.",
    "effects": []
  },
  {
    "id": 3742,
    "type": "ability",
    "name": "Song of Rebirth",
    "class": "Inspiring Artist",
    "rarity": "Epic",
    "art": "https://placehold.co/150x126/ef4444/FFFFFF?text=Ability",
    "energyCost": 4,
    "category": "Support",
    "target": "ALLIES",
    "description": "Revive all fallen allies at 50% HP.",
    "effects": []
  },
  {
    "id": 3743,
    "type": "ability",
    "name": "Finale",
    "class": "Inspiring Artist",
    "rarity": "Epic",
    "art": "https://placehold.co/150x126/ef4444/FFFFFF?text=Ability",
    "energyCost": 4,
    "category": "Offense",
    "target": "ENEMIES",
    "description": "Deal 4 damage to all enemies.",
    "effects": [
      {
        "type": "DEAL_DAMAGE",
        "target": "ALL_ENEMIES",
        "amount": 4,
        "damageType": "Physical"
      }
    ]
  },
  {
    "id": 3811,
    "type": "ability",
    "name": "Precision Shot",
    "class": "Wilderness Expert",
    "rarity": "Common",
    "art": "https://placehold.co/150x126/ef4444/FFFFFF?text=Ability",
    "energyCost": 1,
    "category": "Offense",
    "description": "Deal 3 damage to a single enemy.",
    "effects": [
      {
        "type": "DEAL_DAMAGE",
        "target": "SINGLE_ENEMY",
        "amount": 3,
        "damageType": "Physical"
      }
    ]
  },
  {
    "id": 3812,
    "type": "ability",
    "name": "Camouflage",
    "class": "Wilderness Expert",
    "rarity": "Common",
    "art": "https://placehold.co/150x126/ef4444/FFFFFF?text=Ability",
    "energyCost": 1,
    "category": "Defense",
    "description": "Gain +2 evasion for 1 turn and +1 speed next turn.",
    "effects": []
  },
  {
    "id": 3813,
    "type": "ability",
    "name": "Animal Companion – Wolf",
    "class": "Wilderness Expert",
    "rarity": "Common",
    "art": "https://placehold.co/150x126/ef4444/FFFFFF?text=Ability",
    "energyCost": 1,
    "category": "Support",
    "description": "Summon a Wolf that deals 2 damage and lasts 1 turn.",
    "effects": []
  },
  {
    "id": 3821,
    "type": "ability",
    "name": "Multi-Shot",
    "class": "Wilderness Expert",
    "rarity": "Uncommon",
    "art": "https://placehold.co/150x126/ef4444/FFFFFF?text=Ability",
    "energyCost": 2,
    "category": "Offense",
    "description": "Deal 2 damage to up to 3 enemies.",
    "effects": [
      {
        "type": "DEAL_DAMAGE",
        "target": "SINGLE_ENEMY",
        "amount": 2,
        "damageType": "Physical"
      }
    ]
  },
  {
    "id": 3822,
    "type": "ability",
    "name": "Hawk Eye",
    "class": "Wilderness Expert",
    "rarity": "Uncommon",
    "art": "https://placehold.co/150x126/ef4444/FFFFFF?text=Ability",
    "energyCost": 2,
    "category": "Support",
    "description": "Gain +1 attack and +1 crit chance for 2 turns.",
    "effects": [
      {
        "type": "APPLY_STATUS",
        "target": "SELF",
        "status": "Attack Up",
        "power": 1,
        "duration": 2
      }
    ]
  },
  {
    "id": 3823,
    "type": "ability",
    "name": "Animal Companion – Bear",
    "class": "Wilderness Expert",
    "rarity": "Uncommon",
    "art": "https://placehold.co/150x126/ef4444/FFFFFF?text=Ability",
    "energyCost": 2,
    "category": "Defense",
    "description": "Summon a Bear that deals 3 damage and taunts enemies.",
    "effects": []
  },
  {
    "id": 3831,
    "type": "ability",
    "name": "Rain of Arrows",
    "class": "Wilderness Expert",
    "rarity": "Rare",
    "art": "https://placehold.co/150x126/ef4444/FFFFFF?text=Ability",
    "energyCost": 3,
    "category": "Offense",
    "target": "ENEMIES",
    "description": "Deal 3 damage to all enemies.",
    "effects": [
      {
        "type": "DEAL_DAMAGE",
        "target": "ALL_ENEMIES",
        "amount": 3,
        "damageType": "Physical"
      }
    ]
  },
  {
    "id": 3832,
    "type": "ability",
    "name": "Trap Mastery",
    "class": "Wilderness Expert",
    "rarity": "Rare",
    "art": "https://placehold.co/150x126/ef4444/FFFFFF?text=Ability",
    "energyCost": 3,
    "category": "Defense",
    "description": "Set a trap: next enemy to attack you takes 4 damage and is rooted.",
    "effects": [
      {
        "type": "APPLY_STATUS",
        "target": "SINGLE_ENEMY",
        "status": "Root",
        "duration": 1
      }
    ]
  },
  {
    "id": 3833,
    "type": "ability",
    "name": "Animal Companion – Falcon",
    "class": "Wilderness Expert",
    "rarity": "Rare",
    "art": "https://placehold.co/150x126/ef4444/FFFFFF?text=Ability",
    "energyCost": 3,
    "category": "Support",
    "description": "Summon a Falcon that grants +1 attack and reveals hidden enemies for 2 turns.",
    "effects": []
  },
  {
    "id": 3841,
    "type": "ability",
    "name": "Alpha's Call",
    "class": "Wilderness Expert",
    "rarity": "Epic",
    "art": "https://placehold.co/150x126/ef4444/FFFFFF?text=Ability",
    "energyCost": 4,
    "category": "Support",
    "description": "Summon all three animal companions simultaneously.",
    "effects": []
  },
  {
    "id": 3842,
    "type": "ability",
    "name": "True Shot",
    "class": "Wilderness Expert",
    "rarity": "Epic",
    "art": "https://placehold.co/150x126/ef4444/FFFFFF?text=Ability",
    "energyCost": 4,
    "category": "Offense",
    "description": "Deal 7 damage to one enemy, ignoring evasion and armor.",
    "effects": [
      {
        "type": "DEAL_DAMAGE",
        "target": "SINGLE_ENEMY",
        "amount": 7,
        "damageType": "Physical"
      }
    ]
  },
  {
    "id": 3843,
    "type": "ability",
    "name": "Ranger's Focus",
    "class": "Wilderness Expert",
    "rarity": "Epic",
    "art": "https://placehold.co/150x126/ef4444/FFFFFF?text=Ability",
    "energyCost": 4,
    "category": "Defense",
    "description": "Gain +2 attack and +2 speed for 2 turns.",
    "effects": [
      {
        "type": "APPLY_STATUS",
        "target": "SELF",
        "status": "Attack Up",
        "power": 2,
        "duration": 2
      }
    ]
  }
]
;
// NOTE: Placeholder art links ('...') and new IDs have been assigned.

export const allPossibleArmors = [
    // 1. Light Armor (Evasion & Speed)
    { id: 2101, type: 'armor', name: 'Leather Padding', rarity: 'Common', armorType: 'Light', art: '../img/armor/leather_padding_card.png', statBonuses: { Block: 1 }, ability: null },
    { id: 2102, type: 'armor', name: 'Agile Reflexes', rarity: 'Uncommon', armorType: 'Light', art: '../img/armor/agile_reflexes_card.png', statBonuses: { Evasion: 2 }, ability: null },
    { id: 2103, type: 'armor', name: 'Shadow Garb', rarity: 'Rare', armorType: 'Light', art: '../img/armor/shadow_garb_card.png', statBonuses: { Evasion: 2, SPD: 1 }, ability: null },
    { id: 2104, type: 'armor', name: 'Phantom Cloak', rarity: 'Epic', armorType: 'Light', art: '../img/armor/phantom_cloak_card.png', statBonuses: { Evasion: 3 }, ability: { name: 'Untouchable', description: 'Once per combat, the first time this hero is attacked, they ignore it.' } },

    // 2. Medium Armor (Balanced Defense & Utility)
    { id: 2201, type: 'armor', name: 'Studded Vest', rarity: 'Common', armorType: 'Medium', art: '../img/armor/studded_vest_card.png', statBonuses: { Block: 1, Evasion: 1 }, ability: null },
    { id: 2202, type: 'armor', name: 'Chainmail Guard', rarity: 'Uncommon', armorType: 'Medium', art: '../img/armor/chainmail_guard_card.png', statBonuses: { Block: 2 }, ability: null },
    { id: 2203, type: 'armor', name: 'Vanguard Mail', rarity: 'Rare', armorType: 'Medium', art: '../img/armor/vanguard_mail_card.png', statBonuses: { Block: 2 }, ability: { name: 'Thorns', description: 'When hit by a melee attack, reflect 1 damage back to the attacker.' } },
    { id: 2204, type: 'armor', name: 'Captain’s Bulwark', rarity: 'Epic', armorType: 'Medium', art: '../img/armor/captains_bulwark_card.png', statBonuses: { Block: 2 }, ability: { name: 'Inspiring Presence', description: 'Adjacent allies gain +1 Block.' } },

    // 3. Heavy Armor (Pure Damage Soak)
    { id: 2301, type: 'armor', name: 'Iron Plate', rarity: 'Common', armorType: 'Heavy', art: '../img/armor/iron_plate_card.png', statBonuses: { Block: 2 }, ability: null },
    { id: 2302, type: 'armor', name: 'Reinforced Plating', rarity: 'Uncommon', armorType: 'Heavy', art: '../img/armor/reinforced_plating_card.png', statBonuses: { Block: 3, SPD: -1 }, ability: null },
    { id: 2303, type: 'armor', name: 'Juggernaut Armor', rarity: 'Rare', armorType: 'Heavy', art: '../img/armor/juggernaut_armor_card.png', statBonuses: { Block: 3 }, ability: { name: 'Unstoppable', description: 'This hero is immune to Stun effects.' } },
    { id: 2304, type: 'armor', name: 'Aegis of the Colossus', rarity: 'Epic', armorType: 'Heavy', art: '../img/armor/aegis_of_the_colossus_card.png', statBonuses: { Block: 1 }, ability: { name: 'Aegis Protection', description: 'Once per combat, completely nullify the damage from one attack.' } },

    // 4. Magic Armor (Magical Defense)
    { id: 2401, type: 'armor', name: 'Mystic Robes', rarity: 'Common', armorType: 'Magic', art: '../img/armor/mystic_robes_card.png', statBonuses: { MagicResist: 2 }, ability: null },
    { id: 2402, type: 'armor', name: 'Arcane Shielding', rarity: 'Uncommon', armorType: 'Magic', art: '../img/armor/arcane_shielding_card.png', statBonuses: {}, ability: { name: 'Spell Ward', description: 'Once per combat, block the effects of the next enemy ability.' } },
    { id: 2403, type: 'armor', name: 'Runed Cloak', rarity: 'Rare', armorType: 'Magic', art: '../img/armor/runed_cloak_card.png', statBonuses: { MagicResist: 3, SPD: 1 }, ability: null },
    { id: 2404, type: 'armor', name: 'Ward of Eternity', rarity: 'Epic', armorType: 'Magic', art: '../img/armor/ward_of_eternity_card.png', statBonuses: { MagicResist: 2 }, ability: { name: 'Magic Immunity', description: 'This hero is immune to all magic damage.' } },
];
// NOTE: Placeholder art links ('...') and new IDs have been assigned. 'Block' reduces physical damage, 'MagicResist' reduces magic damage.

export const battleSpeeds = [
    { label: '0.5x', multiplier: 0.5 },
    { label: '1x', multiplier: 0.33 },
    { label: '2x', multiplier: 0.25 },
    { label: '3x', multiplier: 0.2 },
    { label: '4x', multiplier: 0.1 },
    { label: '5x', multiplier: 0.05 }
];
