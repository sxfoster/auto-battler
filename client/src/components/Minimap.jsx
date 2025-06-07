import React from 'react';
import { getDungeon } from 'shared/dungeonState';
import './Minimap.css';

export default function Minimap() {
  const { rooms, current } = getDungeon();
  return (
    <div className="minimap">
      {rooms.map((r, i) => (
        <div
          key={i}
          className={`minimap-tile ${r.visited ? 'visited' : ''} ${
            r.x === current.x && r.y === current.y ? 'current' : ''
          }`}
        />
      ))}
    </div>
  );
}
