import type { Unit } from './BattleManager';

export interface AIContext {
  allies: Unit[];
  opponents: Unit[];
  round: number;
}

function selectTarget(opponents: Unit[]): Unit | null {
  if (!opponents.length) return null;
  return opponents.reduce((low, u) => (u.stats.hp < low.stats.hp ? u : low), opponents[0]);
}

function selectCard(unit: Unit): any {
  return unit.deck[0] || null;
}

export function decideAction(unit: Unit, context: AIContext) {
  const target = selectTarget(context.opponents);
  const action = selectCard(unit);
  return { action, target };
}
