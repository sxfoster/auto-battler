const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('fight')
        .setDescription('Choose champions from your roster to enter a dungeon fight!'),
};
