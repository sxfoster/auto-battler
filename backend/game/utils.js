const { allPossibleHeroes, allPossibleWeapons, allPossibleArmors, allPossibleAbilities } = require('./data');

function createCombatant(playerData, team, position) {
    // Find all the data for the player's chosen hero and equipment
    const hero = allPossibleHeroes.find(h => h.id === playerData.hero_id);
    const weapon = allPossibleWeapons.find(w => w.id === playerData.weapon_id);
    const armor = allPossibleArmors.find(a => a.id === playerData.armor_id);
    const ability = allPossibleAbilities.find(a => a.id === playerData.ability_id);

    if (!hero) return null;

    // Simplified stat calculation (can be expanded later)
    const finalStats = {
        hp: hero.hp,
        attack: hero.attack + (weapon ? weapon.statBonuses.ATK || 0 : 0),
        speed: hero.speed
    };

    return {
        id: `${team}-hero-${position}`,
        heroData: hero,
        weaponData: weapon,
        armorData: armor,
        abilityData: ability,
        team: team,
        position: position,
        currentHp: finalStats.hp,
        maxHp: finalStats.hp,
        currentEnergy: 0,
        statusEffects: [],
        ...finalStats
    };
}

module.exports = { createCombatant };
