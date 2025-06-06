import { Role, Class } from './Card.js'; // Import Role and Class enums

/** @type {{name: import('./Card').Class, description: string, role: import('./Card').Role, allowedCards: string[]}[]} */
export const classes = [
  {
    name: Class.Warrior,
    description: 'Stalwart frontline fighter.',
    role: Role.Tank,
    allowedCards: ['strike'], // IDs of cards
  },
  {
    name: Class.Cleric,
    description: 'Devout healer who mends wounds.',
    role: Role.Healer,
    allowedCards: ['heal'],
  },
  {
    name: Class.Bard,
    description: 'Supportive musician boosting allies.',
    role: Role.Support,
    allowedCards: ['inspire'],
  },
  {
    name: Class.Blademaster,
    description: 'High damage melee specialist.',
    role: Role.DPS,
    allowedCards: ['strike'],
  },
  // Add other classes from the Class enum in Card.ts if they have specific definitions here
  // For example, if Guardian has specific allowedCards:
  // {
  //   name: Class.Guardian,
  //   description: 'A protector who excels at mitigating damage.',
  //   role: Role.Tank, // Assuming Guardian is a Tank
  //   allowedCards: ['block', 'taunt'],
  // },
];
