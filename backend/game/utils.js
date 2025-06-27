const { allPossibleHeroes, allPossibleWeapons, allPossibleArmors, allPossibleAbilities } = require('./data');

function createCombatant(playerData, team, position) {
    // Find all the data for the player's chosen hero and equipment
    const hero = allPossibleHeroes.find(h => h.id === playerData.hero_id);
    const weapon = allPossibleWeapons.find(w => w.id === playerData.weapon_id);
    const armor = allPossibleArmors.find(a => a.id === playerData.armor_id);
    const ability = allPossibleAbilities.find(a => a.id === playerData.ability_id);
    const deckAbilities = (playerData.deck || []).map(id => allPossibleAbilities.find(a => a.id === id));
    const abilityCards = (playerData.ability_cards || []).map(card => ({
        id: card.id,
        abilityId: card.abilityId,
        abilityData: allPossibleAbilities.find(a => a.id === card.abilityId),
        charges: card.charges
    }));

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
        deck: deckAbilities,
        abilityCards: abilityCards,
        team: team,
        position: position,
        currentHp: finalStats.hp,
        maxHp: finalStats.hp,
        currentEnergy: 0,
        statusEffects: [],
        ...finalStats
    };
}

function generateRandomChampion() {
    const commonHeroes = allPossibleHeroes.filter(h => h.rarity === 'Common');
    const hero = commonHeroes[Math.floor(Math.random() * commonHeroes.length)];

    const abilityPool = allPossibleAbilities.filter(a => a.class === hero.class && a.rarity === 'Common');
    const ability = abilityPool.length ? abilityPool[Math.floor(Math.random() * abilityPool.length)] : null;

    const commonWeapons = allPossibleWeapons.filter(w => w.rarity === 'Common');
    const weapon = commonWeapons[Math.floor(Math.random() * commonWeapons.length)];

    const commonArmors = allPossibleArmors.filter(a => a.rarity === 'Common');
    const armor = commonArmors[Math.floor(Math.random() * commonArmors.length)];

    return {
        hero_id: hero.id,
        ability_id: ability ? ability.id : null,
        weapon_id: weapon.id,
        armor_id: armor.id,
    };
}

module.exports = { createCombatant, generateRandomChampion };
