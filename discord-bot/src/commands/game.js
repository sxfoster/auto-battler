const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const classes = require('../data/classes');
const userService = require('../utils/userService');

const data = new SlashCommandBuilder()
  .setName('game')
  .setDescription('Begin your adventure');

async function execute(interaction) {
  let user = await userService.getUser(interaction.user.id);
  if (!user) {
    await userService.createUser(interaction.user.id, interaction.user.username);
    user = await userService.getUser(interaction.user.id);
  }

  if (user.class) {
    await interaction.reply({ content: `You have already chosen the **${user.class}** class and it cannot be changed.`, ephemeral: true });
    return;
  }

  const embed = new EmbedBuilder()
    .setTitle('Welcome to the World')
    .setDescription('Choose your class to begin your journey.');

  const menu = new StringSelectMenuBuilder()
    .setCustomId('class-select')
    .setPlaceholder('Select a class')
    .addOptions(classes.map(c => ({ label: c.name, value: c.name })));

  const row = new ActionRowBuilder().addComponents(menu);

  await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
}

async function handleClassSelect(interaction) {
  const className = interaction.values[0];
  const cls = classes.find(c => c.name === className);
  if (!cls) {
    await interaction.update({ content: 'Invalid class selected.', components: [], embeds: [], ephemeral: true });
    return;
  }

  const embed = new EmbedBuilder()
    .setTitle(cls.name)
    .setDescription(cls.description)
    .addFields({ name: 'Specializations', value: cls.specializations.map(s => `• ${s}`).join('\n') });

  const buttons = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`class-confirm:${cls.name}`).setLabel('Confirm Class').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('class-choose-again').setLabel('Choose Another').setStyle(ButtonStyle.Secondary)
  );

  await interaction.update({ embeds: [embed], components: [buttons], ephemeral: true });
}

async function handleClassButton(interaction) {
  if (interaction.customId === 'class-choose-again') {
    const embed = new EmbedBuilder()
      .setTitle('Choose your class')
      .setDescription('Select a class to begin.');
    const menu = new StringSelectMenuBuilder()
      .setCustomId('class-select')
      .setPlaceholder('Select a class')
      .addOptions(classes.map(c => ({ label: c.name, value: c.name })));
    const row = new ActionRowBuilder().addComponents(menu);
    await interaction.update({ embeds: [embed], components: [row], ephemeral: true });
    return;
  }

  if (interaction.customId.startsWith('class-confirm:')) {
    const className = interaction.customId.split(':')[1];
    let user = await userService.getUser(interaction.user.id);
    if (!user) {
      await userService.createUser(interaction.user.id, interaction.user.username);
      user = await userService.getUser(interaction.user.id);
    }
    if (user.class) {
      await interaction.reply({ content: 'You have already chosen a class and it cannot be changed.', ephemeral: true });
      return;
    }
    await userService.setUserClass(interaction.user.id, className);
    await interaction.reply({ content: `Congratulations! You are now a **${className}**.`, ephemeral: true });
  }
}

module.exports = { data, execute, handleClassSelect, handleClassButton };
