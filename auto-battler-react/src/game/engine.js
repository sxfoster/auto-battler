// GameEngine handles simple auto-attack combat rounds

import { allPossibleMinions } from '../data/data.js';
import { STATUS_EFFECTS } from './statusEffects.js';
import ProcEngine from './procEngine.js';


class GameEngine {
    constructor(combatants, options = {}) {
        this.combatants = combatants.map(c => ({
            attacksMade: 0,
            hitsTaken: 0,
            ...c
        }));
        this.turnQueue = [];
        this.battleLog = [];
        this.isBattleOver = false;
        this.winner = null;
        this.roundCounter = 0;
        this.extraActionTaken = {}; // Tracks extra actions per round
        this.finalPlayerState = {}; // Will store final state changes
        this.procEngine = new ProcEngine(this.battleLog);
        this.narrativeMode = options.isNarrative || false;
        this.playerName = options.playerName || (this.combatants.find(c => c.team === 'player')?.name);
        this.isTutorial = options.isTutorial || false;
        this.abilityPauseShown = false;
        this.pendingPause = null;
    }

    log(entry, level = 'detail', isNarrative = false) {
        if (typeof entry === 'string') {
            entry = { type: 'info', message: entry };
        }
        if (this.narrativeMode || isNarrative) {
            entry = { ...entry, message: this.formatNarrative(entry.message) };
        }
        this.battleLog.push({ round: this.roundCounter, level, ...entry });
    }

    formatNarrative(message) {
        if (!this.playerName || typeof message !== 'string') return message;
        const name = this.playerName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        let result = message
            .replace(new RegExp(`^${name} hits`, 'i'), 'You strike')
            .replace(new RegExp(`^${name} uses`, 'i'), 'You use')
            .replace(new RegExp(`^${name} takes`, 'i'), 'You take')
            .replace(new RegExp(`^${name}'s`, 'i'), 'Your')
            .replace(new RegExp(`${name}'s`, 'gi'), 'your')
            .replace(new RegExp(`${name}`, 'gi'), 'you');
        result = result.replace(/You hits/gi, 'You hit');
        result = result.replace(/You uses/gi, 'You use');
        result = result.replace(/You takes/gi, 'You take');
        if (result.startsWith('you ')) result = 'You ' + result.slice(4);
        if (result.startsWith('you')) result = 'You' + result.slice(3);
        return result;
    }

    getEffectiveSpeed(combatant) {
       let spd = combatant.speed || 0;
       if (combatant.statusEffects.some(s => s.name === 'Slow')) spd -= 1;
       return spd;
    }

    computeTurnQueue() {
        return this.combatants
            .filter(c => c.currentHp > 0)
            .sort((a, b) => this.getEffectiveSpeed(b) - this.getEffectiveSpeed(a));
    }

   applyHeal(caster, amount) {
       caster.currentHp = Math.min(caster.maxHp, caster.currentHp + amount);
   }

   applyCleanse(target) {
       const effectsToRemove = target.statusEffects.filter(e => {
           const info = STATUS_EFFECTS[e.name];
           return info && info.type === 'debuff';
       });

       if (effectsToRemove.length > 0) {
           target.statusEffects = target.statusEffects.filter(e => {
               const info = STATUS_EFFECTS[e.name];
               return !info || info.type !== 'debuff';
           });
           this.log({ type: 'status', message: `${target.name}'s negative effects were cleansed.` }, 'summary');
       }
   }

   applyStatusEffect(target, name, duration = 2, extra = {}) {
       const context = { attacker: null, defender: target, statusName: name };
       this.procEngine.trigger('on_status_applied', context);
       if (context.cancelStatus) return;

       const effect = { name, turnsRemaining: duration, ...extra };
       if (name === 'Poison' && effect.damage === undefined) {
           effect.damage = 1;
       }
       target.statusEffects.push(effect);
       this.log({ type: 'status', message: `↳ ${target.name} is ${name.toLowerCase()}.` });
   }

   applyDamage(attacker, target, baseDamage, options = {}) {
       const { log = true, ignoreDefense = 0 } = options;

       // --- Calculate bonuses from attacker buffs ---
       let bonusDamage = 0;
       if (attacker.statusEffects && attacker.statusEffects.some(s => s.name === 'Attack Up')) {
           bonusDamage += 2; // simple flat bonus for each Attack Up instance
       }

       // --- Calculate target defense value ---
       let defense = target.defense || 0;
       if (target.statusEffects && target.statusEffects.some(s => s.name === 'Defense Down')) {
           defense = Math.max(0, defense - 1);
       }
       if (target.statusEffects && target.statusEffects.some(s => s.name === 'Fortify')) {
           defense += 1; // reduces damage by 1 while Fortify is active
       }

       // --- Bonus damage from target debuffs ---
       if (target.statusEffects) {
           for (const eff of target.statusEffects) {
               if (eff.name === 'Armor Break') {
                   bonusDamage += eff.bonusDamage || 1;
               }
           }
       }

       const defenseMitigation = Math.max(0, defense - ignoreDefense);
       const rawDamage = baseDamage + bonusDamage;
       const finalDamage = Math.max(1, rawDamage - defenseMitigation);

       target.currentHp = Math.max(0, target.currentHp - finalDamage);
       if (log) {
           if (attacker === target) {
               this.log({ type: 'damage', message: `${target.name} takes ${finalDamage} damage.` }, 'summary');
           } else {
               this.log({ type: 'damage', message: `${attacker.name} hits ${target.name} for ${finalDamage} damage.` }, 'summary');
           }
           if (target.currentHp <= 0) {
               this.log({ type: 'status', message: `💀 ${target.name} has been defeated.` }, 'summary');
               this.procEngine.trigger('on_kill', {
                   attacker,
                   defender: target,
                   allCombatants: this.combatants,
                   applyDamage: this.applyDamage.bind(this),
                   applyStatus: this.applyStatusEffect.bind(this),
                   applyHeal: this.applyHeal.bind(this),
                   turnQueue: this.turnQueue
               });
           }
       }
       if (finalDamage > 0) {
           target.hitsTaken = (target.hitsTaken || 0) + 1;
       }
       return {
           baseDamage,
           bonusDamage,
           defenseMitigation,
           finalDamage
       };
   }

  applyAbilityEffect(attacker, target, ability) {

       const targetContext = {
           attacker,
           defender: target,
           ability,
           allCombatants: this.combatants,
           applyDamage: this.applyDamage.bind(this),
           applyStatus: this.applyStatusEffect.bind(this),
           applyHeal: this.applyHeal.bind(this),
           turnQueue: this.turnQueue
       };
       this.procEngine.trigger('on_ability_targeted', targetContext);
       if (targetContext.cancelAbility) {
           this.log({ type: 'info', message: `${target.name} resists the ability!` });
           return;
       }

       let damageDealt = 0; // actual damage after mitigation
       let healingDone = 0;
       let healTarget = null;
       let multiTarget = false;

       // check for multi-target damage phrases first
       const multiDamageMatch = ability.effect.match(/Deal (\d+) damage to (?:all|each) enemies/i);
       if (multiDamageMatch) {
           const base = parseInt(multiDamageMatch[1], 10);
           multiTarget = true;
           const enemies = this.combatants.filter(c => c.team !== attacker.team && c.currentHp > 0);
           for (const enemy of enemies) {
               const result = this.applyDamage(attacker, enemy, base, { log: false });
               damageDealt = result.finalDamage;
           }
       } else {
           const damageMatch = ability.effect.match(/Deal (\d+) damage/i);
           if (damageMatch) {
               const base = parseInt(damageMatch[1], 10);
               const result = this.applyDamage(attacker, target, base, { log: false });
               damageDealt = result.finalDamage;
           }
       }

       const healSelfMatch = ability.effect.match(/heal yourself for (\d+) HP(?!\s*per turn)/i);
       if (healSelfMatch) {
           healingDone = parseInt(healSelfMatch[1], 10);
           healTarget = attacker;
       } else {
           const generalHealMatch = ability.effect.match(/Heal .*? for (\d+) HP(?!\s*per turn)/i);
           if (generalHealMatch) {
               healingDone = parseInt(generalHealMatch[1], 10);
               healTarget = target;
           }
       }

       if (healTarget && healingDone > 0) {
           this.applyHeal(healTarget, healingDone);
       }

       // process heal over time effects
       const hotMatch = ability.effect.match(/Heal .* for (\d+) HP per turn over (\d+) turns/i);
       if (hotMatch) {
           const healing = parseInt(hotMatch[1], 10);
           const turns = parseInt(hotMatch[2], 10);
           target.statusEffects.push({ name: 'Regrowth', healing, turnsRemaining: turns, sourceAbility: ability.name });
           this.log({ type: 'status', message: `💚 ${target.name} gains Regrowth (${healing} HP/turn for ${turns} turns) from ${attacker.name}'s [${ability.name}].` });
       }

        const poisonMatchDetailed = ability.effect.match(/apply Poison \((\d+) dmg\/turn for (\d+) turns\)/i);
        const poisonMatchSimple = ability.effect.match(/poison .* for (\d+) turns/i);
        if (poisonMatchDetailed || poisonMatchSimple) {
            const damage = poisonMatchDetailed ? parseInt(poisonMatchDetailed[1], 10) : 1;
            const turns = poisonMatchDetailed ? parseInt(poisonMatchDetailed[2], 10) : parseInt(poisonMatchSimple[1], 10);
            target.statusEffects.push({ name: 'Poison', damage, turnsRemaining: turns, sourceAbility: ability.name });
            this.log({ type: 'status', message: `☣️ ${target.name} is afflicted with Poison (${damage} dmg/turn for ${turns} turns) from ${attacker.name}'s [${ability.name}].` });
        }

        if (/confuse/i.test(ability.effect)) {
            target.statusEffects.push({ name: 'Confuse', turnsRemaining: 1, sourceAbility: ability.name });
            this.log({ type: 'status', message: `❓ ${target.name} is confused by ${attacker.name}'s [${ability.name}].` });
        }

        if (/Armor Break/i.test(ability.effect)) {
            const match = ability.effect.match(/(\d+) turns?/i);
            const turns = match ? parseInt(match[1], 10) : 2;
            target.statusEffects.push({ name: 'Armor Break', bonusDamage: 1, turnsRemaining: turns, sourceAbility: ability.name });
            this.log({ type: 'status', message: `🛡️ ${target.name} suffers Armor Break for ${turns} turns from ${attacker.name}'s [${ability.name}].` });
        }

        if (/Defense Down/i.test(ability.effect)) {
            const match = ability.effect.match(/Defense Down for (\d+) turns?/i);
            const turns = match ? parseInt(match[1], 10) : 2;
            target.statusEffects.push({ name: 'Defense Down', turnsRemaining: turns, sourceAbility: ability.name });
            this.log({ type: 'status', message: `🛡️ ${target.name} suffers Defense Down for ${turns} turns from ${attacker.name}'s [${ability.name}].` });
        }

       if (ability.summons) {
           const summonKeys = Array.isArray(ability.summons) ? ability.summons : [ability.summons];
           for (const key of summonKeys) {
               const minionData = allPossibleMinions[key];
               if (minionData) {
                   const newMinion = {
                       id: `${attacker.team}-minion-${Date.now()}-${Math.random()}`,
                       name: minionData.name,
                       heroData: { ...minionData },
                       team: attacker.team,
                       position: this.combatants.filter(c => c.team === attacker.team).length,
                       currentHp: minionData.hp,
                       maxHp: minionData.hp,
                       attack: minionData.attack,
                       speed: minionData.speed,
                       defense: 0,
                       currentEnergy: 0,
                       statusEffects: [],
                   };
                   this.combatants.push(newMinion);
                   this.log({ type: 'info', message: `${attacker.name} summons a ${minionData.name}!` }, 'summary');
               }
           }
           this.turnQueue = this.computeTurnQueue();
       }

       if (ability.effect.includes('Remove all negative effects')) {
           this.applyCleanse(target);
       }

       if (ability.effect.includes('extra action') && !this.extraActionTaken[attacker.id]) {
           this.log({ type: 'info', message: `${attacker.name} gains an extra action!` }, 'summary');
           this.extraActionTaken[attacker.id] = true;
           this.turnQueue.unshift(attacker);
       }

       // first log line - announce ability usage
       this.log({ type: 'ability-cast', message: `${attacker.name} uses ${ability.name}!` }, 'summary');

       // build description of the ability effects
       let descParts = [];
       if (damageDealt > 0) {
           if (multiTarget) {
               descParts.push(`hits all enemies for ${damageDealt} damage`);
           } else {
               descParts.push(`hits ${target.name} for ${damageDealt} damage`);
           }
       }
       if (healingDone > 0) {
           if (healTarget === attacker) {
               descParts.push(`heals for ${healingDone} HP`);
           } else if (healTarget) {
               descParts.push(`heals ${healTarget.name} for ${healingDone} HP`);
           }
       }

       // check for additional text in ability.effect not covered above
       let remaining = ability.effect;
       if (multiDamageMatch) {
           remaining = remaining.replace(/Deal \d+ damage to (?:all|each) enemies\.*/i, '').trim();
       } else {
           const dmgRegex = /Deal \d+ damage(?: to .*?)?\.?/i;
           remaining = remaining.replace(dmgRegex, '').trim();
       }
       remaining = remaining.replace(/heal yourself for \d+ HP\.?/i, '')
                           .replace(/Heal .*? for \d+ HP\.?/i, '')
                           .replace(/per turn over \d+ turns\.?/i, '')
                           .trim();
       if (remaining.toLowerCase().startsWith('and ')) {
           remaining = remaining.slice(4);
       }
       if (remaining) {
           descParts.push(remaining);
       }

       const effectLine = `${attacker.name} ${descParts.join(' and ')}.`;
       this.log({ type: 'ability-result', message: effectLine });

       if (multiTarget && damageDealt > 0) {
           const enemies = this.combatants.filter(c => c.team !== attacker.team && c.currentHp <= 0);
           for (const enemy of enemies) {
               this.log({ type: 'status', message: `💀 ${enemy.name} has been defeated.` }, 'summary');
           }
       } else if (damageDealt > 0 && target.currentHp <= 0) {
           this.log({ type: 'status', message: `💀 ${target.name} has been defeated.` }, 'summary');
       }
   }

   startRound() {
       this.roundCounter++;
       this.procEngine.roundCounter = this.roundCounter;
       this.log({ type: 'round', message: `--- Round ${this.roundCounter} ---` }, 'summary');
       this.extraActionTaken = {}; // reset extra action tracking each round
       this.turnQueue = this.computeTurnQueue();
   }

   processStatuses(combatant) {
       let skip = false;
       for (let i = combatant.statusEffects.length - 1; i >= 0; i--) {
           const effect = combatant.statusEffects[i];
           if (effect.name === 'Regrowth') {
               this.applyHeal(combatant, effect.healing);
               this.log({ type: 'status', message: `💚 ${combatant.name} is healed for ${effect.healing} by Regrowth.` });
           } else if (effect.name === 'Poison') {
               const result = this.applyDamage(combatant, combatant, effect.damage, { log: false });
               this.log({ type: 'status', message: `☣️ ${combatant.name} takes ${result.finalDamage} poison damage.` });
           }

           if (effect.name !== 'Confuse') {
               effect.turnsRemaining -= 1;
               if (effect.turnsRemaining <= 0) {
                   this.log({ type: 'status', message: `${effect.name} on ${combatant.name} has worn off.` });
                   combatant.statusEffects.splice(i, 1);
               }
           }
       }

       if (combatant.statusEffects.some(s => s.name === 'Stun')) {
           this.log({ type: 'status', message: `${combatant.name} is stunned and misses the turn.` });
           skip = true;
       }
       return skip;
   }

   checkVictory() {
       const playerAlive = this.combatants.some(c => c.team === 'player' && c.currentHp > 0);
       const enemyAlive = this.combatants.some(c => c.team === 'enemy' && c.currentHp > 0);

       if (!playerAlive || !enemyAlive) {
           this.isBattleOver = true;
           this.winner = playerAlive ? 'player' : 'enemy';
           return true;
       }
       return false;
   }

   processTurn() {
       if (this.isBattleOver) return;

       const attacker = this.turnQueue.shift();
       if (!attacker || attacker.currentHp <= 0) {
            if (!this.checkVictory() && this.turnQueue.length > 0) this.processTurn();
            return;
       }

       this.log({ type: 'turn', message: `> Turn: ${attacker.name} (${attacker.currentHp}/${attacker.maxHp} HP)` });

       const wasSkipped = this.processStatuses(attacker);
       if (this.checkVictory()) return;

       let confused = attacker.statusEffects.find(s => s.name === 'Confuse');

       if (!wasSkipped) {
           const enemies = this.combatants.filter(c => c.team !== attacker.team && c.currentHp > 0);
           if (enemies.length > 0) {
               const targetEnemy = enemies[0];
               const ability = attacker.abilityData;
               const cost = ability ? ability.energyCost || 1 : 0;

               if (ability) {
                   console.log(`${attacker.name} is checking if they can use ${ability.name}.`);
               }

               if (confused) {
                   if (Math.random() < 0.5) {
                       this.log({ type: 'status', message: `${attacker.name}'s attack misses ${targetEnemy.name}!` });
                       attacker.statusEffects = attacker.statusEffects.filter(e => e !== confused);
                       this.log({ type: 'status', message: `Confuse on ${attacker.name} has worn off.` });
                       attacker.currentEnergy = (attacker.currentEnergy || 0) + 1;
                       return;
                   } else {
                       attacker.statusEffects = attacker.statusEffects.filter(e => e !== confused);
                       this.log({ type: 'status', message: `Confuse on ${attacker.name} has worn off.` });
                   }
               }

               const context = {
                   attacker,
                   defender: targetEnemy,
                   allCombatants: this.combatants,
                   applyDamage: this.applyDamage.bind(this),
                   applyStatus: this.applyStatusEffect.bind(this),
                   applyHeal: this.applyHeal.bind(this),
                   turnQueue: this.turnQueue
               };

               this.procEngine.trigger('on_attack', context);
               this.procEngine.trigger('on_attacked', context);

               let dealt = 0;
               let damageDetails = null;
               if (!context.cancelDamage) {
                   damageDetails = this.applyDamage(attacker, targetEnemy, attacker.attack, {
                       ignoreDefense: context.ignoreDefense || 0
                   });
                   dealt = damageDetails.finalDamage;
                   attacker.attacksMade = (attacker.attacksMade || 0) + 1;
                   this.log({
                       type: 'damage_calculation',
                       level: 'detail',
                       attacker: attacker.name,
                       target: targetEnemy.name,
                       details: damageDetails,
                       message: `${attacker.name} damage calc`
                   });
               }
               context.damage = dealt;

               this.procEngine.trigger('on_hit', context);
               if (this.checkVictory()) return;

               // Re-evaluate potential targets in case the first enemy was defeated
               const remainingEnemies = this.combatants.filter(c => c.team !== attacker.team && c.currentHp > 0);
               const abilityTarget = ability && ability.targetType === 'friendly'
                   ? attacker
                   : remainingEnemies[0];

               if (ability && attacker.abilityCharges > 0 && attacker.currentEnergy >= cost && abilityTarget) {
                   console.log(`${attacker.name} spends ${cost} energy to use ${ability.name}.`);
                   this.applyAbilityEffect(attacker, abilityTarget, ability);
                   this.procEngine.trigger('on_ability_used', {
                       attacker,
                       defender: abilityTarget,
                       allCombatants: this.combatants,
                       applyDamage: this.applyDamage.bind(this),
                       applyStatus: this.applyStatusEffect.bind(this),
                       applyHeal: this.applyHeal.bind(this),
                       turnQueue: this.turnQueue
                   });
                   attacker.currentEnergy -= cost;
                   attacker.abilityCharges -= 1;
                   if (attacker.abilityCharges <= 0) {
                       const idx = attacker.deck.findIndex(a => a.charges > 0);
                       if (idx !== -1) {
                           const next = attacker.deck.splice(idx, 1)[0];
                           attacker.abilityData = next;
                           attacker.abilityCharges = next.charges;
                           if (attacker.team === 'player') {
                               this.finalPlayerState.equipped_ability_id = next.cardId;
                               this.log({ type: 'info', message: `${attacker.name} automatically equipped a new ${next.name} card!` });
                           }
                       } else {
                           attacker.abilityData = null;
                       }
                   }
               } else if (ability) {
                   console.log(`${attacker.name} has ${attacker.currentEnergy} energy and requires ${cost}. Unable to use ${ability.name}.`);
               }
           }
       }

       if (this.checkVictory()) return;
       attacker.currentEnergy = (attacker.currentEnergy || 0) + 1;
       if (
           this.isTutorial &&
           attacker.team === 'player' &&
           attacker.abilityData &&
           attacker.abilityCharges > 0 &&
           !this.abilityPauseShown &&
           attacker.currentEnergy >= (attacker.abilityData.energyCost || 1)
       ) {
           this.pendingPause = { type: 'PAUSE', reason: 'ABILITY_READY' };
           this.abilityPauseShown = true;
       }
  }



   *runGameSteps() {
       this.log({ type: 'start', message: '⚔️ --- Battle Starting --- ⚔️' });
       for (const c of this.combatants) {
           this.procEngine.trigger('on_combat_start', {
               attacker: c,
               defender: null,
               allCombatants: this.combatants,
               applyDamage: this.applyDamage.bind(this),
               applyStatus: this.applyStatusEffect.bind(this),
               applyHeal: this.applyHeal.bind(this),
               turnQueue: this.turnQueue
           });
       }
       let lastIndex = 0;
       yield { combatants: this.combatants.map(c => ({ ...c })), log: this.battleLog.slice(lastIndex) };
       lastIndex = this.battleLog.length;

       while (!this.isBattleOver) {
           this.startRound();
           if (this.battleLog.length > lastIndex) {
               yield { combatants: this.combatants.map(c => ({ ...c })), log: this.battleLog.slice(lastIndex) };
               lastIndex = this.battleLog.length;
           }
           while (this.turnQueue.length > 0 && !this.isBattleOver) {
               this.processTurn();
               if (this.battleLog.length > lastIndex) {
                   yield { combatants: this.combatants.map(c => ({ ...c })), log: this.battleLog.slice(lastIndex) };
                   lastIndex = this.battleLog.length;
               }
               if (this.pendingPause) {
                   const pause = this.pendingPause;
                   this.pendingPause = null;
                   yield pause;
               }
           }
       }
       this.log({ type: this.winner === 'player' ? 'victory' : 'defeat', message: '🏆 --- Battle Finished! --- 🏆' }, 'summary');
       if (this.battleLog.length > lastIndex) {
           yield { combatants: this.combatants.map(c => ({ ...c })), log: this.battleLog.slice(lastIndex) };
       }
   }

   runFullGame() {
       for (const _ of this.runGameSteps()) {
           // exhaust generator to completion
       }
       return {
           battleLog: this.battleLog,
           finalPlayerState: this.finalPlayerState
       };
   }
}

export default GameEngine;
