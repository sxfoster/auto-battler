const db = require('../../util/database');

// Add a new weapon to a user's inventory
async function addWeapon(userId, weaponId) {
    const [result] = await db.query(
        'INSERT INTO user_weapons (user_id, weapon_id) VALUES (?, ?)',
        [userId, weaponId]
    );
    return result.insertId;
}

// Get all weapons owned by a user
async function getWeapons(userId) {
    const [rows] = await db.query('SELECT * FROM user_weapons WHERE user_id = ?', [userId]);
    return rows;
}

// Get a single weapon instance by its unique ID
async function getWeapon(weaponInstanceId) {
    const [rows] = await db.query('SELECT * FROM user_weapons WHERE id = ?', [weaponInstanceId]);
    return rows[0] || null;
}

// Mark a specific weapon as equipped if it belongs to the user
async function setEquippedWeapon(userId, weaponInstanceId) {
    await db.query(
        `UPDATE users
         SET equipped_weapon_id = ?
         WHERE id = ? AND EXISTS (
           SELECT 1 FROM user_weapons
           WHERE id = ? AND user_id = ?
         )`,
        [weaponInstanceId, userId, weaponInstanceId, userId]
    );
}

module.exports = { addWeapon, getWeapons, getWeapon, setEquippedWeapon };
