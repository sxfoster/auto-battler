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

export const battleSpeeds = [
    { label: '1x', multiplier: 2 },
    { label: '2x', multiplier: 1 },
    { label: '0.5x', multiplier: 4 }
];
