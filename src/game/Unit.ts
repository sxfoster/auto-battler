import type { Ability } from './Ability';
import type { UnitManager } from './UnitManager';

export interface UnitConfig {
  id: string;
  name: string;
  health: number;
  maxMana: number;
  manaRegen?: number;
}

export class Unit {
  id: string;
  name: string;
  health: number;
  maxMana: number;
  mana: number;
  manaRegen: number;
  abilities: Ability[] = [];

  constructor(config: UnitConfig) {
    this.id = config.id;
    this.name = config.name;
    this.health = config.health;
    this.maxMana = config.maxMana;
    this.mana = 0;
    this.manaRegen = config.manaRegen ?? 1;
  }

  /** Gain mana and attempt to activate abilities */
  gainMana(amount: number, manager: UnitManager) {
    this.mana = Math.min(this.maxMana, this.mana + amount);
    this.checkAutoAbilities(manager);
  }

  /** Called each update tick to accumulate passive mana */
  tick(manager: UnitManager) {
    if (this.manaRegen > 0) {
      this.gainMana(this.manaRegen, manager);
    }
  }

  /**
   * Attempt to activate any auto-trigger abilities if enough mana
   */
  checkAutoAbilities(manager: UnitManager) {
    for (const ability of this.abilities) {
      if (ability.autoTrigger && this.mana >= ability.manaCost) {
        this.mana -= ability.manaCost;
        ability.execute(this, manager);
      }
    }
  }

  /** Assign a new ability */
  addAbility(ability: Ability) {
    this.abilities.push(ability);
  }
}
