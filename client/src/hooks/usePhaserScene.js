import { useEffect, useState } from 'react'

export function usePhaserScene(key) {
  const [scene, setScene] = useState(null)

  useEffect(() => {
    const game = window.__phaserGame
    if (!game) return
    const sc = game.scene.getScene(key)
    setScene(sc)
  }, [key])

  return scene
}
