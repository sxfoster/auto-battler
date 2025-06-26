const beginCommand = require('../commands/begin');
const selectMenuHandler = require('../handlers/selectMenuHandler');
const beginManager = require('../features/beginManager');

jest.mock('../features/beginManager', () => ({
  showClassSelection: jest.fn(),
  handleClassSelected: jest.fn(),
  userClassChoices: new Map()
}));

describe('begin command flow', () => {
  test('executing /begin calls showClassSelection', async () => {
    const interaction = {};
    await beginCommand.execute(interaction);
    expect(beginManager.showClassSelection).toHaveBeenCalledWith(interaction);
  });

  test('select menu invokes handleClassSelected', async () => {
    const interaction = {
      customId: 'begin_class_select',
      values: ['Mage'],
      user: { id: '42' },
      deferUpdate: jest.fn().mockResolvedValue()
    };
    await selectMenuHandler(interaction);
    expect(beginManager.handleClassSelected).toHaveBeenCalledWith(interaction, '42', 'Mage');
  });
});
