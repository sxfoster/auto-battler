export type AbilityEffect = (unit: Unit, manager: UnitManager) => void;

export interface AbilityConfig {
  id: string;
  name: string;
  manaCost: number;
  /** If true ability triggers automatically when mana is available */
  autoTrigger?: boolean;
  effect: AbilityEffect;
}

export class Ability {
  id: string;
  name: string;
  manaCost: number;
  autoTrigger: boolean;
  effect: AbilityEffect;

  constructor(config: AbilityConfig) {
    this.id = config.id;
    this.name = config.name;
    this.manaCost = config.manaCost;
    this.autoTrigger = Boolean(config.autoTrigger);
    this.effect = config.effect;
  }

  execute(unit: Unit, manager: UnitManager) {
    this.effect(unit, manager);
  }
}

// circular type imports
import type { Unit } from './Unit';
import type { UnitManager } from './UnitManager';
