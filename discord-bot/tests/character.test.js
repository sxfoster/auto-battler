const character = require('../commands/character');
const db = require('../util/database');

jest.mock('../util/database');

function createInteraction() {
  return {
    user: { id: '123', username: 'Tester' },
    reply: jest.fn().mockResolvedValue(),
  };
}

describe('character command', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('creates a new user when none exists', async () => {
    db.query
      .mockResolvedValueOnce({ rows: [] }) // select
      .mockResolvedValueOnce({ insertId: 1 }); // insert

    const interaction = createInteraction();
    await character.execute(interaction);

    expect(db.query).toHaveBeenCalledWith('SELECT * FROM players WHERE discord_id = ?', ['123']);
    expect(db.query).toHaveBeenCalledWith('INSERT INTO players (discord_id, name) VALUES (?, ?)', ['123', 'Tester']);
    expect(interaction.reply).toHaveBeenCalled();
  });

  test('handles class select menu', async () => {
    const interaction = {
      values: ['Warrior'],
      reply: jest.fn().mockResolvedValue(),
    };
    await character.handleClassSelect(interaction);
    expect(interaction.reply).toHaveBeenCalledWith({ content: 'Class selected: Warrior', ephemeral: true });
  });
});
