const { SlashCommandBuilder } = require('discord.js');
const beginManager = require('../features/beginManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('begin')
        .setDescription('Select your starting class'),
    async execute(interaction) {
        await beginManager.showClassSelection(interaction);
    }
};
