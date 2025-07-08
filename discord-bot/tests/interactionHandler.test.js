jest.mock('../src/services/playerService', () => ({ storeStatSelection: jest.fn() }));
jest.mock('../src/utils/embedBuilder', () => ({ simple: jest.fn(() => 'embed') }));

let playerService;
let embeds;

test('handleStatSelectMenu sets stats and replies', async () => {
  jest.resetModules();
  jest.clearAllMocks();
  playerService = require('../src/services/playerService');
  embeds = require('../src/utils/embedBuilder');
  const { handleStatSelectMenu } = require('../index');
  const interaction = {
    user: { id: '123' },
    values: ['MGT'],
    reply: jest.fn().mockResolvedValue()
  };

  await handleStatSelectMenu(interaction);

  expect(playerService.storeStatSelection).toHaveBeenCalledWith('123', ['MGT']);
  expect(embeds.simple).toHaveBeenCalledWith('Starting stats saved!', [{ name: 'Selected', value: 'MGT' }]);
  expect(interaction.reply).toHaveBeenCalledWith({ embeds: ['embed'], ephemeral: true });
});

test('interactionCreate calls handleStatSelectMenu for stat_select menu', async () => {
  let interactionHandler;
  const mockClient = {
    commands: new Map(),
    on: jest.fn((event, cb) => {
      if (event === 'interactionCreate') interactionHandler = cb;
    }),
    once: jest.fn(),
    login: jest.fn(),
    user: { tag: 'bot' }
  };

  jest.resetModules();
  jest.clearAllMocks();
  playerService = require('../src/services/playerService');
  embeds = require('../src/utils/embedBuilder');
  jest.doMock('discord.js', () => ({
    Client: jest.fn(() => mockClient),
    Collection: jest.fn(() => new Map()),
    GatewayIntentBits: { Guilds: 0 },
    Events: { ClientReady: 'ready', InteractionCreate: 'interactionCreate' },
    SlashCommandBuilder: class {
      setName() { return this; }
      setDescription() { return this; }
      addSubcommand() { return this; }
      addSubcommandGroup() { return this; }
      addStringOption() { return this; }
      addIntegerOption() { return this; }
    },
    ActionRowBuilder: class { addComponents() { return this; } },
    StringSelectMenuBuilder: class {
      setCustomId() { return this; }
      setPlaceholder() { return this; }
      addOptions() { return this; }
    }
  }));

  const index = require('../index');

  const interaction = {
    isChatInputCommand: () => false,
    isStringSelectMenu: () => true,
    customId: 'stat_select',
    user: { id: '1' },
    values: [],
    reply: jest.fn().mockResolvedValue()
  };

  await interactionHandler(interaction);

  expect(playerService.storeStatSelection).toHaveBeenCalledWith('1', []);
});
