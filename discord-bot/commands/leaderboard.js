const { MessageFlags } = require('discord.js');
const { SlashCommandBuilder } = require('discord.js');
const db = require('../util/database');
const { simple } = require('../src/utils/embedBuilder');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Display the top PvP players.'),
    async execute(interaction) {
        try {
            const [rows] = await db.execute(
                'SELECT discord_id, pvp_rating FROM users ORDER BY pvp_rating DESC LIMIT 10'
            );

            const lines = await Promise.all(rows.map(async (row, idx) => {
                let name = row.discord_id;
                try {
                    const user = await interaction.client.users.fetch(row.discord_id);
                    name = user.username;
                } catch {}
                return `${idx + 1}. **${name}** - ${row.pvp_rating}`;
            }));

            const embed = simple('🏆 PvP Leaderboard', [
                { name: 'Top Players', value: lines.join('\n') || 'No data' }
            ]);
            await interaction.reply({ embeds: [embed], flags: [MessageFlags.Ephemeral] });
        } catch (err) {
            console.error('Error fetching leaderboard:', err);
            await interaction.reply({ content: 'Failed to fetch leaderboard.', flags: [MessageFlags.Ephemeral] });
        }
    }
};
