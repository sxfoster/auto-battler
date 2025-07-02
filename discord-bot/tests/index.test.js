const EventEmitter = require('events');

jest.mock('node:fs', () => ({
  existsSync: jest.fn(() => false),
  readdirSync: jest.fn(() => [])
}));
jest.mock('fs', () => ({
  existsSync: jest.fn(() => false),
  readdirSync: jest.fn(() => [])
}));

jest.mock('../src/utils/userService', () => ({
  getUser: jest.fn().mockResolvedValue({
    dm_battle_logs_enabled: true,
    dm_item_drops_enabled: true,
    log_verbosity: 'summary'
  }),
  setDmPreference: jest.fn(),
  setLogVerbosity: jest.fn()
}));

jest.mock('../util/config', () => ({ DISCORD_TOKEN: 'token' }));

jest.mock('discord.js', () => {
  const { EventEmitter } = require('events');
  const clients = [];
  class MockClient extends EventEmitter {
    constructor() {
      super();
      this.commands = new Map();
      this.login = jest.fn();
      clients.push(this);
    }
  }
  class StubBuilder {
    constructor() {
      const proxy = new Proxy(this, {
        get: (target, prop) => {
          if (prop === 'toJSON') return () => ({})
          return function(...args) {
            if (typeof args[0] === 'function') {
              args[0](new StubBuilder());
            }
            return proxy;
          };
        }
      });
      return proxy;
    }
  }
  return {
    Client: MockClient,
    Collection: Map,
    GatewayIntentBits: { Guilds: 0 },
    Events: { ClientReady: 'ready', InteractionCreate: 'interactionCreate' },
    SlashCommandBuilder: StubBuilder,
    ActionRowBuilder: StubBuilder,
    ButtonBuilder: StubBuilder,
    StringSelectMenuBuilder: StubBuilder,
    EmbedBuilder: StubBuilder,
    ButtonStyle: { Primary: 1, Secondary: 2, Success: 3 },
    MessageFlags: { Ephemeral: 64 },
    __clients: clients
  };
});

const discord = require('discord.js');
const userService = require('../src/utils/userService');

require('../index.js');

test('nav-town button calls town command', async () => {
  const client = discord.__clients[0];
  const handler = client.listeners('interactionCreate')[0];
  const town = { execute: jest.fn() };
  client.commands.set('town', town);
  const interaction = {
    isChatInputCommand: jest.fn(() => false),
    isAutocomplete: jest.fn(() => false),
    isStringSelectMenu: jest.fn(() => false),
    isButton: jest.fn(() => true),
    customId: 'nav-town'
  };
  await handler(interaction);
  expect(town.execute).toHaveBeenCalledWith(interaction);
});

test('continue-adventure button calls adventure command', async () => {
  const client = discord.__clients[0];
  const handler = client.listeners('interactionCreate')[0];
  const adventure = { execute: jest.fn() };
  client.commands.set('adventure', adventure);
  const interaction = {
    isChatInputCommand: jest.fn(() => false),
    isAutocomplete: jest.fn(() => false),
    isStringSelectMenu: jest.fn(() => false),
    isButton: jest.fn(() => true),
    customId: 'continue-adventure:123',
    user: { id: '123' },
    update: jest.fn().mockResolvedValue()
  };
  await handler(interaction);
  expect(interaction.update).toHaveBeenCalled();
  expect(adventure.execute).toHaveBeenCalledWith(interaction);
});

test('toggle_battle_logs updates preference and refreshes message', async () => {
  const client = discord.__clients[0];
  const handler = client.listeners('interactionCreate')[0];
  const interaction = {
    isChatInputCommand: jest.fn(() => false),
    isAutocomplete: jest.fn(() => false),
    isStringSelectMenu: jest.fn(() => false),
    isButton: jest.fn(() => true),
    customId: 'toggle_battle_logs',
    user: { id: '123' },
    update: jest.fn().mockResolvedValue()
  };
  await handler(interaction);
  expect(userService.setDmPreference).toHaveBeenCalledWith('123', 'dm_battle_logs_enabled', false);
  expect(interaction.update).toHaveBeenCalled();
});
