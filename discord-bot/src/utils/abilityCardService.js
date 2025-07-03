const db = require('../../util/database');

// Add a new ability card to the user's inventory with configurable charges
async function addCard(userId, abilityId, charges = 20) {
  const result = await db.query(
    'INSERT INTO user_ability_cards (user_id, ability_id, charges) VALUES (?, ?, ?)',
    [userId, abilityId, charges]
  );
  return result.insertId;
}

// Retrieve all ability cards owned by a user
async function getCards(userId) {
  const { rows } = await db.query(
    'SELECT * FROM user_ability_cards WHERE user_id = ? ORDER BY id',
    [userId]
  );
  return rows;
}

// Retrieve a single ability card by id
async function getCard(cardId) {
  const { rows } = await db.query(
    'SELECT * FROM user_ability_cards WHERE id = ?',
    [cardId]
  );
  return rows[0] || null;
}

// Mark a specific card as equipped and unequip others for the user
async function setEquippedCard(userId, cardId) {
  await db.query(
    `UPDATE users
     SET equipped_ability_id = ?
     WHERE id = ? AND EXISTS (
       SELECT 1 FROM user_ability_cards
       WHERE id = ? AND user_id = ?
     )`,
    [cardId, userId, cardId, userId]
  );
}

// Reduce the charge count of a card by one, clamping at zero
async function decrementCharge(cardId) {
  await db.query(
    'UPDATE user_ability_cards SET charges = GREATEST(charges - 1, 0) WHERE id = ?',
    [cardId]
  );
}

// Delete a single ability card by id
async function deleteCard(cardId) {
  await db.query('DELETE FROM user_ability_cards WHERE id = ?', [cardId]);
}

// Delete multiple cards using an array of ids
async function deleteCards(cardIds) {
  if (!cardIds.length) return;
  const placeholders = cardIds.map(() => '?').join(',');
  await db.query(`DELETE FROM user_ability_cards WHERE id IN (${placeholders})`, cardIds);
}

module.exports = { addCard, getCards, getCard, setEquippedCard, decrementCharge, deleteCard, deleteCards };
