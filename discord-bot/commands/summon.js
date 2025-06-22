const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('summon')
        .setDescription('Use summoning shards to recruit a new champion to your roster.'),
};
