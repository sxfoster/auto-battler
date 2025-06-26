const { MessageFlags } = require('discord.js');
const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const db = require('../util/database');

/**
 * Generates the town menu, conditionally adding a tutorial button.
 * @param {boolean} showTutorialButton - Whether to show the "Begin Your Training" button.
 * @returns {object} The message payload for Discord's reply function.
 */

function getTownMenu(showTutorialButton = true) {
    const embed = new EmbedBuilder()
        .setColor('#29b6f6')
        .setTitle('Welcome to the Town Square')
        .setDescription(
            'This is your central hub for all activities. Where would you like to go?'
        )
        .setImage('https://placehold.co/600x200/1e293b/ffffff?text=Town+Square');

    const components = [];

    // Conditionally add the tutorial button at the very top if needed.
    if (showTutorialButton) {
        const tutorialRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('tutorial_start_new_flow')
                .setLabel('Begin Your Training')
                .setStyle(ButtonStyle.Success)
                .setEmoji('🎓')
        );
        components.push(tutorialRow);
    }

    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('town_dungeon')
                .setLabel('Enter the Dungeon Portal')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('🌀')
        );

    components.push(row);

    return { embeds: [embed], components: components, flags: [MessageFlags.Ephemeral] };
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('town')
        .setDescription('Enter the main town square to access all game features.'),
    async execute(interaction) {
        const userId = interaction.user.id;
        let showTutorial = false;
        try {
            // Check if the user exists in the database.
            let [[user]] = await db.execute(
                'SELECT tutorial_completed FROM users WHERE discord_id = ?',
                [userId]
            );

            // If the user doesn't exist, create a new entry for them.
            if (!user) {
                await db.execute(
                    'INSERT INTO users (discord_id) VALUES (?) ON DUPLICATE KEY UPDATE discord_id=discord_id',
                    [userId]
                );
                user = { tutorial_completed: 0 };
            }

            // If the tutorial_completed flag is 0 (or false), we should show the button.
            if (!user.tutorial_completed) {
                showTutorial = true;
            }
        } catch (error) {
            console.error(
                `[ERROR] Could not check tutorial status for user ${userId}:`,
                error
            );
            // As a fallback, we won't show the tutorial button if the database check fails.
        }
        await interaction.reply(getTownMenu(showTutorial));
    },
    getTownMenu,
};
