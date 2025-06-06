import { sampleCards } from './cards.js';
// import { classes } from './classes.js'; // classes import seems unused here, consider removing if not needed for other logic
import { Class } from './Card.js'; // Import Class enum from Card.ts

/** @type {import('./Character').Character[]} */
export const sampleCharacters = [
  {
    id: 'warrior_01', // Changed id to be more unique if there were multiple warriors
    name: 'Valerius',
    class: Class.Warrior,
    portrait: 'portraits/valerius_warrior.png',
    description: 'A stalwart warrior, known for his unyielding defense and powerful blows. He seeks glory and treasure in the dark depths.',
    stats: { hp: 30, energy: 3, attack: 7, defense: 5, speed: 2 }, // Added attack/defense
    deck: [sampleCards.find(c => c.id === 'strike'), sampleCards.find(c => c.id === 'iron_sword'), sampleCards.find(c => c.id === 'strike'), sampleCards.find(c => c.id === 'strike')],
    survival: { hunger: 0, thirst: 0, fatigue: 0 },
  },
  {
    id: 'cleric_01',
    name: 'Seraphina',
    class: Class.Cleric,
    portrait: 'portraits/seraphina_cleric.png',
    description: 'A devoted cleric wielding the power of light to mend wounds and smite darkness. She adventures to bring solace to the afflicted.',
    stats: { hp: 25, energy: 3, attack: 4, defense: 3, speed: 1 },
    deck: [sampleCards.find(c => c.id === 'heal'), sampleCards.find(c => c.id === 'strike'), sampleCards.find(c => c.id === 'iron_sword'), sampleCards.find(c => c.id === 'heal')],
    survival: { hunger: 0, thirst: 0, fatigue: 0 },
  },
  {
    id: 'blademaster_01',
    name: 'Kael',
    class: Class.Blademaster,
    portrait: 'portraits/kael_blademaster.png',
    description: 'A swift blademaster whose flashing strikes carve through enemies. He dances with death, seeking the ultimate challenge.',
    stats: { hp: 22, energy: 3, attack: 8, defense: 2, speed: 3 },
    deck: [sampleCards.find(c => c.id === 'strike'), sampleCards.find(c => c.id === 'herb'), sampleCards.find(c => c.id === 'strike'), sampleCards.find(c => c.id === 'bread')], // Blademaster using herb and bread? Might need more thematic cards
    survival: { hunger: 0, thirst: 0, fatigue: 0 },
  },
]
