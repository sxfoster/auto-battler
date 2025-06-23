// This file contains all the raw data for game entities.
// In a real application, this would likely be fetched from a server API.

const allPossibleHeroes = [
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

    // 9. Mystic Deceiver (Enchanter)
    { type: 'hero', id: 901, name: 'Trickster', class: 'Mystic Deceiver', rarity: 'Common', art: '../img/trickster_card.png', hp: 14, attack: 2, speed: 4, abilities: [] },
    { type: 'hero', id: 902, name: 'Illusionist', class: 'Mystic Deceiver', rarity: 'Uncommon', art: '../img/illusionist_card.png', hp: 19, attack: 3, speed: 4, abilities: [] },
    { type: 'hero', id: 903, name: 'Mesmerist', class: 'Mystic Deceiver', rarity: 'Rare', art: '../img/mesmerist_card.png', hp: 25, attack: 4, speed: 5, abilities: [] },
    { type: 'hero', id: 904, name: 'Mind Flayer', class: 'Mystic Deceiver', rarity: 'Epic', art: '../img/mind_flayer_card.png', hp: 32, attack: 5, speed: 5, abilities: [] },

    // 10. Shadow Striker (Rogue)
    { type: 'hero', id: 1001, name: 'Thug', class: 'Shadow Striker', rarity: 'Common', art: '../img/thug_card.png', hp: 13, attack: 6, speed: 6, abilities: [] },
    { type: 'hero', id: 1002, name: 'Cutthroat', class: 'Shadow Striker', rarity: 'Uncommon', art: '../img/cutthroat_card.png', hp: 18, attack: 8, speed: 6, abilities: [] },
    { type: 'hero', id: 1003, name: 'Shade', class: 'Shadow Striker', rarity: 'Rare', art: '../img/shade_card.png', hp: 24, attack: 11, speed: 7, abilities: [] },
    { type: 'hero', id: 1004, name: 'Nightblade', class: 'Shadow Striker', rarity: 'Epic', art: '../img/nightblade_card.png', hp: 30, attack: 14, speed: 7, abilities: [] },

    // 11. Arcane Savant (Wizard)
    { type: 'hero', id: 1101, name: 'Apprentice', class: 'Arcane Savant', rarity: 'Common', art: '../img/apprentice_card.png', hp: 13, attack: 3, speed: 4, abilities: [] },
    { type: 'hero', id: 1102, name: 'Mage', class: 'Arcane Savant', rarity: 'Uncommon', art: '../img/mage_card.png', hp: 18, attack: 4, speed: 4, abilities: [] },
    { type: 'hero', id: 1103, name: 'Archmage', class: 'Arcane Savant', rarity: 'Rare', art: '../img/archmage_card.png', hp: 24, attack: 5, speed: 5, abilities: [] },
    { type: 'hero', id: 1104, name: 'Grand Magus', class: 'Arcane Savant', rarity: 'Epic', art: '../img/grand_magus_card.png', hp: 30, attack: 6, speed: 5, abilities: [] },

    // === MONSTER ARCHETYPES ===
    // Archetype 1: Grave Titan
    { type: 'hero', id: 2001, name: 'Lesser Grave Titan', class: 'Grave Titan', rarity: 'Common', art: '../img/monsters/grave_titan_1.png', hp: 45, attack: 8, speed: 2, isMonster: true, trait: 'Stonehide: Reduces all incoming physical damage by 2.' },
    { type: 'hero', id: 2002, name: 'Grave Titan', class: 'Grave Titan', rarity: 'Uncommon', art: '../img/monsters/grave_titan_2.png', hp: 55, attack: 10, speed: 2, isMonster: true, trait: 'Stonehide: Reduces all incoming physical damage by 2.' },
    { type: 'hero', id: 2003, name: 'Elder Grave Titan', class: 'Grave Titan', rarity: 'Rare', art: '../img/monsters/grave_titan_3.png', hp: 68, attack: 13, speed: 2, isMonster: true, trait: 'Stonehide: Reduces all incoming physical damage by 2.' },
    { type: 'hero', id: 2004, name: 'World-Shaper Titan', class: 'Grave Titan', rarity: 'Epic', art: '../img/monsters/grave_titan_4.png', hp: 85, attack: 17, speed: 2, isMonster: true, trait: 'Stonehide: Reduces all incoming physical damage by 2.' },

    // Archetype 2: Brute
    { type: 'hero', id: 2101, name: 'Lesser Brute', class: 'Brute', rarity: 'Common', art: '../img/monsters/brute_1.png', hp: 40, attack: 12, speed: 3, isMonster: true, trait: 'Unstoppable: Cannot be Stunned or Rooted.' },
    { type: 'hero', id: 2102, name: 'War Brute', class: 'Brute', rarity: 'Uncommon', art: '../img/monsters/brute_2.png', hp: 50, attack: 15, speed: 3, isMonster: true, trait: 'Unstoppable: Cannot be Stunned or Rooted.' },
    { type: 'hero', id: 2103, name: 'Savage Brute', class: 'Brute', rarity: 'Rare', art: '../img/monsters/brute_3.png', hp: 62, attack: 19, speed: 3, isMonster: true, trait: 'Unstoppable: Cannot be Stunned or Rooted.' },
    { type: 'hero', id: 2104, name: 'Unchained Behemoth', class: 'Brute', rarity: 'Epic', art: '../img/monsters/brute_4.png', hp: 78, attack: 24, speed: 3, isMonster: true, trait: 'Unstoppable: Cannot be Stunned or Rooted.' },

    // Archetype 3: Frost Revenant
    { type: 'hero', id: 2201, name: 'Lesser Frost Revenant', class: 'Frost Revenant', rarity: 'Common', art: '../img/monsters/frost_revenant_1.png', hp: 38, attack: 7, speed: 4, isMonster: true, trait: 'Frozen Core: Immune to Slow effects.' },
    { type: 'hero', id: 2202, name: 'Frost Revenant', class: 'Frost Revenant', rarity: 'Uncommon', art: '../img/monsters/frost_revenant_2.png', hp: 48, attack: 9, speed: 4, isMonster: true, trait: 'Frozen Core: Immune to Slow effects.' },
    { type: 'hero', id: 2203, name: 'Elder Frost Revenant', class: 'Frost Revenant', rarity: 'Rare', art: '../img/monsters/frost_revenant_3.png', hp: 60, attack: 12, speed: 4, isMonster: true, trait: 'Frozen Core: Immune to Slow effects.' },
    { type: 'hero', id: 2204, name: 'Glacial Wraith', class: 'Frost Revenant', rarity: 'Epic', art: '../img/monsters/frost_revenant_4.png', hp: 74, attack: 16, speed: 4, isMonster: true, trait: 'Frozen Core: Immune to Slow effects.' },

    // Archetype 4: Blood Witch
    { type: 'hero', id: 2301, name: 'Novice Blood Witch', class: 'Blood Witch', rarity: 'Common', art: '../img/monsters/blood_witch_1.png', hp: 30, attack: 6, speed: 5, isMonster: true, trait: 'Blood Magic: Heals 1 HP whenever she deals damage.' },
    { type: 'hero', id: 2302, name: 'Blood Witch', class: 'Blood Witch', rarity: 'Uncommon', art: '../img/monsters/blood_witch_2.png', hp: 40, attack: 8, speed: 5, isMonster: true, trait: 'Blood Magic: Heals 1 HP whenever she deals damage.' },
    { type: 'hero', id: 2303, name: 'Elder Blood Witch', class: 'Blood Witch', rarity: 'Rare', art: '../img/monsters/blood_witch_3.png', hp: 52, attack: 11, speed: 5, isMonster: true, trait: 'Blood Magic: Heals 1 HP whenever she deals damage.' },
    { type: 'hero', id: 2304, name: 'Crimson Matriarch', class: 'Blood Witch', rarity: 'Epic', art: '../img/monsters/blood_witch_4.png', hp: 66, attack: 15, speed: 5, isMonster: true, trait: 'Blood Magic: Heals 1 HP whenever she deals damage.' },

    // Archetype 5: Infernal Beast
    { type: 'hero', id: 2401, name: 'Lesser Infernal Beast', class: 'Infernal Beast', rarity: 'Common', art: '../img/monsters/infernal_beast_1.png', hp: 42, attack: 11, speed: 4, isMonster: true, trait: 'Burning Rage: Deals 1 fire damage to attackers.' },
    { type: 'hero', id: 2402, name: 'Infernal Beast', class: 'Infernal Beast', rarity: 'Uncommon', art: '../img/monsters/infernal_beast_2.png', hp: 52, attack: 13, speed: 4, isMonster: true, trait: 'Burning Rage: Deals 1 fire damage to attackers.' },
    { type: 'hero', id: 2403, name: 'Greater Infernal Beast', class: 'Infernal Beast', rarity: 'Rare', art: '../img/monsters/infernal_beast_3.png', hp: 64, attack: 16, speed: 4, isMonster: true, trait: 'Burning Rage: Deals 1 fire damage to attackers.' },
    { type: 'hero', id: 2404, name: 'Apocalyptic Behemoth', class: 'Infernal Beast', rarity: 'Epic', art: '../img/monsters/infernal_beast_4.png', hp: 78, attack: 20, speed: 4, isMonster: true, trait: 'Burning Rage: Deals 1 fire damage to attackers.' },

    // Archetype 6: Necromancer
    { type: 'hero', id: 2501, name: 'Apprentice Necromancer', class: 'Necromancer', rarity: 'Common', art: '../img/monsters/necromancer_1.png', hp: 32, attack: 6, speed: 3, isMonster: true, trait: 'Soul Harvest: Gain 1 energy when a minion dies.' },
    { type: 'hero', id: 2502, name: 'Necromancer', class: 'Necromancer', rarity: 'Uncommon', art: '../img/monsters/necromancer_2.png', hp: 42, attack: 8, speed: 3, isMonster: true, trait: 'Soul Harvest: Gain 1 energy when a minion dies.' },
    { type: 'hero', id: 2503, name: 'Bone Weaver', class: 'Necromancer', rarity: 'Rare', art: '../img/monsters/necromancer_3.png', hp: 54, attack: 11, speed: 3, isMonster: true, trait: 'Soul Harvest: Gain 1 energy when a minion dies.' },
    { type: 'hero', id: 2504, name: 'Lich Lord', class: 'Necromancer', rarity: 'Epic', art: '../img/monsters/necromancer_4.png', hp: 68, attack: 15, speed: 3, isMonster: true, trait: 'Soul Harvest: Gain 1 energy when a minion dies.' },

    // Archetype 7: Shadowfiend
    { type: 'hero', id: 2601, name: 'Lesser Shadowfiend', class: 'Shadowfiend', rarity: 'Common', art: '../img/monsters/shadowfiend_1.png', hp: 35, attack: 10, speed: 6, isMonster: true, trait: 'Shadowstep: Starts with +1 Evasion.' },
    { type: 'hero', id: 2602, name: 'Shadowfiend', class: 'Shadowfiend', rarity: 'Uncommon', art: '../img/monsters/shadowfiend_2.png', hp: 45, attack: 12, speed: 6, isMonster: true, trait: 'Shadowstep: Starts with +1 Evasion.' },
    { type: 'hero', id: 2603, name: 'Night Terror', class: 'Shadowfiend', rarity: 'Rare', art: '../img/monsters/shadowfiend_3.png', hp: 57, attack: 15, speed: 6, isMonster: true, trait: 'Shadowstep: Starts with +1 Evasion.' },
    { type: 'hero', id: 2604, name: 'Umbral Devourer', class: 'Shadowfiend', rarity: 'Epic', art: '../img/monsters/shadowfiend_4.png', hp: 71, attack: 19, speed: 6, isMonster: true, trait: 'Shadowstep: Starts with +1 Evasion.' },

    // Archetype 8: Storm Serpent
    { type: 'hero', id: 2701, name: 'Young Storm Serpent', class: 'Storm Serpent', rarity: 'Common', art: '../img/monsters/storm_serpent_1.png', hp: 38, attack: 9, speed: 7, isMonster: true, trait: 'Stormborn: Immune to Shock.' },
    { type: 'hero', id: 2702, name: 'Storm Serpent', class: 'Storm Serpent', rarity: 'Uncommon', art: '../img/monsters/storm_serpent_2.png', hp: 48, attack: 11, speed: 7, isMonster: true, trait: 'Stormborn: Immune to Shock.' },
    { type: 'hero', id: 2703, name: 'Elder Storm Serpent', class: 'Storm Serpent', rarity: 'Rare', art: '../img/monsters/storm_serpent_3.png', hp: 60, attack: 14, speed: 7, isMonster: true, trait: 'Stormborn: Immune to Shock.' },
    { type: 'hero', id: 2704, name: 'Tempest Leviathan', class: 'Storm Serpent', rarity: 'Epic', art: '../img/monsters/storm_serpent_4.png', hp: 74, attack: 18, speed: 7, isMonster: true, trait: 'Stormborn: Immune to Shock.' },

    // Archetype 9: Venomspawn
    { type: 'hero', id: 2801, name: 'Lesser Venomspawn', class: 'Venomspawn', rarity: 'Common', art: '../img/monsters/venomspawn_1.png', hp: 32, attack: 8, speed: 5, isMonster: true, trait: 'Toxic Blood: Poisons melee attackers.' },
    { type: 'hero', id: 2802, name: 'Venomspawn', class: 'Venomspawn', rarity: 'Uncommon', art: '../img/monsters/venomspawn_2.png', hp: 42, attack: 10, speed: 5, isMonster: true, trait: 'Toxic Blood: Poisons melee attackers.' },
    { type: 'hero', id: 2803, name: 'Toxic Horror', class: 'Venomspawn', rarity: 'Rare', art: '../img/monsters/venomspawn_3.png', hp: 54, attack: 13, speed: 5, isMonster: true, trait: 'Toxic Blood: Poisons melee attackers.' },
    { type: 'hero', id: 2804, name: 'Plague Serpent', class: 'Venomspawn', rarity: 'Epic', art: '../img/monsters/venomspawn_4.png', hp: 68, attack: 17, speed: 5, isMonster: true, trait: 'Toxic Blood: Poisons melee attackers.' },

    // Archetype 10: Void Horror
    { type: 'hero', id: 2901, name: 'Lesser Void Horror', class: 'Void Horror', rarity: 'Common', art: '../img/monsters/void_horror_1.png', hp: 37, attack: 9, speed: 5, isMonster: true, trait: 'Reality Warp: 25% chance to ignore damage.' },
    { type: 'hero', id: 2902, name: 'Void Horror', class: 'Void Horror', rarity: 'Uncommon', art: '../img/monsters/void_horror_2.png', hp: 47, attack: 11, speed: 5, isMonster: true, trait: 'Reality Warp: 25% chance to ignore damage.' },
    { type: 'hero', id: 2903, name: 'Eldritch Abomination', class: 'Void Horror', rarity: 'Rare', art: '../img/monsters/void_horror_3.png', hp: 59, attack: 14, speed: 5, isMonster: true, trait: 'Reality Warp: 25% chance to ignore damage.' },
    { type: 'hero', id: 2904, name: 'Reality Devourer', class: 'Void Horror', rarity: 'Epic', art: '../img/monsters/void_horror_4.png', hp: 73, attack: 18, speed: 5, isMonster: true, trait: 'Reality Warp: 25% chance to ignore damage.' },
];

const allPossibleMinions = {
    SKELETON: {
        id: 'MINION_SKELETON',
        name: 'Skeleton',
        art: '../img/skeleton_card.png',
        rarity: 'Common',
        hp: 10,
        attack: 3,
        speed: 4,
        abilities: [],
        isMinion: true
    },
    GOLEM: {
        id: 'MINION_GOLEM',
        name: 'Rock Golem',
        art: '../img/golem_card.png',
        rarity: 'Uncommon',
        hp: 20,
        attack: 2,
        speed: 2,
        isMinion: true
    },
    WOLF: {
        id: 'MINION_WOLF',
        name: 'Wolf',
        art: '../img/wolf_card.png',
        rarity: 'Common',
        hp: 8,
        attack: 2,
        speed: 5,
        abilities: [],
        isMinion: true
    },
    BEAR: {
        id: 'MINION_BEAR',
        name: 'Bear',
        art: '../img/bear_card.png',
        rarity: 'Uncommon',
        hp: 15,
        attack: 3,
        speed: 3,
        abilities: [],
        isMinion: true
    },
    FALCON: {
        id: 'MINION_FALCON',
        name: 'Falcon',
        art: '../img/falcon_card.png',
        rarity: 'Rare',
        hp: 6,
        attack: 1,
        speed: 7,
        abilities: [],
        isMinion: true
    }
};

const allPossibleWeapons = [
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

const allPossibleAbilities = [
    // === Stalwart Defender (Warrior) ===
    // Common
    { id: 3111, type: 'ability', name: 'Power Strike', class: 'Stalwart Defender', rarity: 'Common', art: 'https://placehold.co/150x126/ef4444/FFFFFF?text=Ability', effect: 'Deal 2 damage to one enemy.', energyCost: 1, category: 'Offense' },
    { id: 3112, type: 'ability', name: 'Fortify', class: 'Stalwart Defender', rarity: 'Common', art: 'https://placehold.co/150x126/ef4444/FFFFFF?text=Ability', effect: 'Reduce all incoming damage by 1 for 2 turns.', energyCost: 1, category: 'Defense' },
    { id: 3113, type: 'ability', name: 'Shield Bash', class: 'Stalwart Defender', rarity: 'Common', art: 'https://placehold.co/150x126/ef4444/FFFFFF?text=Ability', effect: 'Deal 1 damage and stun the enemy for 1 turn.', energyCost: 1, category: 'Support' },
    // Uncommon
    { id: 3121, type: 'ability', name: 'Crippling Blow', class: 'Stalwart Defender', rarity: 'Uncommon', art: 'https://placehold.co/150x126/ef4444/FFFFFF?text=Ability', effect: 'Deal 3 damage and reduce the enemy’s attack by 1 next turn.', energyCost: 2, category: 'Offense' },
    { id: 3122, type: 'ability', name: 'Parry & Riposte', class: 'Stalwart Defender', rarity: 'Uncommon', art: 'https://placehold.co/150x126/ef4444/FFFFFF?text=Ability', effect: 'Block next attack; if successful, counterattack for 2 damage.', energyCost: 2, category: 'Defense' },
    { id: 3123, type: 'ability', name: 'Battle Roar', class: 'Stalwart Defender', rarity: 'Uncommon', art: 'https://placehold.co/150x126/ef4444/FFFFFF?text=Ability', effect: 'Gain +2 attack on your next attack.', energyCost: 2, category: 'Support' },
    // Rare
    { id: 3131, type: 'ability', name: 'Whirlwind Slash', class: 'Stalwart Defender', rarity: 'Rare', art: 'https://placehold.co/150x126/ef4444/FFFFFF?text=Ability', effect: 'Deal 2 damage to all enemies.', energyCost: 3, category: 'Offense', env_effect: 'wind', target: 'ENEMIES' },
    { id: 3132, type: 'ability', name: 'Blood Frenzy', class: 'Stalwart Defender', rarity: 'Rare', art: 'https://placehold.co/150x126/ef4444/FFFFFF?text=Ability', effect: 'If under 50% HP, gain +2 attacks this turn.', energyCost: 3, category: 'Defense' },
    { id: 3133, type: 'ability', name: 'Relentless Pursuit', class: 'Stalwart Defender', rarity: 'Rare', art: 'https://placehold.co/150x126/ef4444/FFFFFF?text=Ability', effect: 'Deal 3 damage and take an extra action if this kills the target.', energyCost: 3, category: 'Support' },
    // Epic
    { id: 3141, type: 'ability', name: 'Juggernaut Charge', class: 'Stalwart Defender', rarity: 'Epic', art: 'https://placehold.co/150x126/ef4444/FFFFFF?text=Ability', effect: 'Deal 5 damage to one enemy and stun for 1 turn.', energyCost: 4, category: 'Offense' },
    { id: 3142, type: 'ability', name: 'Champion’s Wrath', class: 'Stalwart Defender', rarity: 'Epic', art: 'https://placehold.co/150x126/ef4444/FFFFFF?text=Ability', effect: 'Deal 4 damage to all enemies. If you KO at least 1 enemy, gain another full turn immediately.', energyCost: 4, category: 'Defense', target: 'ENEMIES' },
    { id: 3143, type: 'ability', name: 'Last Stand', class: 'Stalwart Defender', rarity: 'Epic', art: 'https://placehold.co/150x126/ef4444/FFFFFF?text=Ability', effect: 'If under 25% HP, all attacks this turn deal double damage.', energyCost: 4, category: 'Support' },

    // === Holy Warrior (Paladin) ===
    // Common
    { id: 3211, type: 'ability', name: 'Divine Strike', class: 'Holy Warrior', rarity: 'Common', art: 'https://placehold.co/150x126/ef4444/FFFFFF?text=Ability', effect: 'Deal 2 damage and heal yourself for 2 HP.', energyCost: 1, category: 'Offense' },
    { id: 3212, type: 'ability', name: 'Righteous Shield', class: 'Holy Warrior', rarity: 'Common', art: 'https://placehold.co/150x126/ef4444/FFFFFF?text=Ability', effect: 'Block the next attack completely.', energyCost: 1, category: 'Defense' },
    { id: 3213, type: 'ability', name: 'Holy Light', class: 'Holy Warrior', rarity: 'Common', art: 'https://placehold.co/150x126/ef4444/FFFFFF?text=Ability', effect: 'Heal an ally for 4 HP.', energyCost: 1, category: 'Support' },
    // Uncommon
    { id: 3221, type: 'ability', name: 'Judgment', class: 'Holy Warrior', rarity: 'Uncommon', art: 'https://placehold.co/150x126/ef4444/FFFFFF?text=Ability', effect: 'Deal 3 damage and reduce the enemy’s defense by 1 for 2 turns.', energyCost: 2, category: 'Offense' },
    { id: 3222, type: 'ability', name: 'Aegis Aura', class: 'Holy Warrior', rarity: 'Uncommon', art: 'https://placehold.co/150x126/ef4444/FFFFFF?text=Ability', effect: 'All allies reduce incoming damage by 1 for 2 turns.', energyCost: 2, category: 'Defense', target: 'ALLIES' },
    { id: 3223, type: 'ability', name: 'Blessing of Valor', class: 'Holy Warrior', rarity: 'Uncommon', art: 'https://placehold.co/150x126/ef4444/FFFFFF?text=Ability', effect: 'All allies gain +1 attack and +1 defense for 2 turns.', energyCost: 2, category: 'Support', target: 'ALLIES' },
    // Rare
    { id: 3231, type: 'ability', name: 'Radiant Smite', class: 'Holy Warrior', rarity: 'Rare', art: 'https://placehold.co/150x126/ef4444/FFFFFF?text=Ability', effect: 'Deal 4 holy damage and stun the enemy if they are undead/dark-aligned.', energyCost: 3, category: 'Offense' },
    { id: 3232, type: 'ability', name: 'Sacred Vow', class: 'Holy Warrior', rarity: 'Rare', art: 'https://placehold.co/150x126/ef4444/FFFFFF?text=Ability', effect: 'You take half damage and cannot be debuffed for 2 turns.', energyCost: 3, category: 'Defense' },
    { id: 3233, type: 'ability', name: 'Lay on Hands', class: 'Holy Warrior', rarity: 'Rare', art: 'https://placehold.co/150x126/ef4444/FFFFFF?text=Ability', effect: 'Fully heal one ally to max HP.', energyCost: 3, category: 'Support' },
    // Epic
    { id: 3241, type: 'ability', name: 'Light’s Wrath', class: 'Holy Warrior', rarity: 'Epic', art: 'https://placehold.co/150x126/ef4444/FFFFFF?text=Ability', effect: 'Deal 5 holy damage to all enemies and heal all allies for 5 HP.', energyCost: 4, category: 'Offense', target: 'ENEMIES' },
    { id: 3242, type: 'ability', name: 'Divine Intervention', class: 'Holy Warrior', rarity: 'Epic', art: 'https://placehold.co/150x126/ef4444/FFFFFF?text=Ability', effect: 'Prevent all allies from taking damage this turn (total immunity).', energyCost: 4, category: 'Defense', target: 'ALLIES' },
    { id: 3243, type: 'ability', name: 'Resurrection', class: 'Holy Warrior', rarity: 'Epic', art: 'https://placehold.co/150x126/ef4444/FFFFFF?text=Ability', effect: 'Revive a fallen ally at 75% HP.', energyCost: 4, category: 'Support' },

    // === Raging Fighter (Barbarian) ===
    // Common
    { id: 3311, type: 'ability', name: 'Reckless Charge', class: 'Raging Fighter', rarity: 'Common', art: 'https://placehold.co/150x126/ef4444/FFFFFF?text=Ability', effect: 'Deal 2 damage to all enemies, but you take 1 self-damage.', energyCost: 1, category: 'Offense', target: 'ENEMIES' },
    { id: 3312, type: 'ability', name: 'Raging Strike', class: 'Raging Fighter', rarity: 'Common', art: 'https://placehold.co/150x126/ef4444/FFFFFF?text=Ability', effect: 'Deal 3 damage, but reduce your defense by 1 until next turn.', energyCost: 1, category: 'Defense' },
    { id: 3313, type: 'ability', name: 'Battle Roar', class: 'Raging Fighter', rarity: 'Common', art: 'https://placehold.co/150x126/ef4444/FFFFFF?text=Ability', effect: 'Gain +2 attack for 2 turns.', energyCost: 1, category: 'Support' },
    // Uncommon
    { id: 3321, type: 'ability', name: 'Savage Cleave', class: 'Raging Fighter', rarity: 'Uncommon', art: 'https://placehold.co/150x126/ef4444/FFFFFF?text=Ability', effect: 'Deal 4 damage to one enemy. If you kill them, gain +1 attack on your next action.', energyCost: 2, category: 'Offense', env_effect: 'wind' },
    { id: 3322, type: 'ability', name: 'Frenzied Defense', class: 'Raging Fighter', rarity: 'Uncommon', art: 'https://placehold.co/150x126/ef4444/FFFFFF?text=Ability', effect: 'Take -2 damage reduction this turn and deal 2 damage back when attacked.', energyCost: 2, category: 'Defense' },
    { id: 3323, type: 'ability', name: 'Unbreakable Will', class: 'Raging Fighter', rarity: 'Uncommon', art: 'https://placehold.co/150x126/ef4444/FFFFFF?text=Ability', effect: 'Prevent defeat if your HP would drop to 0 this turn (survive with 1 HP).', energyCost: 2, category: 'Support' },
    // Rare
    { id: 3331, type: 'ability', name: 'Bloodbath', class: 'Raging Fighter', rarity: 'Rare', art: 'https://placehold.co/150x126/ef4444/FFFFFF?text=Ability', effect: 'Deal 3 damage to all enemies. For each enemy hit, gain +1 attack next turn.', energyCost: 3, category: 'Offense', target: 'ENEMIES' },
    { id: 3332, type: 'ability', name: 'Warlord’s Challenge', class: 'Raging Fighter', rarity: 'Rare', art: 'https://placehold.co/150x126/ef4444/FFFFFF?text=Ability', effect: 'Force all enemies to target you next turn and gain +2 defense.', energyCost: 3, category: 'Defense', target: 'ENEMIES' },
    { id: 3333, type: 'ability', name: 'Last Stand', class: 'Raging Fighter', rarity: 'Rare', art: 'https://placehold.co/150x126/ef4444/FFFFFF?text=Ability', effect: 'If under 50% HP, all attacks this turn deal double damage.', energyCost: 3, category: 'Support' },
    // Epic
    { id: 3341, type: 'ability', name: 'Titan Breaker', class: 'Raging Fighter', rarity: 'Epic', art: 'https://placehold.co/150x126/ef4444/FFFFFF?text=Ability', effect: 'Deal 7 damage to a single enemy and ignore all their defenses/armor.', energyCost: 4, category: 'Offense' },
    { id: 3342, type: 'ability', name: 'Berserker’s Rage', class: 'Raging Fighter', rarity: 'Epic', art: 'https://placehold.co/150x126/ef4444/FFFFFF?text=Ability', effect: 'For 2 turns, all attacks deal +2 damage and you cannot be stunned or debuffed.', energyCost: 4, category: 'Defense' },
    { id: 3343, type: 'ability', name: 'Unending Rage', class: 'Raging Fighter', rarity: 'Epic', art: 'https://placehold.co/150x126/ef4444/FFFFFF?text=Ability', effect: 'Your abilities cost 1 less energy for the rest of combat.', energyCost: 4, category: 'Support' },

    // === Raw Power Mage (Sorcerer) ===
    // Common
    { id: 3411, type: 'ability', name: 'Chaos Bolt', class: 'Raw Power Mage', rarity: 'Common', art: 'https://placehold.co/150x126/ef4444/FFFFFF?text=Ability', effect: 'Deal 3 damage of a random element.', energyCost: 1, category: 'Offense' },
    { id: 3412, type: 'ability', name: 'Mana Surge', class: 'Raw Power Mage', rarity: 'Common', art: 'https://placehold.co/150x126/ef4444/FFFFFF?text=Ability', effect: 'Restore 2 energy and gain +1 attack for spells this turn.', energyCost: 1, category: 'Support' },
    { id: 3413, type: 'ability', name: 'Elemental Spark', class: 'Raw Power Mage', rarity: 'Common', art: 'https://placehold.co/150x126/ef4444/FFFFFF?text=Ability', effect: 'Deal 2 damage and apply a random debuff.', energyCost: 1, category: 'Defense' },
    // Uncommon
    { id: 3421, type: 'ability', name: 'Arcane Explosion', class: 'Raw Power Mage', rarity: 'Uncommon', art: 'https://placehold.co/150x126/ef4444/FFFFFF?text=Ability', effect: 'Deal 2 damage to all enemies.', energyCost: 2, category: 'Offense', target: 'ENEMIES' },
    { id: 3422, type: 'ability', name: 'Elemental Infusion', class: 'Raw Power Mage', rarity: 'Uncommon', art: 'https://placehold.co/150x126/ef4444/FFFFFF?text=Ability', effect: 'All spells deal +1 damage for 2 turns.', energyCost: 2, category: 'Support' },
    { id: 3423, type: 'ability', name: 'Chain Lightning', class: 'Raw Power Mage', rarity: 'Uncommon', art: 'https://placehold.co/150x126/ef4444/FFFFFF?text=Ability', effect: 'Deal 3 lightning damage to one enemy and 2 to another.', energyCost: 2, category: 'Offense' },
    // Rare
    { id: 3431, type: 'ability', name: 'Firestorm', class: 'Raw Power Mage', rarity: 'Rare', art: 'https://placehold.co/150x126/ef4444/FFFFFF?text=Ability', effect: 'Deal 3 fire damage to all enemies and apply Burn.', energyCost: 3, category: 'Offense', target: 'ENEMIES', elementType: 'fire' },
    { id: 3432, type: 'ability', name: 'Elemental Rift', class: 'Raw Power Mage', rarity: 'Rare', art: 'https://placehold.co/150x126/ef4444/FFFFFF?text=Ability', effect: 'Deal 4 damage of a random element and root the enemy.', energyCost: 3, category: 'Offense' },
    { id: 3433, type: 'ability', name: 'Spell Mirror', class: 'Raw Power Mage', rarity: 'Rare', art: 'https://placehold.co/150x126/ef4444/FFFFFF?text=Ability', effect: 'Reflect the next magical attack back at the caster.', energyCost: 3, category: 'Defense' },
    { id: 3434, type: 'ability', name: 'Frozen Grasp', class: 'Raw Power Mage', rarity: 'Rare', art: 'https://placehold.co/150x126/3fa9f5/FFFFFF?text=Ability', effect: 'Deal 3 ice damage and root the enemy for 1 turn.', energyCost: 3, category: 'Offense', elementType: 'ice' },
    // Epic
    { id: 3441, type: 'ability', name: 'Annihilation Sphere', class: 'Raw Power Mage', rarity: 'Epic', art: 'https://placehold.co/150x126/ef4444/FFFFFF?text=Ability', effect: 'Deal 5 damage to all enemies and apply random status effects.', energyCost: 4, category: 'Offense', target: 'ENEMIES' },
    { id: 3442, type: 'ability', name: 'Chaos Mastery', class: 'Raw Power Mage', rarity: 'Epic', art: 'https://placehold.co/150x126/ef4444/FFFFFF?text=Ability', effect: 'For 3 turns, spells deal +2 damage and cannot be resisted.', energyCost: 4, category: 'Support' },
    { id: 3443, type: 'ability', name: 'Elemental Fury', class: 'Raw Power Mage', rarity: 'Epic', art: 'https://placehold.co/150x126/ef4444/FFFFFF?text=Ability', effect: 'Deal 6 damage of a random element to one enemy.', energyCost: 4, category: 'Offense' },

    // === Divine Healer (Cleric) ===
    // Common
    { id: 3511, type: 'ability', name: 'Divine Light', class: 'Divine Healer', rarity: 'Common', art: 'https://placehold.co/150x126/ef4444/FFFFFF?text=Ability', effect: 'Heal an ally for 4 HP.', energyCost: 1, category: 'Support' },
    { id: 3512, type: 'ability', name: 'Smite Evil', class: 'Divine Healer', rarity: 'Common', art: 'https://placehold.co/150x126/ef4444/FFFFFF?text=Ability', effect: 'Deal 2 damage, or 4 to undead enemies.', energyCost: 1, category: 'Offense' },
    { id: 3513, type: 'ability', name: 'Holy Barrier', class: 'Divine Healer', rarity: 'Common', art: 'https://placehold.co/150x126/ef4444/FFFFFF?text=Ability', effect: 'Reduce all damage taken by allies by 1 this turn.', energyCost: 1, category: 'Defense', target: 'ALLIES' },
    // Uncommon
    { id: 3521, type: 'ability', name: 'Bless', class: 'Divine Healer', rarity: 'Uncommon', art: 'https://placehold.co/150x126/ef4444/FFFFFF?text=Ability', effect: 'All allies gain +1 attack and +1 evasion for 2 turns.', energyCost: 2, category: 'Support', target: 'ALLIES' },
    { id: 3522, type: 'ability', name: 'Purify', class: 'Divine Healer', rarity: 'Uncommon', art: 'https://placehold.co/150x126/ef4444/FFFFFF?text=Ability', effect: 'Remove all negative effects from an ally and heal 3 HP.', energyCost: 2, category: 'Defense' },
    { id: 3523, type: 'ability', name: 'Sacred Shield', class: 'Divine Healer', rarity: 'Uncommon', art: 'https://placehold.co/150x126/ef4444/FFFFFF?text=Ability', effect: 'One ally becomes immune to damage this turn.', energyCost: 2, category: 'Defense' },
    // Rare
    { id: 3531, type: 'ability', name: 'Judgment', class: 'Divine Healer', rarity: 'Rare', art: 'https://placehold.co/150x126/ef4444/FFFFFF?text=Ability', effect: 'Deal 3 damage and reduce enemy defense by 1 for 2 turns.', energyCost: 3, category: 'Offense' },
    { id: 3532, type: 'ability', name: 'Radiant Wave', class: 'Divine Healer', rarity: 'Rare', art: 'https://placehold.co/150x126/ef4444/FFFFFF?text=Ability', effect: 'Heal all allies for 3 HP and remove one debuff each.', energyCost: 3, category: 'Support', target: 'ALLIES' },
    { id: 3533, type: 'ability', name: 'Divine Retribution', class: 'Divine Healer', rarity: 'Rare', art: 'https://placehold.co/150x126/ef4444/FFFFFF?text=Ability', effect: 'Deal 3 damage to all enemies and heal allies for 2 HP.', energyCost: 3, category: 'Offense', target: 'ENEMIES' },
    // Epic
    { id: 3541, type: 'ability', name: 'Lay on Hands', class: 'Divine Healer', rarity: 'Epic', art: 'https://placehold.co/150x126/ef4444/FFFFFF?text=Ability', effect: 'Fully restore one ally’s HP.', energyCost: 4, category: 'Support' },
    { id: 3542, type: 'ability', name: 'Resurrect', class: 'Divine Healer', rarity: 'Epic', art: 'https://placehold.co/150x126/ef4444/FFFFFF?text=Ability', effect: 'Revive a fallen ally at 50% HP and remove all debuffs.', energyCost: 4, category: 'Support' },
    { id: 3543, type: 'ability', name: 'Heaven’s Fury', class: 'Divine Healer', rarity: 'Epic', art: 'https://placehold.co/150x126/ef4444/FFFFFF?text=Ability', effect: 'Deal 5 holy damage to undead enemies.', energyCost: 4, category: 'Offense' },

    // === Nature Shaper (Druid) ===
    // Common
    { id: 3611, type: 'ability', name: 'Nature’s Wrath', class: 'Nature Shaper', rarity: 'Common', art: 'https://placehold.co/150x126/ef4444/FFFFFF?text=Ability', effect: 'Deal 1 damage and apply Poison 1 for 2 turns.', energyCost: 1, category: 'Offense' },
    { id: 3612, type: 'ability', name: 'Regrowth', class: 'Nature Shaper', rarity: 'Common', art: 'https://placehold.co/150x126/ef4444/FFFFFF?text=Ability', effect: 'Heal an ally for 2 HP per turn over 3 turns.', energyCost: 1, category: 'Support' },
    { id: 3613, type: 'ability', name: 'Entangle', class: 'Nature Shaper', rarity: 'Common', art: 'https://placehold.co/150x126/ef4444/FFFFFF?text=Ability', effect: 'Root an enemy; they cannot act next turn.', energyCost: 1, category: 'Defense' },
    // Uncommon
    { id: 3621, type: 'ability', name: 'Wild Growth', class: 'Nature Shaper', rarity: 'Uncommon', art: 'https://placehold.co/150x126/ef4444/FFFFFF?text=Ability', effect: 'Heal all allies for 2 HP and give +1 defense for 1 turn.', energyCost: 2, category: 'Support', target: 'ALLIES' },
    { id: 3622, type: 'ability', name: 'Shapeshift – Bear Form', class: 'Nature Shaper', rarity: 'Uncommon', art: 'https://placehold.co/150x126/ef4444/FFFFFF?text=Ability', effect: 'Gain +2 attack and +2 defense for 2 turns, then revert.', energyCost: 2, category: 'Defense' },
    { id: 3623, type: 'ability', name: 'Venom Thorns', class: 'Nature Shaper', rarity: 'Uncommon', art: 'https://placehold.co/150x126/ef4444/FFFFFF?text=Ability', effect: 'Deal 2 damage. Deals double damage to Poisoned targets. If enemy attacks next turn they take 2 poison damage.', energyCost: 2, category: 'Offense',
      synergy: { condition: 'Poison', bonus_multiplier: 2 } },
    // Rare
    { id: 3631, type: 'ability', name: 'Shapeshift – Wolf Form', class: 'Nature Shaper', rarity: 'Rare', art: 'https://placehold.co/150x126/ef4444/FFFFFF?text=Ability', effect: 'Gain +2 speed and +1 attack for 3 turns, then revert.', energyCost: 3, category: 'Offense' },
    { id: 3632, type: 'ability', name: 'Poison Storm', class: 'Nature Shaper', rarity: 'Rare', art: 'https://placehold.co/150x126/ef4444/FFFFFF?text=Ability', effect: 'Deal 1 damage to all enemies and poison them for 2 turns.', energyCost: 3, category: 'Offense', target: 'ENEMIES' },
    { id: 3633, type: 'ability', name: 'Barkskin', class: 'Nature Shaper', rarity: 'Rare', art: 'https://placehold.co/150x126/ef4444/FFFFFF?text=Ability', effect: 'All allies reduce damage by 2 for 1 turn.', energyCost: 3, category: 'Defense', target: 'ALLIES' },
    // Epic
    { id: 3641, type: 'ability', name: 'Avatar of the Wild', class: 'Nature Shaper', rarity: 'Epic', art: 'https://placehold.co/150x126/ef4444/FFFFFF?text=Ability', effect: 'Shapeshift into Avatar form for 3 turns; attacks poison enemies.', energyCost: 4, category: 'Offense' },
    { id: 3642, type: 'ability', name: 'Nature’s Renewal', class: 'Nature Shaper', rarity: 'Epic', art: 'https://placehold.co/150x126/ef4444/FFFFFF?text=Ability', effect: 'Heal all allies for 6 HP and remove all debuffs.', energyCost: 4, category: 'Support', target: 'ALLIES' },
    { id: 3643, type: 'ability', name: 'Elemental Harmony', class: 'Nature Shaper', rarity: 'Epic', art: 'https://placehold.co/150x126/ef4444/FFFFFF?text=Ability', effect: 'Allies gain Poison immunity and +1 attack for 2 turns.', energyCost: 4, category: 'Support', target: 'ALLIES' },

    // === Inspiring Artist (Bard) ===
    // Common
    { id: 3711, type: 'ability', name: 'Inspiring Tune', class: 'Inspiring Artist', rarity: 'Common', art: 'https://placehold.co/150x126/ef4444/FFFFFF?text=Ability', effect: 'All allies gain +1 attack for 2 turns.', energyCost: 1, category: 'Support', target: 'ALLIES' },
    { id: 3712, type: 'ability', name: 'Dissonant Chord', class: 'Inspiring Artist', rarity: 'Common', art: 'https://placehold.co/150x126/ef4444/FFFFFF?text=Ability', effect: 'Deal 1 damage and reduce enemy attack by 1 next turn.', energyCost: 1, category: 'Offense' },
    { id: 3713, type: 'ability', name: 'Quick Tempo', class: 'Inspiring Artist', rarity: 'Common', art: 'https://placehold.co/150x126/ef4444/FFFFFF?text=Ability', effect: 'Choose an ally: they may immediately take 1 extra action.', energyCost: 1, category: 'Defense' },
    // Uncommon
    { id: 3721, type: 'ability', name: 'Song of Restoration', class: 'Inspiring Artist', rarity: 'Uncommon', art: 'https://placehold.co/150x126/ef4444/FFFFFF?text=Ability', effect: 'Heal an ally for 3 HP per turn over 2 turns.', energyCost: 2, category: 'Support' },
    { id: 3722, type: 'ability', name: 'Encore', class: 'Inspiring Artist', rarity: 'Uncommon', art: 'https://placehold.co/150x126/ef4444/FFFFFF?text=Ability', effect: 'Replay your last Bard ability.', energyCost: 2, category: 'Support' },
    { id: 3723, type: 'ability', name: 'Harmony', class: 'Inspiring Artist', rarity: 'Uncommon', art: 'https://placehold.co/150x126/ef4444/FFFFFF?text=Ability', effect: 'Buff all allies: +1 attack and +1 evasion for 1 turn.', energyCost: 2, category: 'Defense', target: 'ALLIES' },
    // Rare
    { id: 3731, type: 'ability', name: 'Ballad of Courage', class: 'Inspiring Artist', rarity: 'Rare', art: 'https://placehold.co/150x126/ef4444/FFFFFF?text=Ability', effect: 'All allies gain +2 attack and +2 speed for 2 turns.', energyCost: 3, category: 'Support', target: 'ALLIES' },
    { id: 3732, type: 'ability', name: 'Discordant Blast', class: 'Inspiring Artist', rarity: 'Rare', art: 'https://placehold.co/150x126/ef4444/FFFFFF?text=Ability', effect: 'Deal 2 damage to all enemies and reduce their attack by 1.', energyCost: 3, category: 'Offense', target: 'ENEMIES' },
    { id: 3733, type: 'ability', name: 'Rhythm Shift', class: 'Inspiring Artist', rarity: 'Rare', art: 'https://placehold.co/150x126/ef4444/FFFFFF?text=Ability', effect: 'Swap turn order so an ally goes first.', energyCost: 3, category: 'Defense' },
    // Epic
    { id: 3741, type: 'ability', name: 'Crescendo', class: 'Inspiring Artist', rarity: 'Epic', art: 'https://placehold.co/150x126/ef4444/FFFFFF?text=Ability', effect: 'All allies gain +3 attack and take an immediate action.', energyCost: 4, category: 'Support', target: 'ALLIES' },
    { id: 3742, type: 'ability', name: 'Song of Rebirth', class: 'Inspiring Artist', rarity: 'Epic', art: 'https://placehold.co/150x126/ef4444/FFFFFF?text=Ability', effect: 'Revive all fallen allies at 50% HP.', energyCost: 4, category: 'Support', target: 'ALLIES' },
    { id: 3743, type: 'ability', name: 'Finale', class: 'Inspiring Artist', rarity: 'Epic', art: 'https://placehold.co/150x126/ef4444/FFFFFF?text=Ability', effect: 'Deal 4 damage to all enemies.', energyCost: 4, category: 'Offense', target: 'ENEMIES' },

    // === Wilderness Expert (Ranger) ===
    // Common
    { id: 3811, type: 'ability', name: 'Precision Shot', class: 'Wilderness Expert', rarity: 'Common', art: 'https://placehold.co/150x126/ef4444/FFFFFF?text=Ability', effect: 'Deal 3 damage to a single enemy.', energyCost: 1, category: 'Offense' },
    { id: 3812, type: 'ability', name: 'Camouflage', class: 'Wilderness Expert', rarity: 'Common', art: 'https://placehold.co/150x126/ef4444/FFFFFF?text=Ability', effect: 'Gain +2 evasion for 1 turn and +1 speed next turn.', energyCost: 1, category: 'Defense' },
    { id: 3813, type: 'ability', name: 'Animal Companion – Wolf', class: 'Wilderness Expert', rarity: 'Common', art: 'https://placehold.co/150x126/ef4444/FFFFFF?text=Ability', effect: 'Summon a Wolf that deals 2 damage and lasts 1 turn.', energyCost: 1, category: 'Support', summons: 'WOLF' },
    // Uncommon
    { id: 3821, type: 'ability', name: 'Multi-Shot', class: 'Wilderness Expert', rarity: 'Uncommon', art: 'https://placehold.co/150x126/ef4444/FFFFFF?text=Ability', effect: 'Deal 2 damage to up to 3 enemies.', energyCost: 2, category: 'Offense' },
    { id: 3822, type: 'ability', name: 'Hawk Eye', class: 'Wilderness Expert', rarity: 'Uncommon', art: 'https://placehold.co/150x126/ef4444/FFFFFF?text=Ability', effect: 'Gain +1 attack and +1 crit chance for 2 turns.', energyCost: 2, category: 'Support' },
    { id: 3823, type: 'ability', name: 'Animal Companion – Bear', class: 'Wilderness Expert', rarity: 'Uncommon', art: 'https://placehold.co/150x126/ef4444/FFFFFF?text=Ability', effect: 'Summon a Bear that deals 3 damage and taunts enemies.', energyCost: 2, category: 'Defense', summons: 'BEAR' },
    // Rare
    { id: 3831, type: 'ability', name: 'Rain of Arrows', class: 'Wilderness Expert', rarity: 'Rare', art: 'https://placehold.co/150x126/ef4444/FFFFFF?text=Ability', effect: 'Deal 3 damage to all enemies.', energyCost: 3, category: 'Offense', target: 'ENEMIES' },
    { id: 3832, type: 'ability', name: 'Trap Mastery', class: 'Wilderness Expert', rarity: 'Rare', art: 'https://placehold.co/150x126/ef4444/FFFFFF?text=Ability', effect: 'Set a trap: next enemy to attack you takes 4 damage and is rooted.', energyCost: 3, category: 'Defense' },
    { id: 3833, type: 'ability', name: 'Animal Companion – Falcon', class: 'Wilderness Expert', rarity: 'Rare', art: 'https://placehold.co/150x126/ef4444/FFFFFF?text=Ability', effect: 'Summon a Falcon that grants +1 attack and reveals hidden enemies for 2 turns.', energyCost: 3, category: 'Support', summons: 'FALCON' },
    // Epic
    { id: 3841, type: 'ability', name: 'Alpha\'s Call', class: 'Wilderness Expert', rarity: 'Epic', art: 'https://placehold.co/150x126/ef4444/FFFFFF?text=Ability', effect: 'Summon all three animal companions simultaneously.', energyCost: 4, category: 'Support', summons: ['WOLF', 'BEAR', 'FALCON'] },
    { id: 3842, type: 'ability', name: 'True Shot', class: 'Wilderness Expert', rarity: 'Epic', art: 'https://placehold.co/150x126/ef4444/FFFFFF?text=Ability', effect: 'Deal 7 damage to one enemy, ignoring evasion and armor.', energyCost: 4, category: 'Offense' },
    { id: 3843, type: 'ability', name: 'Ranger\'s Focus', class: 'Wilderness Expert', rarity: 'Epic', art: 'https://placehold.co/150x126/ef4444/FFFFFF?text=Ability', effect: 'Gain +2 attack and +2 speed for 2 turns.', energyCost: 4, category: 'Defense' },
    // --- Necromancer Abilities ---
    { id: 3911, type: 'ability', name: 'Raise Skeleton', class: 'Necromancer', rarity: 'Common', art: 'https://placehold.co/150x126/ef4444/FFFFFF?text=Ability', effect: 'Summon a Skeleton with 10 HP and 3 Attack.', summons: 'SKELETON', energyCost: 1, category: 'Support' },

    // === Mystic Deceiver (Enchanter) ===
    // Common
    { id: 4001, type: 'ability', name: 'Mind Twist', class: 'Mystic Deceiver', rarity: 'Common', art: '...', effect: 'Deal 2 psychic damage.', energyCost: 1, category: 'Offense' },
    { id: 4002, type: 'ability', name: 'Mirror Image', class: 'Mystic Deceiver', rarity: 'Common', art: '...', effect: 'Gain +1 Evasion for 2 turns.', energyCost: 1, category: 'Defense' },
    { id: 4003, type: 'ability', name: 'Mind Fog', class: 'Mystic Deceiver', rarity: 'Common', art: '...', effect: 'Apply Confuse to one enemy for 1 turn.', energyCost: 1, category: 'Support' },
    // Uncommon
    { id: 4004, type: 'ability', name: 'Illusionary Strike', class: 'Mystic Deceiver', rarity: 'Uncommon', art: '...', effect: 'Deal 3 damage. If the target is Confused, they are also Stunned.', energyCost: 2, category: 'Offense' },
    { id: 4005, type: 'ability', name: 'Arcane Ward', class: 'Mystic Deceiver', rarity: 'Uncommon', art: '...', effect: 'Block the next incoming magical ability.', energyCost: 2, category: 'Defense' },
    { id: 4006, type: 'ability', name: 'Charm', class: 'Mystic Deceiver', rarity: 'Uncommon', art: '...', effect: 'An enemy attacks one of its own allies on its next turn.', energyCost: 2, category: 'Support' },
    // Rare
    { id: 4007, type: 'ability', name: 'Phantasmal Blades', class: 'Mystic Deceiver', rarity: 'Rare', art: '...', effect: 'Deal 2 damage to all enemies and apply Confuse for 1 turn.', energyCost: 3, category: 'Offense', target: 'ENEMIES' },
    { id: 4008, type: 'ability', name: 'Warding Sigil', class: 'Mystic Deceiver', rarity: 'Rare', art: '...', effect: 'All allies gain immunity to debuffs for 2 turns.', energyCost: 3, category: 'Defense', target: 'ALLIES' },
    { id: 4009, type: 'ability', name: 'Dominate Mind', class: 'Mystic Deceiver', rarity: 'Rare', art: '...', effect: 'Force an enemy to perform a basic attack against itself.', energyCost: 3, category: 'Support' },
    // Epic
    { id: 4010, type: 'ability', name: 'Mind Shatter', class: 'Mystic Deceiver', rarity: 'Epic', art: '...', effect: 'Deal 5 psychic damage. If the target has a debuff, this damage cannot be blocked.', energyCost: 4, category: 'Offense' },
    { id: 4011, type: 'ability', name: 'Cloak of Invisibility', class: 'Mystic Deceiver', rarity: 'Epic', art: '...', effect: 'This hero becomes untargetable for 2 turns.', energyCost: 4, category: 'Defense' },
    { id: 4012, type: 'ability', name: 'Mass Domination', class: 'Mystic Deceiver', rarity: 'Epic', art: '...', effect: 'All enemies have a 50% chance to attack their own allies on their next turn.', energyCost: 4, category: 'Support', target: 'ENEMIES' },

    // === Shadow Striker (Rogue) ===
    // Common
    { id: 4101, type: 'ability', name: 'Quick Stab', class: 'Shadow Striker', rarity: 'Common', art: '...', effect: 'Deal 3 piercing damage.', energyCost: 1, category: 'Offense' },
    { id: 4102, type: 'ability', name: 'Fade', class: 'Shadow Striker', rarity: 'Common', art: '...', effect: 'Gain +1 Evasion for 2 turns.', energyCost: 1, category: 'Defense' },
    { id: 4103, type: 'ability', name: 'Poisoned Shiv', class: 'Shadow Striker', rarity: 'Common', art: '...', effect: 'Deal 1 damage and apply Poison (1 damage per turn for 2 turns).', energyCost: 1, category: 'Support' },
    // Uncommon
    { id: 4104, type: 'ability', name: 'Backstab', class: 'Shadow Striker', rarity: 'Uncommon', art: '...', effect: 'Deal 4 damage. If the target has a debuff, this attack cannot be blocked.', energyCost: 2, category: 'Offense' },
    { id: 4105, type: 'ability', name: 'Smoke Bomb', class: 'Shadow Striker', rarity: 'Uncommon', art: '...', effect: 'All allies gain +1 Evasion for 1 turn.', energyCost: 2, category: 'Defense', target: 'ALLIES' },
    { id: 4106, type: 'ability', name: 'Bleeding Strike', class: 'Shadow Striker', rarity: 'Uncommon', art: '...', effect: 'Deal 2 damage and apply Bleed for 2 turns.', energyCost: 2, category: 'Support' },
    // Rare
    { id: 4107, type: 'ability', name: 'Flurry of Blades', class: 'Shadow Striker', rarity: 'Rare', art: '...', effect: 'Deal 2 damage to three random enemies.', energyCost: 3, category: 'Offense' },
    { id: 4108, type: 'ability', name: 'Shadow Step', class: 'Shadow Striker', rarity: 'Rare', art: '...', effect: 'Avoid the next incoming attack completely.', energyCost: 3, category: 'Defense' },
    { id: 4109, type: 'ability', name: 'Deadly Poison', class: 'Shadow Striker', rarity: 'Rare', art: '...', effect: 'Apply Poison (2 damage per turn for 3 turns) to all enemies.', energyCost: 3, category: 'Support', target: 'ENEMIES' },
    // Epic
    { id: 4110, type: 'ability', name: 'Assassinate', class: 'Shadow Striker', rarity: 'Epic', art: '...', effect: 'Deal 7 damage to a single target. If this defeats the target, gain 2 Energy.', energyCost: 4, category: 'Offense' },
    { id: 4111, type: 'ability', name: 'Cloak of Shadows', class: 'Shadow Striker', rarity: 'Epic', art: '...', effect: 'Become untargetable for 1 turn and gain +2 Attack on your next turn.', energyCost: 4, category: 'Defense' },
    { id: 4112, type: 'ability', name: 'Shadow Mastery', class: 'Shadow Striker', rarity: 'Epic', art: '...', effect: 'For 2 turns, all of your attacks are guaranteed critical hits.', energyCost: 4, category: 'Support' },

    // === Arcane Savant (Wizard) ===
    // Common
    { id: 4201, type: 'ability', name: 'Fireball', class: 'Arcane Savant', rarity: 'Common', art: '...', effect: 'Deal 3 fire damage to a single target.', energyCost: 1, category: 'Offense' },
    { id: 4202, type: 'ability', name: 'Arcane Shield', class: 'Arcane Savant', rarity: 'Common', art: '...', effect: 'Gain 4 temporary HP that lasts for 2 turns.', energyCost: 1, category: 'Defense' },
    { id: 4203, type: 'ability', name: 'Ice Lance', class: 'Arcane Savant', rarity: 'Common', art: '...', effect: 'Deal 1 damage and apply Slow for 2 turns.', energyCost: 1, category: 'Support' },
    // Uncommon
    { id: 4204, type: 'ability', name: 'Lightning Bolt', class: 'Arcane Savant', rarity: 'Uncommon', art: '...', effect: 'Deal 4 lightning damage. Has a 25% chance to Stun.', energyCost: 2, category: 'Offense' },
    { id: 4205, type: 'ability', name: 'Counterspell', class: 'Arcane Savant', rarity: 'Uncommon', art: '...', effect: 'If an enemy casts an ability next, interrupt it and deal 2 damage to them.', energyCost: 2, category: 'Defense' },
    { id: 4206, type: 'ability', name: 'Arcane Focus', class: 'Arcane Savant', rarity: 'Uncommon', art: '...', effect: 'Your next ability costs 1 less Energy and deals +1 damage.', energyCost: 2, category: 'Support' },
    // Rare
    { id: 4207, type: 'ability', name: 'Ice Storm', class: 'Arcane Savant', rarity: 'Rare', art: '...', effect: 'Deal 2 ice damage to all enemies and apply Slow for 2 turns.', energyCost: 3, category: 'Offense', target: 'ENEMIES' },
    { id: 4208, type: 'ability', name: 'Time Warp', class: 'Arcane Savant', rarity: 'Rare', art: '...', effect: 'This hero takes their next turn immediately after this one.', energyCost: 3, category: 'Defense' },
    { id: 4209, type: 'ability', name: 'Mana Drain', class: 'Arcane Savant', rarity: 'Rare', art: '...', effect: 'Steal 2 Energy from an enemy.', energyCost: 3, category: 'Support' },
    // Epic
    { id: 4210, type: 'ability', name: 'Meteor Shower', class: 'Arcane Savant', rarity: 'Epic', art: '...', effect: 'Deal 6 fire damage to all enemies.', energyCost: 4, category: 'Offense', target: 'ENEMIES' },
    { id: 4211, type: 'ability', name: 'Prismatic Wall', class: 'Arcane Savant', rarity: 'Epic', art: '...', effect: 'All allies take 50% less damage from all sources for 1 turn.', energyCost: 4, category: 'Defense', target: 'ALLIES' },
    { id: 4212, type: 'ability', name: 'Temporal Mastery', class: 'Arcane Savant', rarity: 'Epic', art: '...', effect: 'For 2 turns, this hero gets an extra action on each of their turns.', energyCost: 4, category: 'Support' },

    // === MONSTER ABILITIES ===
    // Grave Titan Abilities (sample)
    { id: 5001, type: 'ability', name: 'Crushing Blow', class: 'Grave Titan', rarity: 'Common', art: '...', effect: 'Deal 4 damage to a single target.', energyCost: 1, category: 'Offense' },
    { id: 5002, type: 'ability', name: 'Stonehide', class: 'Grave Titan', rarity: 'Common', art: '...', effect: 'Reduce all incoming damage by 2 this turn.', energyCost: 1, category: 'Defense' },

    // Brute Abilities (sample)
    { id: 5101, type: 'ability', name: 'Savage Swipe', class: 'Brute', rarity: 'Common', art: '...', effect: 'Deal 3 damage to two enemies.', energyCost: 1, category: 'Offense' },

    // TODO: Add remaining monster ability definitions
];
// NOTE: Placeholder art links ('...') and new IDs have been assigned.

const allPossibleArmors = [
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

const battleSpeeds = [
    { label: '0.5x', multiplier: 0.5 },
    { label: '1x', multiplier: 0.33 },
    { label: '2x', multiplier: 0.25 },
    { label: '3x', multiplier: 0.2 },
    { label: '4x', multiplier: 0.1 },
    { label: '5x', multiplier: 0.05 }
];
module.exports = {
  allPossibleHeroes,
  allPossibleMinions,
  allPossibleWeapons,
  allPossibleAbilities,
  allPossibleArmors,
  battleSpeeds
};

