import { dungeonEvents } from '../models/events.js'

/**
 * Assigns a random dungeon event to a floor, based on the floor's biome and an optional event pool.
 * The chosen event is deep cloned and set as the `activeEvent` on the floor object.
 *
 * @param {{ biome: string, activeEvent?: any }} floor - The floor object to assign an event to. This object is mutated.
 * @param {import('../models').DungeonEvent[]} [eventPool=dungeonEvents] - An optional pool of dungeon events to choose from. Defaults to all dungeonEvents.
 * @returns {import('../models').DungeonEvent | null} The chosen event object, or null if no eligible event is found.
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
 * A map of event effect type handlers. Each handler function takes an event and a context object,
 * and applies the event's specific effect based on the context's phase and other properties.
 * Supported effects include `missChance`, `doubleCastChance`, and `periodicDamage`.
 *
 * @type {Object.<string, function(event: import('../models').DungeonEvent, context: any): void>}
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

/**
 * Applies the effects of a given dungeon event based on the current game context.
 * It looks up the appropriate handler in `eventEffectHandlers` based on `event.effectType`
 * and executes it.
 *
 * @param {import('../models').DungeonEvent} event - The dungeon event whose effects are to be applied.
 * @param {any} context - The current game context object. This object may be mutated by the event handler.
 *                        Expected properties on context can vary based on `event.effectType` and `context.phase`.
 *                        Common context properties include `phase` (e.g., 'beforeCard', 'afterCard', 'turnStart'),
 *                        `cancel` (boolean, to cancel an action), `repeat` (boolean, to repeat an action),
 *                        `isFirstCard` (boolean), `turn` (number), `party` (Character[]), `enemies` (Enemy[]).
 */
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
 * Removes the active event from a floor by setting its `activeEvent` property to null.
 *
 * @param {{ activeEvent?: any }} floor - The floor object to remove the event from. This object is mutated.
 */
export function removeEventFromFloor(floor) {
  floor.activeEvent = null
}
