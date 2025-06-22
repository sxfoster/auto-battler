const { allPossibleMinions } = require('./data');

class GameEngine {
    constructor(combatants, eventEmitter) {
        this.combatants = combatants.map(c => ({ ...c }));
        this.turnQueue = [];
        this.battleLog = [];
        this.isBattleOver = false;
        this.winner = null;
        this.eventEmitter = eventEmitter;
    }

    log(message) {
        this.battleLog.push(message);
        console.log(message);
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

    calculateDamage(attacker, target, baseDamage) {
        let dmg = baseDamage;
        if (attacker.statusEffects.some(s => s.name === 'Attack Up')) dmg += 2;
        let block = target.block || 0;
        if (target.statusEffects.some(s => s.name === 'Defense Down')) block = Math.max(0, block - 1);
        if (target.statusEffects.some(s => s.name === 'Burn')) block = Math.max(0, block - 1);
        dmg = Math.max(1, dmg - block);
        if (target.statusEffects.some(s => s.name === 'Vulnerable')) dmg += 1;
        return dmg;
    }

    applyDamage(attacker, target, baseDamage) {
        const dmg = this.calculateDamage(attacker, target, baseDamage);
        target.currentHp = Math.max(0, target.currentHp - dmg);
        this.log(`${attacker.heroData.name} hits ${target.heroData.name} for ${dmg} damage.`);
        if (target.currentHp <= 0) {
            this.log(`${target.heroData.name} is defeated.`);
            this.turnQueue = this.turnQueue.filter(c => c.id !== target.id);
        }
    }

    applyStatus(target, statusName, turns) {
        const existing = target.statusEffects.find(s => s.name === statusName);
        if (existing) existing.turnsRemaining += turns;
        else target.statusEffects.push({ name: statusName, turnsRemaining: turns });
        this.log(`${target.heroData.name} is afflicted with ${statusName}!`);
    }

    processStatuses(combatant) {
        let skip = false;
        combatant.statusEffects.forEach(s => {
            switch (s.name) {
                case 'Poison':
                case 'Bleed':
                case 'Burn':
                    combatant.currentHp = Math.max(0, combatant.currentHp - 2);
                    this.log(`${combatant.heroData.name} suffers 2 ${s.name.toLowerCase()} damage.`);
                    break;
                default:
                    break;
            }
        });

        if (combatant.statusEffects.some(s => s.name === 'Stun')) {
            this.log(`${combatant.heroData.name} is stunned and misses the turn.`);
            skip = true;
        }
        if (!skip && combatant.statusEffects.some(s => s.name === 'Root')) {
            this.log(`${combatant.heroData.name} is rooted and cannot act.`);
            skip = true;
        }
        if (!skip && combatant.statusEffects.some(s => s.name === 'Confuse') && Math.random() < 0.5) {
            this.log(`${combatant.heroData.name} is confused and fumbles their turn.`);
            skip = true;
        }

        combatant.statusEffects = combatant.statusEffects
            .map(s => ({ ...s, turnsRemaining: s.turnsRemaining - 1 }))
            .filter(s => s.turnsRemaining > 0);

        return skip;
    }

    checkVictory() {
        const playerAlive = this.combatants.some(c => c.team === 'player' && c.currentHp > 0);
        const enemyAlive = this.combatants.some(c => c.team === 'enemy' && c.currentHp > 0);
        if (!playerAlive || !enemyAlive) {
            this.isBattleOver = true;
            this.winner = playerAlive ? 'player' : 'enemy';
            this.log(`--- Battle Over! Winner: ${this.winner} ---`);
            return true;
        }
        return false;
    }

    processTurn() {
        if (this.isBattleOver) return;
        if (this.turnQueue.length === 0) {
            this.turnQueue = this.computeTurnQueue();
        }
        const attacker = this.turnQueue.shift();
        if (!attacker || attacker.currentHp <= 0) {
            if (!this.checkVictory()) this.processTurn();
            return;
        }
        this.log(`\n--- Turn: ${attacker.heroData.name} ---`);
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
        this.log('--- Battle Starting ---');
        while (!this.isBattleOver) {
            this.processTurn();
        }
        this.log('--- Battle Finished ---');
    }
}

module.exports = GameEngine;
