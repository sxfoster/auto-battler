const { Client, Collection, GatewayIntentBits, Events } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();

const gameHandlers = require('./src/commands/game');

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

client.once(Events.ClientReady, () => {
  console.log(`✅ Logged in as ${client.user.tag}!`);
});

client.on(Events.InteractionCreate, async interaction => {
  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(`Error executing ${interaction.commandName}`, error);
      const replyOptions = { content: 'There was an error executing this command!', ephemeral: true };
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(replyOptions);
      } else {
        await interaction.reply(replyOptions);
      }
    }
  } else if (interaction.isStringSelectMenu()) {
    if (interaction.customId === 'class-select') {
      await gameHandlers.handleClassSelect(interaction);
    }
  } else if (interaction.isButton()) {
    if (interaction.customId.startsWith('class-confirm') || interaction.customId === 'class-choose-again') {
      await gameHandlers.handleClassButton(interaction);
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
