export interface DungeonEvent {
  /** Unique event id */
  id: string;
  /** Display name */
  name: string
  /** Description shown to the player */
  description: string
  /** Optional biomes this event can appear in */
  biomeEligibility?: string[]
  /** Identifier used by systems to apply effects */
  effectType: string
  /** Additional details for the effect implementation */
  effectDetails: Record<string, any>
  /** Duration in turns or 'floor' for whole floor */
  duration: number | 'floor'
}
