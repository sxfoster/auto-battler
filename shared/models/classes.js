export const Role = {
  Tank: 'Tank',
  Healer: 'Healer',
  Support: 'Support',
  DPS: 'DPS',
}

export const classes = [
  {
    name: 'Warrior',
    description: 'Stalwart frontline fighter.',
    role: Role.Tank,
    allowedCards: ['strike'],
  },
  {
    name: 'Cleric',
    description: 'Devout healer who mends wounds.',
    role: Role.Healer,
    allowedCards: ['heal'],
  },
  {
    name: 'Bard',
    description: 'Supportive musician boosting allies.',
    role: Role.Support,
    allowedCards: ['inspire'],
  },
  {
    name: 'Blademaster',
    description: 'High damage melee specialist.',
    role: Role.DPS,
    allowedCards: ['strike'],
  },
]
