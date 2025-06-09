import React from 'react'
import placeholderArt from '../assets/placeholder-card-art.svg'

interface CardProps {
  name: string
  description: string
  art?: string
}

export default function Card({ name, description, art }: CardProps) {
  return (
    <div style={{ border: '1px solid #555', borderRadius: 8, padding: '0.5rem', width: 150 }}>
      <img src={art || placeholderArt} alt={name} style={{ width: '100%', height: 80, objectFit: 'cover', borderRadius: 4 }} />
      <div style={{ fontWeight: 'bold', marginTop: '0.25rem' }}>{name}</div>
      <div style={{ fontSize: '0.8rem' }}>{description}</div>
    </div>
  )
}
