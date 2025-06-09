import React from 'react';
import { UnitState } from '../../shared/models/UnitState';

interface Props {
  party: UnitState[];
  onConfirm: () => void;
  onBack: () => void;
}

const PartySummary: React.FC<Props> = ({ party, onConfirm, onBack }) => {
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
      <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
        <button onClick={onBack}>Back</button>
        <button onClick={onConfirm}>Save Party</button>
      </div>
    </div>
  );
};

export default PartySummary;
