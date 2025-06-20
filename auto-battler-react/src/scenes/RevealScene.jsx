import React, { useEffect, useState } from 'react'
import { useGameStore } from '../store.js'
import Card from '../components/Card.jsx'

export default function RevealScene() {
  const { packChoices, finishReveal } = useGameStore(state => ({
    packChoices: state.packChoices,
    finishReveal: state.finishReveal,
  }))

  const [flipped, setFlipped] = useState([])
  const [dismissed, setDismissed] = useState([])

  useEffect(() => {
    setFlipped([])
    setDismissed([])
  }, [packChoices])

  useEffect(() => {
    if (packChoices.length && dismissed.length === packChoices.length) {
      const t = setTimeout(() => finishReveal(), 300)
      return () => clearTimeout(t)
    }
  }, [dismissed, packChoices, finishReveal])

  const handleClick = idx => {
    if (!flipped.includes(idx)) {
      setFlipped([...flipped, idx])
    } else if (!dismissed.includes(idx)) {
      setDismissed([...dismissed, idx])
    }
  }

  const mid = (packChoices.length - 1) / 2

  return (
    <div className="scene">
      <div id="reveal-area" className="relative flex justify-center items-center">
        {packChoices
          .slice()
          .reverse()
          .map((card, rIdx) => {
            const idx = packChoices.length - 1 - rIdx
            const rot = (rIdx - mid) * 5
            const y = Math.abs(rIdx - mid) * 20
            const style = { transform: `rotate(${rot}deg) translateY(${y}px)`, zIndex: rIdx }

            const isFlipped = flipped.includes(idx)
            const isDismissed = dismissed.includes(idx)

            let cls = 'revealed-card'
            if (!isFlipped) {
              cls += ' card-back-unrevealed'
              if (card.rarity === 'Rare') cls += ' pre-reveal-rare'
              if (card.rarity === 'Epic') cls += ' pre-reveal-epic'
            }
            if (isFlipped) cls += ' is-flipping'
            if (isDismissed) cls += ' is-dismissed'

            return (
              <div key={idx} className={cls} style={style} onClick={() => handleClick(idx)}>
                {isFlipped && !isDismissed && (
                  <div className="card-face">
                    <Card item={card} view="detail" />
                  </div>
                )}
              </div>
            )
          })}
      </div>
    </div>
  )
}
