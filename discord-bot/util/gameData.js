const db = require('./database');

let heroes = [];

async function loadHeroes() {
  const [rows] = await db.execute(
    'SELECT id, name, rarity, class, is_monster, trait FROM heroes'
  );
  heroes = rows;
  console.log(`✅ Loaded ${heroes.length} heroes from database.`);
}

function getHeroes() {
  return heroes;
}

function getHeroById(id) {
  return heroes.find(h => h.id === id);
}

function getMonsters() {
  return heroes.filter(h => h.is_monster);
}

module.exports = { loadHeroes, getHeroes, getHeroById, getMonsters };
