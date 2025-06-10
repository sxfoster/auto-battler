import React from 'react';
import './TownHub.css';

interface TownHubProps {
  onNavigateToParty: () => void;
  onStartSkirmish: () => void;
}

export const TownHub: React.FC<TownHubProps> = ({ onNavigateToParty, onStartSkirmish }) => {
  return (
    <div className="town-hub">
      <div className="hub-icons hub-left">
        <a href="#" onClick={onNavigateToParty} aria-label="Party"><i className="fa-solid fa-shield-halved"></i></a>
        <a href="#" aria-label="Inventory"><i className="fa-solid fa-backpack"></i></a>
        <a href="#" aria-label="Cards"><i className="fa-solid fa-clone"></i></a>
      </div>
      <div className="hub-icons hub-right">
        <a href="#" aria-label="Crafting"><i className="fa-solid fa-flask"></i></a>
        <a href="#" aria-label="Shop"><i className="fa-solid fa-store"></i></a>
        <a href="#" onClick={onStartSkirmish} aria-label="Battle"><i className="fa-solid fa-swords"></i></a>
      </div>
    </div>
  );
};
