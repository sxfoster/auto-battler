const { SlashCommandBuilder } = require('discord.js');
const { simple } = require('../src/utils/embedBuilder');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('start')
        .setDescription('Learn how to begin your adventure!'),
    async execute(interaction) {
        const embed = simple(
            'Welcome to the Grand Adventure!',
            [{ name: 'Your Journey Begins!', value: 'Use the `/town` command to get started. If you are a new player, a "Begin Your Training" button will appear to guide you!' }]
        );
        await interaction.reply({ embeds: [embed], ephemeral: true });
    },
};
