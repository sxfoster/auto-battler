import React, { useEffect, useState } from 'react';
import Card from '../components/Card.jsx';
import ChampionDisplay from '../components/ChampionDisplay.jsx';
import { allPossibleHeroes } from '../data/data.js';
import { useGameStore } from '../store/gameStore.js';

export default function UpgradeScene() {
  const {
    playerTeam,
    inventory,
    dismantleCard,
    equipItem,
    startNextBattle,
    generateBonusPack,
  } = useGameStore();

  const [phase, setPhase] = useState('REVEAL');
  const [pack, setPack] = useState([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const bonus = generateBonusPack();
    setPack(bonus);
    setIndex(0);
    setPhase('REVEAL');
  }, [generateBonusPack]);

  const currentCard = pack[index];

  const nextCard = () => {
    setIndex((i) => i + 1);
    setPhase('REVEAL');
  };

  const handleDismantle = () => {
    if (!currentCard) return;
    dismantleCard(currentCard.rarity);
    nextCard();
  };

  const handleTake = () => {
    if (!currentCard) return;
    setPhase('EQUIP');
  };

  const computeValidSlots = () => {
    if (!currentCard) return [];
    const slots = [];
    if (currentCard.type === 'weapon' || currentCard.type === 'armor') {
      slots.push(`${currentCard.type}1`, `${currentCard.type}2`);
    } else if (currentCard.type === 'ability') {
      const hero1 = allPossibleHeroes.find((h) => h.id === playerTeam.hero1);
      const hero2 = allPossibleHeroes.find((h) => h.id === playerTeam.hero2);
      if (hero1 && hero1.class === currentCard.class) slots.push('ability1');
      if (hero2 && hero2.class === currentCard.class) slots.push('ability2');
    }
    return slots;
  };

  const validSlots = computeValidSlots();

  const handleEquip = (slotKey) => {
    equipItem(slotKey, currentCard.id);
    nextCard();
    startNextBattle();
  };

  if (!currentCard) {
    startNextBattle();
    return null;
  }

  return (
    <div>
      <div style={{ marginBottom: '0.5rem' }}>
        <span>Shards: {inventory.shards}</span>{' '}
        <span>Reroll Tokens: {inventory.rerollTokens}</span>
      </div>
      <Card item={currentCard} view="detail" />
      {phase === 'REVEAL' && (
        <div>
          <button onClick={handleTake} style={{ marginRight: '0.5rem' }}>
            Take
          </button>
          <button onClick={handleDismantle}>Dismantle</button>
        </div>
      )}
      {phase === 'EQUIP' && (
        <div>
          <p>Choose a slot for this item:</p>
          {validSlots.length === 0 && (
            <p>No champion can equip this item. Dismantle instead.</p>
          )}
          {[1, 2].map((num) => (
            <ChampionDisplay
              key={num}
              number={num}
              champion={{
                hero: playerTeam[`hero${num}`],
                ability: playerTeam[`ability${num}`],
                weapon: playerTeam[`weapon${num}`],
                armor: playerTeam[`armor${num}`],
              }}
              validSlots={validSlots.filter((s) => s.endsWith(num))}
              onSelectSlot={handleEquip}
            />
          ))}
          <button onClick={handleDismantle}>Dismantle</button>
        </div>
      )}
    </div>
  );
}
