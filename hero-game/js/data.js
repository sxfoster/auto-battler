// This file contains all the raw data for game entities.
// In a real application, this would likely be fetched from a server API.

export const allPossibleHeroes = [
    // Warrior Class
    { type: 'hero', id: 1, name: 'Recruit', class: 'Warrior', rarity: 'Common', art: 'https://placehold.co/150x126/6b7280/FFFFFF?text=Recruit', hp: 18, attack: 3, abilities: [] },
    { type: 'hero', id: 2, name: 'Squire', class: 'Warrior', rarity: 'Uncommon', art: 'https://placehold.co/150x126/78716c/FFFFFF?text=Squire', hp: 22, attack: 5, abilities: [] },
    { type: 'hero', id: 3, name: 'Warrior', class: 'Warrior', rarity: 'Rare', art: 'https://placehold.co/150x126/57534e/FFFFFF?text=Warrior', hp: 25, attack: 7, abilities: [] },
    { type: 'hero', id: 4, name: 'Champion', class: 'Warrior', rarity: 'Ultra Rare', art: 'https://placehold.co/150x126/1c1917/FFFFFF?text=Champ', hp: 30, attack: 10, abilities: [] },

    // Mage Class
    { type: 'hero', id: 5, name: 'Apprentice', class: 'Mage', rarity: 'Common', art: 'https://placehold.co/150x126/93c5fd/1e3a8a?text=Apprentice', hp: 15, attack: 2, abilities: [] },
    { type: 'hero', id: 6, name: 'Mage', class: 'Mage', rarity: 'Rare', art: 'https://placehold.co/150x126/60a5fa/1e3a8a?text=Mage', hp: 20, attack: 4, abilities: [] },

    // Rogue Class
    { type: 'hero', id: 7, name: 'Thief', class: 'Rogue', rarity: 'Common', art: 'https://placehold.co/150x126/a78bfa/4c1d95?text=Thief', hp: 16, attack: 4, abilities: [] },
    { type: 'hero', id: 8, name: 'Assassin', class: 'Rogue', rarity: 'Rare', art: 'https://placehold.co/150x126/8b5cf6/4c1d95?text=Assassin', hp: 21, attack: 8, abilities: [] },

    // Priest Class
    { type: 'hero', id: 9, name: 'Acolyte', class: 'Priest', rarity: 'Common', art: 'https://placehold.co/150x126/fef08a/b45309?text=Acolyte', hp: 17, attack: 2, abilities: [] },
    { type: 'hero', id: 10, name: 'Priest', class: 'Priest', rarity: 'Uncommon', art: 'https://placehold.co/150x126/fde047/b45309?text=Priest', hp: 21, attack: 3, abilities: [] },

    // Ranger Class
    { type: 'hero', id: 11, name: 'Hunter', class: 'Ranger', rarity: 'Common', art: 'https://placehold.co/150x126/86efac/15803d?text=Hunter', hp: 17, attack: 4, abilities: [] },
    { type: 'hero', id: 12, name: 'Ranger', class: 'Ranger', rarity: 'Uncommon', art: 'https://placehold.co/150x126/4ade80/15803d?text=Ranger', hp: 22, attack: 6, abilities: [] },

    // Paladin Class
    { type: 'hero', id: 13, name: 'Vindicator', class: 'Paladin', rarity: 'Rare', art: 'https://placehold.co/150x126/fef9c3/a16207?text=Vindicator', hp: 28, attack: 5, abilities: [] },
    { type: 'hero', id: 14, name: 'Paladin', class: 'Paladin', rarity: 'Ultra Rare', art: 'https://placehold.co/150x126/fefce8/a16207?text=Paladin', hp: 32, attack: 8, abilities: [] },

    // Barbarian Class
    { type: 'hero', id: 15, name: 'Brute', class: 'Barbarian', rarity: 'Common', art: 'https://placehold.co/150x126/fca5a5/991b1b?text=Brute', hp: 20, attack: 4, abilities: [] },
    { type: 'hero', id: 16, name: 'Barbarian', class: 'Barbarian', rarity: 'Uncommon', art: 'https://placehold.co/150x126/f87171/991b1b?text=Barbarian', hp: 26, attack: 6, abilities: [] },

    // Monk Class
    { type: 'hero', id: 17, name: 'Initiate', class: 'Monk', rarity: 'Common', art: 'https://placehold.co/150x126/fdba74/c2410c?text=Initiate', hp: 16, attack: 4, abilities: [] },
    { type: 'hero', id: 18, name: 'Monk', class: 'Monk', rarity: 'Rare', art: 'https://placehold.co/150x126/fb923c/c2410c?text=Monk', hp: 24, attack: 5, abilities: [] },

    // Druid Class
    { type: 'hero', id: 19, name: 'Shapeshifter', class: 'Druid', rarity: 'Uncommon', art: 'https://placehold.co/150x126/a3e635/3f6212?text=Shapeshifter', hp: 23, attack: 5, abilities: [] },
    { type: 'hero', id: 20, name: 'Archdruid', class: 'Druid', rarity: 'Ultra Rare', art: 'https://placehold.co/150x126/84cc16/3f6212?text=Archdruid', hp: 28, attack: 7, abilities: [] },

    // Warlock Class
    { type: 'hero', id: 21, name: 'Cultist', class: 'Warlock', rarity: 'Common', art: 'https://placehold.co/150x126/c084fc/581c87?text=Cultist', hp: 16, attack: 3, abilities: [] },
    { type: 'hero', id: 22, name: 'Warlock', class: 'Warlock', rarity: 'Rare', art: 'https://placehold.co/150x126/a855f7/581c87?text=Warlock', hp: 22, attack: 6, abilities: [] },

    // Bard Class
    { type: 'hero', id: 23, name: 'Minstrel', class: 'Bard', rarity: 'Uncommon', art: 'https://placehold.co/150x126/f9a8d4/9d2667?text=Minstrel', hp: 20, attack: 2, abilities: [] },
];

export const allPossibleWeapons = [
    { type: 'weapon', id: 101, name: 'Iron Sword', rarity: 'Common', art: 'https://placehold.co/256x202/6b7280/FFFFFF?text=Sword', damage: 2, abilities: [
        { name: 'Cleave', description: 'Deals 50% damage to the second target.', target: 'ENEMY_ADDITIONAL', effects: [{ type: 'DEAL_DAMAGE_PERCENT', percent: 50 }] }
    ] },
    { type: 'weapon', id: 102, name: 'Mage Staff', rarity: 'Uncommon', art: 'https://placehold.co/256x202/5b21b6/FFFFFF?text=Staff', damage: 1, abilities: [
        { name: 'Fireball', description: 'The wielder\'s basic attack becomes Fireball.' }
    ] },
    { type: 'weapon', id: 103, name: 'Glimmering Dagger', rarity: 'Rare', art: 'https://placehold.co/256x202/facc15/000000?text=Dagger', damage: 3, abilities: [
        { name: 'Poison Tip', description: '10% chance to apply Poison on hit.', target: 'ENEMY_SINGLE', effects: [{ type: 'APPLY_STATUS_CHANCE', status: 'Poison', duration: 3, chance: 0.1 }] }
    ] },
];

export const battleSpeeds = [
    { label: '1x', multiplier: 2 },
    { label: '2x', multiplier: 1 },
    { label: '0.5x', multiplier: 4 }
];
