const { SlashCommandBuilder } = require('discord.js');
const { simple } = require('../src/utils/embedBuilder');
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
    const embed = simple('Player Details', [{
      name: 'Player',
      value: `@${mentionedUser.username} has not started their adventure yet.`
    }], mentionedUser.displayAvatarURL());
    await interaction.reply({ embeds: [embed], ephemeral: true });
    return;
  }

  if (!user.class) {
    const embed = simple('Player Details', [{
      name: 'Player',
      value: `${user.name} has not yet chosen a class.`
    }], mentionedUser.displayAvatarURL());
    await interaction.reply({ embeds: [embed] });
    return;
  }

  const embed = simple('Player Details', [{
    name: 'Player',
    value: `${user.name} - ${user.class}`
  }], mentionedUser.displayAvatarURL());
  await interaction.reply({ embeds: [embed] });
}

module.exports = { data, execute };
