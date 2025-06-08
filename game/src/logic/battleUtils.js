export function chooseTarget(units) {
  const alive = units.filter(u => u.currentHp > 0);
  if (alive.length === 0) return null;
  return alive[Math.floor(Math.random() * alive.length)];
}

export function applyCardEffects(attacker, defender, card) {
  const effects = [];
  if (card.effect) effects.push(card.effect);
  if (Array.isArray(card.effects)) effects.push(...card.effects);
  let damage = 0;
  let heal = 0;
  for (const eff of effects) {
    const amount = eff.magnitude ?? eff.value ?? 0;
    if (eff.type === 'damage') damage += amount;
    if (eff.type === 'heal') heal += amount;
  }
  return { damage, heal };
}

export { shuffleArray } from '../utils/shuffleArray.js';
