/**
 * Simplified snapshot of a single combatant used within {@link BattleStep}.
 */
export interface UnitState {
  /** Unique identifier for the unit */
  id: string
  /** Display name if available */
  name?: string
  /** Current hit points */
  hp: number
  /** Current energy or mana */
  energy?: number
  /** Active buffs keyed by id */
  buffs: Record<string, any>
  /** Team alignment */
  team?: 'party' | 'enemy'
}

/**
 * Represents a single atomic event during battle simulation.
 */
export interface BattleStep {
  /** Acting unit */
  actorId: string
  /** Type of action performed */
  actionType: 'playCard' | 'dealDamage' | 'applyBuff' | 'death' | 'startTurn' | 'endBattle'
  /** Additional details for the action */
  details: Record<string, any>
  /** Target unit ids */
  targets: string[]
  /** State of all units before the action */
  preState: UnitState[]
  /** State of all units after the action */
  postState: UnitState[]
  /** Human readable log message */
  logMessage: string
}

export type { UnitState as BattleUnitState }
