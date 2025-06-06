import { sampleCards } from './cards.js';

/**
 * @fileoverview This file contains a list of all possible enemies in the game.
 * Each enemy is an object with the following properties:
 *  - id: string - A unique identifier for the enemy.
 *  - archetype: string - The archetype of the enemy (e.g., "Goblin Grunt", "Skeleton Warrior").
 *  - stats: object - The enemy's stats, including hp, energy, speed, attack, and defense.
 *  - deck: Card[] - An array of Card objects representing the enemy's deck.
 *  - aiProfile: object - The enemy's AI profile, including behavior, aggressiveness, combo awareness, combo window turns, and finisher chain preference.
 */
/** @type {import('./Enemy').Enemy[]} */
export const enemies = [
  {
    id: 'goblin_grunt_01', // More specific ID
    archetype: 'Goblin Grunt', // Using 'name' as 'archetype'
    stats: { hp: 20, energy: 2, speed: 2, attack: 5, defense: 1 }, // Added attack/defense
    // Using .find() for deck population for robustness
    deck: [
      sampleCards.find(c => c.id === 'strike'),
      sampleCards.find(c => c.id === 'mark_target'),
      // sampleCards.find(c => c.id === 'shadow_execution') // Shadow execution might be too strong for a goblin
    ].filter(Boolean), // Filter out undefined if a card isn't found
    aiProfile: {
      behavior: 'aggressive',
      aggressiveness: 0.8,
      enableComboAwareness: true,
      comboWindowTurns: 2,
      prefersFinisherChains: true,
      // preferredComboTags: ['Execute'] // Example if they have Execute cards
    },
  },
  {
    id: 'skeleton_warrior_01',
    archetype: 'Skeleton Warrior',
    stats: { hp: 25, energy: 1, speed: 1, attack: 6, defense: 3 },
    deck: [
      sampleCards.find(c => c.id === 'strike'),
      // sampleCards.find(c => c.id === 'herb'), // Skeletons using herbs? Unlikely.
      // sampleCards.find(c => c.id === 'shadow_execution')
    ].filter(Boolean),
    aiProfile: {
      behavior: 'aggressive',
      aggressiveness: 0.6,
      enableComboAwareness: true, // Maybe false if they are simpler undead
      comboWindowTurns: 2,
      prefersFinisherChains: false,
    },
  },
]
