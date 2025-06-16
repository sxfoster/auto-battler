export function processEffect(effect, attacker, target, scene) {
    switch (effect.type) {
        case 'DEAL_DAMAGE':
            scene._dealDamage(attacker, target, effect.amount, Math.random() < 0.1);
            break;
        case 'DEAL_DAMAGE_PERCENT':
            const dmg = Math.ceil((attacker.heroData.attack + attacker.weaponData.damage) * (effect.percent / 100));
            scene._dealDamage(attacker, target, dmg, Math.random() < 0.1);
            break;
        case 'HEAL':
            scene._heal(effect.targetSelf ? attacker : target, effect.amount);
            break;
        case 'APPLY_STATUS':
            scene._applyStatus(target, effect.status, effect.duration);
            break;
        case 'APPLY_STATUS_CHANCE':
            if (Math.random() < effect.chance) {
                scene._applyStatus(target, effect.status, effect.duration);
            }
            break;
        default:
            console.warn('Unknown effect type', effect);
    }
}
