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
    <div className="min-h-screen w-full flex flex-col justify-center items-center p-8 bg-gray-900 text-white">
      <div className="text-center mb-10">
        <h1 className="text-5xl font-bold">Pre-Battle Setup</h1>
        <p className="text-lg text-gray-400 mt-2">Click a hero from your party below to place them on the grid.</p>
      </div>

      {/* --- Tactical 3x3 Grid --- */}
      <div className="grid grid-cols-3 gap-4 w-96 h-96 mb-10 border-4 border-gray-700 p-4 rounded-xl bg-black bg-opacity-20">
        {gridSlots.map((unit, index) => (
          <div
            key={index}
            className="w-full h-full bg-gray-800 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-600"
          >
            {unit && (
              <div className="text-center p-2 bg-blue-600 rounded-lg shadow-lg">
                <p className="font-bold text-white">{unit.name}</p>
                <p className="text-xs opacity-80">{unit.class}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* --- Unplaced Party Roster --- */}
      <div className="p-4 bg-gray-800 rounded-lg min-h-[140px] w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4 text-center">Your Party</h2>
        <div className="flex justify-center gap-4">
          {roster.map((unit) => (
            <div
              key={unit.id}
              onClick={() => handlePlaceUnit(unit.id)}
              className="w-24 h-24 bg-gray-700 hover:bg-gray-600 rounded-lg flex flex-col items-center justify-center cursor-pointer p-2 text-center shadow-md transition-transform transform hover:scale-105"
            >
              <p className="font-bold">{unit.name}</p>
              <p className="text-xs opacity-80">{unit.class}</p>
            </div>
          ))}
          {roster.length === 0 && <p className="text-gray-500">All heroes have been placed.</p>}
        </div>
      </div>

      {/* --- Action Button --- */}
      <button
        onClick={() => onStartBattle(gridSlots.filter(u => u !== null) as UnitState[])}
        disabled={roster.length > 0}
        className="mt-10 px-10 py-4 bg-green-600 hover:bg-green-700 rounded-lg text-2xl font-bold transition-colors shadow-lg disabled:bg-gray-600 disabled:cursor-not-allowed"
      >
        Start Battle
      </button>
    </div>
  );
};

export default PreBattleSetup;
