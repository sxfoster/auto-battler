// ProcEngine: Handles the triggering of special effects from equipment.

class ProcEngine {
    constructor(battleLog) {
        this.log = (entry, level = 'detail') => {
            if (typeof entry === 'string') {
                entry = { type: 'info', message: entry };
            }
            battleLog.push({ round: this.roundCounter, level, ...entry });
        };
        this.roundCounter = 0;
    }

    // A central function to check for any procs that should activate.
    // context object contains all necessary info: attacker, defender, all combatants, etc.
    trigger(eventName, context) {
        const { attacker, defender } = context;
        const allCombatants = [attacker, defender].filter(Boolean);

        for (const combatant of allCombatants) {
            const equipment = [combatant.weaponData, combatant.armorData].filter(Boolean);
            for (const item of equipment) {
                if (!item.procs) continue;

                for (const proc of item.procs) {
                    if (proc.trigger === eventName && this.checkConditions(proc, context)) {
                        this.executeEffect(proc, context);
                    }
                }
            }
        }
    }

    // Checks if all conditions for a proc are met.
    checkConditions(proc, context) {
        if (!proc.condition) return true; // No conditions means it always passes.

        const { attacker, defender } = context;

        if (proc.condition.first_attack && (attacker.attacksMade || 0) > 0) return false;
        if (proc.condition.target_hp_below && (defender.currentHp / defender.maxHp) >= proc.condition.target_hp_below) return false;
        if (proc.condition.attacker_is_faster && attacker.speed <= defender.speed) return false;

        if (proc.condition.target_has_status) {
            const hasStatus = proc.condition.target_has_status.some(status =>
                defender.statusEffects.some(e => e.name === status)
            );
            if (!hasStatus) return false;
        }

        // Add more condition checks here as needed...

        return true;
    }

    // Executes the proc's effect.
    executeEffect(proc, context) {
        const { attacker, defender, allCombatants } = context;

        this.log({ type: 'proc', message: `✨ ${attacker.name}'s ${proc.effect} procs!` }, 'summary');

        switch (proc.effect) {
            case 'cleave': {
                const otherEnemies = allCombatants.filter(c => c.team !== attacker.team && c.id !== defender.id && c.currentHp > 0);
                for (const enemy of otherEnemies) {
                    context.applyDamage(attacker, enemy, proc.value);
                }
                break;
            }
            case 'apply_status':
                if (!proc.chance || Math.random() < proc.chance) {
                    context.applyStatus(defender, proc.status, proc.duration, { damage: proc.value });
                }
                break;
            case 'bonus_damage':
                if (!proc.chance || Math.random() < proc.chance) {
                    context.applyDamage(attacker, defender, proc.value);
                }
                break;
            case 'apply_status_to_attacker':
                if (!proc.chance || Math.random() < proc.chance) {
                    context.applyStatus(attacker, proc.status, proc.duration, { damage: proc.value });
                }
                break;
            default:
                if (!proc.chance || Math.random() < proc.chance) {
                    context.applyStatus(defender, proc.effect, proc.duration, { amount: proc.amount });
                }
                break;
            // Add more effect handlers here...
        }
    }
}

module.exports = ProcEngine;
