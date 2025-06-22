const { SlashCommandBuilder } = require('discord.js');
const confirm = require('../src/utils/confirm');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('addcard')
    .setDescription('Add a card to your deck')
    .addStringOption(opt => opt.setName('name').setDescription('Card name').setRequired(true)),
  async execute(interaction) {
    const name = interaction.options.getString('name');
    // TODO: add new column in DB
    await interaction.reply({ embeds: [confirm(`Card ${name} added.`)], ephemeral: true });
  }
};
