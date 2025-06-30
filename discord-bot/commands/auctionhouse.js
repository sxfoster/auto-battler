const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const data = new SlashCommandBuilder()
  .setName('auctionhouse')
  .setDescription('Open the auction house');

async function execute(interaction) {
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('auction-buy')
      .setLabel('Buy')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('auction-sell')
      .setLabel('Sell')
      .setStyle(ButtonStyle.Success)
  );

  await interaction.reply({ content: 'Welcome to the Auction House!', components: [row], ephemeral: true });
}

module.exports = { data, execute };
