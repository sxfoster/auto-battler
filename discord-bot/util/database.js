const mysql = require('mysql2/promise');
const config = require('./config');

const pool = mysql.createPool({
  host: config.DB_HOST,
  user: config.DB_USER,
  password: config.DB_PASSWORD,
  database: config.DB_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

console.log('✅ Database connection pool created.');

async function query(sql, params = []) {
  const [rows] = await pool.query(sql, params);
  const insertId = rows.insertId !== undefined ? rows.insertId : undefined;
  return { insertId, rows };
}

function getConnection() {
  return pool.getConnection();
}

module.exports = { query, getConnection };
