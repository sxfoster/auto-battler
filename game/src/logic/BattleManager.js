export function checkVictory(allies, enemies) {
  const playersAlive = allies.some(a => a.stats?.hp > 0 || a.hp > 0);
  const enemiesAlive = enemies.some(e => e.stats?.hp > 0 || e.hp > 0);
  return !playersAlive || !enemiesAlive;
}
