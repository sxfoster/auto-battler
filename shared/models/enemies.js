import { sampleCards } from './cards.js'

export const enemies = [
  {
    id: 'goblin',
    name: 'Goblin',
    stats: { hp: 20, energy: 2, speed: 2 },
    deck: [sampleCards[0], sampleCards[3]],
    aiProfile: { behavior: 'aggressive', aggressiveness: 0.8 },
  },
  {
    id: 'skeleton',
    name: 'Skeleton',
    stats: { hp: 25, energy: 1, speed: 1 },
    deck: [sampleCards[0], sampleCards[4]],
    aiProfile: { behavior: 'aggressive', aggressiveness: 0.6 },
  },
]
