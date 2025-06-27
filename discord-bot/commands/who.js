const { SlashCommandBuilder } = require('discord.js');
const userService = require('../src/utils/userService');

const data = new SlashCommandBuilder()
  .setName('who')
  .setDescription('Look up a player by name')
  .addStringOption(option =>
    option.setName('player')
      .setDescription('Player name')
      .setRequired(true)
  );

async function execute(interaction) {
  const searchName = interaction.options.getString('player');
  const user = await userService.getUserByName(searchName);

  if (!user) {
    await interaction.reply({ content: `Could not find a player named ${searchName}.`, ephemeral: true });
    return;
  }

  if (!user.class) {
    await interaction.reply({ content: `${user.name} has not yet chosen a class.` });
    return;
  }

  await interaction.reply({ content: `${user.name} - ${user.class}` });
}

module.exports = { data, execute };
