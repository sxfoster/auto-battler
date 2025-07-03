const db = require('../../util/database');

// Add a new armor to a user's inventory
async function addArmor(userId, armorId) {
    const result = await db.query(
        'INSERT INTO user_armors (user_id, armor_id) VALUES (?, ?)',
        [userId, armorId]
    );
    return result.insertId;
}

// Get all armors owned by a user
async function getArmors(userId) {
    const { rows } = await db.query('SELECT * FROM user_armors WHERE user_id = ?', [userId]);
    return rows;
}

// Get a single armor instance by its unique ID
async function getArmor(armorInstanceId) {
    const { rows } = await db.query('SELECT * FROM user_armors WHERE id = ?', [armorInstanceId]);
    return rows[0] || null;
}

// Mark a specific armor as equipped if it belongs to the user
async function setEquippedArmor(userId, armorInstanceId) {
    await db.query(
        `UPDATE users
         SET equipped_armor_id = ?
         WHERE id = ? AND EXISTS (
           SELECT 1 FROM user_armors
           WHERE id = ? AND user_id = ?
         )`,
        [armorInstanceId, userId, armorInstanceId, userId]
    );
}

module.exports = { addArmor, getArmors, getArmor, setEquippedArmor };
