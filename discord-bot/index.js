const { Client, Collection, GatewayIntentBits, Events } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const config = require('./util/config');
const { simple } = require('./src/utils/embedBuilder');
const { storeStatSelection } = require('./src/services/playerService');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.commands = new Collection();

/**
 * Handle a selection menu where players choose bonus stats.
 *
 * @param {import('discord.js').StringSelectMenuInteraction} interaction
 */
async function handleStatSelectMenu(interaction) {
  await storeStatSelection(interaction.user.id, interaction.values);
  const embed = simple('Starting stats saved!', [
    { name: 'Selected', value: interaction.values.join(', ') }
  ]);
  await interaction.reply({ embeds: [embed], ephemeral: true });
}

const commandsPath = path.join(__dirname, 'commands');
for (const file of fs.readdirSync(commandsPath)) {
  if (!file.endsWith('.js')) continue;
  const command = require(path.join(commandsPath, file));
  if (command.data && command.execute) {
    client.commands.set(command.data.name, command);
  }
}

client.once(Events.ClientReady, () => {
  console.log(`✅ Logged in as ${client.user.tag}!`);
});

client.on(Events.InteractionCreate, async interaction => {
  if (interaction.isChatInputCommand()) {
    const command = interaction.client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error('Error executing command:', error);
      await interaction.reply({ content: 'There was an error executing that command.', ephemeral: true });
    }
  } else if (interaction.isStringSelectMenu()) {
    if (interaction.customId === 'stat_select') {
      try {
        await handleStatSelectMenu(interaction);
      } catch (error) {
        console.error('Error setting initial stats:', error);
        await interaction.reply({ content: 'There was an error saving your stats.', ephemeral: true });
      }
    }
  }
});

if (process.env.NODE_ENV !== 'test') {
  client.login(config.DISCORD_TOKEN);
}

module.exports = { handleStatSelectMenu };
