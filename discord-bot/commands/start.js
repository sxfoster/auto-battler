const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { simple } = require('../src/utils/embedBuilder');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('start')
        .setDescription('Begin your adventure and create your first champions!'),
    async execute(interaction) {
        const embed = simple(
            'Welcome to the Grand Adventure!',
            [
                { name: 'Your Journey Begins!', value: 'Prepare to forge your path in a world of mighty heroes and formidable monsters. To begin, let\'s get you equipped with your first champions and some starting resources!' }
            ]
        );

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('tutorial_start_new_flow')
                    .setLabel('Begin Your Training')
                    .setStyle(ButtonStyle.Primary)
            );

        await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
    },
};
