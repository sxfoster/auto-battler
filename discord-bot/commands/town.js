const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, MessageFlags } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('town')
        .setDescription('Visit the town to prepare for your next adventure.'),
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('Welcome to the Town')
            .setDescription('The bustling town is full of adventurers. What would you like to do?')
            .setImage('https://i.imgur.com/2pCIH22.png');

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

        await interaction.reply({
            embeds: [embed],
            components: [row],
            flags: [MessageFlags.Ephemeral]
        });
    }
};
