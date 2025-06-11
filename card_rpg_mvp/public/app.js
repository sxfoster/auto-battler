// public/app.js

// --- Global UI Elements & State ---
const appDiv = document.getElementById('app');
let currentScene = ''; // To track which scene is active (setup, battle, tournament)
let playerData = {}; // Store player's champion and deck
let battleLog = []; // Store the battle log for Scene 2 playback

// --- Global State for 2v2 Setup ---
let selectedChampion1Id = null;
let selectedChampion2Id = null;
let selectedChampion1Data = null;
let selectedChampion2Data = null;
let selectedCards1 = { ability: null, armor: null, weapon: null };
let selectedCards2 = { ability: null, armor: null, weapon: null };
let currentSetupStage = 0; // 0: Choose Champ 1, 1: Draft Champ 1, 2: Choose Champ 2, 3: Draft Champ 2

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
                <span class="energy-cost"><i class="fas fa-bolt"></i> ${card.energy_cost}</span>
            </div>
            <div class="card-body">
                <p class="card-description">${card.description}</p>
                ${card.damage_type ? `<span class="damage-type-icon"><i class="fas fa-${getDamageTypeIcon(card.damage_type)}"></i> ${card.damage_type}</span>` : ''}
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

    renderScene('character-setup', `
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

    const battleResult = await callApi('battle_simulate.php', 'POST', {});
    if (!battleResult) {
        alert('Failed to simulate battle.');
        return;
    }

    battleLog = battleResult.log;

    const playerChamp1 = initialPlayerState.champion_name_1;
    const playerChamp2 = initialPlayerState.champion_name_2;
    const opponentChamp1 = battleResult.opponent_team_names[0];
    const opponentChamp2 = battleResult.opponent_team_names[1];

    const initialPlayerHp1 = initialPlayerState.champion_max_hp_1;
    const initialPlayerHp2 = initialPlayerState.champion_max_hp_2;
    const initialOpponentHp1 = battleResult.opponent_start_hp_1;
    const initialOpponentHp2 = battleResult.opponent_start_hp_2;

    renderScene('battle-scene', `
        <h2>Battle!</h2>
        <div class="battle-arena">
            <div class="team-container player-side">
                <div class="combatant player-1">
                    <h3 id="player-1-name">${playerChamp1}</h3>
                    <div class="hp-bar-container"><div id="player-1-hp-bar" class="hp-bar" style="width: 100%;"></div></div>
                    <span id="player-1-hp-text" class="hp-text">HP: --/--</span>
                    <div id="player-1-energy" class="energy-display"></div>
                    <div id="player-1-status-effects" class="status-effects-container"></div>
                </div>
                <div class="combatant player-2">
                    <h3 id="player-2-name">${playerChamp2}</h3>
                    <div class="hp-bar-container"><div id="player-2-hp-bar" class="hp-bar" style="width: 100%;"></div></div>
                    <span id="player-2-hp-text" class="hp-text">HP: --/--</span>
                    <div id="player-2-energy" class="energy-display"></div>
                    <div id="player-2-status-effects" class="status-effects-container"></div>
                </div>
            </div>
            <div class="vs-text">VS</div>
            <div class="team-container opponent-side">
                <div class="combatant opponent-1">
                    <h3 id="opponent-1-name">${opponentChamp1}</h3>
                    <div class="hp-bar-container"><div id="opponent-1-hp-bar" class="hp-bar" style="width: 100%;"></div></div>
                    <span id="opponent-1-hp-text" class="hp-text">HP: --/--</span>
                    <div id="opponent-1-energy" class="energy-display"></div>
                    <div id="opponent-1-status-effects" class="status-effects-container"></div>
                </div>
                <div class="combatant opponent-2">
                    <h3 id="opponent-2-name">${opponentChamp2}</h3>
                    <div class="hp-bar-container"><div id="opponent-2-hp-bar" class="hp-bar" style="width: 100%;"></div></div>
                    <span id="opponent-2-hp-text" class="hp-text">HP: --/--</span>
                    <div id="opponent-2-energy" class="energy-display"></div>
                    <div id="opponent-2-status-effects" class="status-effects-container"></div>
                </div>
            </div>
        </div>
        <div id="battle-log" class="battle-log">
            <h4>Battle Log</h4>
            <div id="log-entries"></div>
        </div>
    `, []);

    updateCombatantUI('player-1', initialPlayerState.champion_hp_1, initialPlayerHp1);
    updateCombatantUI('player-2', initialPlayerState.champion_hp_2, initialPlayerHp2);
    updateCombatantUI('opponent-1', initialOpponentHp1, initialOpponentHp1);
    updateCombatantUI('opponent-2', initialOpponentHp2, initialOpponentHp2);

    let logIndex = 0;
    const logEntriesDiv = document.getElementById('log-entries');
    const playbackInterval = setInterval(() => {
        if (logIndex < battleLog.length) {
            const entry = battleLog[logIndex];
            const formattedEntry = formatLogEntry(entry);

            if (formattedEntry.trim() !== '') {
                const pElement = document.createElement('p');
                pElement.innerHTML = `<strong>Turn ${entry.turn}:</strong> ${formattedEntry}`;
                logEntriesDiv.prepend(pElement);
            }

            if (entry.action_type === 'Turn End') {
                if (entry.player_hp_1 !== undefined) updateCombatantUI('player-1', entry.player_hp_1, initialPlayerHp1);
                if (entry.player_hp_2 !== undefined) updateCombatantUI('player-2', entry.player_hp_2, initialPlayerHp2);
                if (entry.opponent_hp_1 !== undefined) updateCombatantUI('opponent-1', entry.opponent_hp_1, initialOpponentHp1);
                if (entry.opponent_hp_2 !== undefined) updateCombatantUI('opponent-2', entry.opponent_hp_2, initialOpponentHp2);
            }

            logIndex++;
        } else {
            clearInterval(playbackInterval);
            const battleEndP = document.createElement('p');
            battleEndP.innerHTML = `<strong>Battle Concluded! Winner: ${battleResult.winner}</strong><br>You ${battleResult.result} this battle. Gained ${battleResult.xp_awarded} XP.`;
            logEntriesDiv.prepend(battleEndP);

            appDiv.querySelector('.button-container').innerHTML = '';
            const continueButton = document.createElement('button');
            continueButton.textContent = 'Proceed to Tournament Results';
            continueButton.className = 'game-button';
            continueButton.onclick = renderTournamentView;
            appDiv.querySelector('.button-container').appendChild(continueButton);
        }
    }, 250);
}

function updateCombatantUI(elementIdPrefix, currentHp, maxHp) {
    const hpBar = document.getElementById(`${elementIdPrefix}-hp-bar`);
    const hpText = document.getElementById(`${elementIdPrefix}-hp-text`);
    if (hpBar && hpText) {
        const hpPercent = (currentHp / maxHp) * 100;
        hpBar.style.width = `${Math.max(0, hpPercent)}%`;
        hpText.textContent = `HP: ${Math.max(0, currentHp)}/${maxHp}`;
    }
}

// Basic formatting for battle log entries (expand as needed)
function formatLogEntry(entry) {
    switch (entry.action_type) {
        case "Battle Start":
            return `The battle begins! ${entry.player.name} (HP: ${entry.player.hp}) vs. ${entry.opponent.name} (HP: ${entry.opponent.hp}).`;
        case "Turn Start":
            return `--- Turn ${entry.turn} Begins ---`;
        case "Turn Action":
            return ''; // Do not log generic "takes action" lines
        case "Energy Gain":
            return `${entry.actor} gained ${entry.energy_gained} energy. (Current: ${entry.energy_after})`;
        case "Plays Card":
            return `${entry.actor} plays "${entry.card_name}" on ${entry.target}.`;
        case "Deals Damage":
            return `${entry.actor} deals ${entry.amount} damage to ${entry.target}. ${entry.target}'s HP: ${entry.target_hp_after}`;
        case "Deals Bypass Damage":
            return `${entry.actor} deals ${entry.amount} direct damage to ${entry.target}. ${entry.target}'s HP: ${entry.target_hp_after}`;
        case "Heals":
            return `${entry.actor} heals ${entry.target} for ${entry.amount}. ${entry.target}'s HP: ${entry.target_hp_after}`;
        case "Heals Self":
            return `${entry.actor} heals self for ${entry.amount}. ${entry.actor}'s HP: ${entry.target_hp_after}`;
        case "Applies Buff":
            return `${entry.actor} applies ${entry.stat} buff to ${entry.target} for ${entry.duration} turns.`;
        case "Applies Debuff":
            return `${entry.actor} applies ${entry.stat} debuff to ${entry.target} for ${entry.duration} turns.`;
        case "Applies Status":
            return `${entry.actor} applies ${entry.effect} to ${entry.target} for ${entry.duration} turns.`;
        case "Applies DOT":
            return `${entry.actor} applies ${entry.type} (${entry.amount} dmg/turn for ${entry.duration} turns) to ${entry.target}.`;
        case "Applies HoT":
            return `${entry.actor} applies HoT (${entry.amount} heal/turn for ${entry.duration} turns) to ${entry.target}.`;
        case "Applies Block":
            return `${entry.actor} gains ${entry.amount} block.`;
        case "Disengages":
            return `${entry.actor} disengages from combat.`;
        case "Passes Turn":
            return `${entry.actor} passes turn (${entry.reason}).`;
        case "Skipped Turn":
            return `${entry.actor}'s turn skipped (${entry.reason}).`;
        case "Unhandled Effect":
            return ''; // Suppress unhandled effect messages
        case "Battle End":
            return `Battle Ends! Winner: ${entry.winner}`;
        default:
            return ''; // Filter out any unrecognized action types
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

    const playerTeamName = `${playerStatus.champion_name_1} & ${playerStatus.champion_name_2}`;
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