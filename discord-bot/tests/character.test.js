jest.mock('../util/database', () => ({ query: jest.fn() }));
jest.mock('../src/utils/characterService', () => ({ getCharacterSheet: jest.fn() }));
const db = require('../util/database');
const characterService = require('../src/utils/characterService');

const character = require('../commands/character');

describe('character create', () => {
  beforeEach(() => {
    db.query.mockReset();
  });
  test('inserts new player and replies with stat menu', async () => {
    db.query
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ insertId: 1, rows: [] });

    const interaction = {
      options: {
        getSubcommand: jest.fn().mockReturnValue('create'),
        getString: jest.fn().mockReturnValue('Iron Accord')
      },
      user: { id: '123', username: 'tester' },
      reply: jest.fn().mockResolvedValue()
    };

    await character.execute(interaction);

    expect(db.query).toHaveBeenNthCalledWith(
      1,
      'SELECT id FROM players WHERE discord_id = ?',
      ['123']
    );
    expect(db.query).toHaveBeenNthCalledWith(
      2,
      'INSERT INTO players (discord_id, name) VALUES (?, ?)',
      ['123', 'tester']
    );

    const replyArg = interaction.reply.mock.calls[0][0];
    expect(replyArg.ephemeral).toBe(true);
    expect(replyArg.components[0].components[0].data.custom_id).toBe('stat_select');
  });

  test('reply when character exists', async () => {
    db.query.mockResolvedValueOnce({ rows: [{}] });

    const interaction = {
      options: {
        getSubcommand: jest.fn().mockReturnValue('create'),
        getString: jest.fn().mockReturnValue('Iron Accord')
      },
      user: { id: '123', username: 'tester' },
      reply: jest.fn().mockResolvedValue()
    };

    await character.execute(interaction);

    expect(db.query).toHaveBeenCalledWith(
      'SELECT id FROM players WHERE discord_id = ?',
      ['123']
    );
    expect(db.query).toHaveBeenCalledTimes(1);
    expect(interaction.reply).toHaveBeenCalledWith(
      expect.objectContaining({ ephemeral: true })
    );
  });
});

describe('character view', () => {
  beforeEach(() => {
    characterService.getCharacterSheet.mockReset();
  });

  test('displays character sheet when found', async () => {
    characterService.getCharacterSheet.mockResolvedValue({
      level: 2,
      stats: { MGT: 2 },
      gear: { weapon: 'Sword', armor: null, ability: 'Fireball' },
      flags: ['Injured'],
      codex: []
    });

    const interaction = {
      options: { getSubcommand: jest.fn().mockReturnValue('view') },
      user: { id: '1' },
      reply: jest.fn().mockResolvedValue()
    };

    await character.execute(interaction);

    expect(characterService.getCharacterSheet).toHaveBeenCalledWith('1');
    expect(interaction.reply).toHaveBeenCalledWith(
      expect.objectContaining({ ephemeral: true })
    );
  });

  test('handles missing character', async () => {
    characterService.getCharacterSheet.mockResolvedValue(undefined);

    const interaction = {
      options: { getSubcommand: jest.fn().mockReturnValue('view') },
      user: { id: '2' },
      reply: jest.fn().mockResolvedValue()
    };

    await character.execute(interaction);

    expect(interaction.reply).toHaveBeenCalledWith(
      expect.objectContaining({ ephemeral: true })
    );
  });
});
