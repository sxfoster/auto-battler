// Define UnitState first as BattleStep depends on it.
export interface UnitState {
  unitId: string;
  hp: number;
  // Add other relevant unit properties, e.g., statusEffects, resources
  statusEffects: Array<{ type: string; duration: number; value?: any }>;
  // Consider if other stats like attack, defense, speed should be here
  // For now, keeping it minimal based on current Unit interface in BattleManager
}

export interface BattleStep {
  actorId: string;
  actionType: 'playCard' | 'dealDamage' | 'applyBuff' | 'heal' | 'death' | 'summon' | 'statusEffectApply' | 'statusEffectTick' | 'generic'; // Added more action types
  details: Record<string, any>; // e.g., cardId, abilityId, damageAmount, buffDetails
  targets: string[]; // Array of unit IDs
  preState: UnitState[]; // States of all units involved before the action
  postState: UnitState[]; // States of all units involved after the action
  logMessage: string; // Human-readable log message
  timestamp?: number; // Optional: for ordering or replay
}

// It might be useful to also export a type for ActionType for easier use elsewhere
export type BattleActionType = BattleStep['actionType'];
