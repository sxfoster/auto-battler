export interface Unit {
  id: string;
  name: string;
  team: 'player' | 'enemy';
  stats: { hp: number; speed: number; [key: string]: any };
  deck: any[];
  statusEffects?: { type: string; duration: number; value?: number }[];
}

import { decideAction } from './AIController';
import { executeAction, Card } from './CombatResolver'; // Added Card
import { BattleStep, UnitState, BattleActionType } from '../../shared/models/BattleLog'; // Added BattleLog imports

// Helper function to convert Unit to UnitState
function unitToUnitState(unit: Unit): UnitState {
  return {
    unitId: unit.id,
    hp: unit.stats.hp,
    statusEffects: JSON.parse(JSON.stringify(unit.statusEffects || [])), // Deep copy
  };
}

export class BattleManager {
  private units: Unit[];
  private order: Unit[];
  private battleLog: BattleStep[] = []; // Added battleLog field
  private turnIndex = 0;
  round = 0;

  constructor(units: Unit[]) {
    this.units = units;
    this.order = [...units].sort((a, b) => b.stats.speed - a.stats.speed);
  }

  start() {
    this.round = 1;
    this.turnIndex = 0;
    this.battleLog = []; // Initialize/reset the log
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

  step(): BattleStep | null { // Changed return type
    if (this.isFinished()) return null;
    const unit = this.nextUnit();
    if (!unit) return null;
    if (unit.stats.hp <= 0) {
      // If a unit is dead, we might want to generate a 'death' BattleStep or just skip.
      // For now, let's skip, but this is a point for future refinement.
      // However, to ensure the turn advances and state changes are captured if desired,
      // we might need a minimal BattleStep here or adjust turn advancement.
      // For now, advancing the turn by calling step() again.
      return this.step();
    }

    // Capture pre-action states of ALL units in the order
    const preActionStates: UnitState[] = this.order.map(u => unitToUnitState(u));

    const opponents = this.order.filter((u) => u.team !== unit.team && u.stats.hp > 0);
    const allies = this.order.filter((u) => u.team === unit.team && u !== unit && u.stats.hp > 0);

    const decision = decideAction(unit, { allies, opponents, round: this.round });

    let battleStep: BattleStep | null = null;

    if (decision && decision.action && decision.target) {
      // It's important to capture pre-state of specific targets if executeAction mutates them directly
      // However, preActionStates already has a snapshot of all units.

      executeAction(unit, decision.target, decision.action);

      // Capture post-action states of ALL units
      // Important: capture postState before filtering dead units from this.order
      const postActionStates: UnitState[] = this.order.map(u => unitToUnitState(u));

      // Determine actionType - simplified for now
      let actionType: BattleActionType = 'playCard';
      // Basic logic to refine actionType based on card effects (can be expanded)
      if (decision.action.effects && decision.action.effects.some(e => e.type === 'damage')) {
          actionType = 'dealDamage';
      } else if (decision.action.effects && decision.action.effects.some(e => e.type === 'heal')) {
          actionType = 'heal';
      } // etc. for other types

      battleStep = {
        actorId: unit.id,
        actionType: actionType,
        details: {
          cardId: decision.action.id,
          cardName: decision.action.name,
          // We might want to add effect details here later
        },
        targets: decision.target ? [decision.target.id] : [],
        preState: preActionStates, // Contains state of all units
        postState: postActionStates, // Contains state of all units
        logMessage: `${unit.name} used ${decision.action.name} on ${decision.target.name}.`,
        timestamp: Date.now(), // Optional: add a timestamp
      };
    } else {
      // Handle cases where no action is taken (e.g., unit is stunned or no valid target)
      // Create a BattleStep for this scenario, e.g., actionType 'noAction' or 'skipTurn'
      const postActionStates: UnitState[] = this.order.map(u => unitToUnitState(u)); // Still need postState
      battleStep = {
          actorId: unit.id,
          actionType: 'generic', // Or a new type like 'noAction'
          details: { reason: decision && !decision.action ? "No action found" : "No target or other reason" },
          targets: [],
          preState: preActionStates,
          postState: postActionStates,
          logMessage: `${unit.name} took no action.`,
          timestamp: Date.now(),
      };
    }

    // Ensure order is updated if units died, AFTER postActionStates is captured
    this.order = this.order.filter((u) => u.stats.hp > 0);

    if (battleStep) {
      this.battleLog.push(battleStep);
    }
    return battleStep;
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

  public getBattleLog(): BattleStep[] {
    return this.battleLog;
  }
}
