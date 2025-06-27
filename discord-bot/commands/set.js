const { SlashCommandBuilder } = require('discord.js');
const userService = require('../src/utils/userService');
const abilityCardService = require('../src/utils/abilityCardService');
const { allPossibleAbilities } = require('../../backend/game/data');

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
  const user = await userService.getUser(interaction.user.id);
  if (!user) {
    await interaction.reply({ content: 'User not found.', ephemeral: true });
    return;
  }

  const ability = allPossibleAbilities.find(
    a => a.name.toLowerCase() === abilityName.toLowerCase()
  );
  if (!ability) {
    await interaction.reply({ content: 'Ability not found.', ephemeral: true });
    return;
  }

  const cards = await abilityCardService.getCards(user.id);
  const card = cards.find(c => c.ability_id === ability.id);

  if (!card) {
    await interaction.reply({ content: `You don't own any copies of ${ability.name}.`, ephemeral: true });
    return;
  }

  await userService.setActiveAbility(interaction.user.id, card.id);
  await interaction.reply({ content: `Equipped ${ability.name}.`, ephemeral: true });
}

module.exports = { data, execute };
