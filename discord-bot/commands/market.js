const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('market')
        .setDescription('Interact with the player marketplace.')
        .addSubcommand(sub =>
            sub
                .setName('list')
                .setDescription('List an item for sale.')
                .addStringOption(opt =>
                    opt
                        .setName('item')
                        .setDescription('Item name or ID')
                        .setRequired(true)
                        .setAutocomplete(true)
                )
                .addIntegerOption(opt =>
                    opt
                        .setName('price')
                        .setDescription('Price in gold')
                        .setRequired(true)
                )
        )
        .addSubcommand(sub =>
            sub
                .setName('buy')
                .setDescription('Buy an item from a listing.')
                .addIntegerOption(opt =>
                    opt
                        .setName('listing_id')
                        .setDescription('ID of the listing to purchase')
                        .setRequired(true)
                )
        ),
    async execute(interaction) {
        // Logic handled in index.js
    }
};
