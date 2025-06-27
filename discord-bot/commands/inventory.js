const {
  SlashCommandBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder
} = require('discord.js');
const { simple } = require('../src/utils/embedBuilder');
const userService = require('../src/utils/userService');
const abilityCardService = require('../src/utils/abilityCardService');
const { allPossibleAbilities } = require('../../backend/game/data');

const data = new SlashCommandBuilder()
  .setName('inventory')
  .setDescription('Manage your backpack')
  .addSubcommand(sub =>
    sub
      .setName('show')
      .setDescription('Display your current status and backpack')
  )
  .addSubcommand(sub =>
    sub
      .setName('set')
      .setDescription('Equip an ability card')
      .addStringOption(opt =>
        opt
          .setName('ability')
          .setDescription('Name of the ability to equip')
          .setRequired(true)
          .setAutocomplete(true)
      )
  );

async function execute(interaction) {
  const sub = interaction.options.getSubcommand(false) || 'show';
  const user = await userService.getUser(interaction.user.id);

  if (!user || !user.class) {
    await interaction.reply({
      content: 'You must select a class first! Use /game select to begin your adventure.',
      ephemeral: true
    });
    return;
  }

  if (sub === 'show') {
    const cards = await abilityCardService.getCards(user.id);
    const list = cards.length
      ? cards
          .map(c => {
            const ability = allPossibleAbilities.find(a => a.id === c.ability_id);
            const name = ability ? ability.name : `Ability ${c.ability_id}`;
            return `${name} ${c.charges}/10`;
          })
          .join('\n')
      : 'Your backpack is empty.';

    const equippedCard = cards.find(c => c.id === user.equipped_ability_id);
    const equippedName = equippedCard
      ? allPossibleAbilities.find(a => a.id === equippedCard.ability_id)?.name || `Ability ${equippedCard.ability_id}`
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
    return;
  }

  if (sub === 'set' || sub === 'equip') {
    const abilityName = interaction.options.getString('ability');
    const ability = allPossibleAbilities.find(a => a.name.toLowerCase() === abilityName.toLowerCase());
    if (!ability) {
      await interaction.reply({ content: 'Ability not found.', ephemeral: true });
      return;
    }

    const cards = (await abilityCardService.getCards(user.id)).filter(
      c => c.ability_id === ability.id && c.charges > 0
    );
    if (!cards.length) {
      await interaction.reply({ content: `You don't own any charged copies of ${ability.name}.`, ephemeral: true });
      return;
    }

    if (cards.length === 1) {
      await abilityCardService.setEquippedCard(user.id, cards[0].id);
      await interaction.reply({ content: `Equipped ${ability.name}.`, ephemeral: true });
      return;
    }

    const menu = new StringSelectMenuBuilder()
      .setCustomId('equip-card')
      .setPlaceholder('Select a card')
      .addOptions(
        cards.map(card => ({
          label: `${ability.name} ${card.charges}/10`,
          value: String(card.id)
        }))
      );
    const row = new ActionRowBuilder().addComponents(menu);

    await interaction.reply({ content: 'Choose a card to equip:', components: [row], ephemeral: true });
  }
}

async function handleEquipSelect(interaction) {
  const cardId = parseInt(interaction.values[0], 10);
  const user = await userService.getUser(interaction.user.id);
  if (!user) {
    await interaction.update({ content: 'User not found.', components: [], ephemeral: true });
    return;
  }

  await abilityCardService.setEquippedCard(user.id, cardId);

  const cards = await abilityCardService.getCards(user.id);
  const card = cards.find(c => c.id === cardId);
  const abilityName = card ? allPossibleAbilities.find(a => a.id === card.ability_id)?.name || `Ability ${card.ability_id}` : 'Ability';

  await interaction.update({ content: `Equipped ${abilityName}.`, components: [], embeds: [], ephemeral: true });
}

async function autocomplete(interaction) {
  const focused = interaction.options.getFocused() || '';
  const user = await userService.getUser(interaction.user.id);
  if (!user) {
    await interaction.respond([]);
    return;
  }

  const cards = await abilityCardService.getCards(user.id);
  const names = [];
  for (const card of cards) {
    if (card.charges > 0) {
      const ability = allPossibleAbilities.find(a => a.id === card.ability_id);
      if (ability && ability.name.toLowerCase().includes(focused.toLowerCase()) && !names.includes(ability.name)) {
        names.push(ability.name);
      }
    }
  }
  const suggestions = names.slice(0, 25).map(n => ({ name: n, value: n }));
  await interaction.respond(suggestions);
}

module.exports = { data, execute, handleEquipSelect, autocomplete };
