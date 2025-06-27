const { SlashCommandBuilder } = require('discord.js');
const userService = require('../src/utils/userService');

const data = new SlashCommandBuilder()
  .setName('set')
  .setDescription('Equip an ability card from your inventory')
  .addStringOption(opt =>
    opt.setName('ability')
      .setDescription('Name of the ability to equip')
      .setRequired(true)
  );

async function execute(interaction) {
  const abilityName = interaction.options.getString('ability');
  await userService.setActiveAbility(interaction.user.id, abilityName);
  await interaction.reply({ content: `Equipped ${abilityName}.`, ephemeral: true });
}

module.exports = { data, execute };
