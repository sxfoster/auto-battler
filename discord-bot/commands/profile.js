const { SlashCommandBuilder } = require('discord.js');
const db = require('../util/database');
const { simple } = require('../src/utils/embedBuilder');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription("View your currency and resource balances."),
    async execute(interaction) {
        try {
            const [rows] = await db.execute('SELECT * FROM users WHERE discord_id = ?', [interaction.user.id]);
            const user = rows[0];

            if (!user) {
                return interaction.reply({ content: 'Could not find your profile. Try running a command like `/summon` first!', ephemeral: true });
            }

            const fields = [
                { name: 'Summoning Shards', value: `✨ ${user.summoning_shards || 0}`, inline: true },
                { name: 'Gold', value: `🪙 ${user.soft_currency || 0}`, inline: true },
                { name: 'Gems', value: `💎 ${user.hard_currency || 0}`, inline: true },
            ];

            const embed = simple(`${interaction.user.username}'s Profile`, fields);
            await interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error("Error in /profile command:", error);
            await interaction.reply({ content: 'Could not fetch your profile.', ephemeral: true });
        }
    }
};
