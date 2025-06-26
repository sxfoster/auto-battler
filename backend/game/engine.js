const { allPossibleMinions } = require('./data');

const MAX_ENERGY = 10;

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
       this.log(`💥 ${attacker.heroData.name} hits ${target.heroData.name} for ${baseDamage} damage.`);
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

               let actionToPerform = 'attack';
               let abilityToUse = null;

               if (attacker.deck && attacker.deck.length > 0) {
                   const usableAbilities = attacker.deck
                       .filter(ab => ab && attacker.currentEnergy >= ab.energyCost)
                       .sort((a, b) => b.energyCost - a.energyCost);

                   if (usableAbilities.length > 0) {
                       actionToPerform = 'ability';
                       abilityToUse = usableAbilities[0];
                   }
               }

               if (actionToPerform === 'ability') {
                   this.log(`${attacker.heroData.name} uses ${abilityToUse.name}!`);
                   attacker.currentEnergy -= abilityToUse.energyCost;

                   // Parse damage from effect text or fall back to attack value
                   const dmgMatch = abilityToUse.effect && abilityToUse.effect.match(/(\d+)/);
                   const base = dmgMatch ? parseInt(dmgMatch[1], 10) : attacker.attack;

                   // Handle summoning of minions
                   if (abilityToUse.summons) {
                       const keys = Array.isArray(abilityToUse.summons) ? abilityToUse.summons : [abilityToUse.summons];
                       keys.forEach(key => {
                           const template = allPossibleMinions[key];
                           if (!template) return;
                           const minion = {
                               id: `${attacker.id}-minion-${Math.random().toString(36).slice(2,8)}`,
                               heroData: { ...template },
                               weaponData: null,
                               armorData: null,
                               abilityData: null,
                               team: attacker.team,
                               position: this.combatants.filter(c => c.team === attacker.team).length,
                               currentHp: template.hp,
                               maxHp: template.hp,
                               attack: template.attack,
                               speed: template.speed,
                               currentEnergy: 0,
                               statusEffects: [],
                               isMinion: true
                           };
                           this.combatants.push(minion);
                           this.log(`🔹 ${attacker.heroData.name} summons a ${template.name}!`);
                       });
                       // Recompute queue so new units can act
                       this.turnQueue = this.computeTurnQueue();
                   }

                   // Determine targets
                   const abilityTargets = abilityToUse.target === 'ENEMIES'
                       ? this.combatants.filter(c => c.team !== attacker.team && c.currentHp > 0)
                       : [target];

                   abilityTargets.forEach(t => {
                       this.applyDamage(attacker, t, base);
                       if (abilityToUse.name === 'Shield Bash') {
                           t.statusEffects.push({ name: 'Stun' });
                           this.log(`💫 ${t.heroData.name} is stunned!`);
                       }
                   });
               } else {
                   this.log(`${attacker.heroData.name} performs a basic attack.`);
                   this.applyDamage(attacker, target, attacker.attack);
               }
           }
       }

       attacker.currentEnergy = Math.min(MAX_ENERGY, (attacker.currentEnergy || 0) + 1);

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
