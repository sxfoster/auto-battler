const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const { simple } = require('../src/utils/embedBuilder');
const userService = require('../src/utils/userService');
const abilityCardService = require('../src/utils/abilityCardService');

const data = new SlashCommandBuilder()
  .setName('inventory')
  .setDescription('Manage your inventory')
  .addSubcommand(sub =>
    sub
      .setName('view')
      .setDescription('Display your current status and backpack'))
  .addSubcommand(sub =>
    sub
      .setName('equip')
      .setDescription('Equip an ability card')
      .addIntegerOption(opt =>
        opt
          .setName('ability')
          .setDescription('Ability id to equip')
          .setRequired(true)
      ));

async function execute(interaction) {
  const user = await userService.getUser(interaction.user.id);

  if (!user || !user.class) {
    await interaction.reply({
      content: 'You must select a class first! Use /game select to begin your adventure.',
      ephemeral: true
    });
    return;
  }

  const sub = interaction.options.getSubcommand();

  if (sub === 'view') {
    const embed = simple(
      'Player Inventory',
      [
        { name: 'Player', value: `${user.name} - ${user.class}` },
        { name: 'Backpack', value: 'Your backpack is empty.' }
      ],
      interaction.user.displayAvatarURL()
    );

    await interaction.reply({ embeds: [embed] });
  } else if (sub === 'equip') {
    const abilityId = interaction.options.getInteger('ability');
    const cards = await abilityCardService.getCardsByAbility(interaction.user.id, abilityId);

    if (!cards.length) {
      await interaction.reply({ content: 'You do not own any copies of that ability.', ephemeral: true });
      return;
    }

    const menu = new StringSelectMenuBuilder()
      .setCustomId(`equip-ability:${abilityId}`)
      .setPlaceholder('Select a card');

    cards.forEach(card => {
      menu.addOptions({ label: `${card.name} ${card.charges}/10`, value: String(card.id) });
    });

    const row = new ActionRowBuilder().addComponents(menu);

    await interaction.reply({ content: 'Choose a card to equip:', components: [row], ephemeral: true });
  }
}

async function handleEquipSelect(interaction) {
  const cardId = interaction.values[0];
  await abilityCardService.setEquippedCard(interaction.user.id, cardId);
  await interaction.update({ content: 'Equipped new ability card.', components: [] });
}

module.exports = { data, execute, handleEquipSelect };
