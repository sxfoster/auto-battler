import React from 'react';
// Make sure these components exist from the previous work plan
import EnterDungeonButton from './EnterDungeonButton';
import HubIconButton from './HubIconButton';

// Placeholder icons - replace with your actual SVGs
const PartyIcon = () => <svg /* ... */ />;
const CardsIcon = () => <svg /* ... */ />;
const SkirmishIcon = () => <svg /* ... */ />;
const InventoryIcon = () => <svg /* ... */ />;
const CraftingIcon = () => <svg /* ... */ />;
const ShopIcon = () => <svg /* ... */ />;

interface TownHubProps {
  onEnterDungeon: () => void;
  onNavigateToParty: () => void;
  onStartSkirmish: () => void;
}

export const TownHub: React.FC<TownHubProps> = ({ onEnterDungeon, onNavigateToParty, onStartSkirmish }) => {
  return (
    // Main container that centers everything and applies the background
    <div
      className="min-h-screen w-full flex items-center justify-center p-8"
      style={{
        backgroundImage: `url('/forest-bg.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* Flex container to arrange the columns */}
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
