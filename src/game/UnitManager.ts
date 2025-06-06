import { Unit } from './Unit';
import { Ability } from './Ability';

export class UnitManager {
  units: Map<string, Unit> = new Map();

  addUnit(unit: Unit) {
    this.units.set(unit.id, unit);
  }

  getUnit(id: string): Unit | undefined {
    return this.units.get(id);
  }

  assignAbility(unitId: string, ability: Ability) {
    const unit = this.getUnit(unitId);
    if (unit) {
      unit.addAbility(ability);
    }
  }

  /** Update all units each tick */
  update() {
    for (const unit of this.units.values()) {
      unit.tick(this);
    }
  }
}
