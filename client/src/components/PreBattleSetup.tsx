import React, { useState, useEffect } from 'react';
import { UnitState } from '../../shared/models/UnitState'; // Assuming models from Milestone 1

interface PreBattleSetupProps {
  initialParty: UnitState[];
  onStartBattle: (positionedParty: UnitState[]) => void;
}

const PreBattleSetup: React.FC<PreBattleSetupProps> = ({ initialParty, onStartBattle }) => {
  // State to hold units placed on the 3x3 grid (9 slots)
  const [gridSlots, setGridSlots] = useState<(UnitState | null)[]>(new Array(9).fill(null));

  // State to hold heroes from the party that have not yet been placed
  const [roster, setRoster] = useState<UnitState[]>([]);

  useEffect(() => {
    setRoster(initialParty);
  }, [initialParty]);

  const handlePlaceUnit = (unitId: string) => {
    const unitToPlace = roster.find(u => u.id === unitId);
    if (!unitToPlace) return;

    // Find the first empty slot on the grid
    const firstEmptyIndex = gridSlots.findIndex(slot => slot === null);
    if (firstEmptyIndex === -1) {
      alert("Grid is full!"); // Consider a more user-friendly notification
      return;
    }

    const newGridSlots = [...gridSlots];
    // Assign position based on the grid index
    unitToPlace.position = { row: Math.floor(firstEmptyIndex / 3), col: firstEmptyIndex % 3 };
    newGridSlots[firstEmptyIndex] = unitToPlace;
    setGridSlots(newGridSlots);

    // Remove the unit from the roster
    setRoster(roster.filter(u => u.id !== unitId));
  };

  // Render logic will be added in subsequent steps...
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-4xl font-bold mb-8">Pre-Battle Setup</h1>
      {/* Tactical Grid */}
      <div className="grid grid-cols-3 gap-4 w-96 h-96 mb-8 border-2 border-gray-600 p-4 rounded-lg">
        {gridSlots.map((unit, index) => (
          <div
            key={index}
            className="w-full h-full bg-gray-800 rounded-lg flex items-center justify-center border border-dashed border-gray-500"
          >
            {unit && (
              <div className="w-20 h-20 bg-blue-600 rounded-full flex flex-col items-center justify-center text-center">
                {/* Placeholder for portrait */}
                <span className="text-xs font-bold">{unit.name}</span>
                <span className="text-xs opacity-75">{unit.class}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Unplaced Roster */}
      <h2 className="text-2xl font-bold mb-4">Your Party</h2>
      <div className="flex gap-4 p-4 bg-gray-900 rounded-lg min-h-[120px]">
        {roster.map((unit) => (
          <div
            key={unit.id}
            onClick={() => handlePlaceUnit(unit.id)} // Use simple click-to-place for MVP
            className="w-20 h-20 bg-gray-700 hover:bg-gray-600 rounded-full flex flex-col items-center justify-center cursor-pointer p-2 text-center"
          >
            <span className="text-xs font-bold">{unit.name}</span>
            <span className="text-xs opacity-75">{unit.class}</span>
          </div>
        ))}
      </div>
      <button
        onClick={() => {
          const positionedParty = gridSlots.filter(u => u !== null) as UnitState[];
          // For now, this just passes the data up. Later it will trigger the battle view.
          onStartBattle(positionedParty);
        }}
        className="mt-8 px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg text-xl font-bold transition-colors"
      >
        Start Battle (Simulated)
      </button>
    </div>
  );
};

export default PreBattleSetup;
