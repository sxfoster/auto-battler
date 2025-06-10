import React, { useState } from 'react';
import { UnitState } from '@shared/models/UnitState';
import HeroCard from './HeroCard';

interface PreBattleSetupProps {
  initialParty: UnitState[];
  onStartBattle: (positionedParty: UnitState[]) => void;
  onBackToTown: () => void;
}

const PreBattleSetup: React.FC<PreBattleSetupProps> = ({ initialParty, onStartBattle, onBackToTown }) => {
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
    <div className="min-h-screen flex flex-col items-center justify-center p-8 w-full max-w-4xl mx-auto text-center">
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
            {unit && <div className="w-32"><HeroCard hero={unit} /></div>}
          </div>
        ))}
      </div>

      {/* --- Unplaced Party Roster --- */}
      <div className="p-4 bg-gray-800 rounded-lg min-h-[140px] w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4 text-center">Your Party</h2>
        <div className="flex justify-center gap-4">
          {roster.map((unit) => (
            <div key={unit.id} onClick={() => handlePlaceUnit(unit.id)} className="cursor-pointer transform hover:scale-105 transition-transform w-32">
              <HeroCard hero={unit} />
            </div>
          ))}
          {roster.length === 0 && <p className="text-gray-500">All heroes have been placed.</p>}
        </div>
      </div>
      <div className="flex gap-4 mt-8">
        <button
          onClick={onBackToTown}
          className="px-10 py-4 bg-gray-600 hover:bg-gray-700 rounded-lg font-bold transition-colors shadow-lg"
        >
          Back to Town
        </button>
        <button
          onClick={() =>
            onStartBattle(gridSlots.filter(u => u !== null) as UnitState[])
          }
          className="px-10 py-4 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold transition-colors shadow-lg"
        >
          Start Battle
        </button>
      </div>
    </div>
  );
};

export default PreBattleSetup;
