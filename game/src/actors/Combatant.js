export class Combatant {
  constructor({ id, name, stats = {}, deck = [] }) {
    this.id = id;
    this.name = name;
    this.stats = stats;
    this.deck = deck.slice();
    this.hand = [];
    this.currentEnergy = stats.mana ?? stats.energy ?? 0;
  }

  gainEnergy(amount = 1) {
    const max = this.stats.mana ?? this.stats.energy ?? this.stats.maxMana ?? Infinity;
    this.currentEnergy = Math.min(max, this.currentEnergy + amount);
  }

  drawCard() {
    if (this.deck.length === 0) return null;
    const card = this.deck.shift();
    this.hand.push(card);
    return card;
  }
}
