const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

function createBackToTownRow() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('nav-town')
      .setLabel('Back to Town')
      .setStyle(ButtonStyle.Secondary)
  );
}

module.exports = { createBackToTownRow };
