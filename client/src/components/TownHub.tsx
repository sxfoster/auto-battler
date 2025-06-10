import React from 'react';
import EnterDungeonButton from './EnterDungeonButton';
import HubIconButton from './HubIconButton';
// You will need to find or create SVG icons for each button
// For example, using a library like `react-icons`

// Placeholder icons - replace with actual SVGs
const PartyIcon = () => <span>P</span>; 
const CardsIcon = () => <span>C</span>;
const SkirmishIcon = () => <span>S</span>;
const InventoryIcon = () => <span>I</span>;
const CraftingIcon = () => <span>Cr</span>;
const ShopIcon = () => <span>Sh</span>;

interface TownHubProps {
  onEnterDungeon: () => void;
  onNavigateToParty: () => void;
  onStartSkirmish: () => void;
}

export const TownHub: React.FC<TownHubProps> = ({ onEnterDungeon, onNavigateToParty, onStartSkirmish }) => {
  return (
    // Main container with background and padding
    <div className="min-h-screen w-full flex items-center justify-center p-8 bg-gray-900" style={{ backgroundImage: `url('/path/to/your/forest-background.jpg')`, backgroundSize: 'cover' }}>
      
      <div className="w-full max-w-7xl flex items-center justify-between">

        {/* --- Left Column: Secondary Actions --- */}
        <div className="flex flex-col gap-6">
          <HubIconButton label="Party Roster" icon={<PartyIcon />} onClick={onNavigateToParty} />
          <HubIconButton label="Card Collection" icon={<CardsIcon />} isDisabled={true} />
          <HubIconButton label="Skirmish" icon={<SkirmishIcon />} onClick={onStartSkirmish} />
        </div>

        {/* --- Center Column: Primary Action --- */}
        <div className="flex-shrink-0 mx-12">
          <EnterDungeonButton onClick={onEnterDungeon} />
        </div>

        {/* --- Right Column: Future Actions --- */}
        <div className="flex flex-col gap-6">
          <HubIconButton label="Inventory" icon={<InventoryIcon />} isDisabled={true} />
          <HubIconButton label="Crafting" icon={<CraftingIcon />} isDisabled={true} />
          <HubIconButton label="Shop" icon={<ShopIcon />} isDisabled={true} />
        </div>
        
      </div>
    </div>
  );
};
