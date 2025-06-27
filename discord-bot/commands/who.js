const { SlashCommandBuilder } = require('discord.js');
const userService = require('../src/utils/userService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('who')
    .setDescription('Look up a player\'s class')
    .addStringOption(option =>
      option.setName('player').setDescription('Player name').setRequired(true)
    ),
  async execute(interaction) {
    const playerName = interaction.options.getString('player');
    const user = await userService.getUserByName(playerName);
    if (!user) {
      await interaction.reply({ content: `Could not find a player named ${playerName}.`, ephemeral: true });
      return;
    }
    if (user.class) {
      await interaction.reply({ content: `${user.name} - ${user.class}` });
    } else {
      await interaction.reply({ content: `${user.name} has not yet chosen a class.` });
    }
  }
};
