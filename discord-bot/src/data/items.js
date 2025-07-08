// Base item definitions used throughout the bot

const ITEMS = [
  { id: 'sword', type: 'weapon', name: 'Sword', bonus: 1 },
  { id: 'plate_armor', type: 'armor', name: 'Plate Armor', bonus: 2 },
  { id: 'fireball_card', type: 'ability', name: 'Fireball', bonus: 2 }
];

const BY_NAME = {};
for (const item of ITEMS) {
  BY_NAME[item.name] = item;
}

module.exports = { ITEMS, BY_NAME };
