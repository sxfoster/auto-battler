import { Card } from './Card';

export interface UnitState {
  id: string;
  name: string;
  class: string;
  hp: number;
  maxHp: number;
  energy: number;
  speed: number;
  position: { row: number; col: number } | null;
  cardsInHand: Card[];
  battleDeck: Card[]; // The 2 cards chosen in setup
  cardPool: Card[]; // The hero's full list of available cards
  archetype: 'DPS' | 'Support' | 'Tank' | 'Healer';
}
