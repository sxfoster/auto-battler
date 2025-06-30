const challenge = require('../src/commands/challenge');

jest.mock('../src/utils/userService', () => ({
  getUser: jest.fn()
}));
jest.mock('../util/database', () => ({
  query: jest.fn()
}));
jest.mock('../../backend/game/engine');

const userService = require('../src/utils/userService');
const db = require('../util/database');
const GameEngine = require('../../backend/game/engine');

beforeEach(() => {
  jest.clearAllMocks();
  GameEngine.mockImplementation(() => ({
    runFullGame: jest.fn(),
    battleLog: [],
    winner: 'player'
  }));
});

test('cannot challenge yourself', async () => {
  const user = { id: '1', username: 'Self', bot: false };
  const interaction = {
    user,
    options: { getUser: jest.fn().mockReturnValue(user) },
    reply: jest.fn().mockResolvedValue()
  };
  await challenge.execute(interaction);
  expect(interaction.reply).toHaveBeenCalledWith(expect.objectContaining({ ephemeral: true }));
});

test('cannot challenge bots', async () => {
  const interaction = {
    user: { id: '1', username: 'Tester' },
    options: { getUser: jest.fn().mockReturnValue({ id: '2', bot: true }) },
    reply: jest.fn().mockResolvedValue()
  };
  await challenge.execute(interaction);
  expect(interaction.reply).toHaveBeenCalledWith(expect.objectContaining({ ephemeral: true }));
});

test('cannot challenge unregistered users', async () => {
  const target = { id: '2', bot: false };
  userService.getUser
    .mockResolvedValueOnce({ id: 1, class: 'Mage' })
    .mockResolvedValueOnce(null);
  const interaction = {
    user: { id: '1', username: 'Tester' },
    options: { getUser: jest.fn().mockReturnValue(target) },
    reply: jest.fn().mockResolvedValue()
  };
  await challenge.execute(interaction);
  expect(userService.getUser).toHaveBeenCalledWith('2');
  expect(interaction.reply).toHaveBeenCalledWith(expect.objectContaining({ ephemeral: true }));
});

test('sends challenge DM with buttons and handles accept/decline', async () => {
  const target = { id: '2', username: 'Target', bot: false, send: jest.fn().mockResolvedValue() };
  userService.getUser
    .mockResolvedValueOnce({ id: 1, class: 'Mage' })
    .mockResolvedValueOnce({ id: 2, class: 'Mage' });
  db.query.mockResolvedValue([]);
  db.query.mockResolvedValueOnce([{ insertId: 5 }]);
  const interaction = {
    user: { id: '1', username: 'Challenger' },
    options: { getUser: jest.fn().mockReturnValue(target) },
    reply: jest.fn().mockResolvedValue()
  };
  await challenge.execute(interaction);
  expect(target.send).toHaveBeenCalled();
  const components = target.send.mock.calls[0][0].components;
  expect(components[0].components[0].data.label).toBe('Accept');
  expect(components[0].components[1].data.label).toBe('Decline');

  // accept path
  db.query.mockResolvedValueOnce([{ challenger_id: 1, challenged_id: 2, status: 'pending', created_at: new Date() }]);
  const acceptInteraction = { customId: 'challenge-accept:5', update: jest.fn().mockResolvedValue(), user: { id: '2' }, client: { users: { fetch: jest.fn().mockResolvedValue(target) } } };
  await challenge.handleAccept(acceptInteraction);
  expect(acceptInteraction.update).toHaveBeenCalled();

  // decline path
  const declineInteraction = { customId: 'challenge-decline:5', update: jest.fn().mockResolvedValue() };
  await challenge.handleDecline(declineInteraction);
  expect(declineInteraction.update).toHaveBeenCalled();
});

test('expired challenges notify challenger', async () => {
  const challenger = { send: jest.fn().mockResolvedValue() };
  await challenge.expireChallenge(7, challenger);
  expect(db.query).toHaveBeenCalledWith('UPDATE pvp_battles SET status = ? WHERE id = ?', ['expired', 7]);
  expect(challenger.send).toHaveBeenCalled();
});
