import React, { useEffect, useRef } from 'react'
import './PackOpeningAnimation.css'

export default function PackOpeningAnimation({ onUnlock, visible }) {
  const overlayRef = useRef(null)
  const packRef = useRef(null)

  useEffect(() => {
    if (!visible) return
    const overlay = overlayRef.current
    const pack = packRef.current
    if (!overlay || !pack) return
    pack.style.transform = 'scale(0.6) translateY(200px)'
    pack.style.opacity = '0'
    setTimeout(() => {
      pack.style.transition =
        'transform 0.6s cubic-bezier(.68,-0.55,.27,1.55), opacity 0.4s'
      pack.style.transform = 'scale(1.2) translateY(0)'
      pack.style.opacity = '1'
    }, 100)
    const unlockTimeout = setTimeout(() => {
      if (typeof onUnlock === 'function') onUnlock()
    }, 1800)
    return () => clearTimeout(unlockTimeout)
  }, [visible, onUnlock])

  return (
    <div
      ref={overlayRef}
      className={`pack-animation-overlay ${visible ? 'show' : 'hide'}`}
    >
      <div className="pack-animation-inner">
        <div className="magic-circle">
          <img src="/src/assets/magic_circle.svg" alt="Magic Circle" />
        </div>
        <div className="chains">
          <img src="/src/assets/chains.svg" alt="Chains" />
        </div>
        <img
          ref={packRef}
          className="pack-image"
          src="/src/assets/card_pack.svg"
          alt="Card Pack"
        />
      </div>
    </div>
  )
}
