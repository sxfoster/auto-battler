const db = require('../../util/database');

// Add a new ability card to the user's inventory with default charges
async function addCard(userId, abilityId) {
  const [result] = await db.query(
    'INSERT INTO ability_cards (user_id, ability_id, charges) VALUES (?, ?, 10)',
    [userId, abilityId]
  );
  return result.insertId;
}

// Retrieve all ability cards owned by a user
async function getCards(userId) {
  const [rows] = await db.query(
    'SELECT * FROM ability_cards WHERE user_id = ? ORDER BY id',
    [userId]
  );
  return rows;
}

// Mark a specific card as equipped and unequip others for the user
async function setEquippedCard(userId, cardId) {
  await db.query('UPDATE ability_cards SET equipped = 0 WHERE user_id = ?', [userId]);
  await db.query('UPDATE ability_cards SET equipped = 1 WHERE id = ? AND user_id = ?', [cardId, userId]);
}

// Reduce the charge count of a card by one, clamping at zero
async function decrementCharge(cardId) {
  await db.query(
    'UPDATE ability_cards SET charges = GREATEST(charges - 1, 0) WHERE id = ?',
    [cardId]
  );
}

module.exports = { addCard, getCards, setEquippedCard, decrementCharge };
