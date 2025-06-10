import React from 'react';
import './TownHub.css';

interface TownHubProps {
  onNavigateToParty: () => void;
  onStartSkirmish: () => void;
}

export const TownHub: React.FC<TownHubProps> = ({
  onNavigateToParty,
  onStartSkirmish,
}) => {
  return (
    <div className="town-hub">
      <div className="hub-icon-group hub-left">
        <button className="hub-icon" onClick={onNavigateToParty} aria-label="Party">
          <i className="fa-solid fa-shield-halved" />
          <span className="hub-label">Party</span>
        </button>
        <button className="hub-icon" aria-label="Inventory">
          <i className="fa-solid fa-backpack" />
          <span className="hub-label">Inventory</span>
        </button>
        <button className="hub-icon" aria-label="Cards">
          <i className="fa-solid fa-clone" />
          <span className="hub-label">Cards</span>
        </button>
      </div>
      <div className="hub-icon-group hub-right">
        <button className="hub-icon" aria-label="Crafting">
          <i className="fa-solid fa-flask" />
          <span className="hub-label">Crafting</span>
        </button>
        <button className="hub-icon" aria-label="Shop">
          <i className="fa-solid fa-store" />
          <span className="hub-label">Shop</span>
        </button>
        <button className="hub-icon" onClick={onStartSkirmish} aria-label="Battle">
          <i className="fa-solid fa-swords" />
          <span className="hub-label">Battle</span>
        </button>
      </div>
    </div>
  );
};
