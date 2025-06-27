const set = require('../commands/set');

jest.mock('../src/utils/userService', () => ({
  getUser: jest.fn(),
  setActiveAbility: jest.fn()
}));
jest.mock('../src/utils/abilityCardService', () => ({
  getCards: jest.fn()
}));
const userService = require('../src/utils/userService');
const abilityCardService = require('../src/utils/abilityCardService');

describe('set command', () => {
  beforeEach(() => jest.clearAllMocks());

  test('calls userService to set ability', async () => {
    userService.getUser.mockResolvedValue({ id: 1 });
    abilityCardService.getCards.mockResolvedValue([{ id: 42, ability_id: 3113 }]);
    const interaction = {
      user: { id: '123' },
      options: { getString: jest.fn().mockReturnValue('Shield Bash') },
      reply: jest.fn().mockResolvedValue()
    };
    await set.execute(interaction);
    expect(abilityCardService.getCards).toHaveBeenCalledWith(1);
    expect(userService.setActiveAbility).toHaveBeenCalledWith('123', 42);
    expect(interaction.reply).toHaveBeenCalledWith(expect.objectContaining({ ephemeral: true }));
  });
});
