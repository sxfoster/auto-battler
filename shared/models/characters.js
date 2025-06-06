import { sampleCards } from './cards.js'
import { classes } from './classes.js'

export const Class = {
  Guardian: 'Guardian',
  Warrior: 'Warrior',
  RunestoneSentinel: 'RunestoneSentinel',
  Cleric: 'Cleric',
  Herbalist: 'Herbalist',
  Bloodweaver: 'Bloodweaver',
  Bard: 'Bard',
  Chronomancer: 'Chronomancer',
  TotemWarden: 'TotemWarden',
  Blademaster: 'Blademaster',
  Wizard: 'Wizard',
  Shadowblade: 'Shadowblade',
  Ranger: 'Ranger',
  Pyromancer: 'Pyromancer',
}

export const sampleCharacters = [
  {
    id: 'warrior',
    name: 'Warrior',
    class: Class.Warrior,
    portrait: '',
    description: '',
    stats: { hp: 30, energy: 3, speed: 2 },
    deck: [sampleCards[0], sampleCards[3], sampleCards[0], sampleCards[0]],
    survival: { hunger: 0, thirst: 0, fatigue: 0 },
  },
  {
    id: 'cleric',
    name: 'Cleric',
    class: Class.Cleric,
    portrait: '',
    description: '',
    stats: { hp: 25, energy: 3, speed: 1 },
    deck: [sampleCards[1], sampleCards[0], sampleCards[3], sampleCards[1]],
    survival: { hunger: 0, thirst: 0, fatigue: 0 },
  },
  {
    id: 'blademaster',
    name: 'Blademaster',
    class: Class.Blademaster,
    portrait: '',
    description: '',
    stats: { hp: 22, energy: 3, speed: 3 },
    deck: [sampleCards[0], sampleCards[4], sampleCards[0], sampleCards[5]],
    survival: { hunger: 0, thirst: 0, fatigue: 0 },
  },
]
