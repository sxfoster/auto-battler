const db = require('../util/database');
const embedBuilder = require('../src/utils/embedBuilder');

jest.mock('../util/database', () => ({
  execute: jest.fn(() => Promise.resolve())
}));

jest.mock('../src/utils/cardRenderer', () => ({
  generateCardImage: jest.fn(() => Promise.resolve(Buffer.from('img')))
}));

jest.mock('../../backend/game/data', () => ({
  allPossibleHeroes: [{ id: 101, name: 'Recruit', rarity: 'Common' }]
}));

describe('admin grant-recruit', () => {
  test('uses sendCardDM with pack style embed', async () => {
    const targetUser = { id: 't1', username: 'Target', send: jest.fn().mockResolvedValue() };
    const interaction = {
      options: {
        getSubcommand: jest.fn(() => 'grant-recruit'),
        getUser: jest.fn(() => targetUser)
      },
      member: { roles: { cache: { some: jest.fn(() => true) } } },
      user: { id: 'admin' },
      reply: jest.fn().mockResolvedValue()
    };

    const spy = jest.spyOn(embedBuilder, 'sendCardDM');
    const admin = require('../commands/admin');
    await admin.execute(interaction);

    expect(spy).toHaveBeenCalledWith(targetUser, expect.objectContaining({ id: 101 }));
    const sent = targetUser.send.mock.calls[0][0];
    expect(sent.embeds[0].data.title).toBe('✨ You pulled a new card! ✨');
    expect(sent.embeds[0].data.fields[0].value).toBe('Recruit');
  });
});
