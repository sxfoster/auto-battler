const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder
} = require('discord.js');
const userService = require('../src/utils/userService');

const data = new SlashCommandBuilder()
  .setName('settings')
  .setDescription('Manage notification settings');

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function buildComponents(user) {
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('toggle_battle_logs')
      .setLabel(`Battle Logs: ${user.dm_battle_logs_enabled ? 'On' : 'Off'}`)
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('toggle_item_drops')
      .setLabel(`Item Drops: ${user.dm_item_drops_enabled ? 'On' : 'Off'}`)
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('cycle_log_verbosity')
      .setLabel(`Verbosity: ${capitalize(user.log_verbosity)}`)
      .setStyle(ButtonStyle.Secondary)
  );
  return [row];
}

function buildEmbed(user) {
  return new EmbedBuilder()
    .setColor('#29b6f6')
    .setTitle('Settings')
    .setTimestamp()
    .addFields(
      {
        name: 'Battle Log DMs',
        value: user.dm_battle_logs_enabled ? 'Enabled' : 'Disabled',
        inline: true
      },
      {
        name: 'Item Drop DMs',
        value: user.dm_item_drops_enabled ? 'Enabled' : 'Disabled',
        inline: true
      },
      {
        name: 'Log Verbosity',
        value: capitalize(user.log_verbosity),
        inline: true
      }
    )
    .setFooter({ text: 'Auto‑Battler Bot' });
}

function buildSettingsResponse(user) {
  return {
    embeds: [buildEmbed(user)],
    components: buildComponents(user),
    ephemeral: true
  };
}

async function execute(interaction) {
  let user = await userService.getUser(interaction.user.id);
  if (!user) {
    await userService.createUser(interaction.user.id, interaction.user.username);
    user = await userService.getUser(interaction.user.id);
  }
  await interaction.reply(buildSettingsResponse(user));
}

module.exports = { data, execute, buildSettingsResponse };
