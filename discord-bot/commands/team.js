const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('team')
        .setDescription('Manage your champion teams.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('set-defense')
                .setDescription('Set your persistent team for PvP defense.')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('manage')
                .setDescription('Equip items on one of your champions.')
                .addStringOption(opt =>
                    opt
                        .setName('champion')
                        .setDescription('Champion to manage')
                        .setRequired(true)
                        .setAutocomplete(true)
                )
        ),
    async execute(interaction) {
        // Logic is handled in the interaction listener within index.js
    }
};
