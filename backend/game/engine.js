// GameEngine handles simple auto-attack combat rounds

const abilityCardService = require('../../discord-bot/src/utils/abilityCardService');

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

   applyDamage(attacker, target, baseDamage) {
       target.currentHp = Math.max(0, target.currentHp - baseDamage);
       this.log(`${attacker.heroData.name} hits ${target.heroData.name} for ${baseDamage} damage.`);
       if (target.currentHp <= 0) {
           this.log(`💀 ${target.heroData.name} has been defeated.`);
       }
   }

   startRound() {
       this.roundCounter++;
       this.log(`\n**--- Round ${this.roundCounter} ---**`);
       this.combatants.forEach(c => {
           if (c.currentHp > 0) {
               c.currentEnergy = (c.currentEnergy || 0) + 1;
           }
       });
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
           const targets = this.combatants.filter(c => c.team !== attacker.team && c.currentHp > 0);
           if (targets.length > 0) {
               const target = targets[0];
               const ability = attacker.abilityData;
               const cost = ability ? ability.energyCost || 1 : 1;
               if (ability && attacker.abilityCharges > 0 && attacker.currentEnergy >= cost) {
                   this.log(`${attacker.heroData.name} uses ${ability.name}!`);
                   this.applyDamage(attacker, target, attacker.attack);
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
                   this.applyDamage(attacker, target, attacker.attack);
               }
           }
       }

       if (this.checkVictory()) return;
   }


   runFullGame() {
       this.log('⚔️ --- Battle Starting --- ⚔️');
       while (!this.isBattleOver) {
           this.startRound();
           while(this.turnQueue.length > 0 && !this.isBattleOver){
               this.processTurn();
           }
       }
       this.log(`\n🏆 --- Battle Finished! --- 🏆`);
       return this.battleLog;
   }
}

module.exports = GameEngine;
