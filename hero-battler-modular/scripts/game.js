import * as data from './data.js';
import * as ui from './ui.js';

// --- STATE MANAGEMENT ---
let team = {
    hero1: { hero: null, ability: null, weapon: null, armor: null },
    hero2: { hero: null, ability: null, weapon: null, armor: null }
};
let currentDraftStage = 'HERO_1_PACK';
let openedPack = [];
let battleState = [];
const battleSpeeds = [
    { label: '1x', multiplier: 2 },
    { label: '2x', multiplier: 1 },
    { label: '0.5x', multiplier: 4 }
];
let currentSpeedIndex = 0;
let currentAttackerIndex = 0;


// --- DOM ELEMENTS (to be initialized in initializeGame) ---
let scenes = {};
let boosterPack, weaponPack, draftPool, weaponDraftPool, confirmationBar;
let packSceneTitle, draftInstructions, weaponInstructions, battleLogElement, speedCycleButtonElement;


// --- HELPER FUNCTIONS ---
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// --- FLOW CONTROL ---
function transitionToScene(sceneName) {
    Object.values(scenes).forEach(s => s.classList.add('hidden'));
    if (scenes[sceneName]) {
        scenes[sceneName].classList.remove('hidden');
    }
}

function advanceDraft() {
    switch (currentDraftStage) {
        case 'HERO_1_DRAFT':
            currentDraftStage = 'ABILITY_1_PACK';
            break;
        case 'ABILITY_1_DRAFT':
            currentDraftStage = 'WEAPON_1_PACK';
            break;
        case 'WEAPON_1_DRAFT':
            currentDraftStage = 'ARMOR_1_PACK';
            break;
        case 'ARMOR_1_DRAFT':
            currentDraftStage = 'HERO_2_PACK';
            break;
        case 'HERO_2_DRAFT':
            currentDraftStage = 'ABILITY_2_PACK';
            break;
        case 'ABILITY_2_DRAFT':
            currentDraftStage = 'WEAPON_2_PACK';
            break;
        case 'WEAPON_2_DRAFT':
            currentDraftStage = 'ARMOR_2_PACK';
            break;
        case 'ARMOR_2_DRAFT':
            currentDraftStage = 'COMPLETE';
            if (confirmationBar) confirmationBar.classList.add('visible');
            return;
    }
    updateInstructions();
}

function updateInstructions() {
    if (packSceneTitle) packSceneTitle.textContent = currentDraftStage === 'HERO_1_PACK' ? 'Open Your Hero Pack' : 'Open Pack for Second Hero';
    if (draftInstructions) draftInstructions.textContent = `Choose your ${currentDraftStage === 'HERO_1_DRAFT' ? 'first' : 'second'} hero.`;

    const heroName = team.hero1.hero ? data.allPossibleHeroes.find(h => h.id === team.hero1.hero).name : 'your hero';
    if (weaponInstructions) weaponInstructions.textContent = `Select a weapon for ${heroName}.`;
}

// --- DRAFT LOGIC ---
function generatePackRarities() {
    const rarities = [];
    for (let i = 0; i < 4; i++) {
        const roll = Math.random();
        if (roll < 0.05) rarities.push('Ultra Rare');
        else if (roll < 0.20) rarities.push('Rare');
        else if (roll < 0.50) rarities.push('Uncommon');
        else rarities.push('Common');
    }
    return rarities;
}

function openPack(isWeapon = false) {
    const packElement = isWeapon ? weaponPack : boosterPack;
    if (!packElement) return;

    packElement.style.pointerEvents = 'none';
    packElement.classList.add('opening');

    packElement.addEventListener('animationend', () => {
        if (isWeapon) {
            packElement.style.display = 'none';
            if (weaponDraftPool) weaponDraftPool.style.display = 'grid';
            renderWeaponPool();
        } else {
            currentDraftStage = currentDraftStage === 'HERO_1_PACK' ? 'HERO_1_DRAFT' : 'HERO_2_DRAFT';
            transitionToScene('draft');
            renderHeroPool();
        }
    }, { once: true });
}

function renderHeroPool() {
    if (!draftPool) return;
    const packRarities = generatePackRarities();
    openedPack = packRarities.map(rarity => {
        const available = data.allPossibleHeroes.filter(h => h.rarity === rarity);
        return available[Math.floor(Math.random() * available.length)];
    });
    openedPack = [...new Map(openedPack.map(item => [item.id, item])).values()];
    while (openedPack.length < 4 && data.allPossibleHeroes.length > 0) {
        const fallback = data.allPossibleHeroes[Math.floor(Math.random() * data.allPossibleHeroes.length)];
        if (!openedPack.find(h => h.id === fallback.id)) openedPack.push(fallback);
    }

    draftPool.innerHTML = '';
    openedPack.forEach(hero => {
        if (!hero) return; // Guard against undefined hero
        const card = ui.createDetailCard(hero, handleHeroSelection);
        draftPool.appendChild(card);
    });
}

function renderWeaponPool() {
    if (!weaponDraftPool) return;
    weaponDraftPool.innerHTML = '';
    const shuffled = [...data.allPossibleWeapons].sort(() => 0.5 - Math.random());
    const weaponChoices = shuffled.slice(0, 3);
    weaponChoices.forEach(weapon => {
        if(!weapon) return;
        const card = ui.createDetailCard(weapon, handleWeaponSelection);
        weaponDraftPool.appendChild(card);
    });
}

function handleHeroSelection(hero) {
    const heroKey = currentDraftStage.includes('HERO_1') ? 'hero1' : 'hero2';
    team[heroKey].hero = hero.id;
    advanceDraft();
}

function handleWeaponSelection(weapon) {
    const heroKey = currentDraftStage.includes('WEAPON_1') ? 'hero1' : 'hero2';
    team[heroKey].weapon = weapon.id;
    advanceDraft();
}

function handleAbilitySelection(ability) {
    const heroKey = currentDraftStage.includes('ABILITY_1') ? 'hero1' : 'hero2';
    team[heroKey].ability = ability.id;
    advanceDraft();
}

function handleArmorSelection(armor) {
    const heroKey = currentDraftStage.includes('ARMOR_1') ? 'hero1' : 'hero2';
    team[heroKey].armor = armor.id;
    advanceDraft();
}

function getDataSourceForCurrentStage() {
    const heroNumber = currentDraftStage.includes('_1_') ? 1 : 2;
    const stageType = currentDraftStage.split('_')[0];
    switch(stageType) {
        case 'HERO':
            return data.allPossibleHeroes;
        case 'WEAPON':
            return data.allPossibleWeapons;
        case 'ABILITY': {
            const heroClass = data.allPossibleHeroes.find(h => h.id === team[`hero${heroNumber}`].hero)?.class;
            return data.allPossibleAbilities.filter(a => a.class === heroClass);
        }
        case 'ARMOR':
            return data.allPossibleArmors;
        default:
            return [];
    }
}

function populateDraftScene() {
    if (!draftPool) return;
    draftPool.innerHTML = '';
    const stageType = currentDraftStage.split('_')[0].toUpperCase();
    const selectionHandlers = {
        'HERO': handleHeroSelection,
        'ABILITY': handleAbilitySelection,
        'WEAPON': handleWeaponSelection,
        'ARMOR': handleArmorSelection
    };
    const dataSource = getDataSourceForCurrentStage();
    dataSource.forEach(item => {
        const card = ui.createDetailCard(item, selectionHandlers[stageType]);
        draftPool.appendChild(card);
    });
}

function resetPackScene() {
    if (!boosterPack) return;
    boosterPack.classList.remove('opening');
    boosterPack.style.pointerEvents = 'auto';
}

function resetWeaponScene() {
    if (!weaponPack || !weaponDraftPool) return;
    weaponPack.classList.remove('opening');
    weaponPack.style.display = 'flex';
    weaponPack.style.pointerEvents = 'auto';
    weaponDraftPool.style.display = 'none';
}

// --- BATTLE LOGIC ---
async function runCombatTurn() {
    const attacker = battleState[currentAttackerIndex];

    if (!attacker || attacker.currentHp <= 0) {
        currentAttackerIndex = (currentAttackerIndex + 1) % battleState.length;
        if (battleState.some(c => c.currentHp > 0)) setTimeout(runCombatTurn, 167 * battleSpeeds[currentSpeedIndex].multiplier);
        return;
    }

    const stunEffect = attacker.statusEffects.find(e => e.name === 'Stun');
    if (stunEffect) {
        logToBattle(`${attacker.heroData.name} is stunned and skips their turn!`);
        stunEffect.turnsRemaining--;
        if (stunEffect.turnsRemaining <= 0) attacker.statusEffects = attacker.statusEffects.filter(e => e.name !== 'Stun');
        updateStatusIcons(attacker);
        await sleep(125 * battleSpeeds[currentSpeedIndex].multiplier);
        currentAttackerIndex = (currentAttackerIndex + 1) % battleState.length;
        if (battleState.some(c => c.currentHp > 0)) setTimeout(runCombatTurn, 167 * battleSpeeds[currentSpeedIndex].multiplier);
        return;
    }

    const enemies = battleState.filter(c => c.team !== attacker.team && c.currentHp > 0);
    if (enemies.length === 0) return;
    const target = enemies.sort((a,b) => a.position - b.position)[0];

    let action = 'basic_attack';
    if (attacker.heroData.name === 'Warrior' && !target.statusEffects.some(e => e.name === 'Stun')) action = 'Shield Bash';
    if (attacker.heroData.name === 'Champion' && enemies.length > 1) action = 'Whirlwind';

    if (attacker.element) attacker.element.classList.add('is-attacking');
    await sleep(67 * battleSpeeds[currentSpeedIndex].multiplier);

    switch(action) {
        case 'Whirlwind':
            logToBattle(`${attacker.heroData.name} uses Whirlwind!`);
            for (const enemy of enemies) {
                dealDamage(attacker, enemy, 4, false);
            }
            break;
        case 'Shield Bash':
            logToBattle(`${attacker.heroData.name} uses Shield Bash!`);
            dealDamage(attacker, target, 1, false);
            applyStatus(target, 'Stun', 1);
            break;
        default:
            let damage = attacker.heroData.attack + (attacker.weaponData ? attacker.weaponData.damage : 0);
            let attackName = attacker.weaponData ? attacker.weaponData.name : "Basic Attack";
            if (attacker.heroData.name === 'Champion') attackName = 'Execute';

            logToBattle(`${attacker.heroData.name} attacks ${target.heroData.name} with ${attackName}!`);
            dealDamage(attacker, target, damage, true);

            if (attacker.weaponData && attacker.weaponData.name === 'Iron Sword' && enemies.length > 1) {
                const secondTarget = enemies.find(e => e.id !== target.id);
                if (secondTarget) {
                    logToBattle(`Cleave hits ${secondTarget.heroData.name}!`);
                    dealDamage(attacker, secondTarget, Math.ceil(damage * 0.5), false);
                }
            }
            if (attacker.weaponData && attacker.weaponData.name === 'Glimmering Dagger' && Math.random() < 0.10){
                applyStatus(target, 'Poison', Math.floor(Math.random() * 3) + 2);
            }
    }

    await sleep(100 * battleSpeeds[currentSpeedIndex].multiplier);
    if (attacker.element) attacker.element.classList.remove('is-attacking');

    const isPlayerTeamDefeated = battleState.filter(c => c.team === 'player' && c.currentHp > 0).length === 0;
    const isEnemyTeamDefeated = battleState.filter(c => c.team === 'enemy' && c.currentHp > 0).length === 0;

    if (isPlayerTeamDefeated || isEnemyTeamDefeated) {
        endBattle(!isPlayerTeamDefeated);
        return;
    }

    currentAttackerIndex = (currentAttackerIndex + 1) % battleState.length;
    if (battleState.some(c => c.currentHp > 0)) setTimeout(runCombatTurn, 167 * battleSpeeds[currentSpeedIndex].multiplier);
}

function dealDamage(attacker, target, amount, isBasicAttack) {
    if (!target || !target.heroData) return;
    if (target.heroData.abilities.some(a => a.name === 'Fortify')) amount = Math.max(0, amount - 1);
    target.currentHp = Math.max(0, target.currentHp - amount);

    if (target.element) {
        target.element.classList.add('is-taking-damage');
        setTimeout(() => target.element.classList.remove('is-taking-damage'), 67 * battleSpeeds[currentSpeedIndex].multiplier);
        showDamagePopup(target.element, amount);
    }
    updateHealthBar(target);

    if (target.currentHp <= 0) {
        logToBattle(`${target.heroData.name} has been defeated!`);
        if (target.element) target.element.classList.add('is-defeated');
    }
}

function applyStatus(target, statusName, duration) {
    if (!target || !target.heroData) return;
    logToBattle(`${target.heroData.name} is afflicted with ${statusName}!`);
    target.statusEffects.push({ name: statusName, turnsRemaining: duration });
    updateStatusIcons(target);
}

function endBattle(didPlayerWin) {
    const endScreen = document.getElementById('end-screen');
    const resultText = document.getElementById('end-screen-result-text');
    const resultsContainer = document.getElementById('end-screen-results');
    if (!endScreen || !resultText || !resultsContainer) return;

    logToBattle(didPlayerWin ? "Player team is victorious!" : "Enemy team is victorious!");

    endScreen.className = didPlayerWin ? 'victory' : 'defeat'; // Removes other classes like 'hidden'
    endScreen.classList.add('scene'); // Ensure it's displayed like a scene
    resultText.textContent = didPlayerWin ? 'Victory' : 'Defeat';

    resultsContainer.innerHTML = '';
    battleState.filter(c => c.team === 'player').forEach(c => {
        if (!c.heroData) return;
        const card = createCompactCard(c); // This function is defined below
        if (c.currentHp <= 0) card.classList.add('is-defeated');
        resultsContainer.appendChild(card);
    });

    setTimeout(() => endScreen.classList.add('visible'), 167 * battleSpeeds[currentSpeedIndex].multiplier);
}

function createCompactCard(combatant) {
    const card = document.createElement('div');
    if (!combatant || !combatant.heroData) { // Basic fallback
        card.textContent = 'Invalid Combatant';
        return card;
    }
    const rarityClass = combatant.heroData.rarity.toLowerCase().replace(' ', '-');
    card.id = combatant.id;
    card.className = `compact-card ${rarityClass}`;
    card.innerHTML = `
        <div class="compact-art" style="background-image: url('${combatant.heroData.art}')"></div>
        <div class="compact-info">
            <div class="compact-name font-cinzel">${combatant.heroData.name}</div>
            <div class="hp-text">${combatant.currentHp} / ${combatant.maxHp}</div>
            <div class="compact-hp-bar-container">
                <div class="compact-hp-bar"></div>
            </div>
        </div>
        <div class="status-icon-container"></div>
    `;
    updateHealthBar(combatant, card);
    updateStatusIcons(combatant, card);
    return card;
}

function updateHealthBar(combatant, cardElement = null) {
    const card = cardElement || combatant.element;
    if (!card) return;
    const bar = card.querySelector('.compact-hp-bar');
    const hpText = card.querySelector('.hp-text');
    if (!bar || !hpText) return;

    const percentage = (combatant.currentHp / combatant.maxHp) * 100;
    bar.style.width = `${percentage}%`;
    bar.style.backgroundColor = percentage > 50 ? '#48bb78' : percentage > 20 ? '#f59e0b' : '#ef4444';
    hpText.textContent = `${combatant.currentHp} / ${combatant.maxHp}`;
}

function showDamagePopup(targetElement, amount) {
    if (!targetElement) return;
    const popup = document.createElement('div');
    popup.className = 'damage-popup';
    popup.textContent = amount;
    targetElement.appendChild(popup);
    setTimeout(() => popup.remove(), 234 * battleSpeeds[currentSpeedIndex].multiplier);
}

function updateStatusIcons(combatant, cardElement = null) {
    const card = cardElement || combatant.element;
    if (!card) return;
    const container = card.querySelector('.status-icon-container');
    if (!container) return;

    container.innerHTML = '';
    combatant.statusEffects.forEach(effect => {
        const icon = document.createElement('div');
        icon.className = 'status-icon';
        icon.innerHTML = effect.name === 'Stun' ? '<i class="fa-solid fa-star"></i>' : '<i class="fa-solid fa-skull-crossbones"></i>';
        icon.title = `${effect.name} (${effect.turnsRemaining} turns left)`;
        container.appendChild(icon);
    });
}

function logToBattle(message) {
    if (!battleLogElement) return;
    battleLogElement.textContent = message;
    battleLogElement.style.opacity = '1';
    setTimeout(() => {
        if (battleLogElement) battleLogElement.style.opacity = '0';
    }, 667 * battleSpeeds[currentSpeedIndex].multiplier);
}

// --- PUBLIC API ---
export function initializeGame() {
    scenes = {
        pack: document.getElementById('pack-scene'),
        draft: document.getElementById('draft-scene'),
        weapon: document.getElementById('weapon-scene'),
        battle: document.getElementById('battle-scene'),
    };
    boosterPack = document.getElementById('booster-pack');
    weaponPack = document.getElementById('weapon-pack');
    draftPool = document.getElementById('draft-pool');
    weaponDraftPool = document.getElementById('weapon-draft-pool');
    confirmationBar = document.getElementById('confirmation-bar');

    packSceneTitle = document.getElementById('pack-scene-title');
    draftInstructions = document.getElementById('draft-instructions');
    weaponInstructions = document.getElementById('weapon-instructions');
    battleLogElement = document.getElementById('battle-log');
    speedCycleButtonElement = document.getElementById('speed-cycle-button');

    // Reset state for fresh game (important for play again)
    team = {
        hero1: { hero: null, ability: null, weapon: null, armor: null },
        hero2: { hero: null, ability: null, weapon: null, armor: null }
    };
    currentDraftStage = 'HERO_1_PACK';
    openedPack = [];
    battleState = [];
    currentSpeedIndex = 0;
    currentAttackerIndex = 0;

    if (confirmationBar) confirmationBar.classList.remove('visible');
    const endScreen = document.getElementById('end-screen');
    if (endScreen) {
      endScreen.classList.remove('visible', 'victory', 'defeat');
      endScreen.classList.add('hidden'); // Ensure it's hidden initially
    }


    resetPackScene();
    resetWeaponScene();
    transitionToScene('pack'); // Start at pack scene
    updateInstructions();
    if(speedCycleButtonElement) speedCycleButtonElement.textContent = `Speed: ${battleSpeeds[currentSpeedIndex].label}`;

    // Ensure battle arena is clear for new game
    const playerContainer = document.getElementById('player-team-container');
    const enemyContainer = document.getElementById('enemy-team-container');
    if(playerContainer) playerContainer.innerHTML = '';
    if(enemyContainer) enemyContainer.innerHTML = '';
}

export function handlePackClick(packType) {
    openPack(packType === 'weapon');
}

export async function startBattle() {
    if (confirmationBar) confirmationBar.classList.remove('visible');
    transitionToScene('battle');

    // Ensure data.allPossibleHeroes and data.allPossibleWeapons are populated
    if (!data.allPossibleHeroes || data.allPossibleHeroes.length === 0 || !data.allPossibleWeapons || data.allPossibleWeapons.length === 0) {
        logToBattle("Error: Game data not loaded!");
        return;
    }

    const enemyHero1 = data.allPossibleHeroes[Math.floor(Math.random() * data.allPossibleHeroes.length)];
    let enemyHero2 = data.allPossibleHeroes[Math.floor(Math.random() * data.allPossibleHeroes.length)];
    while (enemyHero2.id === enemyHero1.id) { // Ensure different heroes
        enemyHero2 = data.allPossibleHeroes[Math.floor(Math.random() * data.allPossibleHeroes.length)];
    }
    const enemyWeapon1 = data.allPossibleWeapons[Math.floor(Math.random() * data.allPossibleWeapons.length)];
    const enemyWeapon2 = data.allPossibleWeapons[Math.floor(Math.random() * data.allPossibleWeapons.length)];

    const playerHero1 = data.allPossibleHeroes.find(h => h.id === team.hero1.hero);
    const playerWeapon1 = data.allPossibleWeapons.find(w => w.id === team.hero1.weapon);
    const playerHero2 = data.allPossibleHeroes.find(h => h.id === team.hero2.hero);
    const playerWeapon2 = data.allPossibleWeapons.find(w => w.id === team.hero2.weapon);

    if (!playerHero1 || !playerHero2) {
        logToBattle("Error: Player heroes not selected!");
        return;
    }

    battleState = [
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
        element: null, // Will be assigned when card is created
    }));

    const playerContainer = document.getElementById('player-team-container');
    const enemyContainer = document.getElementById('enemy-team-container');
    if (!playerContainer || !enemyContainer) return;

    playerContainer.innerHTML = '';
    enemyContainer.innerHTML = '';

    battleState.forEach(combatant => {
        const card = createCompactCard(combatant);
        combatant.element = card; // Assign the DOM element to the combatant state
        if (combatant.team === 'player') playerContainer.appendChild(card);
        else enemyContainer.appendChild(card);
    });

    currentAttackerIndex = 0; // Start with the first combatant
    await sleep(125 * battleSpeeds[currentSpeedIndex].multiplier);
    logToBattle("The battle begins!");
    runCombatTurn();
}

export function handlePlayAgain() {
    initializeGame(); // Re-initialize the game state and UI
}

export function handleSpeedCycle() {
    currentSpeedIndex = (currentSpeedIndex + 1) % battleSpeeds.length;
    const newSpeed = battleSpeeds[currentSpeedIndex];
    if (speedCycleButtonElement) speedCycleButtonElement.textContent = `Speed: ${newSpeed.label}`;
}

export { handleAbilitySelection, handleArmorSelection };
