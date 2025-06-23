const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../util/database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Display the top PvP players.'),
    async execute(interaction) {
        const [rows] = await db.execute(
            'SELECT discord_id, pvp_rating FROM users ORDER BY pvp_rating DESC LIMIT 10'
        );
        if (rows.length === 0) {
            return interaction.reply({ content: 'No players found.', ephemeral: true });
        }

        const description = rows
            .map((row, idx) => `${idx + 1}. <@${row.discord_id}> - ${row.pvp_rating || 0}`)
            .join('\n');

        const embed = new EmbedBuilder()
            .setColor('#f59e0b')
            .setTitle('🏆 PvP Leaderboard')
            .setDescription(description);
        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
};
