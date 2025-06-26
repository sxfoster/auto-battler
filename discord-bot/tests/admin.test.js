const db = require('../util/database');
const embedBuilder = require('../src/utils/embedBuilder');

jest.mock('../util/database', () => ({
  execute: jest.fn(() => Promise.resolve([]))
}));

jest.mock('../src/utils/cardRenderer', () => ({
  generateCardImage: jest.fn(() => Promise.resolve(Buffer.from('x')))
}));

jest.mock('../../backend/game/data', () => ({
  allPossibleHeroes: [{ id: 101, name: 'Recruit', rarity: 'Common' }]
}));

describe('admin grant-recruit', () => {
  test('uses sendCardDM helper with pack style embed', async () => {
    const sendSpy = jest.spyOn(embedBuilder, 'sendCardDM');
    const admin = require('../commands/admin');
    const targetUser = { id: '321', username: 'Target', send: jest.fn().mockResolvedValue() };
    const interaction = {
      options: {
        getSubcommand: jest.fn(() => 'grant-recruit'),
        getUser: jest.fn(() => targetUser)
      },
      member: { roles: { cache: { some: jest.fn(() => true) } } },
      user: { id: '123', username: 'Admin' },
      reply: jest.fn().mockResolvedValue()
    };

    await admin.execute(interaction);

    expect(sendSpy).toHaveBeenCalledWith(targetUser, expect.objectContaining({ id: 101 }));
    const dmPayload = targetUser.send.mock.calls[0][0];
    expect(dmPayload.embeds[0].data.title).toBe('✨ You pulled a new card! ✨');
    expect(dmPayload.embeds[0].data.fields[0].name).toBe('Name');
    expect(dmPayload.embeds[0].data.fields[0].value).toBe('Recruit');
    expect(interaction.reply).toHaveBeenCalledWith({ content: "Successfully sent the Recruit card to the user's DMs.", ephemeral: true });
  });
});
