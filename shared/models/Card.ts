export interface Effect {
  attribute: string;
  value: number | string;
  target?: string;
}

export interface Card {
  id: string;
  name: string;
  type: string;
  cost: number;
  effects: Effect[];
  description: string;
}
