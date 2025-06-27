class AbilityCardService {
  constructor() {
    this.inventories = new Map();
  }

  /**
   * Assign an inventory of ability cards to a combatant.
   * Each card is an object: { id, abilityId, abilityData, charges }
   */
  setInventory(combatantId, cards) {
    this.inventories.set(combatantId, cards);
  }

  /**
   * Consume one charge from the combatant's equipped card.
   * If the equipped card has no charges, attempt to swap in another copy with
   * remaining charges. Returns true if a charge was consumed and the ability
   * should fire, otherwise false.
   */
  useCharge(combatant) {
    const inv = this.inventories.get(combatant.id);
    if (!inv || !combatant.equippedCardId) return false;

    let card = inv.find(c => c.id === combatant.equippedCardId);
    if (!card) return false;

    if (card.charges <= 0) {
      const replacement = inv.find(c => c.abilityId === card.abilityId && c.charges > 0);
      if (!replacement) return false;
      combatant.equippedCardId = replacement.id;
      card = replacement;
    }

    if (card.charges <= 0) return false;
    card.charges -= 1;

    if (card.charges <= 0) {
      const replacement = inv.find(c => c.abilityId === card.abilityId && c.charges > 0);
      if (replacement) {
        combatant.equippedCardId = replacement.id;
      }
    }

    return true;
  }
}

module.exports = new AbilityCardService();
