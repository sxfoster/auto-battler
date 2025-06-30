const { SlashCommandBuilder } = require('discord.js');
const userService = require('../src/utils/userService');

const data = new SlashCommandBuilder()
  .setName('settings')
  .setDescription('Manage DM notification settings')
  .addSubcommand(sub =>
    sub
      .setName('battle_logs')
      .setDescription('Toggle battle log DMs')
      .addBooleanOption(opt =>
        opt
          .setName('enabled')
          .setDescription('Enable battle log DMs')
          .setRequired(true)
      )
  )
  .addSubcommand(sub =>
    sub
      .setName('item_drops')
      .setDescription('Toggle item drop DMs')
      .addBooleanOption(opt =>
        opt
          .setName('enabled')
          .setDescription('Enable item drop DMs')
          .setRequired(true)
      )
  );

async function execute(interaction) {
  const sub = interaction.options.getSubcommand();
  const enabled = interaction.options.getBoolean('enabled');
  const column =
    sub === 'battle_logs'
      ? 'dm_battle_logs_enabled'
      : 'dm_item_drops_enabled';
  await userService.setDmPreference(interaction.user.id, column, enabled);
  const msg = `${enabled ? 'Enabled' : 'Disabled'} DMs for ${sub.replace('_', ' ')}`;
  await interaction.reply({ content: msg, ephemeral: true });
}

module.exports = { data, execute };
