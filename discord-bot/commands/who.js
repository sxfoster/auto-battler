const { SlashCommandBuilder } = require('discord.js');
const userService = require('../src/utils/userService');

const data = new SlashCommandBuilder()
  .setName('who')
  .setDescription('Display your current class');

async function execute(interaction) {
  try {
    const user = await userService.getUser(interaction.user.id);
    if (!user) {
      await interaction.reply({ content: 'User not found. Try /game to get started.', ephemeral: true });
      return;
    }
    if (!user.class) {
      await interaction.reply({ content: 'You have not chosen a class yet.', ephemeral: true });
      return;
    }
    await interaction.reply({ content: `You are a **${user.class}**.` });
  } catch (err) {
    await interaction.reply({ content: 'Failed to look up user.', ephemeral: true });
  }
}

module.exports = { data, execute };
