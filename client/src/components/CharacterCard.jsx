import React from 'react'
import './CharacterCard.css'

export default function CharacterCard({ name, className, portrait }) {
  return (
    <div className="character-card">
      <img src={portrait} alt={name} className="character-card__portrait" />
      <div className="character-card__info">
        <div className="character-card__name">{name}</div>
        <div className="character-card__class">{className}</div>
      </div>
    </div>
  )
}
