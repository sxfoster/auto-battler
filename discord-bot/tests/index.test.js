jest.mock('node:fs', () => ({
  existsSync: jest.fn(() => false),
  readdirSync: jest.fn(() => [])
}));
jest.mock('fs', () => ({
  existsSync: jest.fn(() => false),
  readdirSync: jest.fn(() => [])
}));

jest.mock('../util/config', () => ({ DISCORD_TOKEN: 'token' }));

jest.mock('../src/utils/interactionRouter', () => ({ routeInteraction: jest.fn() }));
const { routeInteraction } = require('../src/utils/interactionRouter');

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
  return {
    Client: MockClient,
    Collection: Map,
    GatewayIntentBits: { Guilds: 0 },
    Events: { ClientReady: 'ready', InteractionCreate: 'interactionCreate' },
    __clients: clients
  };
});

const discord = require('discord.js');
require('../index.js');

test('interaction routed to router', async () => {
  const client = discord.__clients[0];
  const handler = client.listeners('interactionCreate')[0];
  const interaction = { replied: false, deferred: false, reply: jest.fn(), followUp: jest.fn() };
  await handler(interaction);
  expect(routeInteraction).toHaveBeenCalledWith(interaction);
});

test('errors from router are handled', async () => {
  const client = discord.__clients[0];
  const handler = client.listeners('interactionCreate')[0];
  const interaction = { replied: false, deferred: false, reply: jest.fn(), followUp: jest.fn() };
  routeInteraction.mockRejectedValueOnce(new Error('fail'));
  await handler(interaction);
  expect(interaction.reply).toHaveBeenCalledWith(expect.objectContaining({ content: 'An unexpected error occurred.' }));
});
