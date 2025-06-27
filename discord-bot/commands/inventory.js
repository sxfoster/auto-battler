const { SlashCommandBuilder } = require('discord.js');
const { simple } = require('../src/utils/embedBuilder');
const userService = require('../src/utils/userService');
const abilityCardService = require('../src/utils/abilityCardService');

const data = new SlashCommandBuilder()
  .setName('inventory')
  .setDescription("Display your current status and backpack");

async function execute(interaction) {
  const user = await userService.getUser(interaction.user.id);

  if (!user || !user.class) {
    await interaction.reply({
      content: 'You must select a class first! Use /game select to begin your adventure.',
      ephemeral: true
    });
    return;
  }

  const cards = await abilityCardService.getAbilityCards(interaction.user.id);
  const equipped = await abilityCardService.getEquippedAbility(interaction.user.id);

  const backpackValue = cards.length
    ? cards.map(c => `${c.name} ${c.charges}/10`).join('\n')
    : 'Your backpack is empty.';

  const fields = [
    { name: 'Player', value: `${user.name} - ${user.class}` },
    { name: 'Equipped Ability', value: equipped ? `${equipped.name} ${equipped.charges}/10` : 'None' },
    { name: 'Backpack', value: backpackValue }
  ];

  const embed = simple('Player Inventory', fields, interaction.user.displayAvatarURL());

  await interaction.reply({ embeds: [embed] });
}

module.exports = { data, execute };
