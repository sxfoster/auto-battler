const EventEmitter = require('events');

jest.mock('node:fs', () => ({
  existsSync: jest.fn(() => false),
  readdirSync: jest.fn(() => [])
}));
jest.mock('fs', () => ({
  existsSync: jest.fn(() => false),
  readdirSync: jest.fn(() => [])
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
