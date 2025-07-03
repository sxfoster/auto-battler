const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const userService = require('../src/utils/userService');

const IMAGE_URL = 'https://i.imgur.com/2pCIH22.png';

/**
 * Builds the embed and components for the town hub message.
 * This function is reusable and separate from the interaction reply.
 * @returns {{embeds: EmbedBuilder[], components: ActionRowBuilder[], ephemeral: boolean}}
 */
function buildTownHubResponse() {
  const embed = new EmbedBuilder()
    .setTitle('Welcome to Portal\'s Rest')
    .setDescription('The bustling town is full of adventurers. What would you like to do?')
    .setImage(IMAGE_URL);

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('town-adventure')
      .setLabel('Go on an Adventure')
      .setStyle(ButtonStyle.Success)
      .setEmoji('⚔️'),
    new ButtonBuilder()
      .setCustomId('town-inventory')
      .setLabel('Check Inventory')
      .setStyle(ButtonStyle.Secondary)
      .setEmoji('🎒'),
    new ButtonBuilder()
      .setCustomId('town-leaderboard')
      .setLabel('View Leaderboard')
      .setStyle(ButtonStyle.Primary)
      .setEmoji('🏆'),
    new ButtonBuilder()
      .setCustomId('town-auctionhouse')
      .setLabel('Visit Auction House')
      .setStyle(ButtonStyle.Primary)
      .setEmoji('💰')
  );

  return {
    embeds: [embed],
    components: [row],
    ephemeral: true
  };
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('town')
        .setDescription('Visit the town to prepare for your next adventure.'),
    async execute(interaction) {
        await userService.setUserLocation(interaction.user.id, 'town');
        const responsePayload = buildTownHubResponse();

        if (interaction.replied || interaction.deferred) {
            await interaction.followUp(responsePayload);
        } else {
            await interaction.reply(responsePayload);
        }
    },

    buildTownHubResponse
};
