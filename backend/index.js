const express = require('express');
const cors = require('cors');
const db = require('../discord-bot/util/database');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send('Server is running');
});

app.get('/api/replays/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT battle_log FROM battle_replays WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Not Found' });
    }
    res.json(rows[0].battle_log);
  } catch (err) {
    console.error('Failed to fetch replay:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

if (require.main === module) {
  app.listen(port, () => {
    console.log('Server is running!');
  });
}

module.exports = app;
