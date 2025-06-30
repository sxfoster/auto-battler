const { SlashCommandBuilder } = require('discord.js');
const userService = require('../src/utils/userService');

const data = new SlashCommandBuilder()
  .setName('settings')
  .setDescription('Configure your bot settings')
  .addSubcommand(sub =>
    sub
      .setName('battle_logs')
      .setDescription('Toggle receiving battle log DMs')
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
      .setDescription('Toggle receiving item drop DMs')
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
  const update = {};
  if (sub === 'battle_logs') {
    update.battle_logs = enabled;
  } else {
    update.item_drops = enabled;
  }
  await userService.updateSettings(interaction.user.id, update);
  if (enabled && sub === 'battle_logs' && typeof interaction.user.send === 'function') {
    try {
      await interaction.user.send('Battle logs enabled.');
    } catch (err) {
      /* ignore DM errors */
    }
  }
  await interaction.reply({ content: 'Settings updated.', ephemeral: true });
}

module.exports = { data, execute };
