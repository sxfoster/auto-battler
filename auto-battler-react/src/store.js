import { create } from 'zustand';

export const useGameStore = create((set) => ({
  gamePhase: 'PACK',
  setGamePhase: (phase) => set({ gamePhase: phase }),
}));
