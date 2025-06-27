const {
  SlashCommandBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder
} = require('discord.js');
const { simple } = require('../src/utils/embedBuilder');
const userService = require('../src/utils/userService');
const abilityCardService = require('../src/utils/abilityCardService');
const { allPossibleAbilities } = require('../../backend/game/data');
const classAbilityMap = require('../src/data/classAbilityMap');

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
  )
  // temporary alias for backwards compatibility
  .addSubcommand(sub =>
    sub
      .setName('equip')
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
          label: `${ability.name} (${card.charges}/10)`,
          value: String(card.id)
        }))
      );
    const row = new ActionRowBuilder().addComponents(menu);

    await interaction.reply({ content: 'Choose a card to equip:', components: [row], ephemeral: true });
  }
}

async function handleSetAbilityButton(interaction) {
  const user = await userService.getUser(interaction.user.id);
  if (!user) {
    await interaction.reply({ content: 'User not found.', ephemeral: true });
    return;
  }

  const cards = (await abilityCardService.getCards(user.id)).filter(c => c.charges > 0);
  const uniqueIds = [...new Set(cards.map(c => c.ability_id))];
  if (!uniqueIds.length) {
    await interaction.reply({ content: 'You have no usable ability cards.', ephemeral: true });
    return;
  }

  const menu = new StringSelectMenuBuilder()
    .setCustomId('ability-select')
    .setPlaceholder('Select an ability')
    .addOptions(
      uniqueIds.map(id => {
        const ability = allPossibleAbilities.find(a => a.id === id);
        const name = ability ? ability.name : `Ability ${id}`;
        return { label: name, value: String(id) };
      })
    );
  const row = new ActionRowBuilder().addComponents(menu);
  await interaction.reply({ content: 'Choose an ability to equip:', components: [row], ephemeral: true });
}

async function handleAbilitySelect(interaction) {
  const abilityId = parseInt(interaction.values[0], 10);
  const user = await userService.getUser(interaction.user.id);
  if (!user) {
    await interaction.update({ content: 'User not found.', components: [], ephemeral: true });
    return;
  }

  const cards = (await abilityCardService.getCards(user.id)).filter(c => c.ability_id === abilityId && c.charges > 0);
  const abilityName = allPossibleAbilities.find(a => a.id === abilityId)?.name || `Ability ${abilityId}`;

  if (cards.length === 1) {
    await abilityCardService.setEquippedCard(user.id, cards[0].id);
    await interaction.update({ content: `Equipped ${abilityName}.`, components: [], embeds: [], ephemeral: true });
    return;
  }

  const menu = new StringSelectMenuBuilder()
    .setCustomId('equip-card')
    .setPlaceholder('Select a card')
    .addOptions(
      cards.map(card => ({
        label: `${abilityName} (${card.charges}/10)`,
        value: String(card.id)
      }))
    );
  const row = new ActionRowBuilder().addComponents(menu);
  await interaction.update({ content: 'Choose a card to equip:', components: [row], ephemeral: true });
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
  const focused = interaction.options.getFocused();
  const user = await userService.getUser(interaction.user.id);
  if (!user) {
    await interaction.respond([]);
    return;
  }
  const cards = await abilityCardService.getCards(user.id);
  const abilityClass = classAbilityMap[user.class] || user.class;
  const abilities = [...new Set(
    cards.filter(c => c.charges > 0).map(c => c.ability_id)
  )]
    .map(id => allPossibleAbilities.find(a => a.id === id))
    .filter(Boolean)
    .filter(a => !abilityClass || a.class === abilityClass);
  const filtered = abilities
    .filter(a => a.name.toLowerCase().includes(focused.toLowerCase()))
    .slice(0, 25)
    .map(a => ({ name: a.name, value: a.name }));
  await interaction.respond(filtered);
}

module.exports = {
  data,
  execute,
  handleEquipSelect,
  handleSetAbilityButton,
  handleAbilitySelect,
  autocomplete
};
