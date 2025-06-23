const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('market')
        .setDescription('Player marketplace commands.')
        .addSubcommand(sub =>
            sub.setName('list')
                .setDescription('List an item for sale.')
                .addStringOption(opt =>
                    opt.setName('item')
                        .setDescription('Item from your inventory to sell')
                        .setRequired(true)
                        .setAutocomplete(true)
                )
                .addIntegerOption(opt =>
                    opt.setName('price')
                        .setDescription('Sale price in Gold')
                        .setRequired(true)
                )
        )
        .addSubcommand(sub =>
            sub.setName('buy')
                .setDescription('Buy an item listing.')
                .addIntegerOption(opt =>
                    opt.setName('listing_id')
                        .setDescription('ID of the listing to purchase')
                        .setRequired(true)
                )
        ),
    async execute() {
        // Logic handled in index.js
    }
};
