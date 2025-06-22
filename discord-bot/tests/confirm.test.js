const addcard = require('../commands/addcard');
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
    expect(call.ephemeral).toBe(true);
    expect(call.embeds[0].data.title).toBe('✅ Success');
  });

  test('/openpack sequential confirmation', async () => {
    const interaction = {
      reply: jest.fn().mockResolvedValue(),
      followUp: jest.fn().mockResolvedValue()
    };
    await openpack.execute(interaction);
    expect(interaction.reply).toHaveBeenCalled();
    const follow = interaction.followUp.mock.calls[0][0];
    expect(follow.embeds[0].data.title).toBe('✅ Success');
  });
});
