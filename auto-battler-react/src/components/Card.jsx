import React from 'react';

export default function Card({ item, view = 'detail' }) {
  if (!item) return null;
  return (
    <div className={`card ${view}`} style={{ border: '1px solid white', padding: '0.5rem', margin: '0.5rem' }}>
      <h3>{item.name}</h3>
      <p>Type: {item.type}</p>
      {item.class && <p>Class: {item.class}</p>}
      <p>Rarity: {item.rarity}</p>
    </div>
  );
}
