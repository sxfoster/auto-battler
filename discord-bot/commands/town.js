const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('town')
        .setDescription('Enter the main town square to access all game features.'),
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor('#29b6f6')
            .setTitle('Welcome to the Town Square')
            .setDescription('This is your central hub for all activities. Where would you like to go?')
            .setImage('https://placehold.co/600x200/1e293b/ffffff?text=Town+Square'); // Placeholder image

        const row1 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder().setCustomId('town_summon').setLabel('Acquire Units').setStyle(ButtonStyle.Success).setEmoji('✨'),
                new ButtonBuilder().setCustomId('town_barracks').setLabel('Barracks').setStyle(ButtonStyle.Secondary).setEmoji('⚔️')
            );

        const row2 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder().setCustomId('town_forge').setLabel('The Forge').setStyle(ButtonStyle.Secondary).setEmoji('🔥'),
                new ButtonBuilder().setCustomId('town_market').setLabel('Marketplace').setStyle(ButtonStyle.Secondary).setEmoji('💰')
            );

        const row3 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder().setCustomId('town_dungeon').setLabel('Enter the Dungeon Portal').setStyle(ButtonStyle.Primary).setEmoji('🌀')
            );

        await interaction.reply({ embeds: [embed], components: [row1, row2, row3], ephemeral: true });
    }
};
