const { SlashCommandBuilder } = require('discord.js');
const userService = require('../src/utils/userService');

const data = new SlashCommandBuilder()
  .setName('who')
  .setDescription('Look up a player by mention')
  .addUserOption(option =>
    option.setName('user')
      .setDescription('Discord user to look up')
      .setRequired(true)
  );

async function execute(interaction) {
  const mentionedUser = interaction.options.getUser('user');
  const user = await userService.getUser(mentionedUser.id);

  if (!user) {
    await interaction.reply({ content: `@${mentionedUser.username} has not started their adventure yet.`, ephemeral: true });
    return;
  }

  if (!user.class) {
    await interaction.reply({ content: `${user.name} has not yet chosen a class.` });
    return;
  }

  await interaction.reply({ content: `${user.name} - ${user.class}` });
}

module.exports = { data, execute };
