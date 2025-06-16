import { createCompactCard, updateHealthBar, updateEnergyDisplay } from '../ui/CardRenderer.js';
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
        this.arena = this.element.querySelector('.battle-arena');
        this.abilityAnnouncer = this.element.querySelector('#ability-announcer');
        
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

        // --- 1. Initially hide the teams to prepare for slide-in ---
        this.playerContainer.style.opacity = 0;
        this.enemyContainer.style.opacity = 0;

        // Populate the cards (they will be invisible initially)
        this.state.forEach(combatant => {
            const card = createCompactCard(combatant);
            combatant.element = card;
            if (combatant.team === 'player') {
                this.playerContainer.appendChild(card);
            } else {
                this.enemyContainer.appendChild(card);
            }
        });

        // --- 2. Trigger the Slide-In Animations ---
        await sleep(100);
        this.playerContainer.classList.add('slide-in-left');
        this.enemyContainer.classList.add('slide-in-right');

        // --- 3. Wait for the slide-in to complete ---
        await sleep(800);

        // --- 4. Trigger the Clash and Shake ---
        const clashVFX = document.getElementById('battle-clash-vfx');
        const arena = this.element.querySelector('.battle-arena');

        clashVFX.classList.add('clash');
        arena.classList.add('shake');

        // --- 5. Clean up the animation classes ---
        setTimeout(() => {
            this.playerContainer.classList.remove('slide-in-left');
            this.enemyContainer.classList.remove('slide-in-right');
            clashVFX.classList.remove('clash');
            arena.classList.remove('shake');
            this.playerContainer.style.opacity = '';
            this.enemyContainer.style.opacity = '';
        }, 1000);

        // --- 6. Start the First Round after the intro completes ---
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

        this.state.forEach(c => c.element.classList.remove('is-active-turn'));

        if (this.turnQueue.length === 0) {
            await sleep(1000 * battleSpeeds[this.currentSpeedIndex].multiplier);
            this.runCombatRound();
            return;
        }

        const attacker = this.turnQueue.shift();

        attacker.element.classList.add('is-active-turn');

        this.state.forEach(c => c.element.classList.remove('is-attacking', 'is-lunging'));
        attacker.element.classList.add('is-attacking', 'is-lunging');

        // --- 1. GAIN ENERGY ---
        attacker.currentEnergy += 1;
        updateEnergyDisplay(attacker, attacker.element);
        this._logToBattle(`${attacker.heroData.name} gains 1 energy!`);
        this._showCombatText(attacker.element, '+1', 'energy');
        await this._triggerEnergyChargeUp(attacker.element);
        await sleep(500 * battleSpeeds[this.currentSpeedIndex].multiplier);

        const potentialTargets = this.state.filter(c => c.team !== attacker.team && c.currentHp > 0);
        if (potentialTargets.length === 0) {
            this.executeNextTurn();
            return;
        }
        const target = potentialTargets[0];

        const ability = attacker.abilityData;
        if (ability && attacker.currentEnergy >= ability.energyCost) {
            attacker.currentEnergy -= ability.energyCost;
            updateEnergyDisplay(attacker, attacker.element);

            this._announceAbility(ability.name);
            this._triggerArenaEffect('ability-zoom');
            this._logToBattle(`${attacker.heroData.name} uses ${ability.name}!`);

            if (ability.rarity === 'Epic' || ability.rarity === 'Rare') {
                this._triggerCameraEffect('camera-zoom', 1200);
            }
            await sleep(500 * battleSpeeds[this.currentSpeedIndex].multiplier);

            if (ability.effect && ability.effect.includes('damage')) {
                const match = ability.effect.match(/\d+/);
                const damageAmount = match ? parseInt(match[0]) : attacker.attack;
                await this._fireProjectile(attacker.element, target.element);
                this._dealDamage(attacker, target, damageAmount);
            }

            // --- Auto-attack after ability ---
            this._logToBattle(`${attacker.heroData.name} also performs a basic attack!`);
            await this._fireProjectile(attacker.element, target.element);
            const autoAttackDamage = Math.max(1, attacker.attack - (target.block || 0));
            this._dealDamage(attacker, target, autoAttackDamage);
        } else {
            this._logToBattle(`${attacker.heroData.name} attacks ${target.heroData.name}!`);

            if (attacker.team === 'player') {
                this._triggerCameraEffect('camera-pan-right', 1000);
            } else {
                this._triggerCameraEffect('camera-pan-left', 1000);
            }

            await this._fireProjectile(attacker.element, target.element);
            const damage = Math.max(1, attacker.attack - (target.block || 0));
            this._dealDamage(attacker, target, damage);
        }

        attacker.element.classList.remove('is-lunging');

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


    _dealDamage(attacker, target, baseDamage) {
        if (target.heroData.abilities.some(a => a.name === 'Fortify')) {
            baseDamage = Math.max(0, baseDamage - 1);
        }

        const isCritical = Math.random() < 0.1;
        const finalDamage = isCritical ? Math.floor(baseDamage * 1.5) : baseDamage;

        const isOverkill = (target.currentHp - finalDamage) < -5;

        target.currentHp = Math.max(0, target.currentHp - finalDamage);

        target.element.classList.add('is-taking-damage');
        setTimeout(() => target.element.classList.remove('is-taking-damage'), 400 * battleSpeeds[this.currentSpeedIndex].multiplier);

        if (isOverkill) {
            this._showCombatText(target.element, `-${finalDamage}!!`, 'overkill');
            const flash = document.getElementById('screen-flash');
            if (flash) flash.classList.add('flash');
            setTimeout(() => flash.classList.remove('flash'), 400);
        } else if (isCritical) {
            this._showCombatText(target.element, `-${finalDamage}!`, 'critical');
        } else {
            this._showCombatText(target.element, `-${finalDamage}`, 'damage');
        }

        this._createVFX(target.element, 'physical-hit');
        updateHealthBar(target, target.element);

        if (target.currentHp <= 0) {
            this._logToBattle(`${target.heroData.name} has been defeated!`);
            target.element.classList.add('is-defeated');
            this._triggerArenaEffect('critical-shake');
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
    
    _showCombatText(targetElement, text, type) {
        const popup = document.createElement('div');
        popup.className = `combat-text-popup ${type}`;
        popup.textContent = text;
        targetElement.appendChild(popup);
        setTimeout(() => popup.remove(), 1200 * battleSpeeds[this.currentSpeedIndex].multiplier);
    }

    _updateStatusIcons(combatant){
        const container = combatant.element.querySelector('.status-icon-container');
        const cardElement = combatant.element;
        container.innerHTML = ''; // Clear old icons

        // First, remove all potential aura classes to reset the state
        cardElement.classList.remove('has-aura', 'aura-poison', 'aura-buff');

        if (combatant.statusEffects.length > 0) {
            cardElement.classList.add('has-aura');
        }

        combatant.statusEffects.forEach(effect => {
            const icon = document.createElement('div');
            icon.className = 'status-icon';
            switch(effect.name){
                case 'Stun':
                    icon.innerHTML = '<i class="fas fa-star"></i>';
                    break;
                case 'Poison':
                    icon.innerHTML = '<i class="fas fa-skull-crossbones"></i>';
                    cardElement.classList.add('aura-poison');
                    break;
                case 'Attack Up':
                case 'Fortify':
                    icon.innerHTML = '<i class="fas fa-arrow-up"></i>';
                    cardElement.classList.add('aura-buff');
                    break;
                default:
                    icon.innerHTML = '<i class="fas fa-circle"></i>';
            }
            icon.title = `${effect.name} (${effect.turnsRemaining} turns left)`;
            container.appendChild(icon);
        });
    }

    _announceAbility(name){
        if(!this.abilityAnnouncer) return;
        this.abilityAnnouncer.textContent = name;
        this.abilityAnnouncer.classList.add('show');
        setTimeout(() => this.abilityAnnouncer.classList.remove('show'), 1500);
    }

    _triggerArenaEffect(cls){
        if(!this.arena) return;
        this.arena.classList.add(cls);
        const duration = cls === 'ability-zoom' ? 1000 : 300;
        setTimeout(() => this.arena.classList.remove(cls), duration);
    }

    _triggerCameraEffect(effectClass, duration = 1000) {
        const arena = this.element.querySelector('.battle-arena');
        if (!arena) return;

        arena.classList.add(effectClass);

        setTimeout(() => {
            arena.classList.remove(effectClass);
        }, duration);
    }

    async _fireProjectile(startElement, endElement) {
        // --- Stage 1: Muzzle Flash on Attacker ---
        this._createVFX(startElement, 'muzzle-flash');
        await sleep(100);

        // --- Stage 2: Projectile Travel ---
        const projectile = document.createElement('div');
        projectile.className = 'battle-projectile';
        this.element.appendChild(projectile);

        const startRect = startElement.getBoundingClientRect();
        const endRect = endElement.getBoundingClientRect();

        const startX = startRect.left + startRect.width / 2;
        const startY = startRect.top + startRect.height / 2;
        projectile.style.left = `${startX}px`;
        projectile.style.top = `${startY}px`;

        const endX = endRect.left + endRect.width / 2;
        const endY = endRect.top + endRect.height / 2;
        const deltaX = endX - startX;
        const deltaY = endY - startY;

        await sleep(10);
        projectile.style.transform = `translate(${deltaX}px, ${deltaY}px)`;

        // --- Stage 3: Impact ---
        await sleep(400);

        this._createVFX(endElement, 'physical-hit');
        projectile.remove();
    }

    _createHitSpark(targetElement){
        const rect = targetElement.getBoundingClientRect();
        const spark = document.createElement('div');
        spark.className = 'hit-spark';
        spark.style.left = `${rect.left + rect.width/2}px`;
        spark.style.top = `${rect.top + rect.height/2}px`;
        this.element.appendChild(spark);
        setTimeout(() => spark.remove(), 300);
    }

    _createVFX(targetElement, effectType) {
        const vfx = document.createElement('div');
        vfx.className = `vfx-container ${effectType}`;
        targetElement.appendChild(vfx);
        setTimeout(() => vfx.remove(), 1200);
    }

    async _triggerEnergyChargeUp(targetElement) {
        const targetRect = targetElement.getBoundingClientRect();
        const endX = targetRect.left + targetRect.width - 15; // Target the energy icon area
        const endY = targetRect.top + targetRect.height - 15;

        for (let i = 0; i < 3; i++) {
            const particle = document.createElement('div');
            particle.className = 'energy-particle';
            this.element.appendChild(particle);

            // Start from a random off-screen position
            const startX = Math.random() * window.innerWidth;
            const startY = -50;
            particle.style.transform = `translate(${startX}px, ${startY}px)`;

            // Animate to the target
            await sleep(50 + (i * 50)); // Stagger the particle launch
            particle.style.transform = `translate(${endX}px, ${endY}px) scale(0.5)`;
            particle.style.opacity = '0';

            // Clean up the DOM
            setTimeout(() => particle.remove(), 600);
        }
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
