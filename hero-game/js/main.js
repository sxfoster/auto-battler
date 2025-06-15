// Import data and utilities
import { allPossibleHeroes, allPossibleWeapons, allPossibleArmors, allPossibleAbilities } from './data.js';

// Import UI and Scene classes
import { PackScene } from './scenes/PackScene.js';
import { DraftScene } from './scenes/DraftScene.js';
import { WeaponScene } from './scenes/WeaponScene.js';
import { RecapScene } from './scenes/RecapScene.js';
// RevealScene handles displaying cards from a pack
import { RevealScene } from './scenes/RevealScene.js';
import { BattleScene } from './scenes/BattleScene.js';

// --- STATE MANAGEMENT ---
// Centralized game state
const gameState = {
    currentScene: 'pack', // 'pack', 'draft', 'weapon', 'battle'
    draft: {
        stage: 'HERO_1_PACK', // HERO_1_PACK, HERO_1_DRAFT, WEAPON_1_DRAFT, HERO_2_PACK, etc.
        playerTeam: { hero1: null, ability1: null, weapon1: null, armor1: null, hero2: null, ability2: null, weapon2: null, armor2: null },
    }
};

// --- DOM ELEMENTS ---
const sceneElements = {
    pack: document.getElementById('pack-scene'),
    // element used for the card reveal flow
    reveal: document.getElementById('reveal-scene'),
    draft: document.getElementById('draft-scene'),
    weapon: document.getElementById('weapon-scene'),
    battle: document.getElementById('battle-scene'),
    recap: document.getElementById('recap-scene'),
};

const packElements = {
    hero: document.getElementById('hero-pack'),
    ability: document.getElementById('ability-pack'),
    weapon: document.getElementById('weapon-pack'),
    armor: document.getElementById('armor-pack')
};
const confirmationBar = document.getElementById('confirmation-bar');
const confirmDraftButton = document.getElementById('confirm-draft');

// --- SCENE INSTANTIATION ---
// Create instances of each scene, passing their root element and necessary callbacks.
const packScene = new PackScene(sceneElements.pack, () => openPack());

const revealScene = new RevealScene(sceneElements.reveal, (revealedCards) => {
    // --- onRevealComplete ---
    // 1. advance the draft stage from PACK to DRAFT
    gameState.draft.stage = gameState.draft.stage.replace('PACK', 'DRAFT');

    // 2. render the draft scene using the revealed cards
    draftScene.render(revealedCards, gameState.draft.stage);

    // 3. show the draft scene
    transitionToScene('draft');
});
function onAbilitySelected(ability) {
    const stage = gameState.draft.stage;
    if (stage === 'ABILITY_1_DRAFT') {
        gameState.draft.playerTeam.ability1 = ability.id;
    } else if (stage === 'ABILITY_2_DRAFT') {
        gameState.draft.playerTeam.ability2 = ability.id;
    }
}

const draftScene = new DraftScene(sceneElements.draft, (selectedItem) => {
    const stage = gameState.draft.stage;
    if (stage === 'HERO_1_DRAFT') {
        gameState.draft.playerTeam.hero1 = selectedItem.id;
    } else if (stage === 'HERO_2_DRAFT') {
        gameState.draft.playerTeam.hero2 = selectedItem.id;
    } else if (stage === 'WEAPON_1_DRAFT') {
        gameState.draft.playerTeam.weapon1 = selectedItem.id;
    } else if (stage === 'WEAPON_2_DRAFT') {
        gameState.draft.playerTeam.weapon2 = selectedItem.id;
    } else if (stage === 'ARMOR_1_DRAFT') {
        gameState.draft.playerTeam.armor1 = selectedItem.id;
    } else if (stage === 'ARMOR_2_DRAFT') {
        gameState.draft.playerTeam.armor2 = selectedItem.id;
    } else if (stage === 'ABILITY_1_DRAFT' || stage === 'ABILITY_2_DRAFT') {
        onAbilitySelected(selectedItem);
    }
    advanceDraft();
});
const weaponScene = new WeaponScene(sceneElements.weapon, null, () => openPack());
const recapScene = new RecapScene(sceneElements.recap, () => {
    advanceDraft();
});

const battleScene = new BattleScene(sceneElements.battle);

// --- FLOW CONTROL ---

function transitionToScene(sceneName) {
    gameState.currentScene = sceneName;
    Object.values(sceneElements).forEach(el => el.classList.add('hidden'));
    sceneElements[sceneName].classList.remove('hidden');
}

function configurePackScene(stage) {
    const stageType = stage.split('_')[0].toLowerCase();
    for (const key in packElements) {
        packElements[key].classList.add('hidden');
    }
    if (packElements[stageType]) {
        packElements[stageType].classList.remove('hidden');
    }
}

function openPack() {
    const stage = gameState.draft.stage;
    const stageType = stage.split('_')[0].toUpperCase();
    let choices = [];
    let dataSource = [];

    switch(stageType) {
        case 'HERO':
            dataSource = allPossibleHeroes;
            break;
        case 'ABILITY': {
            const heroSlot = stage.includes('_1_') ? 'hero1' : 'hero2';
            const heroId = gameState.draft.playerTeam[heroSlot];
            const heroClass = allPossibleHeroes.find(h => h.id === heroId).class;
            dataSource = allPossibleAbilities.filter(a => a.class === heroClass);
            const shuffledAbilities = [...dataSource].sort(() => 0.5 - Math.random());
            choices = shuffledAbilities.slice(0, 3);
            transitionToScene('reveal');
            revealScene.startReveal(choices);
            return;
        }
        case 'WEAPON':
            dataSource = allPossibleWeapons;
            break;
        case 'ARMOR':
            dataSource = allPossibleArmors;
            break;
    }

    const shuffled = [...dataSource].sort(() => 0.5 - Math.random());
    choices = shuffled.slice(0, 3);
    transitionToScene('reveal');
    revealScene.startReveal(choices);
}

function advanceDraft() {
    const stage = gameState.draft.stage;
    const team = gameState.draft.playerTeam;

    if (stage === 'HERO_1_DRAFT' && team.hero1) {
        gameState.draft.stage = 'ABILITY_1_PACK';
        packScene.reset();
        packScene.render(gameState.draft.stage);
        configurePackScene(gameState.draft.stage);
        transitionToScene('pack');
    } else if (stage === 'ABILITY_1_DRAFT' && team.ability1) {
        gameState.draft.stage = 'WEAPON_1_PACK';
        packScene.reset();
        packScene.render(gameState.draft.stage);
        configurePackScene(gameState.draft.stage);
        transitionToScene('pack');
    } else if (stage === 'WEAPON_1_DRAFT' && team.weapon1) {
        gameState.draft.stage = 'ARMOR_1_PACK';
        packScene.reset();
        packScene.render(gameState.draft.stage);
        configurePackScene(gameState.draft.stage);
        transitionToScene('pack');
    } else if (stage === 'ARMOR_1_DRAFT' && team.armor1) {
        gameState.draft.stage = 'RECAP_1_DRAFT';
        recapScene.render({
            hero: team.hero1,
            ability: team.ability1,
            weapon: team.weapon1,
            armor: team.armor1
        });
        transitionToScene('recap');
    } else if (stage === 'RECAP_1_DRAFT') {
        gameState.draft.stage = 'HERO_2_PACK';
        packScene.reset();
        packScene.render(gameState.draft.stage);
        configurePackScene(gameState.draft.stage);
        transitionToScene('pack');
    } else if (stage === 'HERO_2_DRAFT' && team.hero2) {
        gameState.draft.stage = 'ABILITY_2_PACK';
        packScene.reset();
        packScene.render(gameState.draft.stage);
        configurePackScene(gameState.draft.stage);
        transitionToScene('pack');
    } else if (stage === 'ABILITY_2_DRAFT' && team.ability2) {
        gameState.draft.stage = 'WEAPON_2_PACK';
        packScene.reset();
        packScene.render(gameState.draft.stage);
        configurePackScene(gameState.draft.stage);
        transitionToScene('pack');
    } else if (stage === 'WEAPON_2_DRAFT' && team.weapon2) {
        gameState.draft.stage = 'ARMOR_2_PACK';
        packScene.reset();
        packScene.render(gameState.draft.stage);
        configurePackScene(gameState.draft.stage);
        transitionToScene('pack');
    } else if (stage === 'ARMOR_2_DRAFT' && team.armor2) {
        gameState.draft.stage = 'DONE';
        confirmationBar.classList.add('visible');
    }
}

// --- DATA GENERATION ---

function generateHeroPack() {
    const rarities = [];
    for (let i = 0; i < 4; i++) {
        const roll = Math.random();
        if (roll < 0.05) rarities.push('Epic'); // Changed 'Ultra Rare' to 'Epic'
        else if (roll < 0.20) rarities.push('Rare');
        else if (roll < 0.50) rarities.push('Uncommon');
        else rarities.push('Common');
    }

    let openedPack = rarities.map(rarity => {
        const available = allPossibleHeroes.filter(h => h.rarity === rarity);
        return available[Math.floor(Math.random() * available.length)];
    });

    // Ensure no duplicate heroes in the pack
    openedPack = [...new Map(openedPack.map(item => [item.id, item])).values()];
    
    // Fill with randoms if duplicates were removed
    while(openedPack.length < 4) {
        const fallback = allPossibleHeroes[Math.floor(Math.random() * allPossibleHeroes.length)];
        if(!openedPack.find(h => h.id === fallback.id)) openedPack.push(fallback);
    }

    return openedPack;
}

function generateWeaponChoices() {
    const shuffled = [...allPossibleWeapons].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
}

function generateArmorChoices() {
    const shuffled = [...allPossibleArmors].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
}

// --- BATTLE SETUP ---

function createCombatant(heroData, weaponData, armorData, team, position) {
    // Start with base hero stats
    const finalStats = {
        hp: heroData.hp,
        attack: heroData.attack,
        speed: heroData.speed,
        block: 0, // Base block
        evasion: 0, // Base evasion
        magicResist: 0, // Base magic resist
    };

    // Add weapon stat bonuses
    if (weaponData && weaponData.statBonuses) {
        for (const [stat, value] of Object.entries(weaponData.statBonuses)) {
            finalStats[stat.toLowerCase()] = (finalStats[stat.toLowerCase()] || 0) + value;
        }
    }

    // Add armor stat bonuses
    if (armorData && armorData.statBonuses) {
        for (const [stat, value] of Object.entries(armorData.statBonuses)) {
            finalStats[stat.toLowerCase()] = (finalStats[stat.toLowerCase()] || 0) + value;
        }
    }

    return {
        id: `${team}-hero-${position}`,
        heroData: heroData,
        weaponData: weaponData,
        armorData: armorData,
        team: team,
        position: position,
        currentHp: finalStats.hp,
        maxHp: finalStats.hp,
        ...finalStats,
        statusEffects: [],
        element: null, // To be assigned in BattleScene
    };
}

function startBattle() {
    confirmationBar.classList.remove('visible');

    const playerTeam = gameState.draft.playerTeam;

    // --- Create Player Combatants ---
    const playerHero1 = allPossibleHeroes.find(h => h.id === playerTeam.hero1);
    const playerWeapon1 = allPossibleWeapons.find(w => w.id === playerTeam.weapon1);
    const playerArmor1 = allPossibleArmors.find(a => a.id === playerTeam.armor1);
    const playerCombatant1 = createCombatant(playerHero1, playerWeapon1, playerArmor1, 'player', 0);

    const playerHero2 = allPossibleHeroes.find(h => h.id === playerTeam.hero2);
    const playerWeapon2 = allPossibleWeapons.find(w => w.id === playerTeam.weapon2);
    const playerArmor2 = allPossibleArmors.find(a => a.id === playerTeam.armor2);
    const playerCombatant2 = createCombatant(playerHero2, playerWeapon2, playerArmor2, 'player', 1);

    // --- Create Enemy Combatants (Randomly) ---
    const enemyHero1 = allPossibleHeroes.find(h => h.rarity === 'Common');
    const enemyWeapon1 = allPossibleWeapons.find(w => w.rarity === 'Common');
    const enemyArmor1 = allPossibleArmors.find(a => a.rarity === 'Common');
    const enemyCombatant1 = createCombatant(enemyHero1, enemyWeapon1, enemyArmor1, 'enemy', 0);

    const enemyHero2 = allPossibleHeroes.find(h => h.id !== enemyHero1.id && h.rarity === 'Common');
    const enemyWeapon2 = allPossibleWeapons.find(w => w.id !== enemyWeapon1.id && w.rarity === 'Common');
    const enemyArmor2 = allPossibleArmors.find(a => a.id !== enemyArmor1.id && a.rarity === 'Common');
    const enemyCombatant2 = createCombatant(enemyHero2, enemyWeapon2, enemyArmor2, 'enemy', 1);

    // --- Prepare Battle State ---
    const battleState = [playerCombatant1, playerCombatant2, enemyCombatant1, enemyCombatant2];

    transitionToScene('battle');
    battleScene.start(battleState);
}


// --- EVENT LISTENERS ---
confirmDraftButton.addEventListener('click', startBattle);

// --- INITIALIZE ---
// Set up the initial scene on page load
packScene.render(gameState.draft.stage);
configurePackScene(gameState.draft.stage);
transitionToScene('pack');
