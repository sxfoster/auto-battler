// GameEngine handles simple auto-attack combat rounds

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
               this.applyDamage(attacker, target, attacker.attack);
           }
       }

       if (this.checkVictory()) return;
   }


   runFullGame() {
       this.log('⚔️ --- Battle Starting --- ⚔️');
       while (!this.isBattleOver) {
           this.roundCounter++;
           this.log(`\n**--- Round ${this.roundCounter} ---**`);
           this.turnQueue = this.computeTurnQueue();
           while(this.turnQueue.length > 0 && !this.isBattleOver){
               this.processTurn();
           }
       }
       this.log(`\n🏆 --- Battle Finished! --- 🏆`);
       return this.battleLog;
   }
}

module.exports = GameEngine;
