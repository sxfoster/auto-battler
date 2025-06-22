const GameEngine = require('./game/engine');
const { allPossibleHeroes, allPossibleWeapons, allPossibleArmors, allPossibleAbilities } = require('./game/data');

function createCombatant(hero, weapon, armor, ability, team, position) {
    if (!hero) return null;
    const finalStats = { hp: hero.hp, attack: hero.attack, speed: hero.speed, block: 0, evasion: 0, magicResist: 0 };
    return {
        id: `${team}-hero-${position}`,
        heroData: hero,
        weaponData: weapon,
        armorData: armor,
        abilityData: ability,
        team,
        position,
        currentHp: finalStats.hp,
        maxHp: finalStats.hp,
        currentEnergy: 0,
        statusEffects: [],
        ...finalStats
    };
}

const player1 = createCombatant(allPossibleHeroes.find(h => h.id === 101), allPossibleWeapons[0], null, null, 'player', 0);
const player2 = createCombatant(allPossibleHeroes.find(h => h.id === 201), allPossibleWeapons[1], null, null, 'player', 1);

const enemy1 = createCombatant(allPossibleHeroes.find(h => h.id === 301), allPossibleWeapons[2], null, null, 'enemy', 0);
const enemy2 = createCombatant(allPossibleHeroes.find(h => h.id === 401), allPossibleWeapons[3], null, null, 'enemy', 1);

const mockCombatants = [player1, player2, enemy1, enemy2];

const game = new GameEngine(mockCombatants);
game.runFullGame();

console.log("\n--- FINAL STATE ---");
game.combatants.forEach(c => {
    console.log(`${c.heroData.name} (${c.team}): ${c.currentHp}/${c.maxHp} HP`);
});
