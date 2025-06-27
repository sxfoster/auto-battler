const { SlashCommandBuilder } = require('discord.js');
const { simple } = require('../src/utils/embedBuilder');
const userService = require('../src/utils/userService');

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

  const inventory = await userService.getInventory(interaction.user.id);
  const list = inventory.length
    ? inventory.map(a => `${a.name} ${a.charges}/10`).join('\n')
    : 'Your backpack is empty.';

  const embed = simple(
    'Player Inventory',
    [
      { name: 'Player', value: `${user.name} - ${user.class}` },
      { name: 'Backpack', value: list }
    ],
    interaction.user.displayAvatarURL()
  );

  await interaction.reply({ embeds: [embed] });
}

module.exports = { data, execute };
