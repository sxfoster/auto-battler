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
import { initBackgroundAnimation } from './background-animation.js';

// --- STATE MANAGEMENT ---
// Centralized game state
const gameState = {
    currentScene: 'pack', // 'pack', 'draft', 'weapon', 'battle'
    draft: {
        stage: 'HERO_1_PACK', // HERO_1_PACK, HERO_1_DRAFT, WEAPON_1_DRAFT, HERO_2_PACK, etc.
        playerTeam: { hero1: null, ability1: null, weapon1: null, armor1: null, hero2: null, ability2: null, weapon2: null, armor2: null },
    },
    tournament: {
        wins: 0,
        losses: 0,
        isComplete: false
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

const battleScene = new BattleScene(sceneElements.battle, handleBattleComplete);

// --- FLOW CONTROL ---

function transitionToScene(sceneName) {
    gameState.currentScene = sceneName;
    Object.values(sceneElements).forEach(el => el.classList.add('hidden'));
    sceneElements[sceneName].classList.remove('hidden');
}

function configurePackScene(stage) {
    // Single pack implementation no longer swaps between pack types.
    // This function is kept for compatibility with existing calls.
    return stage;
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
        recapScene.setContinueButtonLabel('Draft Next Champion');
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
        gameState.draft.stage = 'RECAP_2_DRAFT';
        recapScene.render({
            hero: team.hero2,
            ability: team.ability2,
            weapon: team.weapon2,
            armor: team.armor2
        });
        recapScene.setContinueButtonLabel('Start Battle');
        transitionToScene('recap');
    } else if (stage === 'RECAP_2_DRAFT') {
        gameState.draft.stage = 'DONE';
        confirmationBar.classList.add('visible');
    }

    updateRandomHeroButtonState();
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

// Generate a fully equipped random champion
function generateRandomChampion() {
    const randomHero = allPossibleHeroes[Math.floor(Math.random() * allPossibleHeroes.length)];
    const abilityPool = allPossibleAbilities.filter(a => a.class === randomHero.class);
    const randomAbility = abilityPool.length > 0 ? abilityPool[Math.floor(Math.random() * abilityPool.length)] : null;
    const randomWeapon = allPossibleWeapons[Math.floor(Math.random() * allPossibleWeapons.length)];
    const randomArmor = allPossibleArmors[Math.floor(Math.random() * allPossibleArmors.length)];

    return {
        hero: randomHero.id,
        ability: randomAbility ? randomAbility.id : null,
        weapon: randomWeapon.id,
        armor: randomArmor.id
    };
}

// Handle the Random Team flow and immediately start the tournament
function generateRandomTeamAndStartBattle() {
    console.log("Generating random team...");

    const champion1 = generateRandomChampion();
    let champion2 = generateRandomChampion();
    while (champion2.hero === champion1.hero) {
        champion2 = generateRandomChampion();
    }

    gameState.draft.playerTeam.hero1 = champion1.hero;
    gameState.draft.playerTeam.ability1 = champion1.ability;
    gameState.draft.playerTeam.weapon1 = champion1.weapon;
    gameState.draft.playerTeam.armor1 = champion1.armor;

    gameState.draft.playerTeam.hero2 = champion2.hero;
    gameState.draft.playerTeam.ability2 = champion2.ability;
    gameState.draft.playerTeam.weapon2 = champion2.weapon;
    gameState.draft.playerTeam.armor2 = champion2.armor;

    gameState.draft.stage = 'COMPLETE';

    console.log("Random team generated:", gameState.draft.playerTeam);

    confirmationBar.classList.remove('visible');

    startNextBattle();
}

// Generate a single random hero and advance the draft appropriately
function generateSingleRandomHero() {
    const team = gameState.draft.playerTeam;
    let slot = null;
    if (!team.hero1) slot = 1;
    else if (!team.hero2) slot = 2;
    if (!slot) return; // team full

    const champion = generateRandomChampion();

    if (slot === 1) {
        team.hero1 = champion.hero;
        team.ability1 = champion.ability;
        team.weapon1 = champion.weapon;
        team.armor1 = champion.armor;

        gameState.draft.stage = 'RECAP_1_DRAFT';
        recapScene.render({
            hero: team.hero1,
            ability: team.ability1,
            weapon: team.weapon1,
            armor: team.armor1
        });
        recapScene.setContinueButtonLabel('Draft Next Champion');
        transitionToScene('recap');
    } else {
        team.hero2 = champion.hero;
        team.ability2 = champion.ability;
        team.weapon2 = champion.weapon;
        team.armor2 = champion.armor;

        gameState.draft.stage = 'RECAP_2_DRAFT';
        recapScene.render({
            hero: team.hero2,
            ability: team.ability2,
            weapon: team.weapon2,
            armor: team.armor2
        });
        recapScene.setContinueButtonLabel('Start Battle');
        transitionToScene('recap');
    }

    updateRandomHeroButtonState();
}

function updateRandomHeroButtonState() {
    const button = document.getElementById('random-hero-button');
    if (!button) return;
    const team = gameState.draft.playerTeam;
    const disabled = team.hero1 && team.hero2;
    button.disabled = disabled;
}

// --- BATTLE SETUP ---

function createCombatant(heroData, weaponData, armorData, abilityData, team, position) {
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
        abilityData: abilityData,
        team: team,
        position: position,
        currentHp: finalStats.hp,
        maxHp: finalStats.hp,
        currentEnergy: 0,
        ...finalStats,
        statusEffects: [],
        element: null, // To be assigned in BattleScene
    };
}

function startNextBattle() {
    confirmationBar.classList.remove('visible');

    const tracker = document.getElementById('tournament-tracker');
    tracker.classList.remove('hidden');
    document.getElementById('tournament-wins').textContent = gameState.tournament.wins;
    document.getElementById('tournament-losses').textContent = gameState.tournament.losses;

    let enemyRarity = 'Common';
    if (gameState.tournament.wins >= 5) {
        enemyRarity = 'Epic';
    } else if (gameState.tournament.wins >= 2) {
        enemyRarity = 'Rare';
    } else if (gameState.tournament.wins >= 1) {
        enemyRarity = 'Uncommon';
    }

    const playerTeam = gameState.draft.playerTeam;

    // --- Create Player Combatants ---
    const playerHero1 = allPossibleHeroes.find(h => h.id === playerTeam.hero1);
    const playerWeapon1 = allPossibleWeapons.find(w => w.id === playerTeam.weapon1);
    const playerArmor1 = allPossibleArmors.find(a => a.id === playerTeam.armor1);
    const playerAbility1 = allPossibleAbilities.find(a => a.id === playerTeam.ability1);
    const playerCombatant1 = createCombatant(playerHero1, playerWeapon1, playerArmor1, playerAbility1, 'player', 0);

    const playerHero2 = allPossibleHeroes.find(h => h.id === playerTeam.hero2);
    const playerWeapon2 = allPossibleWeapons.find(w => w.id === playerTeam.weapon2);
    const playerArmor2 = allPossibleArmors.find(a => a.id === playerTeam.armor2);
    const playerAbility2 = allPossibleAbilities.find(a => a.id === playerTeam.ability2);
    const playerCombatant2 = createCombatant(playerHero2, playerWeapon2, playerArmor2, playerAbility2, 'player', 1);

    // --- Create Enemy Combatants with Scaled Difficulty & Dynamic Gear ---
    const enemyHeroPool1 = allPossibleHeroes.filter(h => h.rarity === enemyRarity);
    const enemyHero1 = enemyHeroPool1[Math.floor(Math.random() * enemyHeroPool1.length)];

    const enemyWeapon1 = allPossibleWeapons[Math.floor(Math.random() * allPossibleWeapons.length)];
    const enemyArmor1 = allPossibleArmors[Math.floor(Math.random() * allPossibleArmors.length)];

    const enemyAbilityPool1 = allPossibleAbilities.filter(a => a.class === enemyHero1.class);
    const enemyAbility1 = enemyAbilityPool1.length > 0 ? enemyAbilityPool1[Math.floor(Math.random() * enemyAbilityPool1.length)] : null;

    const enemyCombatant1 = createCombatant(enemyHero1, enemyWeapon1, enemyArmor1, enemyAbility1, 'enemy', 0);

    const enemyHeroPool2 = allPossibleHeroes.filter(h => h.id !== enemyHero1.id && h.rarity === enemyRarity);
    const enemyHero2 = enemyHeroPool2[Math.floor(Math.random() * enemyHeroPool2.length)];

    const enemyWeapon2 = allPossibleWeapons[Math.floor(Math.random() * allPossibleWeapons.length)];
    const enemyArmor2 = allPossibleArmors[Math.floor(Math.random() * allPossibleArmors.length)];

    const enemyAbilityPool2 = allPossibleAbilities.filter(a => a.class === enemyHero2.class);
    const enemyAbility2 = enemyAbilityPool2.length > 0 ? enemyAbilityPool2[Math.floor(Math.random() * enemyAbilityPool2.length)] : null;

    const enemyCombatant2 = createCombatant(enemyHero2, enemyWeapon2, enemyArmor2, enemyAbility2, 'enemy', 1);

    console.log('EnemyCombatant1', enemyCombatant1);

    const battleState = [playerCombatant1, playerCombatant2, enemyCombatant1, enemyCombatant2];

    transitionToScene('battle');
    battleScene.start(battleState);
}

function handleBattleComplete(didPlayerWin) {
    if (didPlayerWin) {
        gameState.tournament.wins++;
    } else {
        gameState.tournament.losses++;
    }

    if (gameState.tournament.wins >= 10 || gameState.tournament.losses >= 2) {
        endTournament();
    } else {
        startNextBattle();
    }
}

function endTournament() {
    gameState.tournament.isComplete = true;
    document.getElementById('tournament-tracker').classList.add('hidden');

    const endScreen = document.getElementById('tournament-end-screen');
    const endTitle = document.getElementById('tournament-end-title');
    const finalRecord = document.getElementById('tournament-final-record');

    finalRecord.textContent = `${gameState.tournament.wins} Wins - ${gameState.tournament.losses} Losses`;
    if (gameState.tournament.wins >= 10) {
        endTitle.textContent = 'Tournament Victor!';
    } else {
        endTitle.textContent = 'Your Run Has Ended';
    }

    endScreen.classList.remove('hidden');
    document.getElementById('tournament-play-again-button').addEventListener('click', () => {
        window.location.reload();
    });
}


// --- EVENT LISTENERS ---
confirmDraftButton.addEventListener('click', startNextBattle);
const randomHeroButton = document.getElementById('random-hero-button');
if (randomHeroButton) {
    randomHeroButton.addEventListener('click', generateSingleRandomHero);
}

// --- INITIALIZE ---
// Set up the initial scene on page load
initBackgroundAnimation();
packScene.render(gameState.draft.stage);
configurePackScene(gameState.draft.stage);
transitionToScene('pack');
updateRandomHeroButtonState();
