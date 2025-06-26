const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('game')
        .setDescription('The primary command for playing the game.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('select')
                .setDescription("Select your champion's class.")
                .addStringOption(option =>
                    option.setName('class')
                        .setDescription('The class you want to select.')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Recruit', value: 'recruit' },
                        )
                )
        ),
    async execute(interaction) {
        if (interaction.options.getSubcommand() === 'select') {
            const selectedClass = interaction.options.getString('class');

            if (selectedClass === 'recruit') {
                await interaction.reply({
                    content: `You have chosen the path of the **Recruit**! Welcome to the adventure.`,
                    ephemeral: true // Only the user who ran the command can see this
                });
            } else {
                // This case is technically not reachable with the current choices,
                // but it's good practice for when more classes are added.
                await interaction.reply({
                    content: 'That is not a valid class. Please choose from the available options.',
                    ephemeral: true
                });
            }
        }
    },
};
