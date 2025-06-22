const addcard = require('../commands/addcard');
const confirm = require('../src/utils/confirm');

describe('confirm embed', () => {
  test('/addcard uses success embed', async () => {
    const interaction = {
      options: { getString: jest.fn(() => 'Ace') },
      reply: jest.fn().mockResolvedValue()
    };
    await addcard.execute(interaction);
    const expected = confirm('Card Ace added.');
    const call = interaction.reply.mock.calls[0][0];
    expect(call.ephemeral).toBe(true);
    expect(call.embeds[0].data.title).toBe(expected.data.title);
  });
});
