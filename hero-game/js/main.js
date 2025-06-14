// Import data and utilities
import { allPossibleHeroes, allPossibleWeapons, allPossibleArmors, allPossibleAbilities } from './data.js';

// Import UI and Scene classes
import { PackScene } from './scenes/PackScene.js';
import { DraftScene } from './scenes/DraftScene.js';
import { WeaponScene } from './scenes/WeaponScene.js';
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

const battleScene = new BattleScene(sceneElements.battle);

// --- FLOW CONTROL ---

function transitionToScene(sceneName) {
    gameState.currentScene = sceneName;
    Object.values(sceneElements).forEach(el => el.classList.add('hidden'));
    sceneElements[sceneName].classList.remove('hidden');
}

function openPack() {
    const stage = gameState.draft.stage;
    const stageType = stage.split('_')[0].toUpperCase();
    let choices = [];
    switch(stageType) {
        case 'HERO':
            choices = generateHeroPack();
            break;
        case 'WEAPON':
            choices = generateWeaponChoices();
            break;
        case 'ARMOR':
            choices = generateArmorChoices();
            break;
        case 'ABILITY':
            const heroSlot = stage.includes('_1_') ? 'hero1' : 'hero2';
            const heroId = gameState.draft.playerTeam[heroSlot];
            const heroClass = allPossibleHeroes.find(h => h.id === heroId).class;
            let dataSource = allPossibleAbilities.filter(a => a.class === heroClass);

            const offense = dataSource.filter(a => a.category === 'Offense' && a.rarity === 'Common');
            const defense = dataSource.filter(a => a.category === 'Defense' && a.rarity === 'Common');
            const support = dataSource.filter(a => a.category === 'Support' && a.rarity === 'Common');

            choices = [
                offense[Math.floor(Math.random() * offense.length)],
                defense[Math.floor(Math.random() * defense.length)],
                support[Math.floor(Math.random() * support.length)],
            ];
            break;
    }

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
        transitionToScene('pack');
    } else if (stage === 'ABILITY_1_DRAFT' && team.ability1) {
        gameState.draft.stage = 'WEAPON_1_PACK';
        weaponScene.reset();
        const heroName = allPossibleHeroes.find(h => h.id === team.hero1).name;
        weaponScene.updateInstructions(`Choose a weapon pack for ${heroName}`);
        transitionToScene('weapon');
    } else if (stage === 'WEAPON_1_DRAFT' && team.weapon1) {
        gameState.draft.stage = 'ARMOR_1_PACK';
        packScene.reset();
        packScene.render(gameState.draft.stage);
        transitionToScene('pack');
    } else if (stage === 'ARMOR_1_DRAFT' && team.armor1) {
        gameState.draft.stage = 'HERO_2_PACK';
        packScene.reset();
        packScene.render(gameState.draft.stage);
        transitionToScene('pack');
    } else if (stage === 'HERO_2_DRAFT' && team.hero2) {
        gameState.draft.stage = 'ABILITY_2_PACK';
        packScene.reset();
        packScene.render(gameState.draft.stage);
        transitionToScene('pack');
    } else if (stage === 'ABILITY_2_DRAFT' && team.ability2) {
        gameState.draft.stage = 'WEAPON_2_PACK';
        weaponScene.reset();
        const heroName = allPossibleHeroes.find(h => h.id === team.hero2).name;
        weaponScene.updateInstructions(`Choose a weapon pack for ${heroName}`);
        transitionToScene('weapon');
    } else if (stage === 'WEAPON_2_DRAFT' && team.weapon2) {
        gameState.draft.stage = 'ARMOR_2_PACK';
        packScene.reset();
        packScene.render(gameState.draft.stage);
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

function startBattle() {
    confirmationBar.classList.remove('visible');
    transitionToScene('battle');

    const team = gameState.draft.playerTeam;

    // Create Player Combatants
    const playerHero1 = allPossibleHeroes.find(h => h.id === team.hero1);
    const playerWeapon1 = allPossibleWeapons.find(w => w.id === team.weapon1);
    const playerHero2 = allPossibleHeroes.find(h => h.id === team.hero2);
    const playerWeapon2 = allPossibleWeapons.find(w => w.id === team.weapon2);
    
    // Create Enemy Combatants
    const enemyHero1 = allPossibleHeroes[Math.floor(Math.random() * allPossibleHeroes.length)];
    const enemyHero2 = allPossibleHeroes.filter(h => h.id !== enemyHero1.id)[Math.floor(Math.random() * (allPossibleHeroes.length - 1))];
    const enemyWeapon1 = allPossibleWeapons[Math.floor(Math.random() * allPossibleWeapons.length)];
    const enemyWeapon2 = allPossibleWeapons[Math.floor(Math.random() * allPossibleWeapons.length)];

    const battleState = [
        { heroData: playerHero1, weaponData: playerWeapon1, team: 'player', position: 0 },
        { heroData: enemyHero1, weaponData: enemyWeapon1, team: 'enemy', position: 0 },
        { heroData: playerHero2, weaponData: playerWeapon2, team: 'player', position: 1 },
        { heroData: enemyHero2, weaponData: enemyWeapon2, team: 'enemy', position: 1 },
    ].map((s, i) => ({
        ...s,
        id: `combatant-${i}`,
        currentHp: s.heroData.hp,
        maxHp: s.heroData.hp,
        statusEffects: [],
        element: null, // This will be populated by the battle scene
    }));

    battleScene.start(battleState);
}


// --- EVENT LISTENERS ---
confirmDraftButton.addEventListener('click', startBattle);

// --- INITIALIZE ---
// Set up the initial scene on page load
packScene.render(gameState.draft.stage);
transitionToScene('pack');
