import { sampleCards } from './cards.js'

export const sampleCharacters = [
  {
    id: 'warrior',
    name: 'Warrior',
    class: 'Warrior',
    portrait: '',
    description: '',
    stats: { hp: 30, energy: 3, speed: 2 },
    deck: [sampleCards[0], sampleCards[3], sampleCards[0], sampleCards[0]],
    survival: { hunger: 0, thirst: 0, fatigue: 0 },
  },
  {
    id: 'cleric',
    name: 'Cleric',
    class: 'Cleric',
    portrait: '',
    description: '',
    stats: { hp: 25, energy: 3, speed: 1 },
    deck: [sampleCards[1], sampleCards[0], sampleCards[3], sampleCards[1]],
    survival: { hunger: 0, thirst: 0, fatigue: 0 },
  },
  {
    id: 'rogue',
    name: 'Rogue',
    class: 'Rogue',
    portrait: '',
    description: '',
    stats: { hp: 22, energy: 3, speed: 3 },
    deck: [sampleCards[0], sampleCards[4], sampleCards[0], sampleCards[5]],
    survival: { hunger: 0, thirst: 0, fatigue: 0 },
  },
]
