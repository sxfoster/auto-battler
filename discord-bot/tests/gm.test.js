jest.mock('../util/database', () => ({ query: jest.fn() }));
jest.mock('../src/utils/auditService', () => ({ logGMAcion: jest.fn() }));
const db = require('../util/database');
const audit = require('../src/utils/auditService');
const gm = require('../commands/gm');

beforeEach(() => {
  db.query.mockReset();
  audit.logGMAcion.mockReset();
});

test('reset deletes player data', async () => {
  db.query
    .mockResolvedValueOnce({ rows: [{ id: 2 }] })
    .mockResolvedValue({});

  const interaction = {
    options: {
      getSubcommandGroup: jest.fn().mockReturnValue(null),
      getSubcommand: jest.fn().mockReturnValue('reset'),
      getUser: jest.fn().mockReturnValue({ id: '5', username: 'target' })
    },
    member: { roles: { cache: new Map([[1, { name: 'GM' }]]) } },
    user: { username: 'admin' },
    reply: jest.fn().mockResolvedValue()
  };

  await gm.execute(interaction);

  expect(db.query).toHaveBeenCalledWith('SELECT id FROM players WHERE discord_id = ?', ['5']);
  expect(db.query).toHaveBeenCalledWith('DELETE FROM players WHERE id = ?', [2]);
  expect(audit.logGMAcion).toHaveBeenCalled();
  expect(interaction.reply).toHaveBeenCalledWith(expect.objectContaining({ ephemeral: true }));
});
