const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { simple } = require('../src/utils/embedBuilder');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('town')
    .setDescription('Visit the Town Square and access all game features.'),
  async execute(interaction) {
    const embed = simple('Welcome to the Town Square');

    const row1 = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('town_summon').setLabel('Summoning Circle').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('town_roster').setLabel('Barracks').setStyle(ButtonStyle.Secondary)
    );

    const row2 = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('town_craft').setLabel('The Forge').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('town_market').setLabel('Marketplace').setStyle(ButtonStyle.Secondary)
    );

    const row3 = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('town_dungeon').setLabel('Enter the Dungeon Portal').setStyle(ButtonStyle.Primary)
    );

    await interaction.reply({ embeds: [embed], components: [row1, row2, row3], ephemeral: true });
  }
};
