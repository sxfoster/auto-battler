import { sampleCards } from './cards.js'

export const enemies = [
  {
    id: 'goblin',
    name: 'Goblin',
    stats: { hp: 20, energy: 2, speed: 2 },
    deck: [sampleCards[0], sampleCards[8], sampleCards[9]],
    aiProfile: {
      behavior: 'aggressive',
      aggressiveness: 0.8,
      enableComboAwareness: true,
      comboWindowTurns: 2,
      prefersFinisherChains: true,
    },
  },
  {
    id: 'skeleton',
    name: 'Skeleton',
    stats: { hp: 25, energy: 1, speed: 1 },
    deck: [sampleCards[0], sampleCards[4], sampleCards[9]],
    aiProfile: {
      behavior: 'aggressive',
      aggressiveness: 0.6,
      enableComboAwareness: true,
      comboWindowTurns: 2,
      prefersFinisherChains: false,
    },
  },
]
