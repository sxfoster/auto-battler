const { Client, Collection, GatewayIntentBits, Events } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const config = require('./util/config');
const gameData = require('./util/gameData');
const { routeInteraction } = require('./src/utils/interactionRouter');
const feedback = require('./src/utils/feedback');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();


const commandDirs = [
  path.join(__dirname, 'commands'),
  path.join(__dirname, 'src/commands')
];

for (const dir of commandDirs) {
  if (!fs.existsSync(dir)) continue;
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));
  for (const file of files) {
    const command = require(path.join(dir, file));
    if ('data' in command && 'execute' in command) {
      client.commands.set(command.data.name, command);
    }
  }
}

client.once(Events.ClientReady, async () => {
  console.log(`✅ Logged in as ${client.user.tag}!`);
  await gameData.loadAllData();
});

client.on(Events.InteractionCreate, async interaction => {
  try {
    await routeInteraction(interaction);
  } catch (error) {
    console.error(`Unhandled error during interaction routing:`, error);
    await feedback.sendError(interaction, 'Unexpected Error', 'An unexpected error occurred.');
  }
});

client.login(config.DISCORD_TOKEN);
