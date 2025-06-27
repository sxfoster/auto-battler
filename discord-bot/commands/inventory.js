const { SlashCommandBuilder } = require('discord.js');
const { simple } = require('../src/utils/embedBuilder');
const userService = require('../src/utils/userService');
const abilityCardService = require('../src/utils/abilityCardService');
const { allPossibleAbilities } = require('../../backend/game/data');

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

  const cards = await abilityCardService.getCards(user.id);
  const list = cards.length
    ? cards.map(c => {
        const ability = allPossibleAbilities.find(a => a.id === c.ability_id);
        const name = ability ? ability.name : `Ability ${c.ability_id}`;
        return `${name} ${c.charges}/10`;
      }).join('\n')
    : 'Your backpack is empty.';

  const equippedCard = cards.find(c => c.id === user.equipped_ability_id);
  const equippedName = equippedCard
    ? (allPossibleAbilities.find(a => a.id === equippedCard.ability_id)?.name || `Ability ${equippedCard.ability_id}`)
    : 'None';

  const embed = simple(
    'Player Inventory',
    [
      { name: 'Player', value: `${user.name} - ${user.class}` },
      { name: 'Equipped', value: equippedName },
      { name: 'Backpack', value: list }
    ],
    interaction.user.displayAvatarURL()
  );

  await interaction.reply({ embeds: [embed] });
}

module.exports = { data, execute };
