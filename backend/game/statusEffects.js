const STATUS_EFFECTS = {
  Stun: { name: 'Stun', icon: '⭐', type: 'debuff' },
  Poison: { name: 'Poison', icon: '☣️', type: 'debuff' },
  Confuse: { name: 'Confuse', icon: '❓', type: 'debuff' },
  'Defense Down': { name: 'Defense Down', icon: '🛡️', type: 'debuff' },
  'Armor Break': { name: 'Armor Break', icon: '🛡️', type: 'debuff' },
  'Attack Up': { name: 'Attack Up', icon: '⬆️', type: 'buff' },
  Fortify: { name: 'Fortify', icon: '🛡️', type: 'buff' },
  Regrowth: { name: 'Regrowth', icon: '💚', type: 'buff' },
  Slow: { name: 'Slow', icon: '🐢', type: 'debuff' }
};

module.exports = { STATUS_EFFECTS };
