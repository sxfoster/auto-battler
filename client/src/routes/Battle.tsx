import React, { useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { loadPartyState } from 'shared/partyState';
import { loadGameState } from 'game/state';

export default function Battle() {
  const location = useLocation();
  // On mount reload both party and game state from localStorage
  useEffect(() => {
    loadPartyState();
    loadGameState();
    console.log('Battle mounted - party and game state loaded');
  }, []);

  const phaserRef = useRef<HTMLDivElement | null>(null);
  // Placeholder for Phaser embed
  return <div ref={phaserRef} />;
}
