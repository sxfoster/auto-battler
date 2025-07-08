jest.mock('../util/database', () => ({ query: jest.fn() }));
jest.mock('../src/services/missionService', () => ({ getPlayerId: jest.fn() }));
jest.mock('../src/services/playerService', () => ({ getPlayerState: jest.fn() }));

const db = require('../util/database');
const missionService = require('../src/services/missionService');
const playerService = require('../src/services/playerService');
const repair = require('../commands/repair');

beforeEach(() => {
  jest.clearAllMocks();
});

test('repairs when idle', async () => {
  missionService.getPlayerId.mockResolvedValue(1);
  playerService.getPlayerState.mockResolvedValue('idle');
  db.query.mockResolvedValue({});
  const interaction = { user: { id: '1' }, reply: jest.fn().mockResolvedValue() };

  await repair.execute(interaction);

  expect(db.query).toHaveBeenNthCalledWith(1, 'UPDATE user_weapons SET durability = 100 WHERE player_id = ?', [1]);
  expect(db.query).toHaveBeenNthCalledWith(2, 'UPDATE user_armors SET durability = 100 WHERE player_id = ?', [1]);
  expect(interaction.reply).toHaveBeenCalledWith(expect.objectContaining({ ephemeral: true }));
});

test('blocks repair when busy', async () => {
  missionService.getPlayerId.mockResolvedValue(1);
  playerService.getPlayerState.mockResolvedValue('mission');
  const interaction = { user: { id: '1' }, reply: jest.fn().mockResolvedValue() };

  await repair.execute(interaction);

  expect(db.query).not.toHaveBeenCalled();
  expect(interaction.reply).toHaveBeenCalledWith(expect.objectContaining({ ephemeral: true }));
});
