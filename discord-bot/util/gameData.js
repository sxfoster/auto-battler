const {
    allPossibleHeroes,
    allPossibleWeapons,
    allPossibleArmors,
    allPossibleAbilities
} = require('../../backend/game/data');

const gameData = {
    heroes: new Map(),
    weapons: new Map(),
    armors: new Map(),
    abilities: new Map(),
};

async function loadAllData() {
    try {
        for (const hero of allPossibleHeroes) {
            gameData.heroes.set(hero.id, hero);
        }

        for (const weapon of allPossibleWeapons) {
            gameData.weapons.set(weapon.id, weapon);
        }

        for (const armor of allPossibleArmors) {
            gameData.armors.set(armor.id, armor);
        }

        for (const ability of allPossibleAbilities) {
            gameData.abilities.set(ability.id, ability);
        }

        console.log(`✅ Loaded ${gameData.heroes.size} heroes, ${gameData.weapons.size} weapons, ${gameData.armors.size} armors, and ${gameData.abilities.size} abilities into cache.`);
    } catch (error) {
        console.error('❌ Failed to load game data into cache:', error);
        // In a production environment, you might want to exit the process if data loading fails
        // process.exit(1); 
    }
}

function getHeroes() {
    return Array.from(gameData.heroes.values());
}

function getHeroById(id) {
    return gameData.heroes.get(Number(id));
}

function getMonsters() {
    return getHeroes().filter(h => h.is_monster);
}

// Helper to select cards by rarity tier for booster packs
function getRandomCardsForPack(pool, count = 3, packRarity = 'basic') {
    let allowedRarities;
    switch (packRarity) {
        case 'premium':
            allowedRarities = ['Uncommon', 'Rare', 'Epic'];
            break;
        case 'standard':
            allowedRarities = ['Common', 'Uncommon', 'Rare'];
            break;
        case 'basic':
        default:
            allowedRarities = ['Common', 'Uncommon'];
            break;
    }

    const filteredPool = pool.filter(item => allowedRarities.includes(item.rarity));
    const shuffled = [...filteredPool].sort(() => 0.5 - Math.random());
    const uniqueCards = [];
    const uniqueIds = new Set();

    for (const card of shuffled) {
        if (!uniqueIds.has(card.id)) {
            uniqueCards.push(card);
            uniqueIds.add(card.id);
            if (uniqueCards.length >= count) break;
        }
    }

    while (uniqueCards.length < count) {
        const fallback = pool[Math.floor(Math.random() * pool.length)];
        if (!uniqueIds.has(fallback.id)) {
            uniqueCards.push(fallback);
            uniqueIds.add(fallback.id);
        }
    }

    return uniqueCards;
}

module.exports = {
    gameData,
    loadAllData,
    getHeroes,
    getHeroById,
    getMonsters,
    getRandomCardsForPack,
};
