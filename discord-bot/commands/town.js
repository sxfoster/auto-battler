const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

function getTownMenu(showTutorialButton = true) {
    const embed = new EmbedBuilder()
        .setColor('#29b6f6')
        .setTitle('Welcome to the Town Square')
        .setDescription('This is your central hub for all activities. Where would you like to go?')
        .setImage('https://placehold.co/600x200/1e293b/ffffff?text=Town+Square');

    const components = [];

    // Conditionally add the tutorial button at the top of the menu
    if (showTutorialButton) {
        const tutorialRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('tutorial_start_new_flow')
                .setLabel('Begin Your Training')
                .setStyle(ButtonStyle.Success)
                .setEmoji('⚔️')
        );
        components.push(tutorialRow);
    }

    const row1 = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder().setCustomId('town_barracks').setLabel('Barracks').setStyle(ButtonStyle.Secondary).setEmoji('⚔️').setDisabled(false)
        );

    const row2 = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder().setCustomId('town_forge').setLabel('The Forge').setStyle(ButtonStyle.Secondary).setEmoji('🔥').setDisabled(true)
        );

    const row3 = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder().setCustomId('town_dungeon').setLabel('Enter the Dungeon Portal').setStyle(ButtonStyle.Primary).setEmoji('🌀')
        );

    components.push(row1, row2, row3);

    return { embeds: [embed], components: components, ephemeral: true };
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('town')
        .setDescription('Enter the main town square to access all game features.'),
    async execute(interaction) {
        await interaction.reply(getTownMenu());
    },
    getTownMenu,
};
