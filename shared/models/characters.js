import { sampleCards } from './cards.js'
import { classes } from './classes.js'
const clericPortrait = new URL('../images/cleric-portrait.png', import.meta.url).href
const warriorPortrait = new URL('../images/warrior-portrait.png', import.meta.url).href
const blademasterPortrait = new URL('../images/blademaster-portrait.png', import.meta.url).href
const defaultPortrait = new URL('../images/default-portrait.png', import.meta.url).href

export const Class = {
  Guardian: 'guardian',
  Warrior: 'warrior',
  RunestoneSentinel: 'runestone-sentinel',
  Cleric: 'cleric',
  Herbalist: 'herbalist',
  Bloodweaver: 'bloodweaver',
  Bard: 'bard',
  Chronomancer: 'chronomancer',
  TotemWarden: 'totem-warden',
  Blademaster: 'blademaster',
  Wizard: 'wizard',
  Shadowblade: 'shadowblade',
  Ranger: 'ranger',
  Pyromancer: 'pyromancer',
}

export const sampleCharacters = [
  {
    id: 'warrior',
    name: 'Warrior',
    class: Class.Warrior,
    portrait: warriorPortrait,
    description: '',
    stats: { hp: 30, energy: 3, speed: 2 },
    deck: [sampleCards[0], sampleCards[3], sampleCards[0], sampleCards[0]],
    survival: { hunger: 0, thirst: 0, fatigue: 0 },
  },
  {
    id: 'cleric',
    name: 'Cleric',
    class: Class.Cleric,
    portrait: clericPortrait,
    description: '',
    stats: { hp: 25, energy: 3, speed: 1 },
    deck: [sampleCards[1], sampleCards[0], sampleCards[3], sampleCards[1]],
    survival: { hunger: 0, thirst: 0, fatigue: 0 },
  },
  {
    id: 'blademaster',
    name: 'Blademaster',
    class: Class.Blademaster,
    portrait: blademasterPortrait,
    description: '',
    stats: { hp: 22, energy: 3, speed: 3 },
    deck: [sampleCards[0], sampleCards[4], sampleCards[0], sampleCards[5]],
    survival: { hunger: 0, thirst: 0, fatigue: 0 },
  },
]
