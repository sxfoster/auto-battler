import React, { useRef, useEffect } from 'react';
import { loadPartyState } from 'shared/partyState';
import { loadGameState } from 'game/state';

export default function Battle() {
  // On mount reload both party and game state from localStorage
  useEffect(() => {
    loadPartyState();
    loadGameState();
  }, []);

  const phaserRef = useRef<HTMLDivElement | null>(null);
  // Placeholder for Phaser embed
  return <div ref={phaserRef} />;
}
