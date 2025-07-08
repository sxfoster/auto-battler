const db = require('../../util/database');

async function logGMAcion(adminUser, targetUser, action, details) {
  console.log(`[GM] ${adminUser} -> ${targetUser}: ${action} ${details}`);
  await db.query(
    'INSERT INTO gm_audit_log (admin_user, target_user, action, details) VALUES (?, ?, ?, ?)',
    [adminUser, targetUser, action, details]
  );
}

module.exports = { logGMAcion };
