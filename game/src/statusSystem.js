export const STATUS_META = {
  poison: { icon: '☠', color: '#88ff88' },
  stun: { icon: '💫', color: '#ff66ff' },
  defense: { icon: '🛡', color: '#99ccff' },
  attack: { icon: '⚔', color: '#ffcc66' },
  marked: { icon: '🎯', color: '#ff8844' },
}

export function addStatusEffect(target, { type, duration = 1, value = 0 }) {
  target.statusEffects = target.statusEffects || []
  const existing = target.statusEffects.find((s) => s.type === type)
  if (existing) {
    existing.duration = Math.max(existing.duration, duration)
    existing.value = (existing.value || 0) + value
  } else {
    target.statusEffects.push({ type, duration, value })
  }
}

export function getStatusValue(target, type) {
  return (target.statusEffects || [])
    .filter((s) => s.type === type)
    .reduce((sum, s) => sum + (s.value || 0), 0)
}

export function applyStatusTick(scene, combatant, showFloat) {
  combatant.statusEffects = combatant.statusEffects || []
  let skip = false
  const remaining = []
  combatant.statusEffects.forEach((eff) => {
    if (eff.type === 'poison') {
      combatant.hp -= eff.value
      showFloat(`-${eff.value}`, combatant, STATUS_META.poison.color)
    }
    if (eff.type === 'stun') {
      skip = true
      showFloat('Stunned', combatant, STATUS_META.stun.color)
    }
    eff.duration -= 1
    if (eff.duration > 0) {
      remaining.push(eff)
    } else {
      showFloat(`${eff.type} ends`, combatant, '#cccccc')
    }
  })
  combatant.statusEffects = remaining
  return skip
}
