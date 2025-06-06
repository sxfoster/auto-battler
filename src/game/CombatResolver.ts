import type { Unit } from './BattleManager';

export interface Effect {
  type: string;
  magnitude?: number;
  value?: number;
  target?: 'self' | 'enemy';
}

export interface Card {
  id: string;
  name: string;
  effects: Effect[];
}

export function executeAction(actor: Unit, target: Unit, card: Card) {
  for (const eff of card.effects) {
    if (eff.type === 'damage') {
      target.stats.hp -= eff.magnitude ?? eff.value ?? 0;
    }
    if (eff.type === 'heal') {
      const healTarget = eff.target === 'self' ? actor : target;
      healTarget.stats.hp += eff.magnitude ?? eff.value ?? 0;
    }
    if (eff.type === 'status') {
      const tgt = eff.target === 'self' ? actor : target;
      tgt.statusEffects = tgt.statusEffects || [];
      tgt.statusEffects.push({
        type: 'status',
        duration: eff.magnitude ?? 1,
      });
    }
  }
}
