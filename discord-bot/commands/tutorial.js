const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require('discord.js');
const userService = require('../src/utils/userService');

const data = new SlashCommandBuilder()
  .setName('tutorial')
  .setDescription('Start or continue the guided tutorial');

async function startTutorial(interaction) {
  await userService.setUserState(interaction.user.id, 'in_tutorial');
  await userService.setTutorialStep(interaction.user.id, 'town');

  await interaction.reply({ content: 'https://youtu.be/mnOVJ-ucQPM', ephemeral: true });

  const introEmbed = new EmbedBuilder()
    .setTitle('Edgar Pain')
    .setDescription('Stay only for a moment, and cover your ears.')
    .setColor('#29b6f6');
  await interaction.followUp({ embeds: [introEmbed], ephemeral: true });

  const townEmbed = new EmbedBuilder()
    .setTitle("Welcome to Portal's Rest")
    .setDescription('The bustling town is full of opportunities. Where will you go?')
    .setImage('https://i.imgur.com/2pCIH22.png');

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('tutorial_complete').setLabel('Finish Tutorial').setStyle(ButtonStyle.Primary)
  );

  await interaction.followUp({ embeds: [townEmbed], components: [row], ephemeral: true });
}

async function handleInteraction(interaction, userState) {
  if (interaction.isChatInputCommand()) {
    await startTutorial(interaction);
    return;
  }

  if (interaction.isButton() && interaction.customId === 'tutorial_complete') {
    await userService.completeTutorial(interaction.user.id);
    await interaction.update({ content: 'Tutorial complete! You are now in town.', components: [] });
  } else {
    await interaction.reply({ content: 'Follow the tutorial steps using the buttons provided.', ephemeral: true });
  }
}

async function execute(interaction) {
  await startTutorial(interaction);
}

module.exports = { data, execute, handleInteraction };
