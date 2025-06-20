import { create } from 'zustand';
import {
  allPossibleHeroes,
  allPossibleAbilities,
  allPossibleWeapons,
  allPossibleArmors,
} from '../data/data.js';

function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Simplified bonus pack generator
function generateBonusPack(playerHeroes = []) {
  const heroClasses = playerHeroes
    .map((id) => allPossibleHeroes.find((h) => h.id === id)?.class)
    .filter(Boolean);

  const abilityPool = allPossibleAbilities.filter((a) =>
    heroClasses.includes(a.class)
  );

  const pack = [];
  if (abilityPool.length) pack.push(getRandom(abilityPool));
  pack.push(getRandom(allPossibleWeapons));
  pack.push(getRandom(allPossibleArmors));

  // Fill remaining slots randomly
  const generalPool = [
    ...allPossibleWeapons,
    ...allPossibleArmors,
    ...abilityPool,
  ];
  while (pack.length < 5) pack.push(getRandom(generalPool));

  return pack;
}

export const useGameStore = create((set, get) => ({
  playerTeam: {
    hero1: null,
    ability1: null,
    weapon1: null,
    armor1: null,
    hero2: null,
    ability2: null,
    weapon2: null,
    armor2: null,
  },
  inventory: { shards: 0, rerollTokens: 0 },

  dismantleCard: (rarity) =>
    set((state) => {
      const shardValues = { Common: 1, Uncommon: 3, Rare: 5, Epic: 10 };
      const gain = shardValues[rarity] ?? 1;
      return {
        inventory: {
          ...state.inventory,
          shards: state.inventory.shards + gain,
        },
      };
    }),

  equipItem: (slot, itemId) =>
    set((state) => {
      const team = { ...state.playerTeam, [slot]: itemId };
      if (slot.startsWith('hero')) {
        const idx = slot.endsWith('1') ? '1' : '2';
        team[`ability${idx}`] = null;
        team[`weapon${idx}`] = null;
        team[`armor${idx}`] = null;
      }
      return { playerTeam: team };
    }),

  startNextBattle: () => {
    console.log('Starting next battle');
  },

  generateBonusPack: () => generateBonusPack([get().playerTeam.hero1, get().playerTeam.hero2]),
}));
