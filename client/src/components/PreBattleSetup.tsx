import React, { useState } from 'react';
import { UnitState } from '../../shared/models/UnitState';

interface PreBattleSetupProps {
  initialParty: UnitState[];
  onStartBattle: (positionedParty: UnitState[]) => void;
}

const PreBattleSetup: React.FC<PreBattleSetupProps> = ({ initialParty, onStartBattle }) => {
  const [gridSlots, setGridSlots] = useState<(UnitState | null)[]>(new Array(9).fill(null));
  const [roster, setRoster] = useState<UnitState[]>(initialParty);

  const handlePlaceUnit = (unitId: string) => {
    const unitToPlace = roster.find(u => u.id === unitId);
    if (!unitToPlace) return;

    const firstEmptyIndex = gridSlots.findIndex(slot => slot === null);
    if (firstEmptyIndex === -1) {
      alert("Grid is full!");
      return;
    }

    const newGridSlots = [...gridSlots];
    unitToPlace.position = { row: Math.floor(firstEmptyIndex / 3), col: firstEmptyIndex % 3 };
    newGridSlots[firstEmptyIndex] = unitToPlace;
    setGridSlots(newGridSlots);
    setRoster(roster.filter(u => u.id !== unitId));
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-4xl font-bold mb-8">Pre-Battle Setup</h1>
      <div className="grid grid-cols-3 gap-4 w-96 h-96 mb-8 border-2 border-gray-600 p-4 rounded-lg">
        {gridSlots.map((unit, index) => (
          <div key={index} className="w-full h-full bg-gray-800 rounded-lg flex items-center justify-center border border-dashed border-gray-500">
            {unit && <div className="text-center"><p className="font-bold">{unit.name}</p><p className="text-xs">{unit.class}</p></div>}
          </div>
        ))}
      </div>
      <h2 className="text-2xl font-bold mb-4">Click a Hero to Place Them</h2>
      <div className="flex gap-4 p-4 bg-gray-800 rounded-lg min-h-[120px]">
        {roster.map((unit) => (
          <div key={unit.id} onClick={() => handlePlaceUnit(unit.id)} className="w-24 h-24 bg-gray-700 hover:bg-gray-600 rounded-lg flex flex-col items-center justify-center cursor-pointer p-2 text-center">
            <p className="font-bold">{unit.name}</p><p className="text-xs">{unit.class}</p>
          </div>
        ))}
      </div>
      <button
        onClick={() => onStartBattle(gridSlots.filter(u => u !== null) as UnitState[])}
        className="mt-8 px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg text-xl font-bold"
      >
        Start Battle
      </button>
    </div>
  );
};

export default PreBattleSetup;
