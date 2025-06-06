export class InitiativeQueue {
  constructor() {
    this.queue = [];
  }

  /**
   * Add a unit with a delay before their next action.
   * @param {object} unit - The acting combatant
   * @param {number} delay - Time in ms until the unit acts
   */
  add(unit, delay) {
    this.queue.push({ unit, delay });
    this.queue.sort((a, b) => a.delay - b.delay);
  }

  /**
   * Update all queued entries, subtracting delta time from their delay.
   * @param {number} delta - Time elapsed since last update in ms
   */
  update(delta) {
    this.queue.forEach((entry) => {
      entry.delay -= delta;
    });
    this.queue.sort((a, b) => a.delay - b.delay);
  }

  /**
   * Get units ready to act (delay <= 0).
   * @returns {{ unit: any, delay: number }[]}
   */
  getReadyUnits() {
    return this.queue.filter((entry) => entry.delay <= 0);
  }

  /**
   * Remove a unit from the queue.
   * @param {object} unit
   */
  remove(unit) {
    this.queue = this.queue.filter((entry) => entry.unit !== unit);
  }
}
