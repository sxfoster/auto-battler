const { allPossibleHeroes, allPossibleWeapons, allPossibleArmors, allPossibleAbilities } = require('./data');

function createCombatant(playerData, team, position) {
    // Determine the equipped ability from either an ability card or raw id
    const abilityId = playerData.ability_card
        ? playerData.ability_card.ability_id
        : playerData.ability_id;
    const ability = allPossibleAbilities.find(a => a.id === abilityId);

    // Resolve the hero based on the equipped ability's class/rarity when a card
    // is provided. Fallback to a direct hero_id lookup for existing callers.
    let hero;
    if (playerData.ability_card && ability) {
        hero = allPossibleHeroes.find(
            h => h.class === ability.class && h.rarity === ability.rarity
        );
    }
    if (!hero) {
        hero = allPossibleHeroes.find(h => h.id === playerData.hero_id);
    }

    const weapon = allPossibleWeapons.find(w => w.id === playerData.weapon_id);
    const armor = allPossibleArmors.find(a => a.id === playerData.armor_id);
    const deckAbilities = (playerData.deck || []).map(entry => {
        if (typeof entry === 'object') {
            const a = allPossibleAbilities.find(ab => ab.id === entry.ability_id);
            return a ? { ...a, cardId: entry.id, charges: entry.charges ?? 10 } : null;
        } else {
            const a = allPossibleAbilities.find(ab => ab.id === entry);
            return a ? { ...a, charges: 10 } : null;
        }
    }).filter(Boolean);

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
        abilityData: ability
            ? (playerData.ability_card ? { ...ability, cardId: playerData.ability_card.id } : ability)
            : deckAbilities[0] || null,
        abilityCharges: ability
            ? (playerData.ability_card ? playerData.ability_card.charges : 10)
            : (deckAbilities[0] ? deckAbilities[0].charges : 0),
        deck: ability ? deckAbilities : deckAbilities.slice(1),
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
