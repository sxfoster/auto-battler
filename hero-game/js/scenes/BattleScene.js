import { createCompactCard, updateHealthBar, updateEnergyDisplay } from '../ui/CardRenderer.js';
import { sleep } from '../utils.js';
import { battleSpeeds, allPossibleMinions } from '../data.js';

// --- Constants for status handling ---
const MAX_DURATION_CAP = 6;
const STATUS_DESCRIPTIONS = {
    'Stun': 'Skips the next action.',
    'Poison': 'Takes 2 damage per turn.',
    'Bleed': 'Takes 1 damage per turn and healing is halved.',
    'Burn': 'Takes 3 damage per turn and suffers -1 defense.',
    'Slow': 'Speed reduced by 1.',
    'Confuse': '50% chance to miss actions.',
    'Root': 'Cannot act next turn.',
    'Shock': '50% chance to fail casting abilities.',
    'Vulnerable': 'Takes +1 damage from all sources.',
    'Defense Down': 'Defense is reduced by 1.',
    'Attack Up': 'Attack power increased.',
    'Fortify': 'Defense increased.'
};

const NEGATIVE_STATUSES = [
    'Bleed','Burn','Poison','Confuse','Root','Slow','Shock','Stun','Vulnerable','Defense Down'
];

export class BattleScene {
    constructor(element, onBattleComplete) {
        this.element = element;
        this.onBattleComplete = onBattleComplete;
        
        // DOM Elements
        this.playerContainer = this.element.querySelector('#player-team-container');
        this.enemyContainer = this.element.querySelector('#enemy-team-container');
        this.battleLogContainer = this.element.querySelector('#battle-log-container');
        this.battleLogSummary = this.element.querySelector('#battle-log-summary');
        this.battleLogPanel = this.element.querySelector('#battle-log-panel');
        this.endScreen = this.element.querySelector('#end-screen');
        this.resultText = this.element.querySelector('#end-screen-result-text');
        this.resultsContainer = this.element.querySelector('#end-screen-results');
        this.playAgainButton = this.element.querySelector('#play-again-button');
        this.speedButton = this.element.querySelector('#speed-cycle-button');
        this.arena = this.element.querySelector('.battle-arena');
        this.abilityAnnouncer = this.element.querySelector('#ability-announcer');
        this.announcerMainText = this.element.querySelector('#announcer-main-text');
        this.announcerSubtitle = this.element.querySelector('#announcer-subtitle');
        this.statusTooltip = document.getElementById('status-tooltip');

        this.comboCount = 0;
        this.lastAttackingTeam = null;
        this.playerComboCounter = document.getElementById('player-combo-counter');
        this.enemyComboCounter = document.getElementById('enemy-combo-counter');
        
        // State
        this.state = [];
        this.currentAttackerIndex = 0;
        this.currentSpeedIndex = 0;
        this.isBattleOver = false;

        // Round tracking and summary bar state
        this.roundStats = {};
        this.summaryLockTime = 0;
        this.summaryLockPriority = 0;

        this.speedButton.addEventListener('click', () => this._cycleSpeed());

        if (this.battleLogSummary) {
            this.battleLogSummary.addEventListener('click', () => {
                this.battleLogPanel.classList.toggle('expanded');
            });
        }

        this._setupTooltipListeners();

        if (this.battleLogPanel) {
            this.battleLogPanel.addEventListener('mouseover', (e) => {
                const entry = e.target.closest('.log-entry');
                if (entry && entry.dataset.combatantId) {
                    const combatantElement = this.element.querySelector(`#${entry.dataset.combatantId}`);
                    if (combatantElement) {
                        combatantElement.classList.add('is-log-hovered');
                    }
                }
            });

            this.battleLogPanel.addEventListener('mouseout', (e) => {
                const entry = e.target.closest('.log-entry');
                if (entry && entry.dataset.combatantId) {
                    const combatantElement = this.element.querySelector(`#${entry.dataset.combatantId}`);
                    if (combatantElement) {
                        combatantElement.classList.remove('is-log-hovered');
                    }
                }
            });
        }
    }

    _cycleSpeed() {
        this.currentSpeedIndex = (this.currentSpeedIndex + 1) % battleSpeeds.length;
        const newSpeed = battleSpeeds[this.currentSpeedIndex];
        this.speedButton.textContent = `Speed: ${newSpeed.label}`;
    }
    
    _logToBattle(message, type = 'info', combatant = null, priority = 1) {
        if (!this.battleLogSummary || !this.battleLogPanel) return;

        const now = Date.now();
        const isLocked = now < this.summaryLockTime;

        if (!isLocked || priority > this.summaryLockPriority) {
            this.battleLogSummary.innerHTML = `${message} <i class="fas fa-chevron-up"></i>`;

            if (priority >= 2) {
                const lockDuration = priority === 3 ? 2500 : 1500;
                this.summaryLockTime = now + lockDuration;
                this.summaryLockPriority = priority;
            } else {
                this.summaryLockTime = 0;
                this.summaryLockPriority = 0;
            }
        }

        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        entry.textContent = message;

        if (combatant && combatant.id) {
            entry.dataset.combatantId = combatant.id;
        }

        const icon = document.createElement('i');
        icon.className = 'log-entry-icon fas';
        const baseType = type.split(' ')[0];
        switch (baseType) {
            case 'damage':
            case 'status-damage':
                icon.classList.add('fa-gavel');
                break;
            case 'heal':
                icon.classList.add('fa-heart');
                break;
            case 'ability-cast':
            case 'ability-result':
                icon.classList.add('fa-star');
                break;
            case 'status':
                icon.classList.add('fa-flask-potion');
                break;
            case 'round':
                icon.classList.add('fa-shield-halved');
                break;
            case 'victory':
                icon.classList.add('fa-crown');
                break;
            case 'defeat':
                icon.classList.add('fa-skull');
                break;
            default:
                icon.classList.add('fa-circle-info');
                break;
        }
        entry.prepend(icon);

        this.battleLogPanel.prepend(entry);

        if (this.battleLogPanel.children.length > 50) {
            this.battleLogPanel.lastChild.remove();
        }
    }

    async start(initialState) {
        this.isBattleOver = false;
        this.state = initialState;
        this.turnQueue = [];
        this.comboCount = 0;
        this.lastAttackingTeam = null;
        this.playerComboCounter.classList.remove('active');
        this.enemyComboCounter.classList.remove('active');

        // --- UI Setup ---
        this.playerContainer.innerHTML = '';
        this.enemyContainer.innerHTML = '';
        if (this.battleLogPanel) {
            this.battleLogPanel.innerHTML = '';
        }
        this.endScreen.classList.remove('visible', 'victory', 'defeat');
        this._logToBattle('The battle begins!', 'round', null, 2);

        // --- 1. Initially hide the teams to prepare for slide-in ---
        this.playerContainer.style.opacity = 0;
        this.enemyContainer.style.opacity = 0;

        // Populate the cards but keep them invisible
        this.state.forEach(combatant => {
            const card = createCompactCard(combatant);
            card.classList.add('is-entering');
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

        // --- 5. Sequential card landing ---
        const playerTeam = this.state.filter(c => c.team === 'player');
        const enemyTeam = this.state.filter(c => c.team === 'enemy');

        for (let i = 0; i < Math.max(playerTeam.length, enemyTeam.length); i++) {
            if (playerTeam[i]) {
                playerTeam[i].element.classList.add('is-landing');
            }
            if (enemyTeam[i]) {
                enemyTeam[i].element.classList.add('is-landing');
            }
            await sleep(150);
        }

        // --- 6. Clean up the animation classes ---
        setTimeout(() => {
            this.playerContainer.classList.remove('slide-in-left');
            this.enemyContainer.classList.remove('slide-in-right');
            clashVFX.classList.remove('clash');
            arena.classList.remove('shake');
            this.playerContainer.style.opacity = '';
            this.enemyContainer.style.opacity = '';
            this.state.forEach(c => c.element.classList.remove('is-entering', 'is-landing'));
        }, 1000);

        // --- 7. Start the First Round after a final pause ---
        await sleep(500);
        this.runCombatRound();
    }
    runCombatRound() {
        if (this.isBattleOver) return;

        this.roundStats = {
            roundNumber: (this.roundStats.roundNumber || 0) + 1,
            playerDamage: 0,
            enemyDamage: 0,
            playerHealing: 0,
            enemyHealing: 0
        };
        this._logToBattle(`Round ${this.roundStats.roundNumber} Begins`, 'round', null, 1);

        // --- 1. Determine Turn Order (Initiative) ---
        this.turnQueue = [...this.state.filter(c => c.currentHp > 0)]
            .sort((a, b) => {
                const aSpeed = a.speed - (a.statusEffects.some(e => e.name === 'Slow') ? 1 : 0);
                const bSpeed = b.speed - (b.statusEffects.some(e => e.name === 'Slow') ? 1 : 0);
                return bSpeed - aSpeed;
            });

        this._logToBattle('Turn order: ' + this.turnQueue.map(c => c.heroData.name).join(', '), 'round', null, 1);

        // --- 2. Start Executing Turns ---
        this.executeNextTurn();
    }

    async executeNextTurn() {
        if (this.isBattleOver) return;

        this.state.forEach(c => c.element.classList.remove('is-active-turn'));

        if (this.turnQueue.length === 0) {
            const summaryMessage = `Round ${this.roundStats.roundNumber} Summary: Player dealt ${this.roundStats.playerDamage} damage and healed ${this.roundStats.playerHealing}. Enemy dealt ${this.roundStats.enemyDamage} damage and healed ${this.roundStats.enemyHealing}.`;
            this._logToBattle(summaryMessage, 'round-summary', null, 2);

            await sleep(1500 * battleSpeeds[this.currentSpeedIndex].multiplier);
            this.runCombatRound();
            return;
        }

        const attacker = this.turnQueue.shift();
        if (attacker.currentHp <= 0) {
            this.executeNextTurn();
            return;
        }

        // --- Check for incapacitating effects like Root or Stun ---
        const rootEffect = attacker.statusEffects.find(e => e.name === 'Root');
        if (rootEffect) {
            this._logToBattle(`${attacker.heroData.name} is rooted and cannot act!`, 'status', attacker, 2);
            rootEffect.turnsRemaining--;
            if (rootEffect.turnsRemaining <= 0) {
                attacker.statusEffects = attacker.statusEffects.filter(e => e !== rootEffect);
            }
            this._updateStatusIcons(attacker);
            attacker.element.classList.remove('is-active-turn', 'is-lunging');
            await sleep(800 * battleSpeeds[this.currentSpeedIndex].multiplier);
            this.executeNextTurn();
            return;
        }

        const stunEffect = attacker.statusEffects.find(e => e.name === 'Stun');
        if (stunEffect) {
            this._logToBattle(`${attacker.heroData.name} is stunned and skips their turn!`, 'status', attacker, 2);
            stunEffect.turnsRemaining--;
            if (stunEffect.turnsRemaining <= 0) {
                attacker.statusEffects = attacker.statusEffects.filter(e => e !== stunEffect);
            }
            this._updateStatusIcons(attacker);
            await sleep(800 * battleSpeeds[this.currentSpeedIndex].multiplier);
            this.executeNextTurn();
            return;
        }

        // --- Apply damage over time effects like Poison, Burn, or Bleed ---
        const dotEffects = attacker.statusEffects.filter(e => e.name === 'Poison' || e.name === 'Burn' || e.name === 'Bleed');
        if (dotEffects.length > 0) {
            for (const effect of dotEffects) {
                let dotDamage = 0;
                if (effect.name === 'Poison') {
                    dotDamage = 2;
                } else if (effect.name === 'Burn') {
                    dotDamage = 3;
                } else if (effect.name === 'Bleed') {
                    dotDamage = 1;
                }
                this._logToBattle(`${attacker.heroData.name} takes ${dotDamage} damage from ${effect.name}.`, 'status-damage', attacker, 1);
                this._dealDamage(attacker, attacker, dotDamage, false, false, null);
                effect.turnsRemaining--;
            }
            attacker.statusEffects = attacker.statusEffects.filter(e => e.turnsRemaining > 0);
            this._updateStatusIcons(attacker);
            if (attacker.currentHp <= 0) {
                await sleep(800 * battleSpeeds[this.currentSpeedIndex].multiplier);
                this.executeNextTurn();
                return;
            }
        }

        // --- Decrement lingering effects like Slow or Vulnerable ---
        const slowEffect = attacker.statusEffects.find(e => e.name === 'Slow');
        if (slowEffect) {
            slowEffect.turnsRemaining--;
            if (slowEffect.turnsRemaining <= 0) {
                attacker.statusEffects = attacker.statusEffects.filter(e => e !== slowEffect);
            }
        }
        const vulnerableEffect = attacker.statusEffects.find(e => e.name === 'Vulnerable');
        if (vulnerableEffect) {
            vulnerableEffect.turnsRemaining--;
            if (vulnerableEffect.turnsRemaining <= 0) {
                attacker.statusEffects = attacker.statusEffects.filter(e => e !== vulnerableEffect);
            }
        }
        this._updateStatusIcons(attacker);

        const confuseEffect = attacker.statusEffects.find(e => e.name === 'Confuse');
        if (confuseEffect) {
            const miss = Math.random() < 0.5;
            confuseEffect.turnsRemaining--;
            if (confuseEffect.turnsRemaining <= 0) {
                attacker.statusEffects = attacker.statusEffects.filter(e => e !== confuseEffect);
            }
            this._updateStatusIcons(attacker);
            if (miss) {
                this._logToBattle(`${attacker.heroData.name} is confused and misses their action!`, 'status', attacker, 2);
                attacker.element.classList.remove('is-active-turn', 'is-lunging');
                await sleep(800 * battleSpeeds[this.currentSpeedIndex].multiplier);
                this.executeNextTurn();
                return;
            }
        }

        this._updateCombo(attacker.team);

        attacker.element.classList.add('is-active-turn');

        this.state.forEach(c => c.element.classList.remove('is-attacking', 'is-lunging'));
        attacker.element.classList.add('is-attacking', 'is-lunging');


        const potentialTargets = this.state.filter(c => c.team !== attacker.team && c.currentHp > 0);
        if (potentialTargets.length === 0) {
            this.executeNextTurn();
            return;
        }
        const target = potentialTargets[0];

        const ability = attacker.abilityData;
        let useAbility = ability && attacker.currentEnergy >= ability.energyCost;
        if (useAbility) {
            const shockEffect = attacker.statusEffects.find(e => e.name === 'Shock');
            if (shockEffect) {
                const fail = Math.random() < 0.5;
                shockEffect.turnsRemaining--;
                if (shockEffect.turnsRemaining <= 0) {
                    attacker.statusEffects = attacker.statusEffects.filter(e => e !== shockEffect);
                }
                if (fail) {
                    this._logToBattle(`${attacker.heroData.name}'s ability fizzles due to Shock!`, 'status', attacker, 2);
                    this._updateStatusIcons(attacker);
                    await sleep(800 * battleSpeeds[this.currentSpeedIndex].multiplier);
                    useAbility = false;
                } else {
                    this._updateStatusIcons(attacker);
                }
            }
        }

        if (useAbility) {
            attacker.currentEnergy -= ability.energyCost;
            updateEnergyDisplay(attacker, attacker.element);
            this._updateChargedStatus(attacker);

            this._showBattleAnnouncement(ability.name, 'ability', ability.effect);
            this._triggerArenaEffect('ability-zoom');
            this._logToBattle(`${attacker.heroData.name} unleashes ${ability.name}!`, 'ability-cast', attacker, 2);

            // This is now redundant with the main _showBattleAnnouncement call.
            /*
            if (ability.target === 'ALLIES') {
                this._triggerTeamBanner(attacker.team, ability.name, 'buff');
            } else if (ability.target === 'ENEMIES') {
                const enemyTeam = attacker.team === 'player' ? 'enemy' : 'player';
                this._triggerTeamBanner(enemyTeam, ability.name, 'debuff');
            }
            */

            if (ability.env_effect) {
                this._triggerEnvironmentalEffect(ability.env_effect);
            }

            if (ability.name === 'Holy Barrier') {
                this._triggerBackgroundEffect('holy-mode', 1500);
            }

            if (ability.rarity === 'Epic' || ability.rarity === 'Rare') {
                this._triggerCameraEffect('camera-zoom', 1200);
            }
            await sleep(500 * battleSpeeds[this.currentSpeedIndex].multiplier);
            if (attacker.currentHp <= 0) {
                this.executeNextTurn();
                return;
            }

            if (ability.summons) {
                const summonList = Array.isArray(ability.summons) ? ability.summons : [ability.summons];
                summonList.forEach(key => {
                    if (allPossibleMinions[key]) {
                        this._summonUnit(attacker, allPossibleMinions[key]);
                    }
                });
            }

            if (ability.effect && ability.effect.includes('damage')) {
                const match = ability.effect.match(/\d+/);
                const baseDamage = match ? parseInt(match[0]) : attacker.attack;

                let finalDamage = baseDamage;
                let isSynergy = false;

                if (ability.synergy) {
                    const hasCondition = target.statusEffects.some(e => e.name === ability.synergy.condition);
                    if (hasCondition) {
                        isSynergy = true;
                        finalDamage *= ability.synergy.bonus_multiplier;

                        const iconToFlash = Array.from(target.element.querySelectorAll('.status-icon'))
                            .find(icon => icon.title.includes(ability.synergy.condition));
                        if (iconToFlash) {
                            iconToFlash.classList.add('synergy-flash');
                            setTimeout(() => iconToFlash.classList.remove('synergy-flash'), 600);
                        }
                    }
                }

                let isCritical = Math.random() < 0.1;
                if (isCritical) {
                    finalDamage = Math.floor(finalDamage * 1.5);
                }

                await this._fireProjectile(attacker.element, target.element);
                if (attacker.currentHp <= 0) {
                    this.executeNextTurn();
                    return;
                }
                this._dealDamage(attacker, target, finalDamage, isCritical, isSynergy, ability);
                if (attacker.currentHp <= 0) {
                    this.executeNextTurn();
                    return;
                }
            }

            // --- Auto-attack after ability ---
            // --- GAIN ENERGY FOR ATTEMPTING ATTACK ---
            attacker.currentEnergy = Math.min(attacker.currentEnergy + 1, 10); // Cap energy at 10
            this._logToBattle(`${attacker.heroData.name} gains 1 energy for attacking!`, 'heal', attacker, 1);
            this._showCombatText(attacker.element, '+1', 'energy');
            updateEnergyDisplay(attacker, attacker.element);
            this._updateChargedStatus(attacker);
            await sleep(400 * battleSpeeds[this.currentSpeedIndex].multiplier);
            // --- END ENERGY GAIN ---

            this._logToBattle(`${attacker.heroData.name} also performs a basic attack!`, 'info', attacker, 1);
            await this._fireProjectile(attacker.element, target.element);
            if (attacker.currentHp <= 0) {
                this.executeNextTurn();
                return;
            }
            const autoAttackBase = Math.max(1, attacker.attack - (target.block || 0));
            let autoCrit = Math.random() < 0.1;
            const autoDamage = autoCrit ? Math.floor(autoAttackBase * 1.5) : autoAttackBase;
            this._dealDamage(attacker, target, autoDamage, autoCrit);
            if (attacker.currentHp <= 0) {
                this.executeNextTurn();
                return;
            }
        } else {
            // --- GAIN ENERGY FOR ATTEMPTING ATTACK ---
            attacker.currentEnergy = Math.min(attacker.currentEnergy + 1, 10); // Cap energy at 10
            this._logToBattle(`${attacker.heroData.name} gains 1 energy for attacking!`, 'heal', attacker, 1);
            this._showCombatText(attacker.element, '+1', 'energy');
            updateEnergyDisplay(attacker, attacker.element);
            this._updateChargedStatus(attacker);
            await sleep(400 * battleSpeeds[this.currentSpeedIndex].multiplier);
            // --- END ENERGY GAIN ---


            const isMeleeClash = (attacker.position === 0 && target.position === 0);

            if (isMeleeClash) {
                // --- Melee Clash Logic ---
                attacker.element.classList.add('is-clashing-player');
                target.element.classList.add('is-clashing-enemy');

                await sleep(400 * battleSpeeds[this.currentSpeedIndex].multiplier);
                if (attacker.currentHp <= 0) {
                    this.executeNextTurn();
                    return;
                }
                this._createVFX(this.element.querySelector('.battle-arena'), 'physical-hit');
                await sleep(400 * battleSpeeds[this.currentSpeedIndex].multiplier);
                if (attacker.currentHp <= 0) {
                    this.executeNextTurn();
                    return;
                }

                attacker.element.classList.remove('is-clashing-player');
                target.element.classList.remove('is-clashing-enemy');

            } else {
                // --- Ranged Attack Logic (Existing Projectile) ---
                if (attacker.team === 'player') {
                    this._triggerCameraEffect('camera-pan-right', 1000);
                } else {
                    this._triggerCameraEffect('camera-pan-left', 1000);
                }
                await this._fireProjectile(attacker.element, target.element);
                if (attacker.currentHp <= 0) {
                    this.executeNextTurn();
                    return;
                }
            }

            // Deal damage AFTER the animation completes
            const baseDamage = Math.max(1, attacker.attack - (target.block || 0));
            const crit = Math.random() < 0.1;
            const dmg = crit ? Math.floor(baseDamage * 1.5) : baseDamage;
            this._dealDamage(attacker, target, dmg, crit);
            if (attacker.currentHp <= 0) {
                this.executeNextTurn();
                return;
            }
        }

        attacker.element.classList.remove('is-lunging');

        // --- 6. Check for Battle End ---
        const isPlayerTeamDefeated = this.state.filter(c => c.team === 'player' && c.currentHp > 0).length === 0;
        const isEnemyTeamDefeated = this.state.filter(c => c.team === 'enemy' && c.currentHp > 0).length === 0;

        if (isPlayerTeamDefeated || isEnemyTeamDefeated) {
            await this._endBattle(!isPlayerTeamDefeated);
            return;
        }

        // --- 7. Continue to Next Turn ---
        // Use a base pause of 0.8 seconds, adjusted by the speed multiplier
        await sleep(800 * battleSpeeds[this.currentSpeedIndex].multiplier);
        this.executeNextTurn();
    }


    _dealDamage(attacker, target, damage, isCritical = false, isSynergy = false, sourceAbility = null) {
        let finalDamage = damage;

        // --- Apply buffs and debuffs ---
        if (attacker.statusEffects.some(e => e.name === 'Attack Up')) {
            finalDamage += 2;
        }

        let totalBlock = (target.block || 0);
        if (target.statusEffects.some(e => e.name === 'Defense Down' || e.name === 'Burn')) {
            this._logToBattle(`${target.heroData.name}'s defense is lowered!`, 'status', target, 1);
            totalBlock = Math.max(0, totalBlock - 1);
        }

        const isVulnerable = target.statusEffects.some(e => e.name === 'Vulnerable');

        if (target.heroData.abilities.some(a => a.name === 'Fortify')) {
            finalDamage = Math.max(0, finalDamage - 1);
        }

        finalDamage = Math.max(1, finalDamage - totalBlock);

        if (isVulnerable) {
            finalDamage += 1;
        }

        const isOverkill = (target.currentHp - finalDamage) < -5;

        let logMessage;
        const verb = sourceAbility ? 'hits' : 'strikes';
        if (attacker === target) {
            logMessage = `${target.heroData.name} takes ${finalDamage} damage from an effect.`;
        } else {
            logMessage = `${attacker.heroData.name} ${verb} ${target.heroData.name} for ${finalDamage} damage.`;
        }

        if (isVulnerable) logMessage += ' (+1 Vulnerable)';
        if (isCritical) logMessage += ' CRITICAL HIT!';
        if (isOverkill) logMessage += ' OVERKILL!';

        const logType = sourceAbility ? 'ability-result damage' : 'damage';
        const logPriority = isCritical || isOverkill ? 3 : 2;
        this._logToBattle(logMessage, logType, target, logPriority);

        if (target.team === 'player') {
            this.roundStats.enemyDamage += finalDamage;
        } else {
            this.roundStats.playerDamage += finalDamage;
        }

        target.currentHp = Math.max(0, target.currentHp - finalDamage);

        target.element.classList.add('is-taking-damage');
        setTimeout(() => target.element.classList.remove('is-taking-damage'), 400 * battleSpeeds[this.currentSpeedIndex].multiplier);

        if (isOverkill) {
            this._showCombatText(target.element, `-${finalDamage}!!`, 'overkill');
            const flash = document.getElementById('screen-flash');
            if (flash) flash.classList.add('flash');
            setTimeout(() => flash.classList.remove('flash'), 400);
        } else if (isCritical || isSynergy) {
            this._showCombatText(target.element, `-${finalDamage}!`, 'critical');
        } else {
            this._showCombatText(target.element, `-${finalDamage}`, 'damage');
        }

        this._createVFX(target.element, 'physical-hit');

        // --- NEW: Critical Health Check ---
        const healthPercentage = target.currentHp / target.maxHp;
        if (healthPercentage > 0 && healthPercentage <= 0.25) {
            target.element.classList.add('is-critical-health');
        } else {
            // Also be sure to remove it if they are healed above the threshold
            target.element.classList.remove('is-critical-health');
        }

        updateHealthBar(target, target.element);

        if (target.currentHp <= 0) {
            target.element.classList.remove('is-critical-health');
            this._logToBattle(`${target.heroData.name} has been defeated!`, 'defeat', target, 3);
            target.element.classList.add('is-defeated');

            setTimeout(() => {
                if (target.element && target.element.parentNode) {
                    target.element.parentNode.removeChild(target.element);
                }
                this.state = this.state.filter(c => c.id !== target.id);
            }, 1500);

            this._recalculateTurnQueue(null, target.id);

            this._triggerArenaEffect('critical-shake');
        }
    }

    _heal(target, amount, sourceAbility = null) {
        let finalHealAmount = amount;
        if (target.statusEffects.some(e => e.name === 'Bleed')) {
            finalHealAmount = Math.floor(amount * 0.5);
            this._logToBattle(`${target.heroData.name}'s healing is reduced by Bleed to ${finalHealAmount} HP!`, 'status', target, 2);
        }
        target.currentHp = Math.min(target.maxHp, target.currentHp + finalHealAmount);
        const type = sourceAbility ? 'ability-result heal' : 'heal';
        this._logToBattle(`${target.heroData.name} heals ${finalHealAmount} HP!`, type, target, 1);

        if (target.team === 'player') {
            this.roundStats.playerHealing += finalHealAmount;
        } else {
            this.roundStats.enemyHealing += finalHealAmount;
        }
        updateHealthBar(target, target.element);
    }

    _applyStatus(target, statusName, duration, sourceAbility = null){
        const type = sourceAbility ? 'ability-result status' : 'status';
        const priority = (statusName === 'Stun' || statusName === 'Root') ? 2 : 1;

        const existing = target.statusEffects.find(e => e.name === statusName);
        if (existing) {
            existing.turnsRemaining = Math.min(MAX_DURATION_CAP, existing.turnsRemaining + duration);
            this._logToBattle(`${target.heroData.name}'s ${statusName} duration was extended to ${existing.turnsRemaining} turns.`, type, target, priority);
        } else {
            this._logToBattle(`${target.heroData.name} is afflicted with ${statusName}!`, type, target, priority);
            target.statusEffects.push({
                name: statusName,
                turnsRemaining: duration,
                baseDuration: duration,
                description: STATUS_DESCRIPTIONS[statusName] || ''
            });
        }
        this._updateStatusIcons(target);
    }

    _cleanseStatus(target, type = 'all_negative') {
        const before = target.statusEffects.slice();
        if (type === 'all_negative') {
            target.statusEffects = target.statusEffects.filter(e => !NEGATIVE_STATUSES.includes(e.name));
        } else {
            target.statusEffects = target.statusEffects.filter(e => e.name !== type);
        }
        const removed = before.filter(e => !target.statusEffects.includes(e));
        removed.forEach(e => this._logToBattle(`${target.heroData.name} cleansed ${e.name}!`, 'status', target, 1));
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
        cardElement.classList.remove(
            'has-aura',
            'aura-poison', 'aura-buff',
            'aura-stun', 'aura-bleed', 'aura-burn', 'aura-slow',
            'aura-confuse', 'aura-root', 'aura-shock', 'aura-vulnerable', 'aura-defense-down'
        );

        if (combatant.statusEffects.length > 0) {
            cardElement.classList.add('has-aura');
        } else {
            cardElement.classList.remove('has-aura');
        }

        combatant.statusEffects.forEach(effect => {
            const icon = document.createElement('div');
            icon.className = 'status-icon';
            switch(effect.name){
                case 'Stun':
                    icon.innerHTML = '<i class="fas fa-star"></i>';
                    cardElement.classList.add('aura-stun');
                    break;
                case 'Poison':
                    icon.innerHTML = '<i class="fas fa-skull-crossbones"></i>';
                    cardElement.classList.add('aura-poison');
                    break;
                case 'Bleed':
                    icon.innerHTML = '<i class="fas fa-droplet"></i>';
                    cardElement.classList.add('aura-bleed');
                    break;
                case 'Burn':
                    icon.innerHTML = '<i class="fas fa-fire-alt"></i>';
                    cardElement.classList.add('aura-burn');
                    break;
                case 'Slow':
                    icon.innerHTML = '<i class="fas fa-hourglass-half"></i>';
                    cardElement.classList.add('aura-slow');
                    break;
                case 'Confuse':
                    icon.innerHTML = '<i class="fas fa-question"></i>';
                    cardElement.classList.add('aura-confuse');
                    break;
                case 'Root':
                    icon.innerHTML = '<i class="fas fa-tree"></i>';
                    cardElement.classList.add('aura-root');
                    break;
                case 'Shock':
                    icon.innerHTML = '<i class="fas fa-bolt"></i>';
                    cardElement.classList.add('aura-shock');
                    break;
                case 'Vulnerable':
                    icon.innerHTML = '<i class="fas fa-crosshairs"></i>';
                    cardElement.classList.add('aura-vulnerable');
                    break;
                case 'Defense Down':
                    icon.innerHTML = '<i class="fas fa-shield-slash"></i>';
                    cardElement.classList.add('aura-defense-down');
                    break;
                case 'Attack Up':
                case 'Fortify':
                    icon.innerHTML = '<i class="fas fa-arrow-up"></i>';
                    cardElement.classList.add('aura-buff');
                    break;
                default:
                    icon.innerHTML = '<i class="fas fa-circle"></i>';
            }
            icon.dataset.statusName = effect.name;
            icon.dataset.statusTurns = effect.turnsRemaining;
            icon.dataset.statusDesc = effect.description || '';
            container.appendChild(icon);
        });
    }

    _updateChargedStatus(combatant) {
        const cardElement = combatant.element;
        const ability = combatant.abilityData;

        if (ability && combatant.currentEnergy >= ability.energyCost) {
            cardElement.classList.add('is-charged', 'has-aura');
        } else {
            cardElement.classList.remove('is-charged');
            const hasOtherAura = Array.from(cardElement.classList).some(c => c.startsWith('aura-'));
            if (!hasOtherAura) {
                cardElement.classList.remove('has-aura');
            }
        }
    }

    _summonUnit(summoner, minionData) {
        const teamContainer = summoner.team === 'player' ? this.playerContainer : this.enemyContainer;
        const team = summoner.team;

        const minionId = `${team}-minion-${Date.now()}`;
        const newMinion = {
            id: minionId,
            heroData: { ...minionData },
            weaponData: null,
            armorData: null,
            abilityData: null,
            team: team,
            position: this.state.filter(c => c.team === team).length,
            currentHp: minionData.hp,
            maxHp: minionData.hp,
            attack: minionData.attack,
            speed: minionData.speed,
            currentEnergy: 0,
            statusEffects: [],
            element: null
        };

        this.state.push(newMinion);

        const card = createCompactCard(newMinion);
        newMinion.element = card;
        teamContainer.appendChild(card);
        card.classList.add('is-landing');

        this._logToBattle(`${summoner.heroData.name} summons a ${minionData.name}!`, 'ability-result', summoner, 2);

        this._recalculateTurnQueue(newMinion);
    }

    _recalculateTurnQueue(newUnit = null, defeatedUnitId = null) {
        if (defeatedUnitId) {
            this.turnQueue = this.turnQueue.filter(c => c.id !== defeatedUnitId);
        }
        if (newUnit) {
            let inserted = false;
            for (let i = 0; i < this.turnQueue.length; i++) {
                if (newUnit.speed > this.turnQueue[i].speed) {
                    this.turnQueue.splice(i, 0, newUnit);
                    inserted = true;
                    break;
                }
            }
            if (!inserted) {
                this.turnQueue.push(newUnit);
            }
        }
        this._logToBattle(`Turn order updated!`, 'info', null, 1);
    }

    _showBattleAnnouncement(text, styleClass = '', subtitle = '') {
        if (!this.abilityAnnouncer) return;

        if (this.announcerMainText) this.announcerMainText.textContent = text;
        if (this.announcerSubtitle) this.announcerSubtitle.textContent = subtitle;

        this.abilityAnnouncer.className = 'ability-announcer';
        if (styleClass) {
            this.abilityAnnouncer.classList.add(styleClass);
        }

        this.abilityAnnouncer.classList.add('show');
        setTimeout(() => {
            this.abilityAnnouncer.classList.remove('show');
        }, 1500);
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

    _triggerBackgroundEffect(effectClass, duration = 1000) {
        const background = document.getElementById('background-canvas');
        if (!background) return;

        background.classList.add(effectClass);
        setTimeout(() => {
            background.classList.remove(effectClass);
        }, duration);
    }

    _triggerEnvironmentalEffect(effectType) {
        const particles = document.querySelectorAll('#environmental-vfx-container .env-particle');
        if (!particles.length) return;

        particles.forEach((particle, index) => {
            particle.className = 'env-particle';
            particle.style.top = `${Math.random() * 100}%`;

            const delay = index * 100;
            const duration = 800 + Math.random() * 400;

            setTimeout(() => {
                if (effectType === 'wind') {
                    particle.style.animationDuration = `${duration}ms`;
                    particle.classList.add('wind-gust');
                }
            }, delay);
        });
    }

    _triggerTeamBanner(team, text, type = 'buff') {
        const bannerId = `${team}-team-banner`;
        const banner = document.getElementById(bannerId);
        if (!banner) return;

        banner.textContent = text;
        banner.className = `team-banner ${type}`;
        banner.classList.add('is-visible');

        setTimeout(() => {
            banner.classList.remove('is-visible');
        }, 2000);
    }

    _updateCombo(attackerTeam) {
        if (this.lastAttackingTeam === attackerTeam) {
            this.comboCount++;
        } else {
            this.comboCount = 1;
            this.playerComboCounter.classList.remove('active');
            this.enemyComboCounter.classList.remove('active');
        }

        this.lastAttackingTeam = attackerTeam;
        const backgroundCanvas = document.getElementById('background-canvas');

        if (this.comboCount > 1) {
            const counter = attackerTeam === 'player' ? this.playerComboCounter : this.enemyComboCounter;
            counter.textContent = `COMBO x${this.comboCount}`;
            counter.classList.add('active');
            if (backgroundCanvas) backgroundCanvas.classList.add('speed-lines-active');
        } else {
            if (backgroundCanvas) backgroundCanvas.classList.remove('speed-lines-active');
        }
    }

    async _fireProjectile(startElement, endElement, isFinalBlow = false) {
        // --- Stage 1: Muzzle Flash on Attacker ---
        this._createVFX(startElement, 'muzzle-flash');
        await sleep(100 * battleSpeeds[this.currentSpeedIndex].multiplier);

        // --- Stage 2: Projectile Travel ---
        const projectile = document.createElement('div');
        projectile.className = 'battle-projectile';

        // **NEW: Apply slow-motion class if it's the final blow**
        if (isFinalBlow) {
            projectile.classList.add('slow-motion');
        }
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
        let travelTime = isFinalBlow ? 1500 : 400;
        await sleep(travelTime * battleSpeeds[this.currentSpeedIndex].multiplier);

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
        const endX = targetRect.left + targetRect.width - 20;
        const endY = targetRect.top + targetRect.height - 20;

        // Determine the origin point of the particles - the center of the arena
        const arenaRect = this.arena.getBoundingClientRect();
        const arenaCenterX = arenaRect.left + (arenaRect.width / 2);
        const arenaCenterY = arenaRect.top + (arenaRect.height / 2);

        for (let i = 0; i < 3; i++) {
            const particle = document.createElement('div');
            particle.className = 'energy-particle';
            this.element.appendChild(particle);

            // Begin particles roughly from the center of the arena with a slight spread
            const startX = arenaCenterX + (Math.random() * 100 - 50);
            const startY = arenaCenterY + (Math.random() * 100 - 50);
            particle.style.transform = `translate(${startX}px, ${startY}px)`;

            await sleep(50 + (i * 60));

            particle.style.transform = `translate(${endX}px, ${endY}px) scale(0.5)`;
            particle.style.opacity = '0';

            setTimeout(() => particle.remove(), 600);
        }
    }

    async _endBattle(didPlayerWin) {
        this.isBattleOver = true;
        const winningTeam = didPlayerWin ? 'player' : 'enemy';
        this._logToBattle(didPlayerWin ? "Player team is victorious!" : "Enemy team is victorious!", didPlayerWin ? 'victory' : 'defeat', null, 3);

        this.state.forEach(combatant => {
            if (combatant.team === winningTeam && combatant.currentHp > 0) {
                combatant.element.classList.add('is-victorious');
            } else {
                combatant.element.classList.add('is-vanquished');
            }
        });

        await sleep(2500 * battleSpeeds[this.currentSpeedIndex].multiplier);

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

    _setupTooltipListeners() {
        if (!this.statusTooltip) return;
        this.element.addEventListener('mouseover', (e) => {
            const icon = e.target.closest('.status-icon');
            if (!icon) return;
            const { statusName, statusTurns, statusDesc } = icon.dataset;
            const nameEl = this.statusTooltip.querySelector('.status-tooltip-name');
            const durEl = this.statusTooltip.querySelector('.status-tooltip-duration');
            const descEl = this.statusTooltip.querySelector('.status-tooltip-description');
            if (nameEl) nameEl.textContent = statusName;
            if (durEl) durEl.textContent = `Turns remaining: ${statusTurns}`;
            if (descEl) descEl.textContent = statusDesc;
            this.statusTooltip.style.left = `${e.clientX + 10}px`;
            this.statusTooltip.style.top = `${e.clientY + 10}px`;
            this.statusTooltip.classList.add('visible');
        });

        this.element.addEventListener('mouseout', (e) => {
            const icon = e.target.closest('.status-icon');
            if (icon) {
                this.statusTooltip.classList.remove('visible');
            }
        });
    }
    
    show() {
        this.element.classList.remove('hidden');
    }

    hide() {
        this.element.classList.add('hidden');
    }
}
