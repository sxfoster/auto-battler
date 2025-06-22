const { SlashCommandBuilder } = require('discord.js');
const embedBuilder = require('../src/utils/embedBuilder');
const confirm = require('../src/utils/confirm');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('addcard')
    .setDescription('Add a card to your deck')
    .addStringOption(opt => opt.setName('name').setDescription('Card name').setRequired(true)),
  async execute(interaction) {
    const name = interaction.options.getString('name');
    // TODO: add new column in DB
    // TODO: persist card to database
    await interaction.reply({ embeds: [embedBuilder.simple(`Card ${name} added.`)], ephemeral: true });
    await interaction.followUp({
      embeds: [ confirm('Your card has been added to your collection.') ],
      ephemeral: true
    });
  }
};
