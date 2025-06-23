const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { simple } = require('../src/utils/embedBuilder');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('start')
        .setDescription('Begin your adventure and create your first champion!'),
    async execute(interaction) {
        const embed = simple(
            'Welcome, Adventurer! Your Journey Begins!',
            [
                { name: 'Embark on a grand quest!', value: 'Before you delve into the dungeons, you\'ll first need a champion. This quick guide will help you assemble your first hero, step-by-step!' }
            ]
        );

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('tutorial_start_draft')
                    .setLabel('Start Champion Draft')
                    .setStyle(ButtonStyle.Primary)
            );

        await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
    },
};
