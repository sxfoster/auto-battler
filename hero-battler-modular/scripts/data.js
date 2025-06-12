export const allPossibleHeroes = [
    // Warrior Class
    { type: 'hero', id: 1, name: 'Recruit', rarity: 'Common', art: 'https://placehold.co/150x126/6b7280/FFFFFF?text=Recruit', hp: 18, attack: 3, abilities: [{ name: 'Basic Strike', description: 'Deals 3 damage.' }] },
    { type: 'hero', id: 2, name: 'Squire', rarity: 'Uncommon', art: 'https://placehold.co/150x126/78716c/FFFFFF?text=Squire', hp: 22, attack: 5, abilities: [{ name: 'Power Strike', description: 'Deals 5 damage.' }, { name: 'Fortify', description: 'Passive: Reduce all incoming damage by 1.' }] },
    { type: 'hero', id: 3, name: 'Warrior', rarity: 'Rare', art: 'https://placehold.co/150x126/57534e/FFFFFF?text=Warrior', hp: 25, attack: 7, abilities: [{ name: 'Shield Bash', description: 'Deals 1 damage and Stuns the target for 1 turn.' }, { name: 'Power Strike', description: 'Deals 7 damage.' }] },
    { type: 'hero', id: 4, name: 'Champion', rarity: 'Ultra Rare', art: 'https://placehold.co/150x126/1c1917/FFFFFF?text=Champ', hp: 30, attack: 10, abilities: [{ name: 'Whirlwind', description: 'Deals 4 damage to all enemies.' }, { name: 'Execute', description: 'Deals 10 damage to a single target.' }] },

    // Mage Class
    { type: 'hero', id: 5, name: 'Apprentice', rarity: 'Common', art: 'https://placehold.co/150x126/93c5fd/1e3a8a?text=Apprentice', hp: 15, attack: 2, abilities: [{ name: 'Magic Bolt', description: 'Deals 2 damage.' }] },
    { type: 'hero', id: 6, name: 'Mage', rarity: 'Rare', art: 'https://placehold.co/150x126/60a5fa/1e3a8a?text=Mage', hp: 20, attack: 4, abilities: [{ name: 'Fireball', description: 'Deals 8 damage.' }, { name: 'Frost Armor', description: 'Gain 5 temporary HP.' }] },

    // Rogue Class
    { type: 'hero', id: 7, name: 'Thief', rarity: 'Common', art: 'https://placehold.co/150x126/a78bfa/4c1d95?text=Thief', hp: 16, attack: 4, abilities: [{ name: 'Quick Stab', description: 'Deals 4 damage.' }] },
    { type: 'hero', id: 8, name: 'Assassin', rarity: 'Rare', art: 'https://placehold.co/150x126/8b5cf6/4c1d95?text=Assassin', hp: 21, attack: 8, abilities: [{ name: 'Backstab', description: 'Deals 12 damage if target is above 50% HP.' }, { name: 'Vanish', description: 'Become untargetable for 1 turn.' }] },

    // Priest Class
    { type: 'hero', id: 9, name: 'Acolyte', rarity: 'Common', art: 'https://placehold.co/150x126/fef08a/b45309?text=Acolyte', hp: 17, attack: 2, abilities: [{ name: 'Minor Heal', description: 'Restores 4 HP to an ally.' }] },
    { type: 'hero', id: 10, name: 'Priest', rarity: 'Uncommon', art: 'https://placehold.co/150x126/fde047/b45309?text=Priest', hp: 21, attack: 3, abilities: [{ name: 'Heal', description: 'Restores 8 HP.' }, { name: 'Smite', description: 'Deals 3 damage.' }] },

    // Ranger Class
    { type: 'hero', id: 11, name: 'Hunter', rarity: 'Common', art: 'https://placehold.co/150x126/86efac/15803d?text=Hunter', hp: 17, attack: 4, abilities: [{ name: 'Aimed Shot', description: 'Deals 4 damage.' }] },
    { type: 'hero', id: 12, name: 'Ranger', rarity: 'Uncommon', art: 'https://placehold.co/150x126/4ade80/15803d?text=Ranger', hp: 22, attack: 6, abilities: [{ name: 'Rapid Fire', description: 'Attacks twice for 3 damage each.' }, { name: 'Tracking Shot', description: 'Target takes +1 damage from all sources.' }] },

    // Paladin Class
    { type: 'hero', id: 13, name: 'Vindicator', rarity: 'Rare', art: 'https://placehold.co/150x126/fef9c3/a16207?text=Vindicator', hp: 28, attack: 5, abilities: [{ name: 'Divine Strike', description: 'Deals 5 damage and heals self for 2.' }] },
    { type: 'hero', id: 14, name: 'Paladin', rarity: 'Ultra Rare', art: 'https://placehold.co/150x126/fefce8/a16207?text=Paladin', hp: 32, attack: 8, abilities: [{ name: 'Holy Smite', description: 'Deals 8 damage and heals all allies for 2.' }, {name: 'Divine Shield', description: 'Become immune to damage for 1 turn.'}] },

    // Barbarian Class
    { type: 'hero', id: 15, name: 'Brute', rarity: 'Common', art: 'https://placehold.co/150x126/fca5a5/991b1b?text=Brute', hp: 20, attack: 4, abilities: [{ name: 'Heavy Swing', description: 'Deals 4 damage.'}] },
    { type: 'hero', id: 16, name: 'Barbarian', rarity: 'Uncommon', art: 'https://placehold.co/150x126/f87171/991b1b?text=Barbarian', hp: 26, attack: 6, abilities: [{ name: 'Reckless Attack', description: 'Deals 10 damage, but take 3 damage.'}, {name: 'Enrage', description: '+2 Attack for 3 turns.'}] },

    // Monk Class
    { type: 'hero', id: 17, name: 'Initiate', rarity: 'Common', art: 'https://placehold.co/150x126/fdba74/c2410c?text=Initiate', hp: 16, attack: 4, abilities: [{ name: 'Swift Fist', description: 'Deals 4 damage.'}] },
    { type: 'hero', id: 18, name: 'Monk', rarity: 'Rare', art: 'https://placehold.co/150x126/fb923c/c2410c?text=Monk', hp: 24, attack: 5, abilities: [{ name: 'Flurry of Blows', description: 'Attack 3 times for 2 damage each.'}, {name: 'Stunning Palm', description: 'Has a 25% chance to Stun.'}] },

    // Druid Class
    { type: 'hero', id: 19, name: 'Shapeshifter', rarity: 'Uncommon', art: 'https://placehold.co/150x126/a3e635/3f6212?text=Shapeshifter', hp: 23, attack: 5, abilities: [{ name: 'Bear Form', description: 'Gain +5 HP and +2 Attack for 2 turns.'}] },
    { type: 'hero', id: 20, name: 'Archdruid', rarity: 'Ultra Rare', art: 'https://placehold.co/150x126/84cc16/3f6212?text=Archdruid', hp: 28, attack: 7, abilities: [{ name: 'Entangling Roots', description: 'Target cannot attack for 2 turns.'}, { name: 'Starfall', description: 'Deals 3 damage to all enemies for 2 turns.'}] },

    // Warlock Class
    { type: 'hero', id: 21, name: 'Cultist', rarity: 'Common', art: 'https://placehold.co/150x126/c084fc/581c87?text=Cultist', hp: 16, attack: 3, abilities: [{ name: 'Shadow Bolt', description: 'Deals 3 damage.'}] },
    { type: 'hero', id: 22, name: 'Warlock', rarity: 'Rare', art: 'https://placehold.co/150x126/a855f7/581c87?text=Warlock', hp: 22, attack: 6, abilities: [{ name: 'Life Drain', description: 'Deals 5 damage and heal for the same amount.'}, { name: 'Curse of Weakness', description: 'Target deals -2 damage for 3 turns.'}] },

    // Bard Class
    { type: 'hero', id: 23, name: 'Minstrel', rarity: 'Uncommon', art: 'https://placehold.co/150x126/f9a8d4/9d2667?text=Minstrel', hp: 20, attack: 2, abilities: [{ name: 'Song of Vigor', description: 'All allies gain +1 attack.'}, { name: 'Dissonance', description: 'Confuses target, 50% chance to attack ally.'}] },
];

export const allPossibleWeapons = [
    { type: 'weapon', id: 101, name: 'Iron Sword', rarity: 'Common', art: 'https://placehold.co/256x202/6b7280/FFFFFF?text=Sword', damage: 2, abilities: [{ name: 'Cleave', description: 'Deals 50% damage to the second target.' }] },
    { type: 'weapon', id: 102, name: 'Mage Staff', rarity: 'Uncommon', art: 'https://placehold.co/256x202/5b21b6/FFFFFF?text=Staff', damage: 1, abilities: [{ name: 'Fireball', description: 'The wielder\'s basic attack becomes Fireball.' }] },
    { type: 'weapon', id: 103, name: 'Glimmering Dagger', rarity: 'Rare', art: 'https://placehold.co/256x202/facc15/000000?text=Dagger', damage: 3, abilities: [{ name: 'Poison Tip', description: '10% chance to apply Poison on hit.' }] },
];

export const allPossibleAbilities = [
    { type: 'ability', id: 201, class: 'Mage', name: 'Arcane Surge', rarity: 'Common', art: 'https://placehold.co/256x202/4f46e5/FFFFFF?text=Arcane', abilities: [{ name: 'Arcane Surge', description: 'Deal 5 magic damage.' }] },
    { type: 'ability', id: 202, class: 'Warrior', name: 'Shield Wall', rarity: 'Uncommon', art: 'https://placehold.co/256x202/334155/FFFFFF?text=Wall', abilities: [{ name: 'Shield Wall', description: 'Reduce incoming damage by 2 for one turn.' }] },
    { type: 'ability', id: 203, class: 'Priest', name: 'Greater Heal', rarity: 'Rare', art: 'https://placehold.co/256x202/fde047/1f2937?text=Heal', abilities: [{ name: 'Greater Heal', description: 'Restore 6 HP to an ally.' }] }
];

export const allPossibleArmors = [
    { type: 'armor', id: 301, name: 'Leather Armor', rarity: 'Common', art: 'https://placehold.co/256x202/78350f/FFFFFF?text=Leather', defense: 1, abilities: [{ name: 'Dodge', description: '10% chance to evade attacks.' }] },
    { type: 'armor', id: 302, name: 'Chainmail', rarity: 'Uncommon', art: 'https://placehold.co/256x202/6b7280/FFFFFF?text=Chain', defense: 2, abilities: [{ name: 'Resist', description: 'Reduce physical damage by 1.' }] },
    { type: 'armor', id: 303, name: 'Plate Armor', rarity: 'Rare', art: 'https://placehold.co/256x202/1e40af/FFFFFF?text=Plate', defense: 3, abilities: [{ name: 'Bulwark', description: 'Gain 3 temporary HP at start of battle.' }] }
];
