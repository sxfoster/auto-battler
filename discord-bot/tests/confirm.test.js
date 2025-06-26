const { MessageFlags } = require('discord.js');
const addcard = require('../commands/addcard');

jest.mock('../util/database', () => ({
  execute: jest.fn(() => Promise.resolve([]))
}));

const openpack = require('../commands/openpack');

describe('confirm embed', () => {
  test('/addcard confirmation follow up', async () => {
    const interaction = {
      options: { getString: jest.fn(() => 'Ace') },
      reply: jest.fn().mockResolvedValue(),
      followUp: jest.fn().mockResolvedValue()
    };
    await addcard.execute(interaction);
    const call = interaction.followUp.mock.calls[0][0];
    expect(call.flags).toContain(MessageFlags.Ephemeral);
    expect(call.embeds[0].data.title).toBe('✅ Success');
  });

  test('/openpack sequential confirmation', async () => {
    const interaction = {
      deferReply: jest.fn().mockResolvedValue(),
      editReply: jest.fn().mockResolvedValue(),
      followUp: jest.fn().mockResolvedValue(),
      user: { id: '123' },
      options: { getString: jest.fn((name) => (name === 'type' ? 'hero_pack' : undefined)) }
    };
    await openpack.execute(interaction);
    expect(interaction.deferReply).toHaveBeenCalled();
    const follow = interaction.followUp.mock.calls[0][0];
    expect(follow.embeds[0].data.title).toBe('✅ Success');
  });
});
