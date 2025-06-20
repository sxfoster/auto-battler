import React, { useEffect, useState } from 'react';
import Card from '../components/Card';
import ChampionDisplay from '../components/ChampionDisplay';
import useGameStore from '../store/useGameStore';

// Simple helper that mimics pulling a reward pack from the store
function generateBonusPack(allCards, count = 3) {
  const pool = [...allCards];
  const cards = [];
  while (cards.length < count && pool.length > 0) {
    const index = Math.floor(Math.random() * pool.length);
    cards.push(pool.splice(index, 1)[0]);
  }
  return cards;
}

function UpgradeScene() {
  const [phase, setPhase] = useState('REVEAL');
  const [pack, setPack] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const playerTeam = useGameStore((state) => state.playerTeam);
  const inventory = useGameStore((state) => state.inventory);
  const dismantleCard = useGameStore((state) => state.dismantleCard);
  const equipItem = useGameStore((state) => state.equipItem);
  const allBonusCards = useGameStore((state) => state.allBonusCards);
  const startNextBattle = useGameStore((state) => state.startNextBattle);

  useEffect(() => {
    const cards = generateBonusPack(allBonusCards);
    setPack(cards);
  }, [allBonusCards]);

  const currentCard = pack[currentIndex];

  const handleDismantle = () => {
    if (!currentCard) return;
    dismantleCard(currentCard);
    const next = currentIndex + 1;
    if (next >= pack.length) {
      startNextBattle();
    } else {
      setCurrentIndex(next);
    }
  };

  const handleTake = () => {
    setPhase('EQUIP');
  };

  const handleEquip = (slotKey) => {
    equipItem(slotKey, currentCard);
    const next = currentIndex + 1;
    if (next >= pack.length) {
      startNextBattle();
    } else {
      setPhase('REVEAL');
      setCurrentIndex(next);
    }
  };

  if (!currentCard) return null;

  return (
    <div className="upgrade-scene">
      {phase === 'REVEAL' && (
        <div className="reward-select">
          <Card view="detail" {...currentCard} />
          <div className="actions">
            <button onClick={handleTake}>Take</button>
            <button onClick={handleDismantle}>Dismantle</button>
          </div>
        </div>
      )}
      {phase === 'EQUIP' && (
        <div className="equip-phase">
          {Object.entries(playerTeam).map(([slot, hero]) => {
            const canEquip =
              hero && currentCard &&
              (!currentCard.class || currentCard.class === hero.class);
            return (
              <ChampionDisplay
                key={slot}
                hero={hero}
                disabled={!canEquip}
                highlight={canEquip}
                onClick={() => canEquip && handleEquip(slot)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

export default UpgradeScene;
