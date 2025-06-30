// This file contains all the raw data for game entities.
// In a real application, this would likely be fetched from a server API.

const allPossibleHeroes = [
    { type: 'hero', id: 1, name: 'Recruit', class: 'Stalwart Defender', rarity: 'Common', hp: 22, attack: 3, speed: 3, abilities: [], isBase: true },
    { type: 'hero', id: 2, name: 'Minstrel', class: 'Inspiring Artist', rarity: 'Common', hp: 16, attack: 2, speed: 5, abilities: [], isBase: true },
    { type: 'hero', id: 3, name: 'Brawler', class: 'Raging Fighter', rarity: 'Common', hp: 20, attack: 4, speed: 3, abilities: [], isBase: true },
    { type: 'hero', id: 4, name: 'Acolyte', class: 'Divine Healer', rarity: 'Common', hp: 18, attack: 2, speed: 4, abilities: [], isBase: true },
    { type: 'hero', id: 5, name: 'Naturalist', class: 'Nature Shaper', rarity: 'Common', hp: 17, attack: 3, speed: 4, abilities: [], isBase: true },
    { type: 'hero', id: 6, name: 'Trickster', class: 'Mystic Deceiver', rarity: 'Common', hp: 15, attack: 2, speed: 4, abilities: [], isBase: true },
    { type: 'hero', id: 7, name: 'Squire', class: 'Holy Warrior', rarity: 'Common', hp: 20, attack: 3, speed: 3, abilities: [], isBase: true },
    { type: 'hero', id: 8, name: 'Thug', class: 'Shadow Striker', rarity: 'Common', hp: 14, attack: 5, speed: 6, abilities: [], isBase: true },
    { type: 'hero', id: 9, name: 'Tracker', class: 'Wilderness Expert', rarity: 'Common', hp: 15, attack: 4, speed: 5, abilities: [], isBase: true },
    { type: 'hero', id: 10, name: 'Adept', class: 'Raw Power Mage', rarity: 'Common', hp: 14, attack: 4, speed: 4, abilities: [], isBase: true },
    { type: 'hero', id: 11, name: 'Apprentice', class: 'Arcane Savant', rarity: 'Common', hp: 14, attack: 4, speed: 4, abilities: [], isBase: true },
    // 1. Stalwart Defender
    { type: 'hero', id: 101, name: 'Recruit', class: 'Stalwart Defender', rarity: 'Common', art: '../img/recruit_card.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Recruit', hp: 22, attack: 4, speed: 5, abilities: [] },
    { type: 'hero', id: 102, name: 'Soldier', class: 'Stalwart Defender', rarity: 'Uncommon', art: '../img/soldier_card.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Soldier', hp: 30, attack: 6, speed: 5, abilities: [] },
    { type: 'hero', id: 103, name: 'Vanguard', class: 'Stalwart Defender', rarity: 'Rare', art: '../img/vanguard_card.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Vanguard', hp: 42, attack: 8, speed: 5, abilities: [] },
    { type: 'hero', id: 104, name: 'Warbringer', class: 'Stalwart Defender', rarity: 'Epic', art: '../img/warbringer_card.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Warbringer', hp: 55, attack: 11, speed: 5, abilities: [] },

    // 2. Holy Warrior
    { type: 'hero', id: 201, name: 'Squire', class: 'Holy Warrior', rarity: 'Common', art: '../img/squire_card.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Squire', hp: 20, attack: 5, speed: 5, abilities: [] },
    { type: 'hero', id: 202, name: 'Crusader', class: 'Holy Warrior', rarity: 'Uncommon', art: '../img/crusader_card.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Crusader', hp: 28, attack: 7, speed: 5, abilities: [] },
    { type: 'hero', id: 203, name: 'Paladin', class: 'Holy Warrior', rarity: 'Rare', art: '../img/paladin_card.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Paladin', hp: 38, attack: 9, speed: 5, abilities: [] },
    { type: 'hero', id: 204, name: 'Divine Aegis', class: 'Holy Warrior', rarity: 'Epic', art: '../img/divine_aegis_card.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Divine%20Aegis', hp: 50, attack: 12, speed: 5, abilities: [] },

    // 3. Raging Fighter
    { type: 'hero', id: 301, name: 'Brawler', class: 'Raging Fighter', rarity: 'Common', art: '../img/brawler_card.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Brawler', hp: 18, attack: 7, speed: 6, abilities: [] },
    { type: 'hero', id: 302, name: 'Marauder', class: 'Raging Fighter', rarity: 'Uncommon', art: '../img/marauder_card.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Marauder', hp: 25, attack: 10, speed: 6, abilities: [] },
    { type: 'hero', id: 303, name: 'Berserker', class: 'Raging Fighter', rarity: 'Rare', art: '../img/berserker_card.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Berserker', hp: 33, attack: 14, speed: 6, abilities: [] },
    { type: 'hero', id: 304, name: 'Juggernaut', class: 'Raging Fighter', rarity: 'Epic', art: '../img/juggernaut_card.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Juggernaut', hp: 42, attack: 18, speed: 6, abilities: [] },

    // 4. Raw Power Mage
    { type: 'hero', id: 401, name: 'Adept', class: 'Raw Power Mage', rarity: 'Common', art: '../img/adept_card.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Adept', hp: 12, attack: 2, speed: 4, abilities: [] },
    { type: 'hero', id: 402, name: 'Sorcerer', class: 'Raw Power Mage', rarity: 'Uncommon', art: '../img/sorcerer_card.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Sorcerer', hp: 16, attack: 3, speed: 4, abilities: [] },
    { type: 'hero', id: 403, name: 'Elementalist', class: 'Raw Power Mage', rarity: 'Rare', art: '../img/elementalist_card.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Elementalist', hp: 21, attack: 4, speed: 4, abilities: [] },
    { type: 'hero', id: 404, name: 'Chaos Conduit', class: 'Raw Power Mage', rarity: 'Epic', art: '../img/chaos_conduit_card.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Chaos%20Conduit', hp: 27, attack: 5, speed: 4, abilities: [] },

    // 5. Divine Healer
    { type: 'hero', id: 501, name: 'Acolyte', class: 'Divine Healer', rarity: 'Common', art: '../img/acolyte_card.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Acolyte', hp: 15, attack: 3, speed: 5, abilities: [] },
    { type: 'hero', id: 502, name: 'Priest', class: 'Divine Healer', rarity: 'Uncommon', art: '../img/priest_card.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Priest', hp: 20, attack: 4, speed: 5, abilities: [] },
    { type: 'hero', id: 503, name: 'High Priest', class: 'Divine Healer', rarity: 'Rare', art: '../img/high_priest_card.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=High%20Priest', hp: 26, attack: 5, speed: 5, abilities: [] },
    { type: 'hero', id: 504, name: 'Hierophant', class: 'Divine Healer', rarity: 'Epic', art: '../img/hierophant_card.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Hierophant', hp: 33, attack: 6, speed: 5, abilities: [] },

    // 6. Nature Shaper
    { type: 'hero', id: 601, name: 'Naturalist', class: 'Nature Shaper', rarity: 'Common', art: '../img/naturalist_card.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Naturalist', hp: 17, attack: 4, speed: 5, abilities: [] },
    { type: 'hero', id: 602, name: 'Shapeshifter', class: 'Nature Shaper', rarity: 'Uncommon', art: '../img/shapeshifter_card.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Shapeshifter', hp: 24, attack: 6, speed: 5, abilities: [] },
    { type: 'hero', id: 603, name: 'Archdruid', class: 'Nature Shaper', rarity: 'Rare', art: '../img/archdruid_card.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Archdruid', hp: 32, attack: 8, speed: 5, abilities: [] },
    { type: 'hero', id: 604, name: 'Avatar of the Wild', class: 'Nature Shaper', rarity: 'Epic', art: '../img/avatar_of_the_wild_card.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Avatar%20of%20the%20Wild', hp: 40, attack: 10, speed: 5, abilities: [] },

    // 7. Inspiring Artist
    { type: 'hero', id: 701, name: 'Minstrel', class: 'Inspiring Artist', rarity: 'Common', art: '../img/minstrel_card.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Minstrel', hp: 14, attack: 2, speed: 6, abilities: [] },
    { type: 'hero', id: 702, name: 'Skald', class: 'Inspiring Artist', rarity: 'Uncommon', art: '../img/skald_card.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Skald', hp: 19, attack: 3, speed: 6, abilities: [] },
    { type: 'hero', id: 703, name: 'Maestro', class: 'Inspiring Artist', rarity: 'Rare', art: '../img/maestro_card.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Maestro', hp: 25, attack: 4, speed: 6, abilities: [] },
    { type: 'hero', id: 704, name: 'Muse Incarnate', class: 'Inspiring Artist', rarity: 'Epic', art: '../img/muse_card.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Muse%20Incarnate', hp: 32, attack: 5, speed: 6, abilities: [] },

    // 8. Wilderness Expert
    { type: 'hero', id: 801, name: 'Tracker', class: 'Wilderness Expert', rarity: 'Common', art: '../img/tracker_card.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Tracker', hp: 13, attack: 6, speed: 7, abilities: [] },
    { type: 'hero', id: 802, name: 'Beast Tamer', class: 'Wilderness Expert', rarity: 'Uncommon', art: '../img/beast_tamer_card.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Beast%20Tamer', hp: 18, attack: 9, speed: 7, abilities: [] },
    { type: 'hero', id: 803, name: 'Beast Master', class: 'Wilderness Expert', rarity: 'Rare', art: '../img/beast_master_card.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Beast%20Master', hp: 24, attack: 12, speed: 7, abilities: [] },
    { type: 'hero', id: 804, name: 'Wild Lord', class: 'Wilderness Expert', rarity: 'Epic', art: '../img/wild_lord_card.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Wild%20Lord', hp: 30, attack: 15, speed: 7, abilities: [] },

    // 9. Mystic Deceiver (Enchanter)
    { type: 'hero', id: 901, name: 'Trickster', class: 'Mystic Deceiver', rarity: 'Common', art: '../img/trickster_card.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Trickster', hp: 14, attack: 2, speed: 4, abilities: [] },
    { type: 'hero', id: 902, name: 'Illusionist', class: 'Mystic Deceiver', rarity: 'Uncommon', art: '../img/illusionist_card.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Illusionist', hp: 19, attack: 3, speed: 4, abilities: [] },
    { type: 'hero', id: 903, name: 'Mesmerist', class: 'Mystic Deceiver', rarity: 'Rare', art: '../img/mesmerist_card.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Mesmerist', hp: 25, attack: 4, speed: 5, abilities: [] },
    { type: 'hero', id: 904, name: 'Mind Flayer', class: 'Mystic Deceiver', rarity: 'Epic', art: '../img/mind_flayer_card.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Mind%20Flayer', hp: 32, attack: 5, speed: 5, abilities: [] },

    // 10. Shadow Striker (Rogue)
    { type: 'hero', id: 1001, name: 'Thug', class: 'Shadow Striker', rarity: 'Common', art: '../img/thug_card.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Thug', hp: 13, attack: 6, speed: 6, abilities: [] },
    { type: 'hero', id: 1002, name: 'Cutthroat', class: 'Shadow Striker', rarity: 'Uncommon', art: '../img/cutthroat_card.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Cutthroat', hp: 18, attack: 8, speed: 6, abilities: [] },
    { type: 'hero', id: 1003, name: 'Shade', class: 'Shadow Striker', rarity: 'Rare', art: '../img/shade_card.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Shade', hp: 24, attack: 11, speed: 7, abilities: [] },
    { type: 'hero', id: 1004, name: 'Nightblade', class: 'Shadow Striker', rarity: 'Epic', art: '../img/nightblade_card.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Nightblade', hp: 30, attack: 14, speed: 7, abilities: [] },

    // 11. Arcane Savant (Wizard)
    { type: 'hero', id: 1101, name: 'Apprentice', class: 'Arcane Savant', rarity: 'Common', art: '../img/apprentice_card.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Apprentice', hp: 13, attack: 3, speed: 4, abilities: [] },
    { type: 'hero', id: 1102, name: 'Mage', class: 'Arcane Savant', rarity: 'Uncommon', art: '../img/mage_card.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Mage', hp: 18, attack: 4, speed: 4, abilities: [] },
    { type: 'hero', id: 1103, name: 'Archmage', class: 'Arcane Savant', rarity: 'Rare', art: '../img/archmage_card.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Archmage', hp: 24, attack: 5, speed: 5, abilities: [] },
    { type: 'hero', id: 1104, name: 'Grand Magus', class: 'Arcane Savant', rarity: 'Epic', art: '../img/grand_magus_card.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Grand%20Magus', hp: 30, attack: 6, speed: 5, abilities: [] },

    // === MONSTER ARCHETYPES ===
    // Archetype 1: Grave Titan
    { type: 'hero', id: 2001, name: 'Lesser Grave Titan', class: 'Grave Titan', rarity: 'Common', art: '../img/monsters/grave_titan_1.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Lesser%20Grave%20Titan', hp: 45, attack: 8, speed: 2, isMonster: true, trait: 'Stonehide: Reduces all incoming physical damage by 2.' },
    { type: 'hero', id: 2002, name: 'Grave Titan', class: 'Grave Titan', rarity: 'Uncommon', art: '../img/monsters/grave_titan_2.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Grave%20Titan', hp: 55, attack: 10, speed: 2, isMonster: true, trait: 'Stonehide: Reduces all incoming physical damage by 2.' },
    { type: 'hero', id: 2003, name: 'Elder Grave Titan', class: 'Grave Titan', rarity: 'Rare', art: '../img/monsters/grave_titan_3.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Elder%20Grave%20Titan', hp: 68, attack: 13, speed: 2, isMonster: true, trait: 'Stonehide: Reduces all incoming physical damage by 2.' },
    { type: 'hero', id: 2004, name: 'World-Shaper Titan', class: 'Grave Titan', rarity: 'Epic', art: '../img/monsters/grave_titan_4.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=World-Shaper%20Titan', hp: 85, attack: 17, speed: 2, isMonster: true, trait: 'Stonehide: Reduces all incoming physical damage by 2.' },

    // Archetype 2: Brute
    { type: 'hero', id: 2101, name: 'Lesser Brute', class: 'Brute', rarity: 'Common', art: '../img/monsters/brute_1.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Lesser%20Brute', hp: 40, attack: 12, speed: 3, isMonster: true, trait: 'Unstoppable: Cannot be Stunned or Rooted.' },
    { type: 'hero', id: 2102, name: 'War Brute', class: 'Brute', rarity: 'Uncommon', art: '../img/monsters/brute_2.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=War%20Brute', hp: 50, attack: 15, speed: 3, isMonster: true, trait: 'Unstoppable: Cannot be Stunned or Rooted.' },
    { type: 'hero', id: 2103, name: 'Savage Brute', class: 'Brute', rarity: 'Rare', art: '../img/monsters/brute_3.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Savage%20Brute', hp: 62, attack: 19, speed: 3, isMonster: true, trait: 'Unstoppable: Cannot be Stunned or Rooted.' },
    { type: 'hero', id: 2104, name: 'Unchained Behemoth', class: 'Brute', rarity: 'Epic', art: '../img/monsters/brute_4.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Unchained%20Behemoth', hp: 78, attack: 24, speed: 3, isMonster: true, trait: 'Unstoppable: Cannot be Stunned or Rooted.' },

    // Archetype 3: Frost Revenant
    { type: 'hero', id: 2201, name: 'Lesser Frost Revenant', class: 'Frost Revenant', rarity: 'Common', art: '../img/monsters/frost_revenant_1.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Lesser%20Frost%20Revenant', hp: 38, attack: 7, speed: 4, isMonster: true, trait: 'Frozen Core: Immune to Slow effects.' },
    { type: 'hero', id: 2202, name: 'Frost Revenant', class: 'Frost Revenant', rarity: 'Uncommon', art: '../img/monsters/frost_revenant_2.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Frost%20Revenant', hp: 48, attack: 9, speed: 4, isMonster: true, trait: 'Frozen Core: Immune to Slow effects.' },
    { type: 'hero', id: 2203, name: 'Elder Frost Revenant', class: 'Frost Revenant', rarity: 'Rare', art: '../img/monsters/frost_revenant_3.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Elder%20Frost%20Revenant', hp: 60, attack: 12, speed: 4, isMonster: true, trait: 'Frozen Core: Immune to Slow effects.' },
    { type: 'hero', id: 2204, name: 'Glacial Wraith', class: 'Frost Revenant', rarity: 'Epic', art: '../img/monsters/frost_revenant_4.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Glacial%20Wraith', hp: 74, attack: 16, speed: 4, isMonster: true, trait: 'Frozen Core: Immune to Slow effects.' },

    // Archetype 4: Blood Witch
    { type: 'hero', id: 2301, name: 'Novice Blood Witch', class: 'Blood Witch', rarity: 'Common', art: '../img/monsters/blood_witch_1.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Novice%20Blood%20Witch', hp: 30, attack: 6, speed: 5, isMonster: true, trait: 'Blood Magic: Heals 1 HP whenever she deals damage.' },
    { type: 'hero', id: 2302, name: 'Blood Witch', class: 'Blood Witch', rarity: 'Uncommon', art: '../img/monsters/blood_witch_2.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Blood%20Witch', hp: 40, attack: 8, speed: 5, isMonster: true, trait: 'Blood Magic: Heals 1 HP whenever she deals damage.' },
    { type: 'hero', id: 2303, name: 'Elder Blood Witch', class: 'Blood Witch', rarity: 'Rare', art: '../img/monsters/blood_witch_3.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Elder%20Blood%20Witch', hp: 52, attack: 11, speed: 5, isMonster: true, trait: 'Blood Magic: Heals 1 HP whenever she deals damage.' },
    { type: 'hero', id: 2304, name: 'Crimson Matriarch', class: 'Blood Witch', rarity: 'Epic', art: '../img/monsters/blood_witch_4.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Crimson%20Matriarch', hp: 66, attack: 15, speed: 5, isMonster: true, trait: 'Blood Magic: Heals 1 HP whenever she deals damage.' },

    // Archetype 5: Infernal Beast
    { type: 'hero', id: 2401, name: 'Lesser Infernal Beast', class: 'Infernal Beast', rarity: 'Common', art: '../img/monsters/infernal_beast_1.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Lesser%20Infernal%20Beast', hp: 42, attack: 11, speed: 4, isMonster: true, trait: 'Burning Rage: Deals 1 fire damage to attackers.' },
    { type: 'hero', id: 2402, name: 'Infernal Beast', class: 'Infernal Beast', rarity: 'Uncommon', art: '../img/monsters/infernal_beast_2.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Infernal%20Beast', hp: 52, attack: 13, speed: 4, isMonster: true, trait: 'Burning Rage: Deals 1 fire damage to attackers.' },
    { type: 'hero', id: 2403, name: 'Greater Infernal Beast', class: 'Infernal Beast', rarity: 'Rare', art: '../img/monsters/infernal_beast_3.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Greater%20Infernal%20Beast', hp: 64, attack: 16, speed: 4, isMonster: true, trait: 'Burning Rage: Deals 1 fire damage to attackers.' },
    { type: 'hero', id: 2404, name: 'Apocalyptic Behemoth', class: 'Infernal Beast', rarity: 'Epic', art: '../img/monsters/infernal_beast_4.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Apocalyptic%20Behemoth', hp: 78, attack: 20, speed: 4, isMonster: true, trait: 'Burning Rage: Deals 1 fire damage to attackers.' },

    // Archetype 6: Necromancer
    { type: 'hero', id: 2501, name: 'Apprentice Necromancer', class: 'Necromancer', rarity: 'Common', art: '../img/monsters/necromancer_1.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Apprentice%20Necromancer', hp: 32, attack: 6, speed: 3, isMonster: true, trait: 'Soul Harvest: Gain 1 energy when a minion dies.' },
    { type: 'hero', id: 2502, name: 'Necromancer', class: 'Necromancer', rarity: 'Uncommon', art: '../img/monsters/necromancer_2.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Necromancer', hp: 42, attack: 8, speed: 3, isMonster: true, trait: 'Soul Harvest: Gain 1 energy when a minion dies.' },
    { type: 'hero', id: 2503, name: 'Bone Weaver', class: 'Necromancer', rarity: 'Rare', art: '../img/monsters/necromancer_3.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Bone%20Weaver', hp: 54, attack: 11, speed: 3, isMonster: true, trait: 'Soul Harvest: Gain 1 energy when a minion dies.' },
    { type: 'hero', id: 2504, name: 'Lich Lord', class: 'Necromancer', rarity: 'Epic', art: '../img/monsters/necromancer_4.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Lich%20Lord', hp: 68, attack: 15, speed: 3, isMonster: true, trait: 'Soul Harvest: Gain 1 energy when a minion dies.' },

    // Archetype 7: Shadowfiend
    { type: 'hero', id: 2601, name: 'Lesser Shadowfiend', class: 'Shadowfiend', rarity: 'Common', art: '../img/monsters/shadowfiend_1.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Lesser%20Shadowfiend', hp: 35, attack: 10, speed: 6, isMonster: true, trait: 'Shadowstep: Starts with +1 Evasion.' },
    { type: 'hero', id: 2602, name: 'Shadowfiend', class: 'Shadowfiend', rarity: 'Uncommon', art: '../img/monsters/shadowfiend_2.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Shadowfiend', hp: 45, attack: 12, speed: 6, isMonster: true, trait: 'Shadowstep: Starts with +1 Evasion.' },
    { type: 'hero', id: 2603, name: 'Night Terror', class: 'Shadowfiend', rarity: 'Rare', art: '../img/monsters/shadowfiend_3.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Night%20Terror', hp: 57, attack: 15, speed: 6, isMonster: true, trait: 'Shadowstep: Starts with +1 Evasion.' },
    { type: 'hero', id: 2604, name: 'Umbral Devourer', class: 'Shadowfiend', rarity: 'Epic', art: '../img/monsters/shadowfiend_4.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Umbral%20Devourer', hp: 71, attack: 19, speed: 6, isMonster: true, trait: 'Shadowstep: Starts with +1 Evasion.' },

    // Archetype 8: Storm Serpent
    { type: 'hero', id: 2701, name: 'Young Storm Serpent', class: 'Storm Serpent', rarity: 'Common', art: '../img/monsters/storm_serpent_1.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Young%20Storm%20Serpent', hp: 38, attack: 9, speed: 7, isMonster: true, trait: 'Stormborn: Immune to Shock.' },
    { type: 'hero', id: 2702, name: 'Storm Serpent', class: 'Storm Serpent', rarity: 'Uncommon', art: '../img/monsters/storm_serpent_2.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Storm%20Serpent', hp: 48, attack: 11, speed: 7, isMonster: true, trait: 'Stormborn: Immune to Shock.' },
    { type: 'hero', id: 2703, name: 'Elder Storm Serpent', class: 'Storm Serpent', rarity: 'Rare', art: '../img/monsters/storm_serpent_3.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Elder%20Storm%20Serpent', hp: 60, attack: 14, speed: 7, isMonster: true, trait: 'Stormborn: Immune to Shock.' },
    { type: 'hero', id: 2704, name: 'Tempest Leviathan', class: 'Storm Serpent', rarity: 'Epic', art: '../img/monsters/storm_serpent_4.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Tempest%20Leviathan', hp: 74, attack: 18, speed: 7, isMonster: true, trait: 'Stormborn: Immune to Shock.' },

    // Archetype 9: Venomspawn
    { type: 'hero', id: 2801, name: 'Lesser Venomspawn', class: 'Venomspawn', rarity: 'Common', art: '../img/monsters/venomspawn_1.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Lesser%20Venomspawn', hp: 32, attack: 8, speed: 5, isMonster: true, trait: 'Toxic Blood: Poisons melee attackers.' },
    { type: 'hero', id: 2802, name: 'Venomspawn', class: 'Venomspawn', rarity: 'Uncommon', art: '../img/monsters/venomspawn_2.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Venomspawn', hp: 42, attack: 10, speed: 5, isMonster: true, trait: 'Toxic Blood: Poisons melee attackers.' },
    { type: 'hero', id: 2803, name: 'Toxic Horror', class: 'Venomspawn', rarity: 'Rare', art: '../img/monsters/venomspawn_3.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Toxic%20Horror', hp: 54, attack: 13, speed: 5, isMonster: true, trait: 'Toxic Blood: Poisons melee attackers.' },
    { type: 'hero', id: 2804, name: 'Plague Serpent', class: 'Venomspawn', rarity: 'Epic', art: '../img/monsters/venomspawn_4.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Plague%20Serpent', hp: 68, attack: 17, speed: 5, isMonster: true, trait: 'Toxic Blood: Poisons melee attackers.' },

    // Archetype 10: Void Horror
    { type: 'hero', id: 2901, name: 'Lesser Void Horror', class: 'Void Horror', rarity: 'Common', art: '../img/monsters/void_horror_1.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Lesser%20Void%20Horror', hp: 37, attack: 9, speed: 5, isMonster: true, trait: 'Reality Warp: 25% chance to ignore damage.' },
    { type: 'hero', id: 2902, name: 'Void Horror', class: 'Void Horror', rarity: 'Uncommon', art: '../img/monsters/void_horror_2.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Void%20Horror', hp: 47, attack: 11, speed: 5, isMonster: true, trait: 'Reality Warp: 25% chance to ignore damage.' },
    { type: 'hero', id: 2903, name: 'Eldritch Abomination', class: 'Void Horror', rarity: 'Rare', art: '../img/monsters/void_horror_3.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Eldritch%20Abomination', hp: 59, attack: 14, speed: 5, isMonster: true, trait: 'Reality Warp: 25% chance to ignore damage.' },
    { type: 'hero', id: 2904, name: 'Reality Devourer', class: 'Void Horror', rarity: 'Epic', art: '../img/monsters/void_horror_4.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Reality%20Devourer', hp: 73, attack: 18, speed: 5, isMonster: true, trait: 'Reality Warp: 25% chance to ignore damage.' },

    // Generic Monsters
    { type: 'hero', id: 9001, name: 'Goblin', class: 'Goblin', rarity: 'Common', hp: 10, attack: 1, speed: 4, isMonster: true, abilities: [] },
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
    { id: 1101, type: 'weapon', name: 'Worn Sword', rarity: 'Common', art: '../img/weapons/worn_sword_card.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Worn%20Sword', statBonuses: { ATK: 3 }, ability: null },
    { id: 1102, type: 'weapon', name: 'Iron Sword', rarity: 'Uncommon', art: '../img/weapons/iron_sword_card.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Iron%20Sword', statBonuses: { ATK: 5 }, ability: { name: 'Cleave', description: 'Your auto-attacks deal 1 damage to an enemy adjacent to the target.' } },
    { id: 1103, type: 'weapon', name: 'Steel Longsword', rarity: 'Rare', art: '../img/weapons/steel_longsword_card.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Steel%20Longsword', statBonuses: { ATK: 7, HP: 3 }, ability: { name: 'Improved Cleave', description: 'Your auto-attacks deal 2 damage to an enemy adjacent to the target.' } },
    { id: 1104, type: 'weapon', name: 'Dragonfang Blade', rarity: 'Epic', art: '../img/weapons/dragonfang_blade_card.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Dragonfang%20Blade', statBonuses: { ATK: 10, SPD: 5 }, ability: { name: 'Blade Dance', description: 'When this hero kills an enemy, immediately perform an extra auto-attack.' } },

    // 2. Axe Family
    { id: 1201, type: 'weapon', name: 'Rusty Axe', rarity: 'Common', art: '../img/weapons/rusty_axe_card.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Rusty%20Axe', statBonuses: { ATK: 4 }, ability: null },
    { id: 1202, type: 'weapon', name: 'Battle Axe', rarity: 'Uncommon', art: '../img/weapons/battle_axe_card.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Battle%20Axe', statBonuses: { ATK: 7, SPD: -2 }, ability: { name: 'Overwhelm', description: 'Your auto-attacks ignore 1 point of Block.' } },
    { id: 1203, type: 'weapon', name: 'Great Axe', rarity: 'Rare', art: '../img/weapons/great_axe_card.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Great%20Axe', statBonuses: { ATK: 10, SPD: -3 }, ability: { name: 'Executioner', description: 'Your auto-attacks deal +2 damage to enemies below 50% HP.' } },
    { id: 1204, type: 'weapon', name: 'Stormreaver', rarity: 'Epic', art: '../img/weapons/stormreaver_card.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Stormreaver', statBonuses: { ATK: 15, SPD: -4 }, ability: { name: 'Reckless Smash', description: 'Your first auto-attack each combat deals double damage, but you take 5 damage.' } },

    // 3. Dagger Family
    { id: 1301, type: 'weapon', name: 'Rusty Knife', rarity: 'Common', art: '../img/weapons/rusty_knife_card.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Rusty%20Knife', statBonuses: { ATK: 1, SPD: 2 }, ability: null },
    { id: 1302, type: 'weapon', name: 'Bandit Dirk', rarity: 'Uncommon', art: '../img/weapons/bandit_dirk_card.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Bandit%20Dirk', statBonuses: { ATK: 2, SPD: 4 }, ability: { name: 'Poison Tip', description: '25% chance on hit to apply Poison 1 for 2 turns.' } },
    { id: 1303, type: 'weapon', name: "Assassin's Stiletto", rarity: 'Rare', art: '../img/weapons/assassins_stiletto_card.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Improved%20Poison%20Tip', statBonuses: { ATK: 4, SPD: 6 }, ability: { name: 'Improved Poison Tip', description: '50% chance on hit to apply Poison 2 for 2 turns.' } },
    { id: 1304, type: 'weapon', name: 'Venombite Fang', rarity: 'Epic', art: '../img/weapons/venombite_fang_card.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Venombite%20Fang', statBonuses: { ATK: 6, SPD: 8 }, ability: { name: 'Shadowfang', description: 'Your auto-attacks deal +3 damage to enemies suffering from Poison or Bleed.' } },

    // 4. Mace Family
    { id: 1401, type: 'weapon', name: 'Crude Club', rarity: 'Common', art: '../img/weapons/crude_club_card.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Crude%20Club', statBonuses: { ATK: 2, HP: 2 }, ability: null },
    { id: 1402, type: 'weapon', name: 'Iron Morningstar', rarity: 'Uncommon', art: '../img/weapons/iron_morningstar_card.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Iron%20Morningstar', statBonuses: { ATK: 4, HP: 3 }, ability: { name: 'Dazing Blow', description: '20% chance on hit to reduce enemy SPD by half for their next turn.' } },
    { id: 1403, type: 'weapon', name: 'Sunforge Maul', rarity: 'Rare', art: '../img/weapons/sunforge_maul_card.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Sunforge%20Maul', statBonuses: { ATK: 6, HP: 5 }, ability: { name: 'Armor Shatter', description: "Your auto-attacks permanently reduce the target's Block by 1." } },
    { id: 1404, type: 'weapon', name: 'Relic of Judgement', rarity: 'Epic', art: '../img/weapons/relic_of_judgement_card.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Relic%20of%20Judgement', statBonuses: { ATK: 9, HP: 7 }, ability: { name: 'Earthquake Slam', description: 'Your first auto-attack each combat has a 50% chance to Stun the target.' } },

    // 5. Spear Family
    { id: 1501, type: 'weapon', name: 'Broken Spear', rarity: 'Common', art: '../img/weapons/broken_spear_card.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Broken%20Spear', statBonuses: { ATK: 2, SPD: 1 }, ability: null },
    { id: 1502, type: 'weapon', name: "Soldier's Pike", rarity: 'Uncommon', art: '../img/weapons/soldiers_pike_card.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Disrupting%20Thrust', statBonuses: { ATK: 4, SPD: 2 }, ability: { name: 'Disrupting Thrust', description: 'On hit, the target has their SPD reduced by 1 for their next turn.' } },
    { id: 1503, type: 'weapon', name: 'Celestial Glaive', rarity: 'Rare', art: '../img/weapons/celestial_glaive_card.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Celestial%20Glaive', statBonuses: { ATK: 6, SPD: 3 }, ability: { name: 'First Strike', description: 'If this hero has higher SPD than their target, their first auto-attack deals +3 damage.' } },
    { id: 1504, type: 'weapon', name: 'Wyrmspire Lance', rarity: 'Epic', art: '../img/weapons/wyrmspire_lance_card.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Wyrmspire%20Lance', statBonuses: { ATK: 8, SPD: 4 }, ability: { name: 'Set for Charge', description: 'At the start of combat, the first enemy that attacks this hero is Stunned.' } },

    // 6. Bow Family
    { id: 1601, type: 'weapon', name: 'Bent Shortbow', rarity: 'Common', art: '../img/weapons/bent_shortbow_card.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Bent%20Shortbow', statBonuses: { ATK: 3 }, ability: null },
    { id: 1602, type: 'weapon', name: 'Oak Longbow', rarity: 'Uncommon', art: '../img/weapons/oak_longbow_card.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Oak%20Longbow', statBonuses: { ATK: 5 }, ability: { name: 'Hawk Eye', description: 'This hero gains +10% accuracy.' } },
    { id: 1603, type: 'weapon', name: 'Elven Warbow', rarity: 'Rare', art: '../img/weapons/elven_warbow_card.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Elven%20Warbow', statBonuses: { ATK: 7, SPD: 3 }, ability: { name: 'Crippling Arrow', description: 'On hit, if the target is the last enemy in their row, their ATK is reduced by 2 for their next turn.' } },
    { id: 1604, type: 'weapon', name: 'Heartwood Stormbow', rarity: 'Epic', art: '../img/weapons/heartwood_stormbow_card.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Heartwood%20Stormbow', statBonuses: { ATK: 10, SPD: 5 }, ability: { name: 'True Shot', description: "This hero's auto-attacks cannot be Evaded." } },

    // 7. Staff Family
    { id: 1701, type: 'weapon', name: 'Crooked Stick', rarity: 'Common', art: '../img/weapons/crooked_stick_card.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Crooked%20Stick', statBonuses: { HP: 3, SPD: 2 }, ability: null },
    { id: 1702, type: 'weapon', name: 'Apprentice Rod', rarity: 'Uncommon', art: '../img/weapons/apprentice_rod_card.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Apprentice%20Rod', statBonuses: { HP: 5, SPD: 3 }, ability: { name: 'Mana Tap', description: 'When this hero uses an Ability, they heal for 2 HP.' } },
    { id: 1703, type: 'weapon', name: "Sagewood Staff", rarity: 'Rare', art: '../img/weapons/sagewood_staff_card.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Spell%20Power', statBonuses: { HP: 8, SPD: 4 }, ability: { name: 'Spell Power', description: "All damage dealt by this hero's equipped Ability cards is increased by 2." } },
    { id: 1704, type: 'weapon', name: 'Archmage Catalyst', rarity: 'Epic', art: '../img/weapons/archmage_catalyst_card.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Archmage%20Catalyst', statBonuses: { HP: 12, SPD: 5 }, ability: { name: 'Ether Pulse', description: 'At the start of combat, gain 1 extra Energy.' } },

    // 8. Shield Family
    { id: 1801, type: 'weapon', name: 'Makeshift Buckler', rarity: 'Common', art: '../img/weapons/makeshift_buckler_card.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Makeshift%20Buckler', statBonuses: { HP: 5 }, ability: null },
    { id: 1802, type: 'weapon', name: 'Iron Kite Shield', rarity: 'Uncommon', art: '../img/weapons/iron_kite_shield_card.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Iron%20Kite%20Shield', statBonuses: { HP: 8 }, ability: { name: 'Shield Wall', description: 'When combat starts, this hero gains Block 1.' } },
    { id: 1803, type: 'weapon', name: 'Lionheart Wall', rarity: 'Rare', art: '../img/weapons/lionheart_wall_card.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Lionheart%20Wall', statBonuses: { HP: 12 }, ability: { name: 'Improved Shield Wall', description: 'When combat starts, this hero gains Block 2.' } },
    { id: 1804, type: 'weapon', name: 'Aegis of the Ages', rarity: 'Epic', art: '../img/weapons/aegis_of_the_ages_card.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Aegis%20of%20the%20Ages', statBonuses: { HP: 15 }, ability: { name: 'Guardian', description: 'When this hero is hit, one adjacent ally gains Block 1 for the next attack against them.' } }
];
// NOTE: Placeholder art links ('...') and IDs have been assigned.

const allPossibleAbilities = [
    { id: 3111, type: 'ability', name: 'Power Strike', class: 'Stalwart Defender', rarity: 'Common', art: 'https://placehold.co/150x126/ef4444/FFFFFF?text=Ability', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Power%20Strike', effect: 'Deal 2 damage to one enemy.', energyCost: 2, category: 'Offense' },
    { id: 3312, type: 'ability', name: 'Raging Strike', class: 'Raging Fighter', rarity: 'Common', art: 'https://placehold.co/150x126/ef4444/FFFFFF?text=Ability', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Raging%20Strike', effect: 'Deal 3 damage, but reduce your defense by 1 until next turn.', energyCost: 2, category: 'Defense' },
    { id: 3211, type: 'ability', name: 'Divine Strike', class: 'Holy Warrior', rarity: 'Common', art: 'https://placehold.co/150x126/ef4444/FFFFFF?text=Ability', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Divine%20Strike', effect: 'Deal 2 damage and heal yourself for 2 HP.', energyCost: 2, category: 'Offense' },
    { id: 3511, type: 'ability', name: 'Divine Light', class: 'Divine Healer', rarity: 'Common', art: 'https://placehold.co/150x126/ef4444/FFFFFF?text=Ability', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Divine%20Light', effect: 'Heal an ally for 4 HP.', energyCost: 2, category: 'Support', targetType: 'friendly' },
    { id: 3612, type: 'ability', name: 'Regrowth', class: 'Nature Shaper', rarity: 'Common', art: 'https://placehold.co/150x126/ef4444/FFFFFF?text=Ability', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Regrowth', effect: 'Heal an ally for 2 HP per turn over 3 turns.', energyCost: 2, category: 'Support', targetType: 'friendly' },
    { id: 4004, type: 'ability', name: 'Illusionary Strike', class: 'Mystic Deceiver', rarity: 'Common', art: '...', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Illusionary%20Strike', effect: 'Deal 2 damage and confuse the target (50% chance they miss their next action).', energyCost: 2, category: 'Offense' },
    { id: 3712, type: 'ability', name: 'Dissonant Chord', class: 'Inspiring Artist', rarity: 'Common', art: 'https://placehold.co/150x126/ef4444/FFFFFF?text=Ability', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Dissonant%20Chord', effect: 'Deal 1 damage and reduce enemy attack by 1 next turn.', energyCost: 2, category: 'Offense' },
    { id: 3811, type: 'ability', name: 'Precision Shot', class: 'Wilderness Expert', rarity: 'Common', art: 'https://placehold.co/150x126/ef4444/FFFFFF?text=Ability', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Precision%20Shot', effect: 'Deal 3 damage to a single enemy.', energyCost: 2, category: 'Offense' },
    { id: 3411, type: 'ability', name: 'Chaos Bolt', class: 'Raw Power Mage', rarity: 'Common', art: 'https://placehold.co/150x126/ef4444/FFFFFF?text=Ability', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Chaos%20Bolt', effect: 'Deal 3 damage of a random element.', energyCost: 2, category: 'Offense' },
    { id: 4104, type: 'ability', name: 'Backstab', class: 'Shadow Striker', rarity: 'Common', art: '...', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Backstab', effect: 'Deal 2 damage, or 4 damage if the enemy is stunned or distracted.', energyCost: 2, category: 'Offense' },
    { id: 4201, type: 'ability', name: 'Fireball', class: 'Arcane Savant', rarity: 'Common', art: '...', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Fireball', effect: 'Deal 3 fire damage to a single target.', energyCost: 2, category: 'Offense' },
];
// NOTE: Placeholder art links ('...') and new IDs have been assigned.

const allPossibleArmors = [
    // 1. Light Armor (Evasion & Speed)
    { id: 2101, type: 'armor', name: 'Leather Padding', rarity: 'Common', armorType: 'Light', art: '../img/armor/leather_padding_card.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Leather%20Padding', statBonuses: { Block: 1 }, ability: null },
    { id: 2102, type: 'armor', name: 'Agile Reflexes', rarity: 'Uncommon', armorType: 'Light', art: '../img/armor/agile_reflexes_card.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Agile%20Reflexes', statBonuses: { Evasion: 2 }, ability: null },
    { id: 2103, type: 'armor', name: 'Shadow Garb', rarity: 'Rare', armorType: 'Light', art: '../img/armor/shadow_garb_card.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Shadow%20Garb', statBonuses: { Evasion: 2, SPD: 1 }, ability: null },
    { id: 2104, type: 'armor', name: 'Phantom Cloak', rarity: 'Epic', armorType: 'Light', art: '../img/armor/phantom_cloak_card.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Phantom%20Cloak', statBonuses: { Evasion: 3 }, ability: { name: 'Untouchable', description: 'Once per combat, the first time this hero is attacked, they ignore it.' } },

    // 2. Medium Armor (Balanced Defense & Utility)
    { id: 2201, type: 'armor', name: 'Studded Vest', rarity: 'Common', armorType: 'Medium', art: '../img/armor/studded_vest_card.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Studded%20Vest', statBonuses: { Block: 1, Evasion: 1 }, ability: null },
    { id: 2202, type: 'armor', name: 'Chainmail Guard', rarity: 'Uncommon', armorType: 'Medium', art: '../img/armor/chainmail_guard_card.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Chainmail%20Guard', statBonuses: { Block: 2 }, ability: null },
    { id: 2203, type: 'armor', name: 'Vanguard Mail', rarity: 'Rare', armorType: 'Medium', art: '../img/armor/vanguard_mail_card.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Vanguard%20Mail', statBonuses: { Block: 2 }, ability: { name: 'Thorns', description: 'When hit by a melee attack, reflect 1 damage back to the attacker.' } },
    { id: 2204, type: 'armor', name: 'Captain’s Bulwark', rarity: 'Epic', armorType: 'Medium', art: '../img/armor/captains_bulwark_card.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Captain%E2%80%99s%20Bulwark', statBonuses: { Block: 2 }, ability: { name: 'Inspiring Presence', description: 'Adjacent allies gain +1 Block.' } },

    // 3. Heavy Armor (Pure Damage Soak)
    { id: 2301, type: 'armor', name: 'Iron Plate', rarity: 'Common', armorType: 'Heavy', art: '../img/armor/iron_plate_card.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Iron%20Plate', statBonuses: { Block: 2 }, ability: null },
    { id: 2302, type: 'armor', name: 'Reinforced Plating', rarity: 'Uncommon', armorType: 'Heavy', art: '../img/armor/reinforced_plating_card.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Reinforced%20Plating', statBonuses: { Block: 3, SPD: -1 }, ability: null },
    { id: 2303, type: 'armor', name: 'Juggernaut Armor', rarity: 'Rare', armorType: 'Heavy', art: '../img/armor/juggernaut_armor_card.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Juggernaut%20Armor', statBonuses: { Block: 3 }, ability: { name: 'Unstoppable', description: 'This hero is immune to Stun effects.' } },
    { id: 2304, type: 'armor', name: 'Aegis of the Colossus', rarity: 'Epic', armorType: 'Heavy', art: '../img/armor/aegis_of_the_colossus_card.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Aegis%20of%20the%20Colossus', statBonuses: { Block: 1 }, ability: { name: 'Aegis Protection', description: 'Once per combat, completely nullify the damage from one attack.' } },

    // 4. Magic Armor (Magical Defense)
    { id: 2401, type: 'armor', name: 'Mystic Robes', rarity: 'Common', armorType: 'Magic', art: '../img/armor/mystic_robes_card.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Mystic%20Robes', statBonuses: { MagicResist: 2 }, ability: null },
    { id: 2402, type: 'armor', name: 'Arcane Shielding', rarity: 'Uncommon', armorType: 'Magic', art: '../img/armor/arcane_shielding_card.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Arcane%20Shielding', statBonuses: {}, ability: { name: 'Spell Ward', description: 'Once per combat, block the effects of the next enemy ability.' } },
    { id: 2403, type: 'armor', name: 'Runed Cloak', rarity: 'Rare', armorType: 'Magic', art: '../img/armor/runed_cloak_card.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Runed%20Cloak', statBonuses: { MagicResist: 3, SPD: 1 }, ability: null },
    { id: 2404, type: 'armor', name: 'Ward of Eternity', rarity: 'Epic', armorType: 'Magic', art: '../img/armor/ward_of_eternity_card.png', imageUrl: 'https://placehold.co/300x400/1e293b/ffffff?text=Ward%20of%20Eternity', statBonuses: { MagicResist: 2 }, ability: { name: 'Magic Immunity', description: 'This hero is immune to all magic damage.' } },
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

