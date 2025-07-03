const express = require('express');
const cors = require('cors');
const db = require('./util/database');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send('Server is running');
});

app.get('/api/replays/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query(
      'SELECT battle_log FROM battle_replays WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Replay not found' });
    }

    const battleLog = JSON.parse(rows[0].battle_log);
    res.json(battleLog);
  } catch (err) {
    console.error(`Error fetching replay ${id}:`, err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

if (require.main === module) {
  app.listen(port, () => {
    console.log('Server is running!');
  });
}

module.exports = app;
