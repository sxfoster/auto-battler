const { allPossibleHeroes, allPossibleWeapons, allPossibleArmors, allPossibleAbilities } = require('./data');

// Stat growth per level for each class
const statGrowth = {
    'Stalwart Defender': { hp: 3, attack: 1 },
    'Holy Warrior': { hp: 3, attack: 1 },
    'Raging Fighter': { hp: 2, attack: 2 },
    'Raw Power Mage': { hp: 2, attack: 2 },
    'Divine Healer': { hp: 2, attack: 1 },
    'Nature Shaper': { hp: 2, attack: 1 },
    'Inspiring Artist': { hp: 2, attack: 1 },
    'Wilderness Expert': { hp: 2, attack: 2 },
    'Mystic Deceiver': { hp: 2, attack: 1 },
    'Shadow Striker': { hp: 1, attack: 2 },
    'Arcane Savant': { hp: 1, attack: 2 },
    'default': { hp: 2, attack: 1 }
};

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
            return a ? { ...a, cardId: entry.id, charges: entry.charges ?? 20 } : null;
        } else {
            const a = allPossibleAbilities.find(ab => ab.id === entry);
            return a ? { ...a, charges: 20 } : null;
        }
    }).filter(Boolean);

    if (!hero) return null;

    // --- START: Player Stat Scaling Logic ---
    const level = playerData.level || 1;
    const growth = statGrowth[hero.class] || statGrowth['default'];

    const bonusHp = (level - 1) * growth.hp;
    const bonusAttack = (level - 1) * growth.attack;

    // Calculate final stats including equipment bonuses and level scaling
    const finalStats = {
        hp: hero.hp + bonusHp,
        attack: hero.attack + bonusAttack,
        speed: hero.speed,
        defense: hero.defense || 0
    };

    if (weapon && weapon.statBonuses) {
        finalStats.attack += weapon.statBonuses.ATK || 0;
        finalStats.hp += weapon.statBonuses.HP || 0;
        finalStats.speed += weapon.statBonuses.SPD || 0;
        finalStats.defense += weapon.statBonuses.DEFENSE || 0;
    }

    if (armor && armor.statBonuses) {
        finalStats.attack += armor.statBonuses.ATK || 0;
        finalStats.hp += armor.statBonuses.HP || 0;
        finalStats.speed += armor.statBonuses.SPD || 0;
        finalStats.defense += armor.statBonuses.DEFENSE || 0;
    }

    return {
        id: `${team}-hero-${position}`,
        name: playerData.name || hero.name,
        level: level,
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
