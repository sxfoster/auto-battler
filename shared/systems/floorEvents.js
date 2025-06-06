import { dungeonEvents } from '../models/events.js'

/**
 * Assign a random event eligible for the floor's biome
 * @param {{ biome: string, activeEvent?: any }} floor
 * @param {import('../models').DungeonEvent[]} [eventPool]
 */
export function assignRandomEventToFloor(floor, eventPool = dungeonEvents) {
  const pool = eventPool.filter(
    (e) => !e.biomeEligibility || e.biomeEligibility.includes(floor.biome)
  )
  if (pool.length === 0) {
    floor.activeEvent = null
    return null
  }
  const chosen = pool[Math.floor(Math.random() * pool.length)]
  floor.activeEvent = JSON.parse(JSON.stringify(chosen))
  return chosen
}

/**
 * Apply event effects to the provided context.
 * Only a subset of effect types are implemented for the demo.
 * @param {import('../models').DungeonEvent} event
 * @param {any} context
 */
const eventEffectHandlers = {
  missChance: (event, context) => {
    if (context.phase === 'beforeCard') {
      const chance = event.effectDetails?.chance || 0;
      if (Math.random() < chance) {
        context.cancel = true;
        console.log(`Event ${event.name} triggered miss chance.`);
      }
    }
  },
  doubleCastChance: (event, context) => {
    if (context.phase === 'afterCard' && context.isFirstCard) {
      const chance = event.effectDetails?.chance || 0;
      if (Math.random() < chance) {
        context.repeat = true;
        console.log(`Event ${event.name} triggered double cast.`);
      }
    }
  },
  periodicDamage: (event, context) => {
    if (context.phase === 'turnStart') {
      const { interval = 0, value = 0, target = 'party' } =
        event.effectDetails || {};
      if (interval && context.turn % interval === 0) {
        const group = target === 'enemy' ? context.enemies : context.party;
        if (group && group.length) {
          const idx = Math.floor(Math.random() * group.length);
          if (group[idx] && typeof group[idx].hp === 'number') {
            group[idx].hp = Math.max(0, group[idx].hp - value);
            console.log(`Event ${event.name} dealt ${value} damage to ${target} member ${idx}.`);
          }
        }
      }
    }
  },
  // Example for a new effect type:
  // resourceGain: (event, context) => {
  //   if (context.phase === 'turnEnd') {
  //     const { resource = 'energy', value = 0, target = 'party' } = event.effectDetails || {};
  //     const group = target === 'enemy' ? context.enemies : context.party;
  //     if (group && group.length) {
  //       group.forEach(member => {
  //         if (member && typeof member[resource] === 'number') {
  //           member[resource] += value;
  //           console.log(`Event ${event.name} granted ${value} ${resource} to ${target}.`);
  //         }
  //       });
  //     }
  //   }
  // },
};

export function applyEventEffects(event, context) {
  if (!event || !event.effectType) return;

  const handler = eventEffectHandlers[event.effectType];
  if (handler) {
    handler(event, context);
  } else {
    // Optionally log or handle unimplemented effect types
    // console.warn(`No handler for event effect type: ${event.effectType}`);
  }
}

/**
 * Remove the active event from a floor
 * @param {{ activeEvent?: any }} floor
 */
export function removeEventFromFloor(floor) {
  floor.activeEvent = null
}
