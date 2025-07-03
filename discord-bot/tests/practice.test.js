const practice = require('../src/commands/practice');

beforeEach(() => {
  jest.clearAllMocks();
  process.env.APP_ID = '123456';
});

test('errors when user not in voice channel', async () => {
  const interaction = {
    member: { voice: { channel: null } },
    reply: jest.fn().mockResolvedValue(),
  };
  await practice.execute(interaction);
  expect(interaction.reply).toHaveBeenCalledWith(
    expect.objectContaining({ ephemeral: true })
  );
});

test('creates invite and replies with link', async () => {
  const createInvite = jest.fn().mockResolvedValue({ code: 'abc123' });
  const interaction = {
    member: { voice: { channel: { createInvite } } },
    reply: jest.fn().mockResolvedValue(),
  };

  await practice.execute(interaction);

  expect(createInvite).toHaveBeenCalled();
  expect(interaction.reply).toHaveBeenCalledWith(
    expect.objectContaining({ ephemeral: true })
  );
});
