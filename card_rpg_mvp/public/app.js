// public/app.js

// --- Global UI Elements & State ---
const appDiv = document.getElementById('app');
let currentScene = ''; // To track which scene is active (setup, battle, tournament)
let playerData = {}; // Store player's champion and deck
let battleLog = []; // Store the battle log for Scene 2 playback

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
document.addEventListener('DOMContentLoaded', () => {
    // Start the game by trying to load player setup, or go to setup if none
    loadGame();
});

async function loadGame() {
    const response = await callApi('player_current_setup.php');
    if (response && response.champion_id) {
        playerData = response;
        // If player already set up, maybe jump to tournament view or next battle
        // For MVP, always start fresh for simplicity, so just go to setup.
        // In a real game, you'd resume from last state.
        renderCharacterSetup(); // Force setup for MVP
    } else {
        renderCharacterSetup();
    }
}

// --- Scene 1: Character Setup ---
let selectedChampionId = null;
let selectedCards = {
    ability: null,
    armor: null,
    weapon: null
};

async function renderCharacterSetup() {
    // 1. Fetch 4 random champions
    const championsResponse = await callApi('champions.php');
    if (!championsResponse || championsResponse.length === 0) {
        appDiv.innerHTML = '<p>Error: No champions found. Please check database population.</p>';
        return;
    }

    const availableChampions = shuffleArray(championsResponse).slice(0, 4);

    let championsHtml = availableChampions.map(champ => `
        <div class="champion-card" data-champion-id="${champ.id}">
            <h3>${champ.name}</h3>
            <p>Role: ${champ.role}</p>
            <p>HP: ${champ.starting_hp} | Speed: ${champ.speed}</p>
        </div>
    `).join('');

    renderScene('character-setup', `
        <h2>Choose Your Champion</h2>
        <div id="champion-selection" class="selection-grid">
            ${championsHtml}
        </div>
        <div id="deck-draft-area" style="display: none;">
            <h3>Draft Your Starting Deck (3 Cards)</h3>
            <p>Select 1 Ability, 1 Armor, 1 Weapon.</p>
            <div class="draft-category">
                <h4>Ability Card</h4>
                <div id="ability-cards" class="card-selection-grid"></div>
            </div>
            <div class="draft-category">
                <h4>Armor Card</h4>
                <div id="armor-cards" class="card-selection-grid"></div>
            </div>
            <div class="draft-category">
                <h4>Weapon Card</h4>
                <div id="weapon-cards" class="card-selection-grid"></div>
            </div>
        </div>
    `, []); // No initial buttons, they are added dynamically

    // Add event listeners for champion selection
    document.querySelectorAll('.champion-card').forEach(card => {
        card.onclick = () => selectChampion(card.dataset.championId, availableChampions.find(c => c.id == card.dataset.championId));
    });
}

async function selectChampion(championId, championData) {
    selectedChampionId = championId;
    playerData = championData; // Store chosen champion data for later use

    // Visually indicate selection
    document.querySelectorAll('.champion-card').forEach(card => card.classList.remove('selected'));
    document.querySelector(`.champion-card[data-champion-id="${championId}"]`).classList.add('selected');

    // Show deck drafting area
    document.getElementById('deck-draft-area').style.display = 'block';

    // Fetch and display common cards for drafting
    await fetchDraftCards('ability', championData.name);
    await fetchDraftCards('armor', championData.name);
    await fetchDraftCards('weapon', championData.name);

    // Add the "Confirm Deck" button once a champion is selected
    updateSetupButtons();
}

async function fetchDraftCards(cardType, championName) {
    const cardsResponse = await callApi(`cards_common_by_type.php?type=${cardType}&class=${championName}`);
    if (!cardsResponse || cardsResponse.length === 0) {
        document.getElementById(`${cardType}-cards`).innerHTML = `<p>No ${cardType} cards found for ${championName}.</p>`;
        return;
    }

    const availableCards = shuffleArray(cardsResponse).slice(0, 3); // Pick 3 random cards for drafting

    const cardContainer = document.getElementById(`${cardType}-cards`);
    cardContainer.innerHTML = ''; // Clear previous cards
    availableCards.forEach(card => {
        const cardElement = renderCard(card, true, () => selectDraftCard(cardType, card));
        cardContainer.appendChild(cardElement);
    });
}

function selectDraftCard(cardType, card) {
    selectedCards[cardType] = card;

    // Visually indicate selection
    document.querySelectorAll(`#${cardType}-cards .card`).forEach(el => el.classList.remove('selected'));
    document.querySelector(`#${cardType}-cards .card[data-card-id="${card.id}"]`).classList.add('selected');

    // Update Confirm button state
    updateSetupButtons();
}

function updateSetupButtons() {
    const buttonContainer = appDiv.querySelector('.button-container');
    buttonContainer.innerHTML = ''; // Clear existing buttons

    const allCardsSelected = selectedCards.ability && selectedCards.armor && selectedCards.weapon;

    if (selectedChampionId && allCardsSelected) {
        const confirmButton = document.createElement('button');
        confirmButton.textContent = 'Confirm Setup & Start Tournament';
        confirmButton.className = 'game-button';
        confirmButton.onclick = confirmSetup;
        buttonContainer.appendChild(confirmButton);
    } else if (selectedChampionId) {
        const hint = document.createElement('p');
        hint.textContent = 'Select one of each card type to proceed.';
        hint.style.color = '#aaa';
        buttonContainer.appendChild(hint);
    }
}

async function confirmSetup() {
    const cardIds = [
        selectedCards.ability.id,
        selectedCards.armor.id,
        selectedCards.weapon.id
    ];

    const response = await callApi('player_setup.php', 'POST', {
        champion_id: selectedChampionId,
        card_ids: cardIds
    });

    if (response && response.message === "Player setup complete.") {
        // alert('Setup complete! Starting tournament...'); // removed debugging alert
        renderBattleScene(); // Move to battle scene
    } else {
        alert('Failed to confirm setup. Please try again.');
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
    renderScene('battle-scene', `
        <h2>Battle!</h2>
        <div class="battle-arena">
            <div class="combatant player-side">
                <h3 id="player-name">Player</h3>
                <div class="hp-bar-container"><div id="player-hp-bar" class="hp-bar" style="width: 100%;"></div></div>
                <span id="player-hp-text" class="hp-text">HP: --/--</span>
                <div id="player-energy" class="energy-display"></div>
                <div id="player-status-effects" class="status-effects-container"></div>
            </div>
            <div class="vs-text">VS</div>
            <div class="combatant opponent-side">
                <h3 id="opponent-name">Opponent</h3>
                <div class="hp-bar-container"><div id="opponent-hp-bar" class="hp-bar" style="width: 100%;"></div></div>
                <span id="opponent-hp-text" class="hp-text">HP: --/--</span>
                <div id="opponent-energy" class="energy-display"></div>
                <div id="opponent-status-effects" class="status-effects-container"></div>
            </div>
        </div>
        <div id="battle-log" class="battle-log">
            <h4>Battle Log</h4>
            <div id="log-entries"></div>
        </div>
    `, []); // Buttons will appear after battle

    // Fetch initial player/opponent data and then simulate battle
    await startBattleSimulation();
}

async function startBattleSimulation() {
    const battleResult = await callApi('battle_simulate.php', 'POST', {}); // Empty POST body to trigger simulation
    if (!battleResult) {
        alert('Failed to simulate battle.');
        return;
    }

    battleLog = battleResult.log; // Store the full log
    const playerFinalHp = battleResult.player_final_hp;
    const opponentFinalHp = battleResult.opponent_final_hp;
    const winner = battleResult.winner;
    const result = battleResult.result; // 'win', 'loss', 'draw'
    const xpAwarded = battleResult.xp_awarded;

    // Display initial HP/Names (mock for now, will get from battleResult)
    document.getElementById('player-name').textContent = playerData.name || 'Your Champion';
    document.getElementById('opponent-name').textContent = battleResult.opponent_monster_name || 'AI Opponent'; // Assuming simulate endpoint returns opponent name
    
    // Simulate turn-by-turn playback for visual effect
    let logIndex = 0;
    const logEntriesDiv = document.getElementById('log-entries');
    
    // Initial HP setup before playback
    const initialPlayerHp = battleResult.player_start_hp; // You'll need to add these to the PHP battle result
    const initialOpponentHp = battleResult.opponent_start_hp; // You'll need to add these to the PHP battle result
    updateCombatantUI('player', initialPlayerHp, initialPlayerHp);
    updateCombatantUI('opponent', initialOpponentHp, initialOpponentHp);

    const playbackInterval = setInterval(() => {
        if (logIndex < battleLog.length) {
            const entry = battleLog[logIndex];
            logEntriesDiv.innerHTML += `<p><strong>Turn ${entry.turn}:</strong> ${formatLogEntry(entry)}</p>`;
            logEntriesDiv.scrollTop = logEntriesDiv.scrollHeight; // Scroll to bottom

            // Update combatant UI based on log entry (simplified for MVP)
            if (entry.action_type === "Deals Damage") {
                if (entry.target === document.getElementById('player-name').textContent) {
                    updateCombatantUI('player', entry.target_hp_after, initialPlayerHp); // Needs max HP
                } else if (entry.target === document.getElementById('opponent-name').textContent) {
                    updateCombatantUI('opponent', entry.target_hp_after, initialOpponentHp); // Needs max HP
                }
            } else if (entry.action_type === "Heals") {
                 if (entry.target === document.getElementById('player-name').textContent) {
                    updateCombatantUI('player', entry.target_hp_after, initialPlayerHp); // Needs max HP
                } else if (entry.target === document.getElementById('opponent-name').textContent) {
                    updateCombatantUI('opponent', entry.target_hp_after, initialOpponentHp); // Needs max HP
                }
            }
            // Implement more granular updates for energy, status effects as needed from log

            logIndex++;
        } else {
            clearInterval(playbackInterval);
            // Battle finished, show result and proceed button
            logEntriesDiv.innerHTML += `<p><strong>Battle Concluded! Winner: ${winner}</strong></p>`;
            logEntriesDiv.innerHTML += `<p>You ${result} this battle. Gained ${xpAwarded} XP.</p>`;
            
            appDiv.querySelector('.button-container').innerHTML = ''; // Clear previous buttons
            const continueButton = document.createElement('button');
            continueButton.textContent = 'Proceed to Tournament Results';
            continueButton.className = 'game-button';
            continueButton.onclick = renderTournamentView;
            appDiv.querySelector('.button-container').appendChild(continueButton);
        }
    }, 250); // Playback speed (set to 250ms per log entry)
}

function updateCombatantUI(side, currentHp, maxHp) {
    const hpBar = document.getElementById(`${side}-hp-bar`);
    const hpText = document.getElementById(`${side}-hp-text`);
    const hpPercent = (currentHp / maxHp) * 100;
    hpBar.style.width = `${hpPercent}%`;
    hpText.textContent = `HP: ${currentHp}/${maxHp}`;
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
    const nextOpponent = statusResponse.next_opponent; // PHP should provide a name here

    let contentHtml = `
        <h2>Tournament Progress</h2>
        <div class="tournament-bracket">
            <p><strong>Your Champion:</strong> ${playerStatus.champion_name}</p>
            <p><strong>Level:</strong> ${playerStatus.current_level} | <strong>XP:</strong> ${playerStatus.current_xp}</p>
            <p><strong>Record:</strong> Wins: ${playerStatus.wins} | Losses: ${playerStatus.losses}</p>
            
            ${gameOver ? 
                `<h3 class="game-over-text">Game Over! You were eliminated.</h3>` : 
                `<p>Next Opponent: <strong>${nextOpponent}</strong></p>`
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
            selectedChampionId = null;
            selectedCards = { ability: null, armor: null, weapon: null };
            renderCharacterSetup(); // Go back to setup
        } else {
            alert('Failed to reset tournament.');
        }
    }
}