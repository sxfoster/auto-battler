const { SlashCommandBuilder } = require('discord.js');
const embedBuilder = require('../src/utils/embedBuilder');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong!'),
    async execute(interaction) {
        await interaction.reply({ embeds: [embedBuilder.simple('Pong!')], ephemeral: false });
    },
};
