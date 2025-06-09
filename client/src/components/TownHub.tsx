import React, { useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useGameState } from "../GameStateProvider.jsx";
import CharacterCard from "./CharacterCard.tsx";
import styles from "./TownView.module.css";
import {
  loadPartyState,
} from "../../../game/src/shared/partyState.js";
import { simulateBattle as battleSimulator } from "../../../game/src/logic/battleSimulator.js";
import { playerParty, enemyParty } from "../../../game/src/logic/sampleBattleData.js";

export default function TownHub() {
  const navigate = useNavigate();
  const location = useLocation();
  const party = useGameState((s) => s.party);

  useEffect(() => {
    loadPartyState();
    console.log('TownHub mounted - party state loaded');
  }, []);

  const onTestBattle = () => {
    const steps = battleSimulator(playerParty, enemyParty);
    navigate('/viewer', { state: { steps } });
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h2>Town Hub</h2>
        <div className={styles.partyCards}>
          {party?.characters && party.characters.length > 0 ? (
            party.characters.map((character) => (
              <CharacterCard
                key={character.id}
                character={character}
                onSelect={() => {}}
                isSelected={false}
                isDisabled={false}
              />
            ))
          ) : (
            <p>No party</p>
          )}
        </div>
        <button onClick={onTestBattle}>Test Battle</button>
        <Link to="/" className={styles.mainMenu}>
          Return to Main Menu
        </Link>
      </header>
      <div className={styles.grid}>
        <button
          className={styles.card}
          onClick={() => navigate("/party-setup")}
          aria-label="Manage Party"
        >
          <span className={styles.icon}>⚔️</span>
          <span className={styles.title}>Party</span>
          <span className={styles.subtitle}>Manage your heroes</span>
        </button>
        <button
          className={styles.card}
          onClick={() => navigate("/inventory")}
          aria-label="View Inventory"
        >
          <span className={styles.icon}>🎒</span>
          <span className={styles.title}>Inventory</span>
          <span className={styles.subtitle}>View your items</span>
        </button>
        <button
          className={styles.card}
          onClick={() => navigate("/cards")}
          aria-label="Browse Cards"
        >
          <span className={styles.icon}>📜</span>
          <span className={styles.title}>Cards</span>
          <span className={styles.subtitle}>Browse your card collection</span>
        </button>
        <button
          className={styles.card}
          onClick={() => navigate("/crafting")}
          aria-label="Craft Items"
        >
          <span className={styles.icon}>🛠️</span>
          <span className={styles.title}>Crafting</span>
          <span className={styles.subtitle}>Prepare for battle</span>
        </button>
        <button
          className={styles.card}
          onClick={() => navigate("/shop")}
          aria-label="Visit Shop"
        >
          <span className={styles.icon}>🛒</span>
          <span className={styles.title}>Shop</span>
          <span className={styles.subtitle}>Browse wares</span>
        </button>
        <button
          className={styles.card}
          onClick={() => navigate("/pre-battle")}
          aria-label="Battle"
        >
          <span className={styles.icon}>⚔️</span>
          <span className={styles.title}>Battle</span>
          <span className={styles.subtitle}>Skirmish test</span>
        </button>
        <button
          className={`${styles.card} ${!party ? styles.disabled : ""}`}
          onClick={() => party && navigate("/dungeon")}
          aria-label="Enter Dungeon"
        >
          <span className={styles.icon}>🏰</span>
          <span className={styles.title}>Enter Dungeon</span>
          <span className={styles.subtitle}>Begin an adventure</span>
        </button>
      </div>
    </div>
  );
}
