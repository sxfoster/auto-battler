export interface Unit {
  id: string;
  name: string;
  team: 'player' | 'enemy';
  stats: { hp: number; speed: number; [key: string]: any };
  deck: any[];
  statusEffects?: { type: string; duration: number; value?: number }[];
}

export interface TurnResult {
  actor: Unit;
  target: Unit | null;
  action: any;
}

import { decideAction } from './AIController';
import { executeAction } from './CombatResolver';

export class BattleManager {
  private units: Unit[];
  private order: Unit[];
  private turnIndex = 0;
  round = 0;

  constructor(units: Unit[]) {
    this.units = units;
    this.order = [...units].sort((a, b) => b.stats.speed - a.stats.speed);
  }

  start() {
    this.round = 1;
    this.turnIndex = 0;
  }

  private advanceRound() {
    this.round += 1;
    this.turnIndex = 0;
    this.order = this.order.filter((u) => u.stats.hp > 0);
    this.order.sort((a, b) => b.stats.speed - a.stats.speed);
  }

  private nextUnit(): Unit | null {
    if (this.order.length === 0) return null;
    if (this.turnIndex >= this.order.length) {
      this.advanceRound();
    }
    return this.order[this.turnIndex++] || null;
  }

  step(): TurnResult | null {
    if (this.isFinished()) return null;
    const unit = this.nextUnit();
    if (!unit) return null;
    if (unit.stats.hp <= 0) return this.step();
    const opponents = this.order.filter((u) => u.team !== unit.team && u.stats.hp > 0);
    const allies = this.order.filter((u) => u.team === unit.team && u !== unit && u.stats.hp > 0);
    const decision = decideAction(unit, { allies, opponents, round: this.round });
    if (decision && decision.action && decision.target) {
      executeAction(unit, decision.target, decision.action);
      // remove dead units from order
      this.order = this.order.filter((u) => u.stats.hp > 0);
      return { actor: unit, target: decision.target, action: decision.action };
    }
    return { actor: unit, target: null, action: null };
  }

  isFinished(): boolean {
    const playersAlive = this.order.some((u) => u.team === 'player' && u.stats.hp > 0);
    const enemiesAlive = this.order.some((u) => u.team === 'enemy' && u.stats.hp > 0);
    return !(playersAlive && enemiesAlive);
  }

  run() {
    this.start();
    while (!this.isFinished()) {
      this.step();
    }
  }
}
