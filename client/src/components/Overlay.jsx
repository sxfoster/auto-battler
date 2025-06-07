import React from 'react'
import './Overlay.css'

export default function Overlay({ message, onContinue }) {
  return (
    <div className="overlay">
      <div className="overlay-inner">
        <p>{message}</p>
        <button onClick={onContinue}>Continue</button>
      </div>
    </div>
  )
}
