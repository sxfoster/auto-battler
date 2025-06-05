import { Effect } from './Card';

export interface Resource {
  id: string;
  name: string;
  effect: Effect | string;
  quantity: number;
  description: string;
  type: string;
}
