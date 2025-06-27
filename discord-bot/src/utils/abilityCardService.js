const db = require('../../util/database');

async function addAbilityCard(userId, abilityId, charges) {
  await db.query(
    'INSERT INTO user_ability_cards (user_id, ability_id, charges) VALUES (?, ?, ?)',
    [userId, abilityId, charges]
  );
}

module.exports = { addAbilityCard };
