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
  process.env.PVP_CHANNEL_ID = '100';
  jest.useFakeTimers();
});

afterEach(() => {
  jest.clearAllTimers();
  jest.useRealTimers();
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
  const channelMessage = { id: '555', edit: jest.fn().mockResolvedValue() };
  const announcementChannel = { id: '100', send: jest.fn().mockResolvedValue(channelMessage), messages: { fetch: jest.fn().mockResolvedValue(channelMessage) } };
  userService.getUser
    .mockResolvedValueOnce({ id: 1, class: 'Mage' })
    .mockResolvedValueOnce({ id: 2, class: 'Mage' });
  db.query.mockResolvedValueOnce([{}]);
  db.query.mockResolvedValueOnce({ insertId: 5 });
  db.query.mockResolvedValueOnce();
  const interaction = {
    user: { id: '1', username: 'Challenger' },
    options: { getUser: jest.fn().mockReturnValue(target) },
    reply: jest.fn().mockResolvedValue(),
    client: { channels: { fetch: jest.fn().mockResolvedValue(announcementChannel) } }
  };
  await challenge.execute(interaction);
  expect(target.send).toHaveBeenCalled();
  const components = target.send.mock.calls[0][0].components;
  expect(components[0].components[0].data.label).toBe('Accept');
  expect(components[0].components[1].data.label).toBe('Decline');

  // accept path
  db.query.mockResolvedValueOnce([{ challenger_id: 1, challenged_id: 2, status: 'pending', created_at: new Date(), message_id: '555', channel_id: '100' }]);
  db.query.mockResolvedValueOnce();
  db.query.mockResolvedValueOnce([[{ id: 1, name: 'Challenger' }]]);
  db.query.mockResolvedValueOnce([[{ id: 2, name: 'Target' }]]);
  db.query.mockResolvedValue([]);
  db.query.mockResolvedValue([]);
  db.query.mockResolvedValueOnce();
  db.query.mockResolvedValueOnce();
  const acceptInteraction = {
    customId: 'challenge-accept:5',
    update: jest.fn().mockResolvedValue(),
    user: { id: '2', username: 'Target' },
    client: {
      users: { fetch: jest.fn().mockResolvedValue(target) },
      channels: { fetch: jest.fn().mockResolvedValue(announcementChannel) }
    }
  };
  await challenge.handleAccept(acceptInteraction);
  expect(acceptInteraction.update).toHaveBeenCalled();

  // decline path
  db.query.mockResolvedValueOnce();
  db.query.mockResolvedValueOnce([[{ message_id: '555', channel_id: '100' }]]);
  db.query.mockResolvedValueOnce();
  const declineInteraction = {
    customId: 'challenge-decline:5',
    update: jest.fn().mockResolvedValue(),
    client: { channels: { fetch: jest.fn().mockResolvedValue(announcementChannel) } }
  };
  await challenge.handleDecline(declineInteraction);
  expect(declineInteraction.update).toHaveBeenCalled();
});

test('logs error when DM fails but still replies', async () => {
  const target = {
    id: '2',
    username: 'Target',
    bot: false,
    send: jest.fn().mockRejectedValue(new Error('DM failed'))
  };
  const announcementChannel = { id: '100', send: jest.fn().mockResolvedValue({}) };
  userService.getUser
    .mockResolvedValueOnce({ id: 1, class: 'Mage' })
    .mockResolvedValueOnce({ id: 2, class: 'Mage' });
  db.query.mockResolvedValueOnce([{}]);
  db.query.mockResolvedValueOnce({ insertId: 6 });
  db.query.mockResolvedValueOnce();
  const interaction = {
    user: { id: '1', username: 'Challenger' },
    options: { getUser: jest.fn().mockReturnValue(target) },
    reply: jest.fn().mockResolvedValue(),
    client: { channels: { fetch: jest.fn().mockResolvedValue(announcementChannel) } }
  };

  console.error = jest.fn();
  await challenge.execute(interaction);
  expect(target.send).toHaveBeenCalled();
  expect(console.error).toHaveBeenCalled();
  expect(interaction.reply).toHaveBeenCalledWith(
    expect.objectContaining({ ephemeral: true })
  );
});

test.skip('expired challenges notify challenger', async () => {
  const challenger = { send: jest.fn().mockResolvedValue() };
  const channelMessage = { id: '1', edit: jest.fn().mockResolvedValue() };
  const announcementChannel = { id: '100', messages: { fetch: jest.fn().mockResolvedValue(channelMessage) } };
  db.query.mockResolvedValue([]);
  const client = { channels: { fetch: jest.fn().mockResolvedValue(announcementChannel) } };
  await challenge.expireChallenge(7, challenger, client);
  expect(db.query).toHaveBeenCalledWith('UPDATE pvp_battles SET status = ? WHERE id = ?', ['expired', 7]);
  expect(challenger.send).toHaveBeenCalled();
});
