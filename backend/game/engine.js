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

    log(message) {
        this.battleLog.push(message);
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
       this.log(`${attacker.heroData.name} hits ${target.heroData.name} for ${baseDamage} damage.`);
       if (target.currentHp <= 0) {
           this.log(`💀 ${target.heroData.name} has been defeated.`);
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

       let log = `${attacker.heroData.name} uses ${ability.name}`;
       if (damageDealt > 0) {
           if (multiTarget) {
               log += ` and hits all enemies for ${damageDealt} damage`;
           } else {
               log += ` and hits ${target.heroData.name} for ${damageDealt} damage`;
           }
       }
       if (healingDone > 0) {
           if (healTarget === attacker) {
               log += ` and is healed for ${healingDone} hit points.`;
           } else if (healTarget) {
               log += ` and heals ${healTarget.heroData.name} for ${healingDone} hit points.`;
           }
       } else {
           log += '.';
       }

       this.log(log);

       if (multiTarget && damageDealt > 0) {
           const enemies = this.combatants.filter(c => c.team !== attacker.team && c.currentHp <= 0);
           for (const enemy of enemies) {
               this.log(`💀 ${enemy.heroData.name} has been defeated.`);
           }
       } else if (damageDealt > 0 && target.currentHp <= 0) {
           this.log(`💀 ${target.heroData.name} has been defeated.`);
       }
   }

   startRound() {
       this.roundCounter++;
       this.log(`\n**--- Round ${this.roundCounter} ---**`);
       this.turnQueue = this.computeTurnQueue();
   }

   processStatuses(combatant) {
       let skip = false;
       if (combatant.statusEffects.some(s => s.name === 'Stun')) {
         this.log(`- ${combatant.heroData.name} is stunned and misses the turn.`);
         skip = true;
       }
       // Future status effect processing (poison, etc.) would go here.
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

       this.log(`\n**> Turn: ${attacker.heroData.name}** (${attacker.currentHp}/${attacker.maxHp} HP)`);

       const wasSkipped = this.processStatuses(attacker);
       if (this.checkVictory()) return;

       if (!wasSkipped) {
           const enemies = this.combatants.filter(c => c.team !== attacker.team && c.currentHp > 0);
           if (enemies.length > 0) {
               const ability = attacker.abilityData;
               const cost = ability ? ability.energyCost || 1 : 1;

               const abilityTarget = ability && ability.targetType === 'friendly'
                   ? attacker
                   : enemies[0];

               if (ability && attacker.abilityCharges > 0 && attacker.currentEnergy >= cost) {
                   this.applyAbilityEffect(attacker, abilityTarget, ability);
                   attacker.currentEnergy -= cost;
                   attacker.abilityCharges -= 1;
                   if (ability.cardId) {
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
               } else {
                   this.applyDamage(attacker, enemies[0], attacker.attack);
               }
           }
       }

       if (this.checkVictory()) return;
       attacker.currentEnergy = (attacker.currentEnergy || 0) + 1;
   }



   *runGameSteps() {
       this.log('⚔️ --- Battle Starting --- ⚔️');
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
       this.log(`\n🏆 --- Battle Finished! --- 🏆`);
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
