import React from 'react';

export default function BattleScene({ team }) {
  return (
    <div className="scene">
      <h1 className="text-5xl font-cinzel tracking-wider mb-8">Battle Coming Soon</h1>
      <pre>{JSON.stringify(team, null, 2)}</pre>
    </div>
  );
}
