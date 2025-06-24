const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../util/database');
const { simple } = require('../src/utils/embedBuilder');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('admin')
        .setDescription('Administrative commands for the game.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(subcommand =>
            subcommand
                .setName('grant-gold')
                .setDescription('Grant gold to a user.')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('The user to grant gold to.')
                        .setRequired(true))
                .addIntegerOption(option =>
                    option.setName('amount')
                        .setDescription('The amount of gold to grant.')
                        .setRequired(true))
        ),
    async execute(interaction) {
        const requiredRoleName = 'Game Master';
        if (!interaction.member.roles.cache.some(role => role.name === requiredRoleName)) {
            return interaction.reply({
                embeds: [simple('🚫 Access Denied', [{ name: 'Error', value: 'You do not have permission to use this command.' }])],
                ephemeral: true
            });
        }

        if (interaction.options.getSubcommand() === 'grant-gold') {
            const targetUser = interaction.options.getUser('user');
            const amount = interaction.options.getInteger('amount');

            if (amount <= 0) {
                return interaction.reply({ content: 'Please provide a positive amount of gold.', ephemeral: true });
            }

            try {
                await db.execute('INSERT INTO users (discord_id) VALUES (?) ON DUPLICATE KEY UPDATE discord_id=discord_id', [targetUser.id]);
                await db.execute('UPDATE users SET soft_currency = soft_currency + ? WHERE discord_id = ?', [amount, targetUser.id]);

                const successEmbed = simple(
                    '💰 Gold Granted',
                    [{ name: 'Success!', value: `Successfully granted ${amount} gold to ${targetUser.username}.` }]
                );
                await interaction.reply({ embeds: [successEmbed], ephemeral: true });
            } catch (error) {
                console.error('Error granting gold:', error);
                await interaction.reply({ content: 'An error occurred while granting gold.', ephemeral: true });
            }
        }
    },
};
