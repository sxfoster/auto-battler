const db = require('../../util/database');

// Add a new ability card to the user's inventory with default charges
async function addCard(userId, abilityId) {
  const [result] = await db.query(
    'INSERT INTO user_ability_cards (user_id, ability_id, charges) VALUES (?, ?, 10)',
    [userId, abilityId]
  );
  return result.insertId;
}

// Retrieve all ability cards owned by a user
async function getCards(userId) {
  const [rows] = await db.query(
    'SELECT * FROM user_ability_cards WHERE user_id = ? ORDER BY id',
    [userId]
  );
  return rows;
}

// Retrieve a single ability card by id
async function getCard(cardId) {
  const [rows] = await db.query(
    'SELECT * FROM user_ability_cards WHERE id = ?',
    [cardId]
  );
  return rows[0] || null;
}

// Mark a specific card as equipped and unequip others for the user
async function setEquippedCard(userId, cardId) {
  await db.query('UPDATE users SET equipped_ability_id = ? WHERE id = ?', [cardId, userId]);
}

// Reduce the charge count of a card by one, clamping at zero
async function decrementCharge(cardId) {
  await db.query(
    'UPDATE user_ability_cards SET charges = GREATEST(charges - 1, 0) WHERE id = ?',
    [cardId]
  );
}

module.exports = { addCard, getCards, getCard, setEquippedCard, decrementCharge };
