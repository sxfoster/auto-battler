const commandHandler = require('../handlers/commandHandler');

jest.mock('../util/database', () => ({
  execute: jest.fn(() => Promise.resolve([]))
}));

jest.mock('../util/gameData', () => ({
  getHeroById: jest.fn(() => ({ name: 'Hero', rarity: 'Common', class: 'Warrior' }))
}));

jest.mock('../../backend/game/data', () => ({
  allPossibleWeapons: [],
  allPossibleArmors: [],
  allPossibleAbilities: []
}));

describe('commandHandler', () => {
  test('executes registered command', async () => {
    const execute = jest.fn();
    const interaction = {
      commandName: 'ping',
      options: { getSubcommand: jest.fn() },
    };
    const client = { commands: new Map([['ping', { execute }]]) };

    await commandHandler(interaction, client);

    expect(execute).toHaveBeenCalledWith(interaction);
  });
});
