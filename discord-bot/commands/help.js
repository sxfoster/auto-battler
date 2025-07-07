const { SlashCommandBuilder } = require('discord.js');
const { simple } = require('../src/utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('List available commands'),
  async execute(interaction) {
    const embed = simple('Available Commands', [
      { name: '/ping', value: 'Check bot responsiveness' },
      { name: '/help', value: 'Show this help message' }
    ]);
    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
