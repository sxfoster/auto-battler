export const STATUS_DATA = {
  Stun: { icon: 'fas fa-star', description: 'Skips the next action.' },
  Poison: { icon: 'fas fa-skull-crossbones', description: 'Takes 2 damage per turn.' },
  Bleed: { icon: 'fas fa-droplet', description: 'Takes 1 damage per turn and healing is halved.' },
  Burn: { icon: 'fas fa-fire-alt', description: 'Takes 3 damage per turn and suffers -1 defense.' },
  Slow: { icon: 'fas fa-hourglass-half', description: 'Speed reduced by 1.' },
  Confuse: { icon: 'fas fa-question', description: '50% chance to miss actions.' },
  Root: { icon: 'fas fa-tree', description: 'Cannot act next turn.' },
  Shock: { icon: 'fas fa-bolt', description: '50% chance to fail casting abilities.' },
  Vulnerable: { icon: 'fas fa-crosshairs', description: 'Takes +1 damage from all sources.' },
  'Defense Down': { icon: 'fas fa-shield-slash', description: 'Defense is reduced by 1.' },
  'Attack Up': { icon: 'fas fa-arrow-up', description: 'Attack power increased.' },
  Fortify: { icon: 'fas fa-arrow-up', description: 'Defense increased.' }
};
