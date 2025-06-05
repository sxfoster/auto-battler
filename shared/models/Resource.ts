import { Effect } from './Card';

export interface Resource {
  id: string;
  name: string; // e.g., 'Health Potion', 'Gold Coin', 'Wood'
  effect: Effect | string; // Can be an Effect object or a string describing its use
  quantity: number;
  description: string;
  type: string; // e.g., 'Consumable', 'Currency', 'Material'
}
