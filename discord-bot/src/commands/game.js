const { SlashCommandBuilder } = require('discord.js');
const userService = require('../utils/userService');

const data = new SlashCommandBuilder()
  .setName('game')
  .setDescription('Begin your adventure');

async function execute(interaction) {
  const user = await userService.getUser(interaction.user.id);
  if (!user) {
    await userService.createUser(interaction.user.id, interaction.user.username);
  }

  await interaction.reply({
    content:
      'Your class is determined by the ability card you equip. Use `/inventory set` to change archetypes.',
    ephemeral: true
  });
}

module.exports = { data, execute };
