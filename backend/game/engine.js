// GameEngine handles simple auto-attack combat rounds

let abilityCardService;
try {
    abilityCardService = require('../../discord-bot/src/utils/abilityCardService');
} catch (e) {
    abilityCardService = { decrementCharge: () => {} };
}

class GameEngine {
    constructor(combatants) {
        this.combatants = combatants.map(c => ({ ...c }));
        this.turnQueue = [];
        this.battleLog = [];
        this.isBattleOver = false;
        this.winner = null;
        this.roundCounter = 0;
    }

    log(entry) {
        if (typeof entry === 'string') {
            entry = { type: 'info', message: entry };
        }
        this.battleLog.push({ round: this.roundCounter, ...entry });
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

   applyDamage(attacker, target, baseDamage) {
       target.currentHp = Math.max(0, target.currentHp - baseDamage);
       if (attacker === target) {
           this.log({ type: 'damage', message: `${target.heroData.name} takes ${baseDamage} damage.` });
       } else {
           this.log({ type: 'damage', message: `${attacker.heroData.name} hits ${target.heroData.name} for ${baseDamage} damage.` });
       }
       if (target.currentHp <= 0) {
           this.log({ type: 'status', message: `💀 ${target.heroData.name} has been defeated.` });
       }
   }

   applyAbilityEffect(attacker, target, ability) {

       let damageDealt = 0;
       let healingDone = 0;
       let healTarget = null;
       let multiTarget = false;

       // check for multi-target damage phrases first
       const multiDamageMatch = ability.effect.match(/Deal (\d+) damage to (?:all|each) enemies/i);
       if (multiDamageMatch) {
           damageDealt = parseInt(multiDamageMatch[1], 10);
           multiTarget = true;
           const enemies = this.combatants.filter(c => c.team !== attacker.team && c.currentHp > 0);
           for (const enemy of enemies) {
               enemy.currentHp = Math.max(0, enemy.currentHp - damageDealt);
           }
       } else {
           const damageMatch = ability.effect.match(/Deal (\d+) damage/i);
           if (damageMatch) {
               damageDealt = parseInt(damageMatch[1], 10);
               target.currentHp = Math.max(0, target.currentHp - damageDealt);
           }
       }

       const healSelfMatch = ability.effect.match(/heal yourself for (\d+) HP/i);
       if (healSelfMatch) {
           healingDone = parseInt(healSelfMatch[1], 10);
           healTarget = attacker;
       } else {
           const generalHealMatch = ability.effect.match(/Heal .*? for (\d+) HP/i);
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
           this.log({ type: 'status', message: `↳ ${target.heroData.name} is blessed with Regrowth.` });
       }

       const poisonMatchDetailed = ability.effect.match(/apply Poison \((\d+) dmg\/turn for (\d+) turns\)/i);
       const poisonMatchSimple = ability.effect.match(/poison .* for (\d+) turns/i);
       if (poisonMatchDetailed || poisonMatchSimple) {
           const damage = poisonMatchDetailed ? parseInt(poisonMatchDetailed[1], 10) : 1;
           const turns = poisonMatchDetailed ? parseInt(poisonMatchDetailed[2], 10) : parseInt(poisonMatchSimple[1], 10);
           target.statusEffects.push({ name: 'Poison', damage, turnsRemaining: turns, sourceAbility: ability.name });
           this.log({ type: 'status', message: `↳ ${target.heroData.name} is poisoned.` });
       }

       // first log line - announce ability usage
       this.log({ type: 'ability-cast', message: `${attacker.heroData.name} uses ${ability.name}!` });

       // build description of the ability effects
       let descParts = [];
       if (damageDealt > 0) {
           if (multiTarget) {
               descParts.push(`hits all enemies for ${damageDealt} damage`);
           } else {
               descParts.push(`hits ${target.heroData.name} for ${damageDealt} damage`);
           }
       }
       if (healingDone > 0) {
           if (healTarget === attacker) {
               descParts.push(`heals for ${healingDone} HP`);
           } else if (healTarget) {
               descParts.push(`heals ${healTarget.heroData.name} for ${healingDone} HP`);
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

       const effectLine = `${attacker.heroData.name} ${descParts.join(' and ')}.`;
       this.log({ type: 'ability-result', message: effectLine });

       if (multiTarget && damageDealt > 0) {
           const enemies = this.combatants.filter(c => c.team !== attacker.team && c.currentHp <= 0);
           for (const enemy of enemies) {
               this.log({ type: 'status', message: `💀 ${enemy.heroData.name} has been defeated.` });
           }
       } else if (damageDealt > 0 && target.currentHp <= 0) {
           this.log({ type: 'status', message: `💀 ${target.heroData.name} has been defeated.` });
       }
   }

   startRound() {
       this.roundCounter++;
       this.log({ type: 'round', message: `--- Round ${this.roundCounter} ---` });
       this.turnQueue = this.computeTurnQueue();
   }

   processStatuses(combatant) {
       let skip = false;
       for (const effect of [...combatant.statusEffects]) {
           if (effect.name === 'Regrowth') {
               this.applyHeal(combatant, effect.healing);
               this.log({ type: 'status', message: `💚 ${combatant.heroData.name} is healed for ${effect.healing} by Regrowth.` });
           } else if (effect.name === 'Poison') {
               this.applyDamage(combatant, combatant, effect.damage);
               this.log({ type: 'status', message: `☣️ ${combatant.heroData.name} takes ${effect.damage} poison damage.` });
           }
           effect.turnsRemaining -= 1;
           if (effect.turnsRemaining <= 0) {
               combatant.statusEffects = combatant.statusEffects.filter(e => e !== effect);
               this.log({ type: 'status', message: `${effect.name} on ${combatant.heroData.name} has worn off.` });
           }
       }

       if (combatant.statusEffects.some(s => s.name === 'Stun')) {
           this.log({ type: 'status', message: `${combatant.heroData.name} is stunned and misses the turn.` });
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

       this.log({ type: 'turn', message: `> Turn: ${attacker.heroData.name} (${attacker.currentHp}/${attacker.maxHp} HP)` });

       const wasSkipped = this.processStatuses(attacker);
       if (this.checkVictory()) return;

       if (!wasSkipped) {
           const enemies = this.combatants.filter(c => c.team !== attacker.team && c.currentHp > 0);
           if (enemies.length > 0) {
               const ability = attacker.abilityData;
               const cost = ability ? ability.energyCost || 1 : 0;

               if (ability) {
                   console.log(`${attacker.heroData.name} is checking if they can use ${ability.name}.`);
               }

               // Always perform the auto-attack first
               this.applyDamage(attacker, enemies[0], attacker.attack);
               if (this.checkVictory()) return;

               // Re-evaluate potential targets in case the first enemy was defeated
               const remainingEnemies = this.combatants.filter(c => c.team !== attacker.team && c.currentHp > 0);
               const abilityTarget = ability && ability.targetType === 'friendly'
                   ? attacker
                   : remainingEnemies[0];

               if (ability && attacker.abilityCharges > 0 && attacker.currentEnergy >= cost && abilityTarget) {
                   console.log(`${attacker.heroData.name} spends ${cost} energy to use ${ability.name}.`);
                   this.applyAbilityEffect(attacker, abilityTarget, ability);
                   attacker.currentEnergy -= cost;
                   attacker.abilityCharges -= 1;
                   if (ability.cardId && !ability.isPractice) {
                       try { abilityCardService.decrementCharge(ability.cardId); } catch(e) { /* ignore */ }
                   }
                   if (attacker.abilityCharges <= 0) {
                       const idx = attacker.deck.findIndex(a => a.charges > 0);
                       if (idx !== -1) {
                           const next = attacker.deck.splice(idx, 1)[0];
                           attacker.abilityData = next;
                           attacker.abilityCharges = next.charges;
                       } else {
                           attacker.abilityData = null;
                       }
                   }
               } else if (ability) {
                   console.log(`${attacker.heroData.name} has ${attacker.currentEnergy} energy and requires ${cost}. Unable to use ${ability.name}.`);
               }
           }
       }

       if (this.checkVictory()) return;
       attacker.currentEnergy = (attacker.currentEnergy || 0) + 1;
   }



   *runGameSteps() {
       this.log({ type: 'start', message: '⚔️ --- Battle Starting --- ⚔️' });
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
           }
       }
       this.log({ type: this.winner === 'player' ? 'victory' : 'defeat', message: '🏆 --- Battle Finished! --- 🏆' });
       if (this.battleLog.length > lastIndex) {
           yield { combatants: this.combatants.map(c => ({ ...c })), log: this.battleLog.slice(lastIndex) };
       }
   }

   runFullGame() {
       for (const _ of this.runGameSteps()) {
           // exhaust generator to completion
       }
       return this.battleLog;
   }
}

module.exports = GameEngine;
