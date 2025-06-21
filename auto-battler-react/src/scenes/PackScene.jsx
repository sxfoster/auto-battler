import React, { useEffect, useRef, useState } from 'react'
import { useGameStore } from '../store.js'

const boosterPackImages = {
  hero: 'img/character_booster.png',
  ability: 'img/ability_booster.png',
  weapon: 'img/weapon_booster.png',
  armor: 'img/armor_booster.png',
}

export default function PackScene() {
  const { openPack, draftStage } = useGameStore(state => ({
    openPack: state.openPack,
    draftStage: state.draftStage,
  }))

  const [isTearing, setIsTearing] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  // Reset animation state whenever a new draft stage begins
  useEffect(() => {
    setIsTearing(false)
    setIsOpen(false)
  }, [draftStage])

  const packageRef = useRef(null)
  const imageAreaRef = useRef(null)

  const handlePackOpen = () => {
    if (isTearing) return
    setIsTearing(true)
  }

  const handleTearEnd = () => {
    setIsOpen(true)
    setTimeout(() => {
      openPack()
    }, 100)
  }

  const handleMouseMove = e => {
    if (!packageRef.current || isOpen || isTearing) return
    const rect = packageRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    const maxTilt = 10
    const rotateY = (x / (rect.width / 2)) * maxTilt
    const rotateX = (y / (rect.height / 2)) * -maxTilt
    packageRef.current.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
    if (imageAreaRef.current) {
      imageAreaRef.current.style.setProperty('--glare-x', `${((e.clientX - rect.left) * 100) / rect.width}%`)
      imageAreaRef.current.style.setProperty('--glare-y', `${((e.clientY - rect.top) * 100) / rect.height}%`)
      imageAreaRef.current.style.setProperty('--glare-opacity', '1')
    }
  }

  const handleMouseLeave = () => {
    if (!packageRef.current) return
    if (imageAreaRef.current) {
      imageAreaRef.current.style.setProperty('--glare-opacity', '0')
    }
    if (isOpen || isTearing) return
    packageRef.current.style.transform = 'rotateX(0deg) rotateY(0deg)'
  }

  const packType = draftStage.split('_')[0].toLowerCase()
  const packImage = boosterPackImages[packType] || boosterPackImages.hero

  return (
    <div id="pack-scene" className="scene">
      <h1
        id="pack-scene-title"
        className="text-5xl font-cinzel tracking-wider mb-8 text-center"
      >
        Open Your Pack
      </h1>

      <div className="package-wrapper" onClick={handlePackOpen}>
        <div
          id="package"
          ref={packageRef}
          className={`package flex flex-col rounded-lg ${isOpen ? 'is-open' : ''}`}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <div
            id="top-crimp"
            className={`crimp h-6 rounded-t-lg ${isTearing ? 'torn-off' : ''}`}
            onAnimationEnd={isTearing ? handleTearEnd : undefined}
          ></div>
          <div
            id="image-area"
            ref={imageAreaRef}
            className="image-area flex-grow flex items-center justify-center"
          >
            <img
              id="booster-pack-img"
              src={packImage}
              alt={`${packType} booster pack`}
              className="booster-pack-image w-[320px] h-auto"
              draggable="false"
            />
          </div>
          <div className="crimp h-6 rounded-b-lg"></div>
        </div>
      </div>

      <p id="pack-scene-instructions" className="text-lg text-gray-400 mt-8">
        Click anywhere on the pack to tear it open.
      </p>
    </div>
  )
}
