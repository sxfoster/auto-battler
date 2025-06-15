import { createCompactCard, updateHealthBar } from '../ui/CardRenderer.js';
import { sleep } from '../utils.js';
import { battleSpeeds } from '../data.js';

export class BattleScene {
    constructor(element, onBattleComplete) {
        this.element = element;
        this.onBattleComplete = onBattleComplete;
        
        // DOM Elements
        this.playerContainer = this.element.querySelector('#player-team-container');
        this.enemyContainer = this.element.querySelector('#enemy-team-container');
        this.battleLog = this.element.querySelector('#battle-log');
        this.endScreen = this.element.querySelector('#end-screen');
        this.resultText = this.element.querySelector('#end-screen-result-text');
        this.resultsContainer = this.element.querySelector('#end-screen-results');
        this.playAgainButton = this.element.querySelector('#play-again-button');
        this.speedButton = this.element.querySelector('#speed-cycle-button');
        
        // State
        this.state = [];
        this.currentAttackerIndex = 0;
        this.currentSpeedIndex = 0;
        this.isBattleOver = false;

        this.speedButton.addEventListener('click', () => this._cycleSpeed());
    }

    _cycleSpeed() {
        this.currentSpeedIndex = (this.currentSpeedIndex + 1) % battleSpeeds.length;
        const newSpeed = battleSpeeds[this.currentSpeedIndex];
        this.speedButton.textContent = `Speed: ${newSpeed.label}`;
    }
    
    _logToBattle(message) {
        this.battleLog.textContent = message;
        this.battleLog.style.opacity = '1';
        setTimeout(() => {
            if (!this.isBattleOver) {
                 this.battleLog.style.opacity = '0';
            }
        }, 667 * battleSpeeds[this.currentSpeedIndex].multiplier);
    }

    async start(initialState) {
        this.isBattleOver = false;
        this.state = initialState;
        this.turnQueue = [];

        // --- UI Setup ---
        this.playerContainer.innerHTML = '';
        this.enemyContainer.innerHTML = '';
        this.endScreen.classList.remove('visible', 'victory', 'defeat');
        this._logToBattle('The battle begins!');

        this.state.forEach(combatant => {
            const card = createCompactCard(combatant);
            combatant.element = card;
            if (combatant.team === 'player') {
                this.playerContainer.appendChild(card);
            } else {
                this.enemyContainer.appendChild(card);
            }
        });

        // Use a base pause of 1 second, adjusted by the speed multiplier
        await sleep(1000 * battleSpeeds[this.currentSpeedIndex].multiplier);
        this.runCombatRound();
    }
    runCombatRound() {
        if (this.isBattleOver) return;

        // --- 1. Determine Turn Order (Initiative) ---
        this.turnQueue = [...this.state.filter(c => c.currentHp > 0)]
            .sort((a, b) => b.speed - a.speed);

        this._logToBattle('New round! Turn order: ' + this.turnQueue.map(c => c.heroData.name).join(', '));

        // --- 2. Start Executing Turns ---
        this.executeNextTurn();
    }

    async executeNextTurn() {
        if (this.isBattleOver) return;

        // If the queue is empty, the round is over. Start a new one.
        if (this.turnQueue.length === 0) {
            // Use a base pause of 1 second, adjusted by the speed multiplier
            await sleep(1000 * battleSpeeds[this.currentSpeedIndex].multiplier);
            this.runCombatRound();
            return;
        }

        // Get the next combatant from the front of the queue
        const attacker = this.turnQueue.shift();

        // Remove existing visual highlights
        this.state.forEach(c => c.element.classList.remove('is-attacking'));
        // Highlight the current attacker
        attacker.element.classList.add('is-attacking');

        // Check for stun, etc. (future feature)

        // --- 3. Choose a Target ---
        const potentialTargets = this.state.filter(c => c.team !== attacker.team && c.currentHp > 0);
        if (potentialTargets.length === 0) {
            // This should trigger battle end, but as a fallback, do nothing.
            this.executeNextTurn();
            return;
        }
        const target = potentialTargets[0]; // Simplest AI: always attack the front-most enemy

        // --- 4. Perform Action (Basic Attack) ---
        this._logToBattle(`${attacker.heroData.name} attacks ${target.heroData.name}!`);
        // Use a base pause of 0.5 seconds, adjusted by the speed multiplier
        await sleep(500 * battleSpeeds[this.currentSpeedIndex].multiplier);

        // --- 5. Calculate Damage ---
        const damage = Math.max(1, attacker.attack - (target.block || 0));
        this._dealDamage(attacker, target, damage);

        // --- 6. Check for Battle End ---
        const isPlayerTeamDefeated = this.state.filter(c => c.team === 'player' && c.currentHp > 0).length === 0;
        const isEnemyTeamDefeated = this.state.filter(c => c.team === 'enemy' && c.currentHp > 0).length === 0;

        if (isPlayerTeamDefeated || isEnemyTeamDefeated) {
            this._endBattle(!isPlayerTeamDefeated);
            return;
        }

        // --- 7. Continue to Next Turn ---
        // Use a base pause of 0.8 seconds, adjusted by the speed multiplier
        await sleep(800 * battleSpeeds[this.currentSpeedIndex].multiplier);
        this.executeNextTurn();
    }


    _dealDamage(attacker, target, amount) {
        if(target.heroData.abilities.some(a => a.name === 'Fortify')) amount = Math.max(0, amount - 1);
        
        target.currentHp = Math.max(0, target.currentHp - amount);
        
        target.element.classList.add('is-taking-damage');
        setTimeout(() => target.element.classList.remove('is-taking-damage'), 67 * battleSpeeds[this.currentSpeedIndex].multiplier);
        
        this._showDamagePopup(target.element, amount);
        updateHealthBar(target, target.element);

        if (target.currentHp <= 0) {
            this._logToBattle(`${target.heroData.name} has been defeated!`);
            target.element.classList.add('is-defeated');
        }
    }

    _heal(target, amount) {
        target.currentHp = Math.min(target.maxHp, target.currentHp + amount);
        this._logToBattle(`${target.heroData.name} heals ${amount} HP!`);
        updateHealthBar(target, target.element);
    }

    _applyStatus(target, statusName, duration){
        this._logToBattle(`${target.heroData.name} is afflicted with ${statusName}!`);
        target.statusEffects.push({name: statusName, turnsRemaining: duration});
        this._updateStatusIcons(target);
    }
    
    _showDamagePopup(targetElement, amount) {
        const popup = document.createElement('div');
        popup.className = 'damage-popup';
        popup.textContent = amount;
        targetElement.appendChild(popup);
        setTimeout(() => popup.remove(), 234 * battleSpeeds[this.currentSpeedIndex].multiplier);
    }

    _updateStatusIcons(combatant){
        const container = combatant.element.querySelector('.status-icon-container');
        container.innerHTML = '';
        combatant.statusEffects.forEach(effect => {
            const icon = document.createElement('div');
            icon.className = 'status-icon';
            icon.innerHTML = effect.name === 'Stun' ? '<i class="fa-solid fa-star"></i>' : '<i class="fa-solid fa-skull-crossbones"></i>';
            icon.title = `${effect.name} (${effect.turnsRemaining} turns left)`;
            container.appendChild(icon);
        });
    }

    _endBattle(didPlayerWin) {
        this.isBattleOver = true;
        this._logToBattle(didPlayerWin ? "Player team is victorious!" : "Enemy team is victorious!");

        this.endScreen.className = didPlayerWin ? 'victory' : 'defeat';
        this.resultText.textContent = didPlayerWin ? 'Victory!' : 'Defeat!';
        this.playAgainButton.textContent = 'Continue';

        this.resultsContainer.innerHTML = '';
        this.state.filter(c => c.team === 'player').forEach(c => {
            const card = createCompactCard(c);
            if(c.currentHp <= 0) card.classList.add('is-defeated');
            this.resultsContainer.appendChild(card);
        });

        const continueButton = this.element.querySelector('#play-again-button');
        const newContinueButton = continueButton.cloneNode(true);
        continueButton.parentNode.replaceChild(newContinueButton, continueButton);

        newContinueButton.addEventListener('click', () => {
            this.endScreen.classList.remove('visible');
            this.onBattleComplete(didPlayerWin);
        }, { once: true });

        setTimeout(() => this.endScreen.classList.add('visible'), 167 * battleSpeeds[this.currentSpeedIndex].multiplier);
    }
    
    show() {
        this.element.classList.remove('hidden');
    }

    hide() {
        this.element.classList.add('hidden');
    }
}
