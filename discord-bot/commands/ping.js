const { InteractionResponseFlags } = require('discord-api-types/v10');
const { SlashCommandBuilder } = require('discord.js');
const { simple } = require('../src/utils/embedBuilder');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong!'),
    async execute(interaction) {
        const embed = simple('Pong!');
        await interaction.reply({ embeds: [embed], flags: [InteractionResponseFlags.EPHEMERAL] });
    },
};
