const { MessageFlags } = require('discord.js');
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../util/database');
const { simple, sendCardDM } = require('../src/utils/embedBuilder');
const { allPossibleHeroes } = require('../../backend/game/data');

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
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('grant-recruit')
                .setDescription('Grants a Recruit hero card to a user for testing.')
                .addUserOption(option =>
                    option.setName('target')
                        .setDescription('The user to receive the card. Defaults to yourself.')
                        .setRequired(false))
        ),
    async execute(interaction) {
        const requiredRoleName = 'Game Master';
        if (!interaction.member.roles.cache.some(role => role.name === requiredRoleName)) {
            return interaction.reply({
                embeds: [simple('🚫 Access Denied', [{ name: 'Error', value: 'You do not have permission to use this command.' }])],
                flags: [MessageFlags.Ephemeral]
            });
        }

        if (interaction.options.getSubcommand() === 'grant-gold') {
            const targetUser = interaction.options.getUser('user');
            const amount = interaction.options.getInteger('amount');

            if (amount <= 0) {
                return interaction.reply({ content: 'Please provide a positive amount of gold.', flags: [MessageFlags.Ephemeral] });
            }

            try {
                await db.execute('INSERT INTO users (discord_id) VALUES (?) ON DUPLICATE KEY UPDATE discord_id=discord_id', [targetUser.id]);
                await db.execute('UPDATE users SET soft_currency = soft_currency + ? WHERE discord_id = ?', [amount, targetUser.id]);

                const successEmbed = simple(
                    '💰 Gold Granted',
                    [{ name: 'Success!', value: `Successfully granted ${amount} gold to ${targetUser.username}.` }]
                );
                await interaction.reply({ embeds: [successEmbed], flags: [MessageFlags.Ephemeral] });
            } catch (error) {
                console.error('Error granting gold:', error);
                await interaction.reply({ content: 'An error occurred while granting gold.', flags: [MessageFlags.Ephemeral] });
            }
        } else if (interaction.options.getSubcommand() === 'grant-recruit') {
            const targetUser = interaction.options.getUser('target') || interaction.user;
            const recruit = allPossibleHeroes.find(h => h.id === 101);

            if (!recruit) {
                return interaction.reply({ content: 'Recruit card data not found.', flags: [MessageFlags.Ephemeral] });
            }

            try {
                await db.execute(
                    `INSERT INTO user_inventory (user_id, item_id, quantity, item_type)
                     VALUES (?, 101, 1, 'hero')
                     ON DUPLICATE KEY UPDATE quantity = quantity + 1`,
                    [targetUser.id]
                );

                console.log(`DMing recruit card to user ${targetUser.username} (${targetUser.id})`);
                await sendCardDM(targetUser, recruit);

                await interaction.reply({ content: "Successfully sent the Recruit card to the user's DMs.", flags: [MessageFlags.Ephemeral] });
            } catch (error) {
                console.error('Error granting recruit:', error);
                await interaction.reply({ content: 'An error occurred while granting the Recruit card.', flags: [MessageFlags.Ephemeral] });
            }
        }
    },
};
