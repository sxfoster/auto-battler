export interface VisualEffect {
  /** When this effect is triggered */
  trigger:
    | 'cardPlay'
    | 'attack'
    | 'heal'
    | 'combo'
    | 'status'
    | 'uiTransition'
    | string
  /** Rendering type for this effect */
  type: 'particle' | 'spriteAnim' | 'floatText' | 'screenOverlay' | string
  /** Optional tint or text color */
  color?: string
  /** Duration in milliseconds */
  duration?: number
  /** Animation key or descriptor */
  animationName?: string
}
