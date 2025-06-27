const db = require('../../util/database');

async function getCardsByAbility(discordId, abilityId) {
  const [rows] = await db.query(
    `SELECT ac.id, ac.ability_id, ac.charges, a.name
     FROM ability_cards ac
     JOIN users u ON ac.user_id = u.id
     JOIN abilities a ON ac.ability_id = a.id
     WHERE u.discord_id = ? AND ac.ability_id = ?`,
    [discordId, abilityId]
  );
  return rows;
}

async function setEquippedCard(discordId, cardId) {
  await db.query(
    `UPDATE user_champions uc
     JOIN users u ON uc.user_id = u.id
     SET uc.equipped_ability_id = ?
     WHERE u.discord_id = ?`,
    [cardId, discordId]
  );
}

module.exports = { getCardsByAbility, setEquippedCard };
