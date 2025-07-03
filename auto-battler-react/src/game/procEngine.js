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
        this.onceMap = new Set();
    }

    // A central function to check for any procs that should activate.
    // context object contains all necessary info: attacker, defender, all combatants, etc.
    trigger(eventName, context) {
        const { attacker, defender } = context;
        const subjects = [attacker, defender].filter(Boolean);

        for (const combatant of subjects) {
            const equipment = [combatant.weaponData, combatant.armorData].filter(Boolean);
            for (const item of equipment) {
                if (!item.procs) continue;

                for (const proc of item.procs) {
                    if (proc.trigger !== eventName) continue;
                    if (!this.checkConditions(proc, context, combatant)) continue;

                    const key = `${combatant.id}-${item.id}-${proc.effect}`;
                    if (proc.once_per_combat && this.onceMap.has(key)) continue;
                    if (proc.once_per_combat) this.onceMap.add(key);

                    const prevOwner = context.owner;
                    const prevItem = context.item;
                    context.owner = combatant;
                    context.item = item;
                    this.executeEffect(proc, context);
                    context.owner = prevOwner;
                    context.item = prevItem;
                }
            }
        }
    }

    // Checks if all conditions for a proc are met.
    checkConditions(proc, context, owner) {
        if (!proc.condition) return true; // No conditions means it always passes.

        const { attacker, defender } = context;
        const actor = owner || attacker;

        if (proc.condition.first_attack && (actor.attacksMade || 0) > 0) return false;
        if (proc.condition.target_hp_below && (defender.currentHp / defender.maxHp) >= proc.condition.target_hp_below) return false;
        if (proc.condition.attacker_is_faster && attacker.speed <= defender.speed) return false;
        if (proc.condition.first_hit_taken && (owner.hitsTaken || 0) > 0) return false;

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
        const { attacker, defender, allCombatants, owner, item } = context;
        const actor = owner || attacker;

        const itemName = item ? `[${item.name}]` : 'Unknown Item';
        this.log({ type: 'proc', message: `✨ ${itemName} on ${actor.name} procs ${proc.effect}!` }, 'summary');

        switch (proc.effect) {
            case 'cleave': {
                const otherEnemies = allCombatants.filter(c => c.team !== actor.team && c.id !== defender.id && c.currentHp > 0);
                for (const enemy of otherEnemies) {
                    context.applyDamage(actor, enemy, proc.value);
                }
                break;
            }
            case 'apply_status':
                if (!proc.chance || Math.random() < proc.chance) {
                    context.applyStatus(defender, proc.status, proc.duration, { damage: proc.value });
                }
                break;
            case 'apply_status_to_attacker':
                if (!proc.chance || Math.random() < proc.chance) {
                    context.applyStatus(attacker, proc.status, proc.duration, { damage: proc.value });
                }
                break;
            case 'bonus_damage':
                if (!proc.chance || Math.random() < proc.chance) {
                    context.applyDamage(actor, defender, proc.value);
                }
                break;
            case 'double_damage':
                context.applyDamage(actor, defender, actor.attack);
                break;
            case 'recoil_damage':
                context.applyDamage(actor, actor, proc.value);
                break;
            case 'extra_attack':
                context.turnQueue.unshift(actor);
                break;
            case 'heal_self':
                context.applyHeal(actor, proc.value);
                break;
            case 'gain_energy':
                actor.currentEnergy = (actor.currentEnergy || 0) + proc.value;
                break;
            case 'modify_stat': {
                const target = proc.trigger === 'on_hit' && actor === attacker ? defender : actor;
                target[proc.stat] = (target[proc.stat] || 0) + proc.value;
                break;
            }
            case 'apply_buff_to_ally': {
                const ally = allCombatants.find(c => c.team === actor.team && c.id !== actor.id);
                if (ally) {
                    ally[proc.stat] = (ally[proc.stat] || 0) + proc.value;
                }
                break;
            }
            case 'aura_buff_allies': {
                const allies = allCombatants.filter(c => c.team === actor.team && c.id !== actor.id);
                for (const ally of allies) {
                    ally[proc.stat] = (ally[proc.stat] || 0) + proc.value;
                }
                break;
            }
            case 'reflect_damage':
                context.applyDamage(actor, attacker, proc.value);
                break;
            case 'ignore_damage':
            case 'nullify_damage':
                context.cancelDamage = true;
                break;
            case 'immune_to_status':
                if (context.statusName === proc.status) {
                    context.cancelStatus = true;
                }
                break;
            case 'block_ability':
                context.cancelAbility = true;
                break;
            case 'immune_to_damage_type':
                context.cancelDamage = true;
                break;
            case 'ignore_block':
                context.ignoreDefense = (context.ignoreDefense || 0) + proc.value;
                break;
            default:
                break;
        }
    }
}

export default ProcEngine;
