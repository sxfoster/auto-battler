// public/app.js

// --- Global UI Elements & State ---
const appDiv = document.getElementById('app');
let currentScene = ''; // To track which scene is active (setup, battle, tournament)
let playerData = {}; // Store player's champion and deck
let battleLog = []; // Store the battle log for Scene 2 playback
let combatantIdMap = {}; // Map display names to DOM element IDs
let battleEventQueue = []; // Queue of events for playback
let currentBattleResult = null;
let initialPlayerHp1, initialPlayerHp2, initialOpponentHp1, initialOpponentHp2;

const ANIMATION_TIMING_MAP = {
    BATTLE_START: { delay: 600 },
    TURN_START: { actor: 'turn-highlight-animation', delay: 300 },
    TURN_ACTION: { actor: 'pulse-animation', delay: 200 },
    ENERGY_GAIN: { actor: 'pulse-animation', delay: 200 },
    CARD_PLAYED: { actor: 'lunge-animation', delay: 400 },
    DAMAGE_DEALT: { actor: 'lunge-animation', target: 'shake-animation', delay: 400 },
    HEAL_APPLIED: { target: 'heal-flash-animation', delay: 300 },
    STATUS_EFFECT_APPLIED: { target: 'status-tint-animation', delay: 500 }, // Updated
    ACTION_FAILED: { actor: 'wobble-animation', delay: 300 },
    EFFECT_APPLYING: { actor: 'effect-applying-pulse-animation', target: 'effect-applying-pulse-animation', delay: 300 }, // Updated
    TURN_SKIPPED: { actor: 'dim-animation', delay: 300 },
    TURN_PASSED: { actor: 'dim-animation', delay: 300 },
    TURN_END: { delay: 200 },
    BATTLE_END: { actor: 'winner-glow-animation', delay: 800 }
};

// --- Global Data for Class Icons ---
const CLASS_ICONS = {
    'Warrior': 'fa-solid fa-shield-halved',
    'Bard': 'fa-solid fa-guitar',
    'Barbarian': 'fa-solid fa-hand-fist',
    'Cleric': 'fa-solid fa-cross',
    'Druid': 'fa-solid fa-leaf',
    'Enchanter': 'fa-solid fa-hat-wizard',
    'Paladin': 'fa-solid fa-shield',
    'Rogue': 'fa-solid fa-user-ninja',
    'Ranger': 'fa-solid fa-person-rifle',
    'Sorcerer': 'fa-solid fa-bolt',
    'Wizard': 'fa-solid fa-wand-magic-sparkles'
};

const AI_PERSONAS = [
    { id: 1, name: 'Aggressive', description: 'Prioritizes offense.' },
    { id: 2, name: 'Defensive', description: 'Focuses on survival & support.' },
    { id: 3, name: 'Controller', description: 'Relies on debilitating foes.' }
];

// --- Global State for 2v2 Setup ---
let selectedChampion1Id = null;
let selectedChampion2Id = null;
let selectedChampion1Data = null;
let selectedChampion2Data = null;
let selectedCards1 = { ability: null, armor: null, weapon: null };
let selectedCards2 = { ability: null, armor: null, weapon: null };
let currentSetupStage = 0; // 0: Choose Champ 1, 1: Draft Champ 1, 2: Choose Champ 2, 3: Draft Champ 2
let selectedPersonaId = AI_PERSONAS[0].id;

// --- API Helper Functions ---
async function callApi(endpoint, method = 'GET', data = null) {
    // Prefix API calls with /public/ so requests hit the proper PHP scripts
    const url = `/public/api/${endpoint}`;
    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json',
        },
    };
    if (data) {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(url, options);
        const responseData = await response.json();

        if (!response.ok) {
            console.error('API Error:', responseData.error || response.statusText);
            alert('Error: ' + (responseData.error || 'Something went wrong.'));
            return null;
        }
        return responseData;
    } catch (error) {
        console.error('Network or API call failed:', error);
        alert('Network error or API is unreachable.');
        return null;
    }
}

// --- UI Rendering Functions ---

// Function to clear existing UI and set up a new scene
function renderScene(sceneId, contentHtml, buttons = []) {
    appDiv.innerHTML = `<div id="${sceneId}" class="scene">${contentHtml}</div>`;
    currentScene = sceneId;

    // Add general styles for scenes
    const sceneElement = appDiv.querySelector('.scene');
    if (sceneElement) {
        sceneElement.style.padding = '20px';
        sceneElement.style.maxWidth = '800px';
        sceneElement.style.margin = '20px auto';
        sceneElement.style.backgroundColor = '#2a2a2a';
        sceneElement.style.borderRadius = '8px';
        sceneElement.style.boxShadow = '0 4px 8px rgba(0,0,0,0.5)';
        sceneElement.style.color = '#eee';
    }

    // Add buttons dynamically
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'button-container';
    buttonContainer.style.marginTop = '20px';
    buttonContainer.style.textAlign = 'center';
    
    buttons.forEach(btn => {
        const buttonElement = document.createElement('button');
        buttonElement.textContent = btn.text;
        buttonElement.className = 'game-button'; // For CSS styling
        buttonElement.onclick = btn.onClick;
        buttonContainer.appendChild(buttonElement);
    });
    appDiv.querySelector('.scene').appendChild(buttonContainer);
}

// Function to render a card (used in setup and potentially battle log)
function renderCard(card, isSelectable = false, clickHandler = null) {
    let cardHtml = `
        <div class="card ${card.rarity.toLowerCase()}-card ${card.card_type}-card">
            <div class="card-header">
                <span class="card-name">${card.name}</span>
                <span class="energy-cost"><i class="fa-solid fa-bolt"></i> ${card.energy_cost}</span>
            </div>
            <div class="card-body">
                <p class="card-description">${card.description}</p>
                ${card.damage_type ? `<span class="damage-type-icon"><i class="fa-solid fa-${getDamageTypeIcon(card.damage_type)}"></i> ${card.damage_type}</span>` : ''}
            </div>
            ${card.flavor_text ? `<div class="card-flavor-text">${card.flavor_text}</div>` : ''}
        </div>
    `;
    const cardElement = document.createElement('div');
    cardElement.innerHTML = cardHtml.trim();
    cardElement.querySelector('.card').dataset.cardId = card.id; // Store ID for selection
    if (isSelectable) {
        cardElement.querySelector('.card').classList.add('selectable-card');
        cardElement.querySelector('.card').onclick = clickHandler;
    }
    return cardElement.firstElementChild; // Return the actual card div
}

// Helper to map damage types to Font Awesome icons
function getDamageTypeIcon(damageType) {
    switch (damageType.toLowerCase()) {
        case 'slashing': return 'sword';
        case 'piercing': return 'arrow-alt-circle-right'; // Or 'crosshairs'
        case 'bludgeoning': return 'hammer';
        case 'magic': return 'hat-wizard'; // Or 'magic'
        default: return 'question-circle';
    }
}

// Helper to map status effect types to Font Awesome icons
function getEffectIcon(effectType) {
    switch (effectType.toLowerCase()) {
        case 'stun': return 'fa-solid fa-face-dizzy';
        case 'poison': return 'fa-solid fa-skull-crossbones';
        case 'bleed': return 'fa-solid fa-droplet';
        case 'burn': return 'fa-solid fa-fire';
        case 'slow': return 'fa-solid fa-hourglass-half';
        case 'confuse': return 'fa-solid fa-brain';
        case 'root': return 'fa-solid fa-tree';
        case 'shock': return 'fa-solid fa-bolt';
        case 'fear': return 'fa-solid fa-ghost';
        case 'defense boost': return 'fa-solid fa-shield-alt';
        case 'magic defense boost': return 'fa-solid fa-shield-alt';
        case 'evasion': return 'fa-solid fa-running';
        case 'attack': return 'fa-solid fa-fist-raised';
        case 'vulnerable': return 'fa-solid fa-bullseye';
        case 'block': return 'fa-solid fa-hand-paper';
        case 'block magic': return 'fa-solid fa-hand-sparkles';
        case 'hot': return 'fa-solid fa-heart-pulse';
        case 'prevent defeat': return 'fa-solid fa-fist-raised';
        default: return 'fa-solid fa-question-circle';
    }
}

// Helper to map class names to Font Awesome icons
function getClassIcon(className) {
    return CLASS_ICONS[className] || 'fa-solid fa-question-circle';
}

// Initial application load
// --- Initial Application Load ---
document.addEventListener('DOMContentLoaded', () => {
    // Always start with fresh setup for MVP 2v2 demo
    renderCharacterSetup();
});

// --- Scene 1: Character Setup ---
async function renderCharacterSetup() {
    // Reset any previous state
    selectedChampion1Id = null;
    selectedChampion2Id = null;
    selectedChampion1Data = null;
    selectedChampion2Data = null;
    selectedCards1 = { ability: null, armor: null, weapon: null };
    selectedCards2 = { ability: null, armor: null, weapon: null };
    currentSetupStage = 0;

    await renderChooseChampion(1); // Begin with champion 1 selection
}

async function renderChooseChampion(championNumber) {
    currentSetupStage = championNumber === 1 ? 0 : 2;

    const championsResponse = await callApi('champions.php');
    if (!championsResponse || championsResponse.length === 0) {
        appDiv.innerHTML = '<p>Error: No champions found. Please check database population.</p>';
        return;
    }

    let availableChampions = shuffleArray(championsResponse);
    if (championNumber === 2 && selectedChampion1Data) {
        availableChampions = availableChampions.filter(c => c.id != selectedChampion1Id);
    }
    availableChampions = availableChampions.slice(0, 4);

    const championsHtml = availableChampions.map(champ => `
        <div class="champion-card" data-champion-id="${champ.id}">
            <h3>${champ.name}</h3>
            <p>Role: ${champ.role}</p>
            <p>HP: ${champ.starting_hp} | Speed: ${champ.speed}</p>
        </div>
    `).join('');

    let personaSection = '';
    if (championNumber === 1) {
        const personaOptions = AI_PERSONAS.map(p => `
            <label class="persona-card">
                <input type="radio" name="aiPersona" value="${p.id}" class="hidden-radio" ${selectedPersonaId === p.id ? 'checked' : ''}>
                <span class="persona-content">
                    <span class="persona-name">${p.name}</span>
                    <span class="persona-description">${p.description}</span>
                </span>
            </label>
        `).join('');
        personaSection = `
            <div class="ai-persona-selection-container">
                <h2 class="section-title ai-persona-title">Choose Your AI Persona</h2>
                <div class="persona-options-grid">${personaOptions}</div>
            </div>
        `;
    }

    renderScene('character-setup', `
        ${personaSection}
        <h2>Choose Your Champion ${championNumber}</h2>
        <div id="champion-selection-${championNumber}" class="selection-grid">
            ${championsHtml}
        </div>
    `, []);

    document.querySelectorAll(`#champion-selection-${championNumber} .champion-card`).forEach(card => {
        card.onclick = () => {
            const champId = card.dataset.championId;
            const champData = availableChampions.find(c => c.id == champId);
            if (championNumber === 1) {
                selectedChampion1Id = champId;
                selectedChampion1Data = champData;
                document.querySelectorAll('.champion-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                renderDeckDraft(1);
            } else {
                selectedChampion2Id = champId;
                selectedChampion2Data = champData;
                document.querySelectorAll('.champion-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                renderDeckDraft(2);
            }
        };
    });

    if (championNumber === 1) {
        document.querySelectorAll('.persona-card').forEach(card => {
            card.onclick = () => {
                const radio = card.querySelector('input');
                radio.checked = true;
                selectedPersonaId = parseInt(radio.value);
                document.querySelectorAll('.persona-card').forEach(c => c.classList.toggle('selected', c.querySelector('input').checked));
            };
        });
    }
}

async function renderDeckDraft(championNumber) {
    currentSetupStage = championNumber === 1 ? 1 : 3;

    const currentChampionData = championNumber === 1 ? selectedChampion1Data : selectedChampion2Data;
    const championName = currentChampionData.name;

    renderScene('deck-draft', `
        <h2>Draft Deck for ${currentChampionData.name} (Champion ${championNumber})</h2>
        <p>Select 1 Ability, 1 Armor, 1 Weapon for this Champion.</p>
        <div class="draft-category">
            <h4>Ability Card</h4>
            <div id="ability-cards-${championNumber}" class="card-selection-grid"></div>
        </div>
        <div class="draft-category">
            <h4>Armor Card</h4>
            <div id="armor-cards-${championNumber}" class="card-selection-grid"></div>
        </div>
        <div class="draft-category">
            <h4>Weapon Card</h4>
            <div id="weapon-cards-${championNumber}" class="card-selection-grid"></div>
        </div>
    `, []);

    await fetchDraftCards('ability', championName, championNumber);
    await fetchDraftCards('armor', championName, championNumber);
    await fetchDraftCards('weapon', championName, championNumber);

    updateDeckDraftButtons(championNumber);
}

async function fetchDraftCards(cardType, championName, championNumber) {
    const cardsResponse = await callApi(`cards_common_by_type.php?type=${cardType}&class=${championName}`);
    const container = document.getElementById(`${cardType}-cards-${championNumber}`);
    if (!cardsResponse || cardsResponse.length === 0) {
        container.innerHTML = `<p>No common ${cardType} cards found for ${championName}. Please ensure database is populated for this class.</p>`;
        return;
    }

    const availableCards = shuffleArray(cardsResponse).slice(0, 3);
    container.innerHTML = '';
    availableCards.forEach(card => {
        const cardElement = renderCard(card, true, () => selectDraftCard(championNumber, cardType, card));
        container.appendChild(cardElement);
    });
}

function selectDraftCard(championNumber, cardType, card) {
    const targetSelectedCards = championNumber === 1 ? selectedCards1 : selectedCards2;
    targetSelectedCards[cardType] = card;

    document.querySelectorAll(`#${cardType}-cards-${championNumber} .card`).forEach(el => el.classList.remove('selected'));
    document.querySelector(`#${cardType}-cards-${championNumber} .card[data-card-id="${card.id}"]`).classList.add('selected');

    updateDeckDraftButtons(championNumber);
}

function updateDeckDraftButtons(championNumber) {
    const buttonContainer = appDiv.querySelector('.button-container');
    buttonContainer.innerHTML = '';

    const currentSelectedCards = championNumber === 1 ? selectedCards1 : selectedCards2;
    const allCardsSelected = currentSelectedCards.ability && currentSelectedCards.armor && currentSelectedCards.weapon;

    if (allCardsSelected) {
        const nextButton = document.createElement('button');
        nextButton.className = 'game-button';
        if (championNumber === 1) {
            nextButton.textContent = 'Configure Champion 2';
            nextButton.onclick = () => renderChooseChampion(2);
        } else {
            nextButton.textContent = 'Confirm Team & Start Tournament';
            nextButton.onclick = confirmTeamSetup;
        }
        buttonContainer.appendChild(nextButton);
    } else {
        const hint = document.createElement('p');
        hint.textContent = 'Select one of each card type to proceed for this champion.';
        hint.style.color = '#aaa';
        buttonContainer.appendChild(hint);
    }
}

async function confirmTeamSetup() {
    const cardIds1 = [selectedCards1.ability.id, selectedCards1.armor.id, selectedCards1.weapon.id];
    const cardIds2 = [selectedCards2.ability.id, selectedCards2.armor.id, selectedCards2.weapon.id];

    const response = await callApi('player_setup.php', 'POST', {
        champion_id_1: selectedChampion1Id,
        card_ids_1: cardIds1,
        champion_id_2: selectedChampion2Id,
        card_ids_2: cardIds2
    });

    if (response && response.message === 'Player team setup complete.') {
        renderBattleScene();
    } else {
        alert('Failed to confirm team setup. Please try again.');
    }
}

// --- Helper for array shuffling (Fisher-Yates) ---
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Swap
    }
    return array;
}

// --- Scene 2: Battle Scene ---
async function renderBattleScene() {
    // Fetch player and opponent data
    const initialPlayerState = await callApi('player_current_setup.php');
    if (!initialPlayerState) {
        alert('Error: Could not load player data for battle.');
        renderCharacterSetup();
        return;
    }

    const battleResult = await callApi('battle_simulate.php', 'POST', { persona_id: selectedPersonaId });
    if (!battleResult) {
        alert('Failed to simulate battle.');
        return;
    }

    battleLog = battleResult.log;

    const playerChamp1DisplayName = initialPlayerState.champion_name_1_display_short || initialPlayerState.champion_name_1;
    const playerChamp2DisplayName = initialPlayerState.champion_name_2_display_short || initialPlayerState.champion_name_2;
    const opponentChamp1DisplayName = battleResult.opponent_display_name_1_short || battleResult.opponent_team_names[0];
    const opponentChamp2DisplayName = battleResult.opponent_display_name_2_short || battleResult.opponent_team_names[1];

    const initialPlayerHp1 = initialPlayerState.champion_max_hp_1;
    const initialPlayerHp2 = initialPlayerState.champion_max_hp_2;
    const initialOpponentHp1 = battleResult.opponent_start_hp_1;
    const initialOpponentHp2 = battleResult.opponent_start_hp_2;

    renderScene('battle-scene', `
        <h2>Battle!</h2>
        <div class="battle-arena">
            <div class="team-container player-side">
                <div class="team-persona-display">Your Team: <span id="player-persona-name"></span></div>
                <div id="player-1" class="combatant player-1">
                    <div class="combatant-header">
                        <h3 id="player-1-name" class="combatant-name">${playerChamp1DisplayName}</h3>
                        <span id="player-1-max-hp" class="max-hp-display">HP ${initialPlayerState.champion_max_hp_1}</span>
                    </div>
                    <div class="hp-section">
                        <div class="hp-bar-container"><div id="player-1-hp-bar" class="hp-bar" style="width: 100%;"></div></div>
                        <span id="player-1-hp-text" class="hp-text">HP: --/--</span>
                    </div>
                    <div id="player-1-class-icon" class="class-icon-container"></div>
                    <div class="bottom-stats-section">
                        <div id="player-1-energy" class="energy-display"></div>
                        <div id="player-1-status-effects" class="status-effects-container"></div>
                    </div>
                    <div id="player-1-defeated-text" class="defeated-text" style="display: none;">DEAD</div>
                </div>
                <div id="player-2" class="combatant player-2">
                    <div class="combatant-header">
                        <h3 id="player-2-name" class="combatant-name">${playerChamp2DisplayName}</h3>
                        <span id="player-2-max-hp" class="max-hp-display">HP ${initialPlayerState.champion_max_hp_2}</span>
                    </div>
                    <div class="hp-section">
                        <div class="hp-bar-container"><div id="player-2-hp-bar" class="hp-bar" style="width: 100%;"></div></div>
                        <span id="player-2-hp-text" class="hp-text">HP: --/--</span>
                    </div>
                    <div id="player-2-class-icon" class="class-icon-container"></div>
                    <div class="bottom-stats-section">
                        <div id="player-2-energy" class="energy-display"></div>
                        <div id="player-2-status-effects" class="status-effects-container"></div>
                    </div>
                    <div id="player-2-defeated-text" class="defeated-text" style="display: none;">DEAD</div>
                </div>
            </div>
            <div class="vs-text">VS</div>
            <div class="team-container opponent-side">
                <div class="team-persona-display">Opponent Team: <span id="opponent-persona-name"></span></div>
                <div id="opponent-1" class="combatant opponent-1">
                    <div class="combatant-header">
                        <h3 id="opponent-1-name" class="combatant-name">${opponentChamp1DisplayName}</h3>
                        <span id="opponent-1-max-hp" class="max-hp-display">HP ${battleResult.opponent_start_hp_1}</span>
                    </div>
                    <div class="hp-section">
                        <div class="hp-bar-container"><div id="opponent-1-hp-bar" class="hp-bar" style="width: 100%;"></div></div>
                        <span id="opponent-1-hp-text" class="hp-text">HP: --/--</span>
                    </div>
                    <div id="opponent-1-class-icon" class="class-icon-container"></div>
                    <div class="bottom-stats-section">
                        <div id="opponent-1-energy" class="energy-display"></div>
                        <div id="opponent-1-status-effects" class="status-effects-container"></div>
                    </div>
                    <div id="opponent-1-defeated-text" class="defeated-text" style="display: none;">DEAD</div>
                </div>
                <div id="opponent-2" class="combatant opponent-2">
                    <div class="combatant-header">
                        <h3 id="opponent-2-name" class="combatant-name">${opponentChamp2DisplayName}</h3>
                        <span id="opponent-2-max-hp" class="max-hp-display">HP ${battleResult.opponent_start_hp_2}</span>
                    </div>
                    <div class="hp-section">
                        <div class="hp-bar-container"><div id="opponent-2-hp-bar" class="hp-bar" style="width: 100%;"></div></div>
                        <span id="opponent-2-hp-text" class="hp-text">HP: --/--</span>
                    </div>
                    <div id="opponent-2-class-icon" class="class-icon-container"></div>
                    <div class="bottom-stats-section">
                        <div id="opponent-2-energy" class="energy-display"></div>
                        <div id="opponent-2-status-effects" class="status-effects-container"></div>
                    </div>
                    <div id="opponent-2-defeated-text" class="defeated-text" style="display: none;">DEAD</div>
                </div>
            </div>
        </div>
        <div id="battle-log" class="battle-log">
            <h4>Battle Log</h4>
            <div id="log-entries"></div>
        </div>
    `, []);

    if (battleResult) {
        document.getElementById('player-persona-name').textContent = battleResult.player_team_persona_name || 'N/A';
        document.getElementById('opponent-persona-name').textContent = battleResult.opponent_team_persona_name || 'N/A';
    }

    updateCombatantUI('player-1', initialPlayerState.champion_hp_1, initialPlayerState.champion_max_hp_1, initialPlayerState.champion_energy_1, initialPlayerState.player_1_active_effects, initialPlayerState.champion_name_1, playerChamp1DisplayName);
    updateCombatantUI('player-2', initialPlayerState.champion_hp_2, initialPlayerState.champion_max_hp_2, initialPlayerState.champion_energy_2, initialPlayerState.player_2_active_effects, initialPlayerState.champion_name_2, playerChamp2DisplayName);
    updateCombatantUI('opponent-1', battleResult.opponent_start_hp_1, battleResult.opponent_start_hp_1, battleResult.opponent_energy_1, battleResult.opponent_1_active_effects, battleResult.opponent_class_name_1, opponentChamp1DisplayName);
    updateCombatantUI('opponent-2', battleResult.opponent_start_hp_2, battleResult.opponent_start_hp_2, battleResult.opponent_energy_2, battleResult.opponent_2_active_effects, battleResult.opponent_class_name_2, opponentChamp2DisplayName);

    combatantIdMap = {
        [playerChamp1DisplayName]: 'player-1',
        [playerChamp2DisplayName]: 'player-2',
        [opponentChamp1DisplayName]: 'opponent-1',
        [opponentChamp2DisplayName]: 'opponent-2'
    };

    initialPlayerHp1 = initialPlayerState.champion_max_hp_1;
    initialPlayerHp2 = initialPlayerState.champion_max_hp_2;
    initialOpponentHp1 = battleResult.opponent_start_hp_1;
    initialOpponentHp2 = battleResult.opponent_start_hp_2;
    currentBattleResult = battleResult;

    // const logEntriesDiv = document.getElementById('log-entries'); // Redundant: Cleared in startBattlePlayback
    // logEntriesDiv.innerHTML = ''; // Redundant: Cleared in startBattlePlayback
    startBattlePlayback(battleLog);
}

function updateCombatantUI(elementIdPrefix, currentHp, maxHp, currentEnergy, activeEffects = [], className = null, characterDisplayName = null) {
    const combatantElement = document.getElementById(elementIdPrefix);
    const hpBar = document.getElementById(`${elementIdPrefix}-hp-bar`);
    const hpText = document.getElementById(`${elementIdPrefix}-hp-text`);
    const energyDisplay = document.getElementById(`${elementIdPrefix}-energy`);
    const statusContainer = document.getElementById(`${elementIdPrefix}-status-effects`);
    const defeatedText = document.getElementById(`${elementIdPrefix}-defeated-text`);
    const combatantNameDisplay = document.getElementById(`${elementIdPrefix}-name`);
    const maxHpDisplay = document.getElementById(`${elementIdPrefix}-max-hp`);
    const classIconContainer = document.getElementById(`${elementIdPrefix}-class-icon`);

    if (currentHp <= 0) {
        if (combatantElement) combatantElement.classList.add('defeated');
        if (combatantElement) combatantElement.classList.remove('active');
        if (defeatedText) defeatedText.style.display = 'flex';
    } else {
        if (combatantElement) combatantElement.classList.remove('defeated');
        if (combatantElement) combatantElement.classList.add('active');
        if (defeatedText) defeatedText.style.display = 'none';
    }

    if (combatantNameDisplay && characterDisplayName) {
        combatantNameDisplay.textContent = characterDisplayName;
    }
    if (maxHpDisplay && maxHp !== undefined) {
        maxHpDisplay.textContent = `HP ${maxHp}`;
    }

    if (hpBar && hpText) {
        const hpPercent = (currentHp / maxHp) * 100;
        hpBar.style.width = `${Math.max(0, hpPercent)}%`;
        hpBar.classList.remove('mid', 'low');
        if (hpPercent <= 30) {
            hpBar.classList.add('low');
        } else if (hpPercent <= 60) {
            hpBar.classList.add('mid');
        }
        hpText.textContent = `HP: ${Math.max(0, currentHp)}/${maxHp}`;
    }

    if (energyDisplay && currentEnergy !== undefined) {
        energyDisplay.innerHTML = `<i class="fa-solid fa-bolt"></i> ${currentEnergy}`;
    }

    if (classIconContainer && className) {
        classIconContainer.innerHTML = `<i class="${getClassIcon(className)}"></i>`;
    }

    if (statusContainer) {
        statusContainer.innerHTML = '';
        activeEffects.forEach(effect => {
            statusContainer.innerHTML += `<i class="${getEffectIcon(effect.type)}" title="${effect.type} (${effect.duration} turns)" style="color:${effect.is_debuff ? 'red' : 'green'};"></i> `;
        });
    }
}

// Helper functions for formatting log entries
function getSafeActorName(actor) {
    if (typeof actor === 'string') {
        return actor;
    }
    if (actor && typeof actor === 'object' && actor.displayName) {
        return actor.displayName;
    }
    // Fallback for system messages or undefined actors in log
    if (actor && typeof actor === 'object' && !actor.displayName && actor.turn !== undefined) { // Heuristic for system actor
         return 'System';
    }
    return 'Unknown Entity';
}

function getSafeActorRole(actor) {
    if (actor && typeof actor === 'object' && actor.role) {
        return actor.role.toLowerCase();
    }
    return '';
}

// Translate backend events to styled HTML snippets
function formatLogEntry(event) {
    const { eventType, payload } = event;

    switch (eventType) {
        case 'BATTLE_START':
            return `<p class="log-entry log-battle-start">Battle Begins! <strong>${payload.player_team_names.join(' & ')}</strong> vs <strong>${payload.opponent_team_names.join(' & ')}</strong>.</p>`;

        case 'TURN_START':
            return `<p class="log-entry log-turn-start">--- Turn ${payload.turn} (Actor: ${getSafeActorName(payload.actor)}) ---</p>`;

        case 'CARD_PLAYED': {
            const targetName = (typeof payload.target === 'string') ? payload.target : getSafeActorName(payload.target);
            const targetRoleClass = (typeof payload.target === 'string') ? '' : getSafeActorRole(payload.target);
            return `<p class="log-entry log-card-played"><span class="actor-name ${getSafeActorRole(payload.caster)}">${getSafeActorName(payload.caster)}</span> plays <strong class="card-name">${payload.card.name}</strong> on <span class="target-name ${targetRoleClass}">${targetName}</span>.</p>`;
        }
        case 'DAMAGE_DEALT': {
            const damageType = payload.card && payload.card.damage_type ? payload.card.damage_type : 'unknown';
            const damageTypeIconName = getDamageTypeIcon(damageType);
            return `
                <p class="log-entry log-damage-dealt">
                    <span class="actor-name ${getSafeActorRole(payload.caster)}">${getSafeActorName(payload.caster)}</span>
                    deals <span class="damage-value">${payload.result.damageDealt}</span>
                    <span class="damage-type-icon"><i class="fa-solid fa-${damageTypeIconName}"></i></span>
                    damage to <span class="target-name ${getSafeActorRole(payload.target)}">${getSafeActorName(payload.target)}</span>
                    with <strong class="card-name">${payload.card.name}</strong>.
                </p>
            `;
        }
        case 'HEAL_APPLIED':
            return `<p class="log-entry log-heal-applied"><span class="actor-name ${getSafeActorRole(payload.caster)}">${getSafeActorName(payload.caster)}</span> heals <span class="target-name ${getSafeActorRole(payload.target)}">${getSafeActorName(payload.target)}</span> for <span class="heal-value">${payload.result.healed}</span> HP (now ${payload.result.targetHpAfter}) using <strong class="card-name">${payload.card.name}</strong>.</p>`;

        case 'STATUS_EFFECT_APPLIED': {
            const effectIconName = getEffectIcon(payload.effect.type);
            return `<p class="log-entry log-status-effect-applied"><span class="actor-name ${getSafeActorRole(payload.caster)}">${getSafeActorName(payload.caster)}</span> applies <span class="status-effect">${payload.effect.type} <i class="fa-solid fa-${effectIconName}"></i></span> to <span class="target-name ${getSafeActorRole(payload.target)}">${getSafeActorName(payload.target)}</span> with <strong class="card-name">${payload.card.name}</strong>.</p>`;
        }
        case 'BATTLE_END':
            return `<p class="log-entry log-battle-end"><strong>Battle Ends! Winner: ${payload.winner}</strong>. Player result: ${payload.result}.</p>`;

        // Added cases
        case 'TURN_END':
            return `<p class="log-entry log-turn-end">--- Turn ${payload.turn} Ends (System) ---</p>`;

        case 'TURN_SKIPPED':
            return `<p class="log-entry log-turn-skipped"><span class="actor-name ${getSafeActorRole(payload.actor)}">${getSafeActorName(payload.actor)}</span> skipped their turn.</p>`;

        case 'TURN_PASSED':
            return `<p class="log-entry log-turn-passed"><span class="actor-name ${getSafeActorRole(payload.actor)}">${getSafeActorName(payload.actor)}</span> passed their turn.</p>`;

        case 'ENERGY_GAIN':
            // Amount is not in the schema for this event, so a generic message.
            return `<p class="log-entry log-energy-gain"><span class="actor-name ${getSafeActorRole(payload.actor)}">${getSafeActorName(payload.actor)}</span> gained energy.</p>`;

        case 'TURN_ACTION':
            return `<p class="log-entry log-turn-action"><span class="actor-name ${getSafeActorRole(payload.actor)}">${getSafeActorName(payload.actor)}</span> is taking an action.</p>`;

        case 'ACTION_FAILED':
            if (payload.card && payload.card.name) {
                return `<p class="log-entry log-action-failed"><span class="actor-name ${getSafeActorRole(payload.actor)}">${getSafeActorName(payload.actor)}</span>'s action with <strong class="card-name">${payload.card.name}</strong> failed.</p>`;
            }
            return `<p class="log-entry log-action-failed"><span class="actor-name ${getSafeActorRole(payload.actor)}">${getSafeActorName(payload.actor)}</span>'s action failed.</p>`;

        case 'EFFECT_APPLYING': {
            const effectIconName = getEffectIcon(payload.effect.type);
            return `<p class="log-entry log-effect-applying">Effect <span class="status-effect">${payload.effect.type} <i class="fa-solid fa-${effectIconName}"></i></span> from <span class="actor-name ${getSafeActorRole(payload.actor)}">${getSafeActorName(payload.actor)}</span> is applying.</p>`;
        }
        default:
            console.warn(`Unknown eventType: ${eventType}`, event);
            return `<p class="log-entry log-unknown">Unknown Event: ${eventType}</p>`;
    }
}

function getCombatantElementByName(name) {
    const id = combatantIdMap[name];
    return id ? document.getElementById(id) : null;
}

function startBattlePlayback(logFromServer) {
    // 1. Clear any old log entries
    const logEntriesDiv = document.getElementById('log-entries');
    if (logEntriesDiv) { // Check if element exists
        logEntriesDiv.innerHTML = '';
    } else {
        console.error("Log entries container 'log-entries' not found.");
    }

    // 2. Populate our queue with the new events from the server
    battleEventQueue = Array.from(logFromServer); // Using Array.from() is good practice

    // 3. Kick off the first event
    processNextEvent();
}

function processNextEvent() {
    // If the queue is empty, we're done!
    if (battleEventQueue.length === 0) {
        // The existing finalizeBattlePlayback() handles showing "Proceed" button and final UI updates.
        finalizeBattlePlayback();
        return;
    }

    // Pull the next event from the front of the queue
    const event = battleEventQueue.shift();
    const { eventType, payload } = event;

    // Default time to wait before showing the log and processing the next event
    // Use ANIMATION_TIMING_MAP from app.js
    const animationConfig = ANIMATION_TIMING_MAP[eventType] || { delay: 300 }; // Default delay
    let animationDelay = animationConfig.delay;

    // --- Trigger Animations based on Event Type ---
    let actorElement = null;
    let targetElement = null;

    // Resolve actor element
    if (payload.caster) { // Events like DAMAGE_DEALT, HEAL_APPLIED use 'caster'
        actorElement = getCombatantElementByName(payload.caster.displayName);
    } else if (payload.actor) { // Events like TURN_ACTION use 'actor'
        if (typeof payload.actor === 'object' && payload.actor.displayName) {
            actorElement = getCombatantElementByName(payload.actor.displayName);
        } else if (typeof payload.actor === 'string') { // System actor for TURN_START etc.
             // No specific element to animate for "System" usually, but allows config
            actorElement = getCombatantElementByName(payload.actor);
        }
    }

    // Resolve target element
    if (payload.target) {
        const targetDisplayName = (typeof payload.target === 'string') ? payload.target : payload.target.displayName;
        if (targetDisplayName) {
            targetElement = getCombatantElementByName(targetDisplayName);
        }
    }

    // Apply animations
    if (actorElement && animationConfig.actor) {
        actorElement.classList.add(animationConfig.actor);
    }
    if (targetElement && animationConfig.target) {
        targetElement.classList.add(animationConfig.target);
    }

    // Special case for BATTLE_START to animate both teams
    if (eventType === 'BATTLE_START') {
        document.querySelectorAll('.player-side .combatant').forEach(el => el.classList.add('slide-in-left'));
        document.querySelectorAll('.opponent-side .combatant').forEach(el => el.classList.add('slide-in-right'));
    }

    // Use setTimeout to create a pause for the animation
    setTimeout(() => {
        // --- After the pause ---

        // 1. Remove any temporary animation classes
        document.querySelectorAll('.combatant').forEach(el => {
            for (const key in ANIMATION_TIMING_MAP) {
                if (ANIMATION_TIMING_MAP[key].actor) el.classList.remove(ANIMATION_TIMING_MAP[key].actor);
                if (ANIMATION_TIMING_MAP[key].target) el.classList.remove(ANIMATION_TIMING_MAP[key].target);
            }
            el.classList.remove('slide-in-left', 'slide-in-right');
        });

        // 2. Update the UI with the outcome (e.g., HP bars)
        // For DAMAGE_DEALT and HEAL_APPLIED, payload.target should be the updated entity.
        if (eventType === 'DAMAGE_DEALT' && payload.target && typeof payload.target === 'object') {
            const combatantIdPrefix = combatantIdMap[payload.target.displayName];
            if (combatantIdPrefix) {
                updateCombatantUI(
                    combatantIdPrefix,
                    payload.target.currentHp, // MODIFIED: Assumes payload.target.currentHp is post-damage state
                    payload.target.maxHp,
                    payload.target.currentEnergy,
                    payload.target.active_effects || []
                );
            } else {
                console.warn('Could not find combatantIdPrefix for target:', payload.target.displayName);
            }
        } else if (eventType === 'HEAL_APPLIED' && payload.target && typeof payload.target === 'object') {
            // HEAL_APPLIED correctly uses payload.result.targetHpAfter as per schema
            const combatantIdPrefix = combatantIdMap[payload.target.displayName];
            if (combatantIdPrefix) {
                 updateCombatantUI(
                    combatantIdPrefix,
                    payload.result.targetHpAfter, // Correct for HEAL_APPLIED
                    payload.target.maxHp,
                    payload.target.currentEnergy,
                    payload.target.active_effects || []
                );
            } else {
                console.warn('Could not find combatantIdPrefix for target:', payload.target.displayName);
            }
        }

        // Update energy for ENERGY_GAIN event
        // payload.actor should be the updated entity
        if (eventType === 'ENERGY_GAIN' && payload.actor && typeof payload.actor === 'object') {
            const combatantIdPrefix = combatantIdMap[payload.actor.displayName];
            if (combatantIdPrefix) {
                 updateCombatantUI(
                    combatantIdPrefix,
                    payload.actor.currentHp,
                    payload.actor.maxHp,
                    payload.actor.currentEnergy, // Key update
                    payload.actor.active_effects || []
                );
            }
        }

        // Update for STATUS_EFFECT_APPLIED
        // payload.target should be the updated entity
        if (eventType === 'STATUS_EFFECT_APPLIED' && payload.target && typeof payload.target === 'object') {
            const combatantIdPrefix = combatantIdMap[payload.target.displayName];
             if (combatantIdPrefix) {
                 updateCombatantUI(
                    combatantIdPrefix,
                    payload.target.currentHp,
                    payload.target.maxHp,
                    payload.target.currentEnergy,
                    payload.target.active_effects || [] // Key update: new set of effects
                );
             }
        }

        // 3. Render the formatted log text
        const logHtml = formatLogEntry(event);
        const logEntriesDiv = document.getElementById('log-entries');
        if (logEntriesDiv && logHtml) {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = logHtml.trim();
            if (tempDiv.firstChild) {
                 logEntriesDiv.prepend(tempDiv.firstChild);
            }
        }

        // 4. Call this function again to process the *next* event in the queue
        processNextEvent();

    }, animationDelay);
}

function finalizeBattlePlayback() {
    if (!currentBattleResult) return;
    const logEntriesDiv = document.getElementById('log-entries');

    updateCombatantUI('player-1', currentBattleResult.player_final_hp_1, initialPlayerHp1,
        currentBattleResult.player_energy_1 ?? 1, currentBattleResult.player_1_active_effects ?? []);
    updateCombatantUI('player-2', currentBattleResult.player_final_hp_2, initialPlayerHp2,
        currentBattleResult.player_energy_2 ?? 1, currentBattleResult.player_2_active_effects ?? []);
    updateCombatantUI('opponent-1', currentBattleResult.opponent_final_hp_1, initialOpponentHp1,
        currentBattleResult.opponent_energy_1 ?? 1, currentBattleResult.opponent_1_active_effects ?? []);
    updateCombatantUI('opponent-2', currentBattleResult.opponent_final_hp_2, initialOpponentHp2,
        currentBattleResult.opponent_energy_2 ?? 1, currentBattleResult.opponent_2_active_effects ?? []);

    if (logEntriesDiv) {
        const battleEndP = document.createElement('p');
        battleEndP.innerHTML = `<strong>Battle Concluded! Winner: ${currentBattleResult.winner}</strong><br>You ${currentBattleResult.result} this battle. Gained ${currentBattleResult.xp_awarded} XP.`;
        logEntriesDiv.prepend(battleEndP);
    }

    const btnContainer = appDiv.querySelector('.button-container');
    if (btnContainer) {
        btnContainer.innerHTML = '';
        const continueButton = document.createElement('button');
        continueButton.textContent = 'Proceed to Tournament Results';
        continueButton.className = 'game-button';
        continueButton.onclick = renderTournamentView;
        btnContainer.appendChild(continueButton);
    }
}

// --- Scene 3: Tournament View ---
async function renderTournamentView() {
    const statusResponse = await callApi('tournament_status.php');
    if (!statusResponse || !statusResponse.player_status) {
        appDiv.innerHTML = '<p>Error: Could not retrieve tournament status.</p>';
        return;
    }

    const playerStatus = statusResponse.player_status;
    const gameOver = statusResponse.game_over;
    const nextOpponent = statusResponse.next_opponent;

    const playerTeamName = `${playerStatus.champion_name_1_display || playerStatus.champion_name_1} & ${playerStatus.champion_name_2_display || playerStatus.champion_name_2}`;
    const nextOpponentTeamName = `AI Team: ${nextOpponent}`;

    let contentHtml = `
        <h2>Tournament Progress</h2>
        <div class="tournament-bracket">
            <p><strong>Your Team:</strong> ${playerTeamName}</p>
            <p><strong>Level:</strong> ${playerStatus.current_level} | <strong>XP:</strong> ${playerStatus.current_xp}</p>
            <p><strong>Record:</strong> Wins: ${playerStatus.wins} | Losses: ${playerStatus.losses}</p>

            ${gameOver ?
                `<h3 class="game-over-text">Game Over! Your team was eliminated.</h3>` :
                `<p>Next Opponent Team: <strong>${nextOpponentTeamName}</strong></p>`
            }
        </div>
    `;

    let buttons = [];
    if (gameOver) {
        buttons.push({ text: 'Start New Tournament', onClick: resetTournament });
    } else {
        buttons.push({ text: 'Fight Next Battle', onClick: renderBattleScene });
    }

    renderScene('tournament-view', contentHtml, buttons);

    // Optional: Add more complex bracket visualization here if needed in future,
    // for MVP simple text summary is fine.
}

async function resetTournament() {
    const confirmReset = confirm("Are you sure you want to start a new tournament? Your current progress will be lost.");
    if (confirmReset) {
        const response = await callApi('tournament_reset.php', 'POST');
        if (response && response.message === "Tournament and player progress reset.") {
            alert('Tournament reset. Starting new game...');
            // Clear client-side player data too
            playerData = {};
            selectedChampion1Id = null;
            selectedChampion2Id = null;
            selectedChampion1Data = null;
            selectedChampion2Data = null;
            selectedCards1 = { ability: null, armor: null, weapon: null };
            selectedCards2 = { ability: null, armor: null, weapon: null };
            renderCharacterSetup(); // Go back to setup
        } else {
            alert('Failed to reset tournament.');
        }
    }
}