export interface Position {
  x: number
  y: number
}

export interface UnitPlacement {
  unitId: string
  position: Position
  cardIds: string[]
}

export interface Formation {
  gridSize: number
  units: UnitPlacement[]
}

export function isPositionValid(pos: Position, gridSize: number): boolean {
  return pos.x >= 0 && pos.y >= 0 && pos.x < gridSize && pos.y < gridSize
}

export function validateFormation(formation: Formation): boolean {
  const occupied = new Set<string>()
  for (const unit of formation.units) {
    const { position } = unit
    const key = `${position.x},${position.y}`
    if (!isPositionValid(position, formation.gridSize)) return false
    if (occupied.has(key)) return false
    if (new Set(unit.cardIds).size !== unit.cardIds.length) return false
    occupied.add(key)
  }
  return true
}
