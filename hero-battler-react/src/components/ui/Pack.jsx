import React from 'react'
import './Pack.css'

export default function Pack({ packType, onOpen }) {
  const handleClick = () => {
    if (onOpen) onOpen()
  }
  return (
    <div className={`pack pack-${packType}`} onClick={handleClick}>
      Open {packType} Pack
    </div>
  )
}
