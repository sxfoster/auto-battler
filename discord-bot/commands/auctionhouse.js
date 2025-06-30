const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const data = new SlashCommandBuilder()
  .setName('auctionhouse')
  .setDescription('Buy and sell ability cards.');

async function execute(interaction) {
    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('ah-buy-start').setLabel('Buy Cards').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId('ah-sell-start').setLabel('Sell Cards').setStyle(ButtonStyle.Primary)
    );

  await interaction.reply({ content: 'Welcome to the Auction House!', components: [row], ephemeral: true });
}

module.exports = { data, execute };
