const { SlashCommandBuilder } = require('discord.js');
const { simple } = require('../src/utils/embedBuilder');
const confirm = require('../src/utils/confirm');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('openpack')
    .setDescription('Open a card pack'),
  async execute(interaction) {
    const results = simple('Pack Opened', [{ name: 'Cards', value: 'Ace, King' }]);
    await interaction.reply({ embeds: [results], ephemeral: true });
    await interaction.followUp({ embeds: [confirm('Cards added to your collection.')], ephemeral: true });
  }
};
