import React from 'react';
import {
  allPossibleHeroes,
  allPossibleAbilities,
  allPossibleWeapons,
  allPossibleArmors,
} from '../data/data.js';

export default function ChampionDisplay({ number, champion, validSlots = [], onSelectSlot }) {
  const hero = allPossibleHeroes.find((h) => h.id === champion.hero);
  const ability = allPossibleAbilities.find((a) => a.id === champion.ability);
  const weapon = allPossibleWeapons.find((w) => w.id === champion.weapon);
  const armor = allPossibleArmors.find((a) => a.id === champion.armor);

  const slotButton = (slotKey, label, item) => (
    <button
      onClick={() => onSelectSlot(slotKey)}
      disabled={!validSlots.includes(slotKey)}
      style={{ marginRight: '0.5rem', opacity: validSlots.includes(slotKey) ? 1 : 0.5 }}
    >
      {item ? item.name : `Empty ${label}`}
    </button>
  );

  return (
    <div style={{ border: '1px dashed gray', padding: '0.5rem', marginBottom: '0.5rem' }}>
      <div>{hero ? hero.name : 'Unknown Hero'}</div>
      {slotButton(`ability${number}`, 'Ability', ability)}
      {slotButton(`weapon${number}`, 'Weapon', weapon)}
      {slotButton(`armor${number}`, 'Armor', armor)}
    </div>
  );
}
