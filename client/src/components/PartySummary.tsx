import React from 'react';
import { UnitState } from '../../shared/models/UnitState';

interface Props {
  party: UnitState[];
  onConfirm: () => void;
}

const PartySummary: React.FC<Props> = ({ party, onConfirm }) => {
  return (
    <div>
      <h2>Party Summary</h2>
      <ul>
        {party.map(u => (
          <li key={u.id}>
            {u.name} - deck: {u.battleDeck.map(c => c.name).join(', ')}
          </li>
        ))}
      </ul>
      <button onClick={onConfirm}>Save Party</button>
    </div>
  );
};

export default PartySummary;
