const db = require('./database');

const gameData = {
    heroes: new Map(),
    weapons: new Map(),
    armors: new Map(),
    abilities: new Map(),
};

async function loadAllData() {
    try {
        // Corrected SQL query with snake_case
        const [heroes] = await db.execute('SELECT id, name, rarity, class, is_monster, trait FROM heroes');
        for (const hero of heroes) {
            gameData.heroes.set(hero.id, hero);
        }

        const [weapons] = await db.execute('SELECT * FROM weapons');
        for (const weapon of weapons) {
            gameData.weapons.set(weapon.id, weapon);
        }

        const [armors] = await db.execute('SELECT * FROM armors');
        for (const armor of armors) {
            gameData.armors.set(armor.id, armor);
        }

        const [abilities] = await db.execute('SELECT * FROM abilities');
        for (const ability of abilities) {
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

module.exports = {
    gameData,
    loadAllData,
    getHeroes,
    getHeroById,
    getMonsters,
};
